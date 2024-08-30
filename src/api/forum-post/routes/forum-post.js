'use strict'

const { customRouter } = require('../../../utils/custom-router')
const {
  createForumPostSchema,
  updateForumPostSchema,
} = require('../validation/forum-post')

/**
 * forum router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

const defaultRouter = createCoreRouter('api::forum-post.forum-post', {
  config: {
    create: {
      middlewares: [
        {
          name: 'global::validate-schema',
          config: { schema: createForumPostSchema },
        },
      ],
    },
    update: {
      middlewares: [
        {
          name: 'global::validate-schema',
          config: { schema: updateForumPostSchema },
        },
      ],
    },
  },
})

const myOverrideRoute = []

const myExtraRoutes = [
  {
    method: 'POST',
    path: '/forum-posts/:id/like',
    handler: 'api::forum-post.forum-post.like',
  },
]

module.exports = customRouter(defaultRouter, myOverrideRoute, myExtraRoutes)
