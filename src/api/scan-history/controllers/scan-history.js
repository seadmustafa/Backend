'use strict'

/**
 * scan-history controller
 */
const { sanitize } = require('@strapi/utils')
const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController(
  'api::scan-history.scan-history',
  ({ strapi }) => ({
    async create(ctx) {
      // @ts-ignore
      const batchId = ctx.request.body.data.batchId
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
      const record = await strapi.db
        .query('api::scan-history.scan-history')
        .findOne({
          where: {
            user: ctx.state.user.id,
            record: batch.id,
          },
        })
      if (record) {
        await strapi.entityService.update(
          'api::scan-history.scan-history',
          record.id,
          {
            data: {
              updatedAt: new Date().toISOString(),
            },
          }
        )
      } else {
        // @ts-ignore
        ctx.request.body.data = { user: ctx.state.user.id, record: batch.id }
        await super.create(ctx)
      }
      return { data: true }
    },
    async find(ctx) {
      const userId = ctx.state.user.id

      ctx.query = {
        ...ctx.query,
        filters: {
          ...(ctx.query.filters
            ? // @ts-ignore
              { ...ctx.query.filters }
            : {}),
          user: {
            id: userId,
          },
        },
      }
      return super.find(ctx)
    },
    async findOne(ctx) {
      const batchId = ctx.params.id
      // @ts-ignore
      ctx.query.filters = {
        user: { id: ctx.state.user.id },
        record: { batchId: batchId },
      }
      ctx.query.populate = 'record,record.productImages,record.productType'

      const data = await super.find(ctx)
      if (data.data.length == 0) return ctx.notFound()
      const supplyChainId =
        data.data[0].attributes.record.data.attributes.supplyChainId
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
      return {
        data: { batch: data.data[0], supplyChain: sanitizedSupplyChain },
      }
    },
  })
)
