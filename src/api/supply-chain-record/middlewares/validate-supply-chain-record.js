'use strict'

const { yup } = require('@strapi/utils')

const SupplyChainField = {
  batchID: 'arrivalBatchId',
  quantity: 'quantity',
  detailsOnAnimalFeed: 'detailsOnAnimalFeed',
  vaccinationDetails: 'vaccinationDetails',
  healthConditions: 'healthConditions',
  butchererDetails: 'butchererDetails',
  oneStrike: 'oneStrike',
  inWeight: 'inWeight',
  outWeight: 'outWeight',
  butcheringProcess: 'butcheringProcess',
  shippingDetails: 'shippingDetails',
  storageCondition: 'storageCondition',
  humidityLevels: 'humidityLevels',
  temperature: 'temperature',
  vehicleFleetSize: 'vehicleFleetSize',
  vehicleID: 'vehicleID',
  route: 'route',
  productImages: 'productImages',
  productName: 'productName',
  productDetails: 'productDetails',
  productionDate: 'productionDate',
  expirationDate: 'expirationDate',
  gtin: 'GTIN',
  productType: 'productType',
}

const RolePermissionSchema = {
  [SupplyChainField.batchID]: yup.string(),
  [SupplyChainField.quantity]: yup
    .string()
    .matches(/^[0-9]+$/)
    .max(20),
  [SupplyChainField.detailsOnAnimalFeed]: yup.string().max(300),
  [`${SupplyChainField.detailsOnAnimalFeed}Files`]: yup
    .array()
    .of(yup.number())
    .max(3)
    .nullable(),
  [SupplyChainField.vaccinationDetails]: yup.string().max(300),
  [`${SupplyChainField.vaccinationDetails}Files`]: yup
    .array()
    .of(yup.number())
    .max(3)
    .nullable(),
  [SupplyChainField.healthConditions]: yup.string().max(300),
  [`${SupplyChainField.healthConditions}Files`]: yup
    .array()
    .of(yup.number())
    .max(3)
    .nullable(),
  [SupplyChainField.butchererDetails]: yup.string().max(300),
  [`${SupplyChainField.butchererDetails}Files`]: yup
    .array()
    .of(yup.number())
    .max(3)
    .nullable(),
  [SupplyChainField.oneStrike]: yup.boolean(),
  [SupplyChainField.inWeight]: yup.string().max(20),
  [SupplyChainField.outWeight]: yup.string().max(20),
  [SupplyChainField.butcheringProcess]: yup.string().max(300),
  [`${SupplyChainField.butcheringProcess}Files`]: yup
    .array()
    .of(yup.number())
    .max(3)
    .nullable(),
  [SupplyChainField.shippingDetails]: yup.string().max(300),
  [`${SupplyChainField.shippingDetails}Files`]: yup
    .array()
    .of(yup.number())
    .max(3)
    .nullable(),
  [SupplyChainField.storageCondition]: yup.string().max(300),
  [`${SupplyChainField.storageCondition}Files`]: yup
    .array()
    .of(yup.number())
    .max(3)
    .nullable(),
  [SupplyChainField.humidityLevels]: yup
    .string()
    .matches(/^[+-]?\d+(\.\d+)?$/)
    .max(20),
  [SupplyChainField.vehicleFleetSize]: yup
    .string()
    .matches(/^[0-9]+$/)
    .max(20),
  [SupplyChainField.vehicleID]: yup
    .string()
    .matches(/^[0-9]+$/)
    .max(20),
  [SupplyChainField.temperature]: yup
    .string()
    .matches(/^[+-]?\d+(\.\d+)?$/)
    .max(20),
  [SupplyChainField.route]: yup.string().max(300),
  [SupplyChainField.productImages]: yup.array().of(yup.number()).max(3),
  [SupplyChainField.productName]: yup.string().max(50),
  [SupplyChainField.productDetails]: yup.string().max(300),
  [SupplyChainField.EnforcementStatus]: yup
    .mixed()
    .oneOf(['Compliant', 'NonCompliant', 'Unknown']),
  [SupplyChainField.productionDate]: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, '${label} must be in the format YYYY-MM-DD')
    .test('valid-date', '${label} must be a valid date', (value) => {
      const date = new Date(value)
      return !isNaN(date.getTime())
    }),
  [SupplyChainField.expirationDate]: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, '${label} must be in the format YYYY-MM-DD')
    .test('valid-date', '${label} must be a valid date', (value) => {
      const date = new Date(value)
      return !isNaN(date.getTime())
    })
    .test(
      'after-today',
      '${label} must be greater than or equal today',
      (value) => {
        const date = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date >= today
      }
    )
    .test(
      'is-after-production-date',
      '${label} must be after production date',
      function (value) {
        const { productionDate } = this.parent
        if (productionDate) {
          const production = new Date(productionDate)
          const expiration = new Date(value)
          return expiration.valueOf() - production.valueOf() >= 0 ? true : false
        }
        return true
      }
    ),
  [SupplyChainField.gtin]: yup
    .string()
    .matches(/^\d{14}$/)
    .length(14),
  [SupplyChainField.productType]: yup.number(),
}

const validateSchema = require('../../../middlewares/validate-schema')

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const { required = false } = config
    const user = ctx.state.user
    const roleType = user.role.type
    const supplyChainFields = await strapi.db
      .query('api::role-permission.role-permission')
      .findMany({
        where: {
          roleType: roleType,
          function: 'SupplyChainRecord',
        },
      })
    let schema
    if (required) {
      schema = {
        body: yup.object().shape({
          data: yup.object().shape(
            supplyChainFields.reduce((prev, curr) => {
              if (curr.field !== SupplyChainField.batchID) {
                prev[curr.field] = RolePermissionSchema[curr.field]
                  .required()
                  .label(curr.field)
              } else {
                prev[curr.field] = RolePermissionSchema[curr.field]
                  .label(curr.field)
                  .nullable()
              }
              if (RolePermissionSchema[`${curr.field}Files`]) {
                prev[`${curr.field}Files`] = RolePermissionSchema[
                  `${curr.field}Files`
                ].label(`${curr.field}Files`)
              }
              return prev
            }, {})
          ),
        }),
      }
    } else {
      schema = {
        body: yup.object().shape({
          data: yup.object().shape({
            receiver: yup.number(),
            ...supplyChainFields.reduce((prev, curr) => {
              if (curr.field !== SupplyChainField.batchID) {
                if (
                  curr.field === SupplyChainField.expirationDate ||
                  curr.field == SupplyChainField.productionDate
                ) {
                  prev[curr.field] = yup
                    .mixed()
                    .label(curr.field)
                    .when('receiver', {
                      is: (a) => a == undefined,
                      then: (schema) =>
                        schema
                          .required()
                          .concat(RolePermissionSchema[curr.field]),
                      otherwise: (schema) => schema.strip(),
                    })
                } else
                  prev[curr.field] = RolePermissionSchema[curr.field]
                    .label(curr.field)
                    .when('receiver', {
                      is: (a) => a != undefined,
                      then: (schema) => schema.notRequired().strip(),
                      otherwise: (schema) => schema.required(),
                    })
              } else {
                prev[curr.field] = RolePermissionSchema[curr.field]
                  .label(curr.field)
                  .nullable()
                  .when('receiver', {
                    is: (a) => a != undefined,
                    then: (schema) => schema.notRequired().strip(),
                  })
              }
              if (RolePermissionSchema[`${curr.field}Files`]) {
                prev[`${curr.field}Files`] = RolePermissionSchema[
                  `${curr.field}Files`
                ].label(`${curr.field}Files`)
              }
              return prev
            }, {}),
          }),
        }),
      }
    }
    await validateSchema({ schema: schema }, { strapi })(ctx, next)
  }
}
