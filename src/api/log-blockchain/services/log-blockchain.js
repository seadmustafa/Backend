'use strict'

/**
 * log-blockchain service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::log-blockchain.log-blockchain')
