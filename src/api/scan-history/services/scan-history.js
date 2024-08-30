'use strict'

/**
 * scan-history service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::scan-history.scan-history')
