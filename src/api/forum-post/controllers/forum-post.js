'use strict'

/**
 * forum controller
 */
const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController(
  'api::forum-post.forum-post',
  ({ strapi }) => ({
    async create(ctx) {
      // @ts-ignore
      const { data } = ctx.request.body
      data.user = ctx.state.user.id
      return super.create(ctx)
    },
    async delete(ctx) {
      const user = ctx.state.user
      const post = await strapi.db.query('api::forum-post.forum-post').findOne({
        where: {
          user: {
            id: user.id,
          },
          id: ctx.params.id,
        },
        populate: ['user'],
      })
      if (!post) return ctx.notFound()
      return super.delete(ctx)
    },
    async update(ctx) {
      const user = ctx.state.user
      const post = await strapi.db.query('api::forum-post.forum-post').findOne({
        where: {
          user: {
            id: user.id,
          },
          id: ctx.params.id,
        },
        populate: ['user'],
      })
      if (!post) return ctx.notFound()
      return super.update(ctx)
    },
    async like(ctx) {
      const postId = ctx.params.id
      const user = ctx.state.user
      const post = await strapi.db.query('api::forum-post.forum-post').findOne({
        populate: ['users_liked'],
        where: {
          id: postId,
        },
      })
      let isLiked = false
      const userIds = post.users_liked
        .map((e) => {
          if (e.id === user.id) {
            isLiked = true
            return undefined
          }
          return e.id
        })
        .filter((x) => x != undefined)
      await strapi.db.query('api::forum-post.forum-post').update({
        populate: ['users_liked'],
        where: {
          id: postId,
        },
        data: {
          users_liked: isLiked ? userIds : [...userIds, user.id],
        },
      })
      return { data: true }
    },

    async find(ctx) {
      const data = await super.find(ctx)
      if (data?.data?.length > 0) {
        const ids = data.data.map((e) => e.id)
        const userLikedPosts = await strapi.entityService.findMany(
          'api::forum-post.forum-post',
          {
            filters: {
              id: {
                $in: ids,
              },
              users_liked: {
                id: ctx.state.user.id,
              },
            },
          }
        )
        return { ...data, likes: userLikedPosts.map((e) => e.id) }
      }
      return data
    },
  })
)
