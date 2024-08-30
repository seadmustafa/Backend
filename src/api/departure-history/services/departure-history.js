'use strict'

/**
 * departure-history service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::departure-history.departure-history')
