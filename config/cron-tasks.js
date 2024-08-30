const { Connection } = require('../src/utils/blockchain')

module.exports = {
  updateStatusHalalCertificateDaily: {
    task: async ({ strapi }) => {
      const users = await strapi.db
        .query('plugin::users-permissions.user')
        .findMany({
          populate: [
            'onboarding_information',
            'onboarding_information.certificateInfo',
          ],
          where: {
            onboarding_information: {
              certificateInfo: {
                expiryDate: {
                  $gte: new Date(),
                },
              },
            },
          },
        })
      const certifiedUserIds = users.map((e) => e.id)
      // TODO:
      const toUpdate = await strapi.db
        .query('plugin::users-permissions.user')
        .findMany({
          populate: [
            'onboarding_information',
            'onboarding_information.certificateInfo',
          ],
          where: {
            id: {
              $notIn: certifiedUserIds,
            },
            onboarded: true,
            onboarding_information: {
              certificateInfo: {
                id: {
                  $notNull: true,
                },
              },
            },
          },
        })
      const toUpdateIds = toUpdate.map((e) => e.id)
      await strapi.db.query('plugin::users-permissions.user').updateMany({
        where: {
          id: {
            $in: toUpdateIds,
          },
        },
        data: {
          onboarded: false,
        },
      })
      strapi.log.info('Job check user onboard status complete!', new Date())
    },
    options: {
      rule: '0 0 0 * * *',
    },
  },
  syncOnboardingInformation: {
    task: async ({ strapi }) => {
      return await strapi.db
        .transaction(async () => {
          const logs = await strapi.db
            .query('api::log-blockchain.log-blockchain')
            .findMany({
              where: {
                channel: 'OnboardingInformation',
              },
              select: ['id', 'blockchainId'],
            })
          const blockchainIds = logs.map((i) => {
            return i.blockchainId
          })
          if (blockchainIds.length > 0) {
            const ids = logs.map((i) => {
              return i.id
            })
            const resultBytes = await Connection.contract.submitTransaction(
              'queryOrgsByListIds',
              JSON.stringify(blockchainIds)
            )
            const resultString = new TextDecoder().decode(resultBytes)
            const result = JSON.parse(resultString.toString())
            await Promise.all(
              result.map(async (item) => {
                // item.contactInformation = item.contactInformation ? JSON.parse(item.contactInformation) : null;
                const certBlockchainIds = JSON.parse(item.certificateInfo)
                const certs = await strapi.db
                  .query('api::halal-certificate.halal-certificate')
                  .findMany({
                    where: {
                      blockchainId: {
                        $in: certBlockchainIds,
                      },
                    },
                    select: 'id',
                  })
                item.certificateInfo = certs.map((i) => {
                  return i.id
                })
                item.productType = item.productTypeAndIngredients
                const { id, productTypeAndIngredients, ...updates } = item
                return strapi.db
                  .query('api::onboarding-information.onboarding-information')
                  .update({
                    where: {
                      blockchainId: item.id,
                    },
                    data: { ...updates },
                  })
              })
            )
            await strapi.db
              .query('api::log-blockchain.log-blockchain')
              .deleteMany({
                where: {
                  id: { $in: ids },
                },
              })
            strapi.log.info(
              'Job sync onboarding information complete!',
              new Date()
            )
          }
        })
        .catch((err) => {
          strapi.log.error('Job sync onboarding information fail:', err)
        })
    },
    options: {
      rule: '*/5 * * * *',
    },
  },
  syncHalalCertificate: {
    task: async ({ strapi }) => {
      return await strapi.db
        .transaction(async () => {
          const logs = await strapi.db
            .query('api::log-blockchain.log-blockchain')
            .findMany({
              where: {
                channel: 'HalaCertificates',
              },
              select: ['id', 'blockchainId'],
            })
          const blockchainIds = logs.map((i) => {
            return i.blockchainId
          })
          if (blockchainIds.length > 0) {
            const ids = logs.map((i) => {
              return i.id
            })
            const resultBytes = await Connection.contract.submitTransaction(
              'queryCertificateRequestByListIds',
              JSON.stringify(blockchainIds)
            )
            const resultString = new TextDecoder().decode(resultBytes)
            const result = JSON.parse(resultString.toString())
            await Promise.all(
              result.map(async (item) =>
                strapi.db
                  .query('api::halal-certificate.halal-certificate')
                  .update({
                    where: {
                      blockchainId: item.blockChainRequestId,
                    },
                    data: { ...item },
                  })
              )
            )
            await strapi.db
              .query('api::log-blockchain.log-blockchain')
              .deleteMany({
                where: {
                  id: { $in: ids },
                },
              })
            strapi.log.info('Job sync halal certificate complete!', new Date())
          }
        })
        .catch((err) => {
          strapi.log.error('Job sync halal certificate fail:', err)
        })
    },
    options: {
      rule: '*/5 * * * *',
    },
  },
  syncSupplyChainRecord: {
    task: async ({ strapi }) => {
      return await strapi.db
        .transaction(async () => {
          const logs = await strapi.db
            .query('api::log-blockchain.log-blockchain')
            .findMany({
              where: {
                channel: 'SupplyChainRecords',
              },
              select: ['blockchainId'],
            })
          const blockchainIds = Object.keys(
            logs.reduce((prev, curr) => {
              if (!prev.hasOwnProperty(curr.blockchainId)) {
                prev[curr.blockchainId] = 1
              }
              return prev
            }, {})
          )
          if (blockchainIds.length > 0) {
            const resultBytes = await Connection.contract.submitTransaction(
              'getRecordsByListOfRecordIds',
              JSON.stringify(blockchainIds)
            )
            const resultString = new TextDecoder().decode(resultBytes)
            const result = JSON.parse(resultString.toString())
            await Promise.all(
              result.map((e) =>
                strapi.db
                  .query('api::supply-chain-record.supply-chain-record')
                  .update({
                    where: {
                      blockchainId: e.recordId,
                    },
                    data: { ...e, departure_histories: e.departureHistories },
                  })
              )
            )
            await strapi.db
              .query('api::log-blockchain.log-blockchain')
              .deleteMany({
                where: {
                  blockchainId: { $in: blockchainIds },
                },
              })
            strapi.log.info(
              'Job sync supply chain record complete!',
              new Date()
            )
          }
        })
        .catch((err) => {
          strapi.log.error('Error when syncing supply chain record blockchain')
        })
    },
    options: {
      rule: '*/5 * * * *',
    },
  },
}
