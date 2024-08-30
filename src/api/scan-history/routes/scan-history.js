'use strict'

/**
 * scan-history router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

module.exports = createCoreRouter('api::scan-history.scan-history', {
  only: ['find', 'findOne', 'create'],
})
