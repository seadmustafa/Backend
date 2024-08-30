'use strict'

/**
 * sensitive-word controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController(
  'api::sensitive-word.sensitive-word',
  ({ strapi }) => ({
    async create(ctx) {
      // @ts-ignore
      const data = ctx.request.body.data
      const word = data.words.trim()
      if (!word) return ctx.internalServerError('Word is required!')
      const dt = await strapi.db.query('api::forum-post.forum-post').findMany({
        where: {
          $or: [
            {
              content: {
                $startsWithi: `${word} `,
              },
            },
            {
              content: {
                $endsWithi: ` ${word}`,
              },
            },
            {
              content: {
                $containsi: word,
              },
            },
          ],
        },
      })
      data.forum_posts = dt.map((e) => e.id)
      return await super
        .create(ctx)
        .then(() => {
          return { ok: true }
        })
        .catch((err) => {
          if (err.message == 'This attribute must be unique')
            err.message = 'The keyword already exists in the system'
          return ctx.internalServerError(err.message)
        })
    },
  })
)
