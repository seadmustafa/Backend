'use strict'

const { createSensitiveWordSchema } = require('../validation/sensitive-word')

/**
 * sensitive-word router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

module.exports = createCoreRouter('api::sensitive-word.sensitive-word', {
  only: ['find', 'delete', 'create'],
  config: {
    create: {
      middlewares: [
        {
          name: 'global::validate-schema',
          config: { schema: createSensitiveWordSchema },
        },
      ],
    },
  },
})
