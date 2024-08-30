'use strict'

/**
 * otp controller.
 */

const { createCoreController } = require('@strapi/strapi').factories
const { sanitize } = require('@strapi/utils')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const { USER_SCOPE } = require('../../../constants/user-scope')
/**
 * @type {{ jwt: "plugin::users-permissions.jwt", users: "plugin::users-permissions.user", otpName: "api::otp.otp" }}
 */
const includes = {
  jwt: 'plugin::users-permissions.jwt',
  users: 'plugin::users-permissions.user',
  otpName: 'api::otp.otp',
}

module.exports = createCoreController(includes.otpName, ({ strapi }) => ({
  async verifyOtp(ctx) {
    return strapi.db
      .transaction(async () => {
        const { jwt, users, otpName } = includes
        const schema = strapi.getModel(otpName)
        // @ts-ignore
        const { email, otp } = await sanitize.contentAPI.input(
          ctx.request.body,
          schema,
          {}
        )
        if (!email || !otp) {
          return ctx.internalServerError('Email and Otp is a required field')
        }
        const checkStatus = await strapi.service(otpName).verifyOtp(email, otp)
        if (checkStatus) {
          let user = await strapi.db.query(users).findOne({
            where: { email },
            populate: ['onboarding_information'],
          })
          if (!user.isVerified) {
            user.isVerified = true
            user = await strapi.db.query(users).update({
              where: { id: user.id },
              data: {
                isVerified: true,
              },
            })
          }
          const jwtUser = strapi
            .service(jwt)
            .issue(
              { id: user.id },
              { expiresIn: process.env.JWT_SECRET_EXPIRES }
            )
          const refreshToken = issueRefreshToken({ id: user.id })
          const sanitizeUser = await sanitize.contentAPI.output(
            user,
            strapi.getModel(users)
          )
          return ctx.send(
            {
              data: checkStatus,
              jwt: jwtUser,
              refreshToken,
              user: sanitizeUser,
            },
            200
          )
        } else {
          return ctx.internalServerError('Invalid OTP')
        }
      })
      .catch(() => {
        return ctx.internalServerError('Something went wrong!')
      })
  },
  async resendOtp(ctx) {
    const { users, otpName } = includes
    const { email } = await sanitize.contentAPI.query(
      ctx.request.query,
      strapi.getModel(users),
      {}
    )

    const user = await strapi.db.query(users).findOne({
      where: { email },
    })
    if (!user) {
      return ctx.notFound('Invalid email')
    }

    const otpCode = await strapi.service(otpName).generateOtp(email)
    await strapi.service(otpName).sendMailOtp(email, otpCode, { name: user.scope  != USER_SCOPE.PORTAL ? user.name : '' })
    return ctx.send({ data: true }, 200)
  },
}))

// issue a Refresh token
const issueRefreshToken = (payload, jwtOptions = {}) => {
  _.defaults(jwtOptions, strapi.config.get('plugin.users-permissions.jwt'))
  return jwt.sign(
    _.clone(payload.toJSON ? payload.toJSON() : payload),
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
  )
}
