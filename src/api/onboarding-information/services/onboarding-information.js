'use strict'

/**
 * onboarding-information service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService(
  'api::onboarding-information.onboarding-information',
  ({ strapi }) => ({
    async saveLogBlockchain(blockchainId, channel) {
      const logBlockchain = 'api::log-blockchain.log-blockchain'
      await strapi.entityService.create(logBlockchain, {
        data: {
          blockchainId: blockchainId,
          channel: channel,
          publishedAt: new Date().toISOString(),
        },
      })
    },
  })
)
