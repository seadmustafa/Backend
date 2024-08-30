'use strict'

/**
 * forum service
 */

const { createCoreService } = require('@strapi/strapi').factories
const { errors } = require('@strapi/utils')
const { ApplicationError } = errors

module.exports = createCoreService(
  'api::forum-post.forum-post',
  ({ strapi }) => ({
    async create(body) {
      const { data } = body
      const badWords = await this.checkForBadWords(data.content)
      if (badWords.length > 0) {
        throw new ApplicationError(
          `Your post contains a term that's flagged as sensitive: ${badWords
            .map((e) => `"${e}"`)
            .join(',')}. Kindly revise your post to proceed`
        )
      }
      return super.create(body)
    },
    async checkForBadWords(paragraph) {
      // TODO: Optimize later
      if (!paragraph) return []
      const _paragraph = ` ${paragraph.toLowerCase()} `
      const badWords = await strapi.db
        .query('api::sensitive-word.sensitive-word')
        .findMany({ select: ['words'] })
      return badWords
        .map((e) =>
          _paragraph.includes(` ${e.words.toLowerCase()} `)
            ? e.words
            : undefined
        )
        .filter((x) => x != undefined)
    },
    async update(id, body) {
      const { data } = body
      const badWords = await this.checkForBadWords(data.content)
      if (badWords.length > 0) {
        throw new ApplicationError(
          `Your post contains a term that's flagged as sensitive: ${badWords
            .map((e) => `"${e}"`)
            .join(',')}. Kindly revise your post to proceed`
        )
      }
      return super.update(id, body)
    },
  })
)
