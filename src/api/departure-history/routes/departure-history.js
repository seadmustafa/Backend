'use strict'

/**
 * departure-history router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

module.exports = createCoreRouter('api::departure-history.departure-history', {
  only: ['find'],
})
