'use strict'

const {
  createNewsPostSchema,
  updateNewsPostSchema,
} = require('../validation/news-post')

/**
 * news-post router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

module.exports = createCoreRouter('api::news-post.news-post', {
  config: {
    create: {
      middlewares: [
        {
          name: 'global::validate-schema',
          config: { schema: createNewsPostSchema },
        },
      ],
      policies: [
        {
          name: 'global::is-onboarded',
          config: { allowAdmin: true },
        },
      ],
    },
    update: {
      middlewares: [
        {
          name: 'global::validate-schema',
          config: { schema: updateNewsPostSchema },
        },
      ],
      policies: [
        {
          name: 'global::is-onboarded',
          config: { allowAdmin: true },
        },
      ],
    },
    delete: {
      policies: [
        {
          name: 'global::is-onboarded',
          config: { allowAdmin: true },
        },
      ],
    },
  },
})
