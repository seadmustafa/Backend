'use strict'

/**
 * log-blockchain router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

module.exports = createCoreRouter('api::log-blockchain.log-blockchain', {
  only: [],
})
