'use strict'

/**
 * forum-comment controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController(
  'api::forum-comment.forum-comment',
  () => ({
    async create(ctx) {
      // @ts-ignore
      const { data } = ctx.request.body
      data.user = ctx.state.user.id
      return super.create(ctx)
    },
    update() {
      return { data: true }
    },
    async delete() {
      return { data: true }
      // const user = ctx.state.user;
      // const commentId = ctx.params.id;
      // const comment = await strapi.db.query("api::forum-comment.forum-comment").findOne({
      //   where: {
      //     id: commentId
      //   },
      //   populate: ['user', 'forum_post', 'forum_post.user']
      // })
      // if (user.id === comment?.user.id || user.id === comment?.forum_post?.user.id){
      //   return super.delete(ctx)
      // }
      // return ctx.notFound()
    },
  })
)
