'use strict'

const {
  createNewsPostCategorySchema,
} = require('../validation/news-post-category')

/**
 * news-post-category router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

module.exports = createCoreRouter(
  'api::news-post-category.news-post-category',
  {
    config: {
      create: {
        middlewares: [
          {
            name: 'global::validate-schema',
            config: { schema: createNewsPostCategorySchema },
          },
        ],
        policies: [
          {
            name: 'global::is-onboarded',
            config: { allowAdmin: true },
          },
        ],
      },
    },
  }
)
