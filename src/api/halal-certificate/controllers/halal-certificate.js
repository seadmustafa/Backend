'use strict'

const { Connection } = require('../../../utils/blockchain')

/**
 * halal-certificate controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController(
  'api::halal-certificate.halal-certificate',
  ({ strapi }) => ({
    async request(ctx) {
      try {
        return ctx.send({ data: true }, 200)
      } catch {
        return ctx.internalServerError('Something went wrong!')
      }
    },
    async review(ctx) {
      await strapi.db
        .transaction(async () => {
          ctx.query.populate = 'evidencePaths,createdRequestId'
          // @ts-ignore
          const data = ctx.request.body.data
          const certificate = await strapi.entityService.findOne(
            'api::halal-certificate.halal-certificate',
            ctx.params.id,
            {
              populate: ['certificationBodyId'],
            }
          )
          if (
            certificate.type == 'Request' &&
            data.status == 'Approved' &&
            (data.evidencePaths == null || data.evidencePaths?.length == 0)
          ) {
            return ctx.badRequest('evidencePaths is required!')
          }
          if (certificate.certificationBodyId.id != ctx.state.user.id) {
            return ctx.notFound()
          }
          if (certificate.status != 'Pending') {
            return ctx.forbidden('Certification review process is completed!')
          }
          const updated = await super.update(ctx)
          if (updated.data.attributes.status == 'Approved') {
            await strapi.entityService.update(
              'plugin::users-permissions.user',
              updated.data.attributes.createdRequestId.data.id,
              {
                data: {
                  onboarded: true,
                },
              }
            )
          }
          await Connection.contract.submitTransaction(
            'updateCertificate',
            updated.data.attributes.blockchainId,
            JSON.stringify(data)
          )
          await strapi.entityService.create(
            'api::log-blockchain.log-blockchain',
            {
              data: {
                channel: 'HalaCertificates',
                blockchainId: updated.data.attributes.blockchainId,
              },
            }
          )
        })
        .catch(() => {
          return ctx.internalServerError('Something went wrong!')
        })
      return { data: true }
    },
  })
)
