'use strict'

/**
 * news-post controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController('api::news-post.news-post', () => ({
  create(ctx) {
    const userId = ctx.state.user.id
    // @ts-ignore
    ctx.request.body.data.publisher = userId
    return super.create(ctx)
  },
}))
