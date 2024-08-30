'use strict'

/**
 * onboarding-information controller
 */
const _ = require('lodash')
const { createCoreController } = require('@strapi/strapi').factories
const { Connection } = require('../../../utils/blockchain')
const { PREFIX } = require('../../../constants/prefix')
const { generateId } = require('../../../utils/generate-id')
const { PAD } = require('../../../constants/pad')

/**
 * @type {{ users: "plugin::users-permissions.user", onboarding: "api::onboarding-information.onboarding-information", role: "plugin::users-permissions.role", permission: "plugin::users-permissions.permission", certificate: "api::halal-certificate.halal-certificate", productType: "api::product-type.product-type", supplyChainRecord: "api::supply-chain-record.supply-chain-record" }}
 */
const includes = {
  users: 'plugin::users-permissions.user',
  role: 'plugin::users-permissions.role',
  permission: 'plugin::users-permissions.permission',
  onboarding: 'api::onboarding-information.onboarding-information',
  certificate: 'api::halal-certificate.halal-certificate',
  productType: 'api::product-type.product-type',
  supplyChainRecord: 'api::supply-chain-record.supply-chain-record',
}

module.exports = createCoreController(
  'api::onboarding-information.onboarding-information',
  ({ strapi }) => ({
    async create(ctx) {
      return strapi.db
        .transaction(async () => {
          const { users, onboarding, certificate, productType } = includes
          const userId = ctx.state.user.id
          // @ts-ignore
          const data = ctx.request.body.data
          data.user = userId
          if (data.halalCertificate && data.halalCertificate != null) {
            data.halalCertificate.createdRequestId = userId
          }
          let productTypes
          if (data.productType) {
            const createdData = await Promise.all(
              data.productType.map(async (e) => {
                return await strapi.entityService.create(productType, {
                  data: {
                    productType: e.productType,
                    productIngredients: e.productIngredients,
                    publishedAt: new Date().toISOString(),
                  },
                })
              })
            )
            productTypes = {
              connect: createdData.map((e) => e.id),
            }
            delete data.productType
          }
          const newOnboarding = await super.create(ctx)
          if (productTypes) {
            await strapi.entityService.update(
              onboarding,
              newOnboarding.data.id,
              {
                data: {
                  productType: productTypes,
                },
              }
            )
            // Synchronize blockchain
            data.productTypeAndIngredients = productTypes.connect
          }
          let isOnboarded = true
          let newCertificate
          // @ts-ignore
          if (
            ctx.request.body.data.halalCertificate &&
            ctx.request.body.data.halalCertificate != null
          ) {
            // @ts-ignore
            const { halalCertificate } = ctx.request.body.data
            if (!halalCertificate.expiryDate) {
              isOnboarded = false
            }
            halalCertificate.status = 'Pending'
            if (!_.isNil(halalCertificate.certificationBodyId)) {
              const certs = await strapi.entityService.findMany(
                'api::halal-certificate.halal-certificate',
                {
                  sort: {
                    requestId: 'desc',
                  },
                }
              )
              let currentRequestId = 0
              if (certs.length > 0) {
                currentRequestId =
                  +certs[0].requestId?.substring(PREFIX.REQUEST_ID.length) || 0
              }
              halalCertificate.requestId = generateId(
                PREFIX.REQUEST_ID,
                PAD.REQUEST_ID,
                currentRequestId + 1
              )
              const info = await strapi.db.query(onboarding).findOne({
                where: {
                  user: {
                    id: halalCertificate.certificationBodyId,
                  },
                },
              })
              halalCertificate.certificationBodyName = info.organizationName
            }
            newCertificate = await strapi.entityService.create(certificate, {
              data: {
                requestId: halalCertificate.requestId,
                createdRequestId: halalCertificate.createdRequestId,
                certificationBodyId: halalCertificate.certificationBodyId,
                certificationBodyIdOther:
                  halalCertificate.certificationBodyIdOther,
                certificationBodyName: halalCertificate.certificationBodyName,
                certificatePaths: halalCertificate.certificatePaths,
                type: halalCertificate.type,
                expiryDate: halalCertificate.expiryDate,
                status: halalCertificate.status,
                publishedAt: new Date().toISOString(),
              },
            })
            await strapi.db.query(onboarding).update({
              where: {
                id: newOnboarding.data.id,
              },
              data: {
                certificateInfo: [newCertificate.id],
              },
            })
          }
          if (isOnboarded) {
            await strapi.db.query(users).update({
              where: {
                id: userId,
              },
              data: {
                onboarded: true,
              },
            })
          }
          // @ts-ignore
          const orgData = JSON.stringify(ctx.request.body.data)
          const resultBytes = await Connection.contract.submitTransaction(
            'createOrg',
            orgData
          )
          const resultString = new TextDecoder().decode(resultBytes)
          const result = JSON.parse(resultString.toString())
          await strapi.entityService.update(onboarding, newOnboarding.data.id, {
            data: {
              blockchainId: result.orgId,
            },
          })
          strapi
            .service(onboarding)
            .saveLogBlockchain(result.orgId, 'OnboardingInformation')
          if (newCertificate) {
            await strapi.entityService.update(certificate, newCertificate.id, {
              data: {
                blockchainId: result.certId,
              },
            })
            strapi
              .service(onboarding)
              .saveLogBlockchain(result.certId, 'HalaCertificates')
          }
          return ctx.send({ data: true }, 200)
        })
        .catch(() => {
          return ctx.internalServerError('Something went wrong!')
        })
    },
    async update(ctx) {
      return strapi.db
        .transaction(async () => {
          const {
            certificate,
            onboarding,
            users,
            productType,
            supplyChainRecord,
          } = includes
          const onboardingInformation = await strapi.db
            .query(onboarding)
            .findOne({
              populate: ['user'],
              where: {
                id: ctx.params.id,
                user: {
                  id: ctx.state.user.id,
                },
              },
            })
          if (!onboardingInformation) return ctx.notFound()
          // @ts-ignore
          const data = ctx.request.body.data
          if (data.productType) {
            //Refactor later
            const current = await strapi.entityService.findOne(
              onboarding,
              ctx.params.id,
              {
                populate: ['productType'],
              }
            )
            let existedProductType // Product type of current onboarding information
            let existedProductTypeInSplcs
            let canBeUpdated
            if (
              current.productType &&
              Object.keys(current.productType).length > 0
            ) {
              existedProductType = current.productType.reduce((prev, curr) => {
                prev[curr.id] = true
                return prev
              }, {})
              const splcs = await strapi.entityService.findMany(
                supplyChainRecord,
                {
                  populate: ['productType'],
                  filters: {
                    productType: {
                      id: {
                        $in: current.productType.map((e) => e.id),
                      },
                    },
                  },
                }
              )
              if (splcs.length > 0) {
                existedProductTypeInSplcs = splcs.reduce((prev, curr) => {
                  prev[curr.productType.id] = true
                  return prev
                }, {})
                if (Object.keys(existedProductTypeInSplcs).length > 0) {
                  const ids = Object.keys(existedProductTypeInSplcs)
                  canBeUpdated = _.difference(
                    Object.keys(existedProductType),
                    ids
                  ).map((e) => Number(e)) // 3,4
                  const a = data.productType
                    .filter((e) => e.id != undefined)
                    .map((e) => e.id)
                  const b = _.intersection(canBeUpdated, a).map((e) =>
                    Number(e)
                  )
                  await strapi.db.query(productType).deleteMany({
                    where: {
                      id: {
                        $in: _.difference(canBeUpdated, b).map((e) =>
                          Number(e)
                        ),
                      },
                    },
                  })
                }
              } else {
                const submittedProductTypeIds = data.productType
                  .filter((e) => e.id != undefined)
                  .map((e) => e.id)
                const existedProductTypeIds = Object.keys(
                  existedProductType
                ).map((e) => Number(e))
                await strapi.db.query(productType).deleteMany({
                  where: {
                    id: {
                      $in: _.difference(
                        existedProductTypeIds,
                        submittedProductTypeIds
                      ).map((e) => Number(e)),
                    },
                  },
                })
              }
            }
            const created = []
            await Promise.all(
              data.productType.map(async (e) => {
                const { id, ...rest } = e

                if (id && existedProductType && existedProductType[id]) {
                  return await strapi.entityService.update(productType, e.id, {
                    data: rest,
                  })
                }
                const a = await strapi.entityService.create(productType, {
                  data: {
                    ...rest,
                    publishedAt: new Date().toISOString(),
                  },
                })
                created.push(a.id)
                return a
              })
            )
            await strapi.entityService.update(onboarding, ctx.params.id, {
              data: {
                productType: {
                  connect: created,
                },
              },
            })
            delete data.productType
          }
          ctx.query.populate = 'productType'
          const updatedOnboarding = await super.update(ctx)
          let newCertificate
          if (data.halalCertificate && data.halalCertificate != null) {
            const { halalCertificate } = data
            // Create new certificate request
            // Only create new certificate request
            halalCertificate.status = 'Pending'
            if (!halalCertificate.blockchainId) {
              if (!_.isNil(halalCertificate.certificationBodyId)) {
                const certs = await strapi.entityService.findMany(
                  'api::halal-certificate.halal-certificate',
                  {
                    sort: {
                      requestId: 'desc',
                    },
                  }
                )
                let currentRequestId = 0
                if (certs.length > 0) {
                  currentRequestId =
                    +certs[0].requestId?.substring(PREFIX.REQUEST_ID.length) ||
                    0
                }
                halalCertificate.requestId = generateId(
                  PREFIX.REQUEST_ID,
                  PAD.REQUEST_ID,
                  currentRequestId + 1
                )
                const info = await strapi.db.query(onboarding).findOne({
                  where: {
                    user: {
                      id: halalCertificate.certificationBodyId,
                    },
                  },
                })
                halalCertificate.certificationBodyName = info.organizationName
              }
              newCertificate = await strapi.db.query(certificate).create({
                data: {
                  ...halalCertificate,
                  createdRequestId: ctx.state.user.id,
                  publishedAt: new Date().toISOString(),
                },
              })
              // Update onboarding information
              await strapi.entityService.update(onboarding, ctx.params.id, {
                data: {
                  certificateInfo: {
                    connect: [newCertificate.id],
                  },
                },
              })
              // When update, this user is marked onboarded = false, update this status only user upload other certificate
              if (halalCertificate.expiryDate) {
                await strapi.db.query(users).update({
                  where: {
                    id: ctx.state.user.id,
                  },
                  data: {
                    onboarded: true,
                  },
                })
              }
            }
            // else {
            //   await strapi.entityService.update(certificate, certificationInfo, {
            //     data: {
            //       ...halalCertificate
            //     },
            //   });
            // }
          }
          // Blockchain already check and create new certificate request if needed.
          data.productTypeAndIngredients =
            updatedOnboarding.data.attributes.productType?.data?.map(
              (e) => e.id
            )
          const updates = JSON.stringify(data)
          const resultBytes = await Connection.contract.submitTransaction(
            'updateOrg',
            updatedOnboarding.data.attributes.blockchainId,
            updates
          )
          strapi
            .service(onboarding)
            .saveLogBlockchain(
              updatedOnboarding.data.attributes.blockchainId,
              'OnboardingInformation'
            )
          const resultString = new TextDecoder().decode(resultBytes)
          const result = JSON.parse(resultString.toString())
          if (newCertificate) {
            await strapi.entityService.update(certificate, newCertificate.id, {
              data: {
                blockchainId: result.certId,
              },
            })
            strapi
              .service(onboarding)
              .saveLogBlockchain(result.certId, 'HalaCertificates')
          }
          return ctx.send({ data: true }, 200)
        })
        .catch(() => {
          return ctx.internalServerError('Something went wrong!')
        })
    },
    async listCertificateReviewer(ctx) {
      try {
        const { role, permission } = includes
        const listPermissons = await strapi.db.query(permission).findMany({
          where: { action: 'api::halal-certificate.halal-certificate.review' },
          populate: ['role'],
        })
        const roleIds = listPermissons.map((item) => {
          return item.role.id
        })
        const listRoles = await strapi.db.query(role).findMany({
          where: { id: { $in: roleIds } },
          populate: ['users', 'users.onboarding_information'],
        })
        let users = []
        listRoles.forEach((item) => {
          item.users.forEach((i) => {
            if (i.onboarded) {
              users.push({
                id: i.id,
                username: i.username,
                email: i.email,
                name: i.name,
                onboarding_information: i.onboarding_information,
              })
            }
          })
        })
        return ctx.send({ data: users }, 200)
      } catch {
        return ctx.internalServerError('Something went wrong!')
      }
    },
  })
)
