'use strict'

/**
 * certification-body controller
 */

const { sanitize } = require('@strapi/utils')

const includes = {
  users: 'plugin::users-permissions.user',
  role: 'plugin::users-permissions.role',
  permission: 'plugin::users-permissions.permission',
}

module.exports = {
  async find(ctx) {
    try {
      const { users, permission } = includes
      const listPermissions = await strapi.db.query(permission).findMany({
        where: { action: 'api::halal-certificate.halal-certificate.review' },
        populate: ['role'],
      })
      const roleIds = listPermissions.map((item) => item.role.id)
      const result = await strapi
        .service('api::onboarding-information.onboarding-information')
        .find({
          ...ctx.query,
          populate: ['user', 'user.role', 'brandLogo', 'license'],
          filters: {
            ...ctx.query?.filters,
            user: {
              role: {
                id: {
                  $in: roleIds,
                },
              },
              onboarded: true,
            },
          },
        })
      const data = await Promise.all(
        result.results.map(async (e) => ({
          ...e,
          user: await sanitize.contentAPI.output(
            e.user,
            // @ts-ignore
            strapi.getModel(users)
          ),
        }))
      )
      return ctx.send({ results: data, pagination: result.pagination }, 200)
    } catch {
      return ctx.internalServerError('Something went wrong!')
    }
  },
  async findOne(ctx) {
    const id = ctx.params.id
    const { users, permission } = includes
    const listPermissions = await strapi.db.query(permission).findMany({
      where: { action: 'api::halal-certificate.halal-certificate.review' },
      populate: ['role'],
    })
    const roleIds = listPermissions.map((item) => item.role.id)
    const onboardingInformation = await strapi.db
      .query('api::onboarding-information.onboarding-information')
      .findOne({
        populate: ['user', 'user.role', 'user.role', 'brandLogo', 'license'],
        where: {
          id: id,
          user: {
            role: {
              id: {
                $in: roleIds,
              },
            },
            onboarded: true,
          },
        },
      })
    if (!onboardingInformation) return ctx.notFound()
    return {
      data: {
        ...onboardingInformation,
        user: await sanitize.contentAPI.output(
          onboardingInformation.user,
          // @ts-ignore
          strapi.getModel(users)
        ),
      },
    }
  },
}
