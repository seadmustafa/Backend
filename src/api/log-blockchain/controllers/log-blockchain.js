'use strict'

/**
 * log-blockchain controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController('api::log-blockchain.log-blockchain')
