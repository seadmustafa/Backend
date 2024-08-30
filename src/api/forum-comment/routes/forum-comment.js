'use strict'

const { createForumCommentSchema } = require('../validation/forum-comment')

/**
 * forum-comment router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

module.exports = createCoreRouter('api::forum-comment.forum-comment', {
  config: {
    create: {
      middlewares: [
        {
          name: 'global::validate-schema',
          config: { schema: createForumCommentSchema },
        },
      ],
    },
  },
})
