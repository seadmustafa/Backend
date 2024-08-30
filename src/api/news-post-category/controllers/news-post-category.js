'use strict'

/**
 * news-post-category controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController(
  'api::news-post-category.news-post-category',
  () => ({
    async create(ctx) {
      try {
        return await super.create(ctx)
      } catch (err) {
        if (err.message == 'This attribute must be unique')
          err.message =
            'The category already exists in the system, please check again'
        return ctx.badRequest(err.message)
      }
    },
  })
)
