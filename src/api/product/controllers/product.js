'use strict'

/**
 * product controller
 */
const { sanitize } = require('@strapi/utils')

module.exports = {
  async find() {
    return { data: true }
  },
  async findOne(ctx) {
    const batchId = ctx.params.id
    const batch = await strapi.db
      .query('api::supply-chain-record.supply-chain-record')
      .findOne({
        where: {
          batchId,
          sender: {
            role: {
              releaseQR: true,
            },
          },
        },
        populate: ['sender', 'sender.role'],
      })
    if (!batch) return ctx.notFound()
    await strapi.entityService.create('api::scan-history.scan-history', {
      data: {
        user: ctx.state.user.id,
        record: batch.id,
      },
    })
    const supplyChainId = batch.supplyChainId
    const supplyChain = await strapi.db
      .query('api::supply-chain-record.supply-chain-record')
      .findMany({
        where: {
          supplyChainId,
        },
        populate: [
          'sender',
          'sender.role',
          'sender.onboarding_information',
          'sender.onboarding_information.certificateInfo',
          'receiver',
          'receiver.role',
          'receiver.onboarding_information',
          'receiver.onboarding_information.certificateInfo',
        ],
      })
    const userSchema = strapi.getModel('plugin::users-permissions.user')
    const sanitizedSupplyChain = await Promise.all(
      supplyChain.map(async (e) => {
        return {
          ...e,
          sender: await sanitize.contentAPI.output(e.sender, userSchema),
          receiver: await sanitize.contentAPI.output(e.receiver, userSchema),
        }
      })
    )
    return { data: { batch, supplyChain: sanitizedSupplyChain } }
  },
}
