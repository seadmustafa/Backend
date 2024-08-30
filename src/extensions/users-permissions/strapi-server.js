const { sanitize, errors } = require('@strapi/utils')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const { USER_SCOPE } = require('../../constants/user-scope')
const { ValidationError } = require('@strapi/utils').errors;
const uuidv4 = require('uuid').v4
const crypto = require('crypto');
const {
  validateDeleteRoleBody,
  createRoleSchema,
  updateRoleSchema,
} = require('./validation/role')
const { updateUserSchema } = require('./validation/user')
const ms = require('ms')
const {
  validateResetPasswordBody,
  validateResetPasswordQuery,
} = require('./validation/auth');
const { isValidEmailTemplate } = require('./validation/email-template');
const { formatDate } = require('../../api/otp/services/otp');

/**
 * @type {{ users: "plugin::users-permissions.user", otp: "api::otp.otp", role: "plugin::users-permissions.role", permission: "plugin::users-permissions.permission" }}
 */
const includes = {
  users: 'plugin::users-permissions.user',
  otp: 'api::otp.otp',
  role: 'plugin::users-permissions.role',
  permission: 'plugin::users-permissions.permission',
}

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state
  const userSchema = strapi.getModel('plugin::users-permissions.user')

  return sanitize.contentAPI.output(user, userSchema, { auth })
}

module.exports = (plugin) => {
  const login = plugin.controllers.auth.callback
  const register = plugin.controllers.auth.register
  const createRole = plugin.controllers.role.createRole
  const updateRole = plugin.controllers.role.updateRole

  plugin.controllers.auth.callback = async (ctx) => {
    try {
      const { users, otp } = includes
      const { identifier, password } = await sanitize.contentAPI.input(
        ctx.request.body,
        strapi.getModel(users),
        {}
      )
      if (!identifier) {
        return ctx.internalServerError('Email is a required field', {})
      }
      const user = await strapi.db.query(users).findOne({
        where: {
          email: identifier,
        },
      })
      if (password) {
        if (user && !user.isVerified) {
          return ctx.unauthorized(
            "Your account hasn't been verified. Please check your email to verify your account"
          )
        }
        if (user && user.scope === USER_SCOPE.PORTAL) {
          return ctx.internalServerError(
            'Invalid email or password. Please check again'
          )
        }
        return await login(ctx)
      }
      if (!user || user.scope === USER_SCOPE.PWA) {
        return ctx.notFound(
          "Your email hasn't been registered to the platform. Reach out to the administrator to get authorization to access the platform",
          {}
        )
      }
      const otpCode = await strapi.service(otp).generateOtp(user.email)
      await strapi.service(otp).sendMailOtp(user.email, otpCode)
      return ctx.send({ data: true }, 200)
    } catch (err) {
      if (err.message === 'Invalid identifier or password')
        err.message = 'Invalid email or password. Please check again'
      return ctx.internalServerError(err.message, {})
    }
  }

  plugin.controllers.auth.register = async (ctx) => {
    return strapi.db
      .transaction(async () => {
        const { users, otp } = includes
        // @ts-ignore
        const { email, name } = await sanitize.contentAPI.input(
          ctx.request.body,
          strapi.getModel(users),
          {}
        )
        const user = await strapi.db.query(users).findOne({
          where: { email },
        })
        if (user && user.scope === USER_SCOPE.PORTAL)
          await strapi.db.query(users).update({
            where: { email },
            data: {
              ...ctx.request.body,
              scope: USER_SCOPE.ALL,
              isVerified: false,
            },
          })
        else await register(ctx)

        const otpCode = await strapi.service(otp).generateOtp(email)
        await strapi.service(otp).sendMailOtp(email, otpCode, { name })
        return ctx.send({ data: true }, 200)
      })
      .catch((err) => {
        if (err.message === 'Email or Username are already taken')
          err.message = 'You already have an account. Please log in to continue'
        return ctx.internalServerError(err.message, {})
      })
  }

  plugin.controllers.auth.forgotPassword = async (ctx) => {
    return strapi.db
      .transaction(async () => {
        const { users } = includes
        // @ts-ignore
        const { email } = await sanitize.contentAPI.input(
          ctx.request.body,
          strapi.getModel(users),
          {}
        )

        const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });
        const emailSettings = await pluginStore.get({ key: 'email' });
        /**
         * @type {{email_reset_password?: any}}
         */
        const advancedSettings = await pluginStore.get({ key: 'advanced' });
        const user = await strapi.db
          .query(users)
          .findOne({ where: { email: email.toLowerCase(), scope: { $ne: USER_SCOPE.PORTAL } } })

        if (!user) {
          return ctx.notFound(
            "You haven't registered to the system. Please create an account to continue",
            {}
          )
        }
        /**
         * @type {any}
         */
        const userInfo = await sanitizeUser(user, ctx);
        const resetPasswordToken = crypto.randomBytes(64).toString('hex');
        /**
         * @type {{message?: any, email_reset_password?: any, object?: any, response_email?: any, from?: any}}
         */
        const resetPasswordSettings = _.get(emailSettings, 'reset_password.options', {});
        const emailBody = await strapi.plugins['users-permissions'].services['users-permissions'].template(
          resetPasswordSettings.message,
          {
            URL: advancedSettings.email_reset_password,
            USER: userInfo,
            TOKEN: resetPasswordToken,
            name: userInfo.name,
            ref: uuidv4(),
            createdAt: formatDate(new Date())
          }
        );
    
        const emailObject = await strapi.plugins['users-permissions'].services['users-permissions'].template(
          resetPasswordSettings.object,
          {
            USER: userInfo,
          }
        );
    
        const emailToSend = {
          to: user.email,
          from:
            resetPasswordSettings.from.email || resetPasswordSettings.from.name
              ? `${resetPasswordSettings.from.name} <${resetPasswordSettings.from.email}>`
              : undefined,
          replyTo: resetPasswordSettings.response_email,
          subject: emailObject,
          text: emailBody,
          html: emailBody,
        };
    
        // Send an email to the user.
        await strapi.plugin('email').service('email').send(emailToSend);
    
        await strapi.entityService.update(users, user.id, {
          data: {
            resetPasswordToken,
            resetPasswordTokenExpire: new Date(
              new Date().valueOf() +
                ms(process.env.RESET_PASSWORD_TOKEN_TTL || '10m')
            ),
          },
        })
        return ctx.send({ ok: true });
      })
      .catch((err) => {
        return ctx.internalServerError(err.message, {})
      })
  }

  plugin.controllers.auth.resetPassword = async (ctx) => {
    const { password, passwordConfirmation, code } =
      await validateResetPasswordBody(ctx.request.body)

    if (password !== passwordConfirmation) {
      throw new errors.ValidationError('Passwords do not match')
    }

    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { resetPasswordToken: code } })

    if (!user) {
      throw new errors.ValidationError('Invalid link provided')
    }

    if (
      new Date(user.resetPasswordTokenExpire).valueOf() < new Date().valueOf()
    ) {
      throw new errors.ValidationError(
        'The reset password link is expired. Please try again later'
      )
    }

    await strapi.plugins['users-permissions'].services.user.edit(user.id, {
      resetPasswordToken: null,
      password,
    })

    ctx.send({
      jwt: strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      }),
      user: await sanitizeUser(user, ctx),
    })
  }

  plugin.controllers.auth.verifyResetPasswordLink = async (ctx) => {
    const { code } = await validateResetPasswordQuery(ctx.query)
    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { resetPasswordToken: code } })

    if (!user) {
      throw new errors.ValidationError('Invalid link provided')
    }

    if (
      new Date(user.resetPasswordTokenExpire).valueOf() < new Date().valueOf()
    ) {
      throw new errors.ValidationError(
        'The reset password link is expired. Please try again later'
      )
    }
    return { ok: true }
  }

  plugin.controllers.auth.refreshToken = async (ctx) => {
    const pluginStore = await strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    })
    const { users } = includes
    const { refreshToken } = ctx.request.body

    if (!refreshToken) {
      return ctx.badRequest('No Authorization')
    }
    try {
      const obj = await verifyRefreshToken(refreshToken)
      const user = await strapi.db
        .query(users)
        .findOne({ where: { id: obj.id } })
      if (!user) {
        throw new errors.ValidationError('Invalid user')
      }
      if (
        _.get(
          await pluginStore.get({ key: 'advanced' }),
          'email_confirmation'
        ) &&
        user.confirmed !== true
      ) {
        throw new errors.ApplicationError('Your account email is not confirmed')
      }
      if (user.blocked === true) {
        throw new errors.ApplicationError(
          'Your account has been blocked by an administrator'
        )
      }
      const newRefreshToken = issueRefreshToken({ id: user.id })
      ctx.send(
        {
          jwt: issueJWT(
            { id: obj.id },
            { expiresIn: process.env.JWT_SECRET_EXPIRES }
          ),
          refreshToken: newRefreshToken,
        },
        200
      )
    } catch (err) {
      return ctx.badRequest(err.toString())
    }
  }

  plugin.controllers.role.find = async (ctx) => {
    const { users, role } = includes
    const { sort, _q, fields, filters } = ctx.query
    let condition = {
      fields,
      filters,
      populate: ['category', 'religion'],
    }
    if (_q && _q != '') {
      condition = {
        ...condition,
        filters: {
          ...condition.filters,
          name: {
            $containsi: _q,
          },
        },
      }
    }
    if (sort) {
      const [sortBy, sortOrder] = sort.split(':')
      condition['sort'] = { [`${sortBy}`]: sortOrder }
    } else {
      condition['sort'] = { id: 'DESC' }
    }
    const roles = await strapi.entityService.findMany(role, condition)

    for (const role of roles) {
      role.nb_users = await strapi
        .query(users)
        .count({ where: { role: { id: role.id } } })
    }

    ctx.send({ roles })
  }

  plugin.controllers.role.findOne = async (ctx) => {
    const { id } = ctx.params
    const { role } = includes

    const roleInfo =
      await strapi.plugins['users-permissions'].services.role.findOne(id)

    if (!roleInfo) {
      return ctx.notFound()
    }
    const r = await strapi.entityService.findOne(role, id, {
      populate: ['permissions', 'category', 'religion'],
    })

    ctx.send({
      role: roleInfo,
      category: r.category,
      religion: r.religion,
    })
  }

  plugin.controllers.role.createRole = async (ctx) => {
    return strapi.db
      .transaction(async () => {
        const { users, role } = includes
        const { paticipants, type } = ctx.request.body
        const pluginStore = await strapi.store({
          type: 'plugin',
          name: 'users-permissions',
        })
        const settings = await pluginStore.get({ key: 'advanced' })
        if (paticipants) {
          const listUsers = await strapi.db.query(users).findMany({
            where: { email: { $in: paticipants } },
            populate: ['role'],
          })
          const listUserErr = []
          for (const user of listUsers) {
            // @ts-ignore
            if (user.role.type !== settings.default_role) {
              listUserErr.push(user.email)
            }
          }
          if (listUserErr.length > 0) {
            return ctx.internalServerError(
              `Those participants ${listUserErr.join(', ')} are already registered to another role. Please remove them out of this role`,
              {}
            )
          }
          await createRole(ctx)
          const newRole = await strapi.db
            .query(role)
            .findOne({ where: { type } })
          const existedEmailMap = listUsers.reduce((prev, curr) => {
            prev[curr.email] = true
            return prev
          }, {})
          const emailOrder = paticipants.reduce((prev, curr, index) => {
            prev[curr] = index
            return prev
          }, {})
          /**
           * To avoid performance issues, bulk operations are not allowed on relations.
           * MySQL will only return an array of one id containing the last inserted id, not the entire list.
           * See: https://docs.strapi.io/dev-docs/api/query-engine/bulk-operations#createmany
           */
          await strapi.db.query(users).createMany({
            data: paticipants
              .filter((email) => !existedEmailMap[email])
              .map((email) => ({
                name: email.substr(0, email.indexOf('@')) + ' User',
                username: email.toLowerCase(),
                email: email.toLowerCase(),
                password: generatePassword(),
                confirmed: true,
                isVerified: true,
                provider: 'local',
                scope: USER_SCOPE.PORTAL,
              })),
          })
          await strapi.db.query(users).updateMany({
            where: {
              email: {
                $in: paticipants.filter((email) => existedEmailMap[email]),
              },
            },
            data: {
              scope: USER_SCOPE.ALL,
            },
          })
          const updatedUsers = await strapi.db.query(users).findMany({
            where: {
              email: {
                $in: paticipants.filter((email) => existedEmailMap[email]),
              },
            },
          })
          const createdUsers = await strapi.db.query(users).findMany({
            where: {
              email: {
                $in: paticipants.filter((email) => !existedEmailMap[email]),
              },
            },
          })
          const a = [...createdUsers, ...updatedUsers].reduce((prev, curr) => {
            const userIdOrder = emailOrder[curr.email]
            prev[userIdOrder] = curr.id
            return prev
          }, {})
          const ids = Object.keys(a)
            .sort()
            .map((e) => a[e])
          await strapi.entityService.update(role, newRole.id, {
            data: {
              users: ids,
            },
          })
        } else {
          await createRole(ctx)
        }
        return ctx.send({ ok: true })
      })
      .catch(() => {
        return ctx.internalServerError('Something went wrong!', {})
      })
  }

  plugin.controllers.role.updateRole = async (ctx) => {
    return strapi.db
      .transaction(async () => {
        const roleID = ctx.params.role
        const data = ctx.request.body
        const pluginStore = await strapi.store({
          type: 'plugin',
          name: 'users-permissions',
        })
        const settings = await pluginStore.get({ key: 'advanced' })
        const defaultRole = await strapi
          .query('plugin::users-permissions.role')
          // @ts-ignore
          .findOne({ where: { type: settings.default_role } })
        const pwaRoleID = defaultRole.id
        if (roleID.toString() === pwaRoleID.toString()) {
          throw new errors.ApplicationError('Cannot update pwa role')
        }

        const roleInfo = await strapi
          .query('plugin::users-permissions.role')
          .findOne({
            where: { id: roleID },
            populate: ['users', 'users.onboarding_information'],
          })

        if (!roleInfo) {
          throw new errors.NotFoundError('Role not found')
        }

        if (roleInfo.type === 'site_admin') {
          throw new errors.ApplicationError('Cannot update Site Admin role')
        }

        const canUpdatePermission = roleInfo.users?.every(
          (e) => e.onboarding_information == null
        )

        if (data.permissions && canUpdatePermission) await updateRole(ctx)

        const { role, users } = includes
        if (data.paticipants) {
          const listUsers = await strapi.db.query(users).findMany({
            where: { email: { $in: data.paticipants } },
            populate: ['role'],
          })
          const listUserErr = []
          for (const user of listUsers) {
            // @ts-ignore
            if (
              user.role.type !== settings.default_role &&
              user.role.id != roleID
            ) {
              listUserErr.push(user.email)
            }
          }
          if (listUserErr.length > 0) {
            return ctx.internalServerError(
              `Those participants ${listUserErr.join(', ')} are already registered to another role. Please remove them out of this role`,
              {}
            )
          }
        }
        if (canUpdatePermission) {
          await strapi.db.query(role).update({
            where: { id: roleID },
            data: _.pick(data, ['category', 'religion', 'releaseQR']),
          })
        }
        if (data.paticipants) {
          for (const email of data.paticipants) {
            let index = email.indexOf('@')
            const user = {
              name: email.substr(0, index) + ' User',
              username: email.toLowerCase(),
              email: email.toLowerCase(),
              password: generatePassword(),
              provider: 'local',
              confirmed: true,
              isVerified: true,
              role: roleID,
              scope: USER_SCOPE.PORTAL,
            }
            const checkUser = await strapi.db
              .query(users)
              .findOne({ where: { email } })
            if (!checkUser) {
              await strapi.plugins['users-permissions'].services.user.add(user)
            } else {
              await strapi.plugins['users-permissions'].services.user.edit(
                checkUser.id,
                {
                  role: roleID,
                  scope:
                    checkUser.scope === USER_SCOPE.PWA
                      ? USER_SCOPE.ALL
                      : checkUser.scope,
                }
              )
            }
          }
        }
        if (data.deletePaticipants) {
          const defaultRole = await strapi
            .query('plugin::users-permissions.role')
            // @ts-ignore
            .findOne({ where: { type: settings.default_role } })

          for (const id of data.deletePaticipants) {
            const user = await strapi.db.query(users).findOne({
              where: { id },
              populate: ['role', 'onboarding_information'],
            })
            if (user.role.id != roleID || user.onboarding_information != null) {
              throw new Error()
            }
            if (user.scope === USER_SCOPE.ALL) {
              await strapi.db.query(users).update({
                where: { id },
                data: { scope: USER_SCOPE.PWA, role: defaultRole.id },
              })
            } else {
              await strapi.plugins['users-permissions'].services.user.remove({
                id,
              })
            }
          }
        }
        return ctx.send({ ok: true })
      })
      .catch(() => {
        return ctx.internalServerError('Something went wrong!', {})
      })
  }

  plugin.controllers.role.deleteRole = async (ctx) => {
    return strapi.db
      .transaction(async () => {
        const roleID = ctx.params.role

        if (!roleID) {
          await validateDeleteRoleBody(ctx.params)
        }
        const { users, role, permission } = includes
        const pluginStore = await strapi.store({
          type: 'plugin',
          name: 'users-permissions',
        })
        const settings = await pluginStore.get({ key: 'advanced' })
        const defaultRole = await strapi
          .query('plugin::users-permissions.role')
          // @ts-ignore
          .findOne({ where: { type: settings.default_role } })
        const pwaRoleID = defaultRole.id
        // Prevent from removing the pwa role.
        if (roleID.toString() === pwaRoleID.toString()) {
          throw new errors.ApplicationError('Cannot delete pwa role')
        }

        const roleInfo = await strapi
          .query('plugin::users-permissions.role')
          .findOne({
            where: { id: roleID },
            populate: [
              'users',
              'permissions',
              'users.onboarding_information',
              'users.onboarding_information.certificateInfo',
            ],
          })

        if (!roleInfo) {
          throw new errors.NotFoundError('Role not found')
        }

        if (roleInfo.type === 'site_admin') {
          throw new errors.ApplicationError('Cannot delete Site Admin role')
        }

        // Check if role has onboarded users
        const hasUsersOnboarded = roleInfo.users.some(
          (user) => user.onboarding_information != null
        )
        if (hasUsersOnboarded) {
          throw new errors.ApplicationError(
            'Cannot delete role with onboarded users'
          )
        }

        // Move users to guest role.
        await Promise.all(
          roleInfo.users.map((user) => {
            if (user.scope === USER_SCOPE.ALL) {
              return strapi.query(users).update({
                where: { id: user.id },
                data: { role: pwaRoleID, scope: USER_SCOPE.PWA },
              })
            }
            return strapi.query(users).delete({ where: { id: user.id } })
          })
        )

        // Remove permissions related to this role.
        // TODO: use delete many
        await Promise.all(
          roleInfo.permissions.map((per) => {
            return strapi.query(permission).delete({
              where: { id: per.id },
            })
          })
        )

        // Delete the role.
        await strapi.query(role).delete({ where: { id: roleID } })
        ctx.send({ ok: true })
      })
      .catch(() => {
        return ctx.internalServerError('Something went wrong!', {})
      })
  }

  plugin.controllers.user.update = async (ctx) => {
    const userId = ctx.request.params.id

    const user = await strapi.db.query(includes.users).findOne({
      where: { id: userId },
    })

    if (!user) {
      return ctx.notFound('User not found!')
    }
    const updatedUser = await strapi.plugins[
      'users-permissions'
    ].services.user.edit(userId, ctx.request.body)

    return sanitize.contentAPI.output(
      updatedUser,
      strapi.getModel(includes.users)
    )
  }

  plugin.routes['content-api'].routes = plugin.routes['content-api'].routes.map(
    (item) => {
      if (item.method == 'PUT' && item.path == '/users/:id') {
        item.config.middlewares = [
          {
            name: 'global::validate-schema',
            config: { schema: updateUserSchema },
          },
        ]
      }
      if (item.method == 'POST' && item.path == '/roles') {
        item.config = {
          ...item.config,
          middlewares: [
            ...(item.config?.middlewares || []),
            {
              name: 'global::validate-schema',
              config: { schema: createRoleSchema },
            },
          ],
          policies: [
            ...(item.config?.policies || []),
            { name: 'global::is-onboarded', config: { allowAdmin: true } },
          ],
        }
      }
      if (item.method == 'PUT' && item.path == '/roles/:role') {
        item.config = {
          ...item.config,
          middlewares: [
            ...(item.config?.middlewares || []),
            {
              name: 'global::validate-schema',
              config: { schema: updateRoleSchema },
            },
          ],
          policies: [
            ...(item.config?.policies || []),
            { name: 'global::is-onboarded', config: { allowAdmin: true } },
          ],
        }
      }
      if (item.method == 'DELETE' && item.path == '/roles/:role') {
        item.config = {
          ...item.config,
          policies: [
            ...(item.config?.policies || []),
            { name: 'global::is-onboarded', config: { allowAdmin: true } },
          ],
        }
      }
      return item
    }
  )

  plugin.routes['content-api'].routes.push(
    {
      method: 'POST',
      path: '/auth/local/token-refresh',
      handler: 'auth.refreshToken',
      config: {
        policies: [],
        prefix: '',
      },
    },
    {
      method: 'GET',
      path: '/auth/verify-reset-password',
      handler: 'auth.verifyResetPasswordLink',
      config: {
        auth: false,
        policies: [],
        prefix: '',
      },
    }
  )

  plugin.controllers.settings.updateEmailTemplate = async (ctx) => {
    if (_.isEmpty(ctx.request.body)) {
      throw new ValidationError('Request body cannot be empty');
    }

    const emailTemplates = ctx.request.body['email-templates'];

    for (const key of Object.keys(emailTemplates)) {
      const template = emailTemplates[key].options.message;

      if (!isValidEmailTemplate(template)) {
        throw new ValidationError('Invalid template');
      }
    }

    await strapi
      .store({ type: 'plugin', name: 'users-permissions', key: 'email' })
      .set({ value: emailTemplates });

    ctx.send({ ok: true });
  };

  return plugin
}

function generatePassword() {
  var length = 8,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    retVal = ''
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n))
  }
  return retVal
}

// issue a JWT
const issueJWT = (payload, jwtOptions = {}) => {
  _.defaults(jwtOptions, strapi.config.get('plugin.users-permissions.jwt'))
  return jwt.sign(
    _.clone(payload.toJSON ? payload.toJSON() : payload),
    strapi.config.get('plugin.users-permissions.jwtSecret'),
    jwtOptions
  )
}

// verify the refreshToken by using the REFRESH_SECRET from the .env
const verifyRefreshToken = (token) => {
  return new Promise(function (resolve, reject) {
    jwt.verify(
      token,
      process.env.REFRESH_SECRET,
      {},
      function (err, tokenPayload = {}) {
        if (err) {
          return reject(new Error('Invalid token.'))
        }
        resolve(tokenPayload)
      }
    )
  })
}

// issue a Refresh token
const issueRefreshToken = (payload, jwtOptions = {}) => {
  _.defaults(jwtOptions, strapi.config.get('plugin.users-permissions.jwt'))
  return jwt.sign(
    _.clone(payload.toJSON ? payload.toJSON() : payload),
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
  )
}
