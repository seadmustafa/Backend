'use strict'

/**
 * supply-chain-record service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService(
  'api::supply-chain-record.supply-chain-record'
)
