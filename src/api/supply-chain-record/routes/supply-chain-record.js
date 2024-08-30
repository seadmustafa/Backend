'use strict'

const { customRouter } = require('../../../utils/custom-router')
const {
  updateArrivalProcessSchema,
} = require('../validation/supply-chain-record')

/**
 * supply-chain-record router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

const defaultRouter = createCoreRouter(
  'api::supply-chain-record.supply-chain-record',
  { only: ['find', 'findOne'] }
)

const myOverrideRoute = []

const myExtraRoutes = [
  {
    method: 'GET',
    path: '/supply-chain-records/arrival-process',
    handler: 'api::supply-chain-record.supply-chain-record.findArrivalProcess',
    config: {
      policies: ['global::is-onboarded'],
    },
  },
  {
    method: 'GET',
    path: '/supply-chain-records/arrival-process/:id',
    handler:
      'api::supply-chain-record.supply-chain-record.findOneArrivalProcess',
    config: {
      policies: ['global::is-onboarded'],
    },
  },
  {
    method: 'POST',
    path: '/supply-chain-records/arrival-process',
    handler: 'api::supply-chain-record.supply-chain-record.arrivalProcess',
  },
  {
    method: 'PUT',
    path: '/supply-chain-records/arrival-process/:id',
    handler:
      'api::supply-chain-record.supply-chain-record.updateArrivalProcess',
    config: {
      middlewares: [
        {
          name: 'global::validate-schema',
          config: { schema: updateArrivalProcessSchema },
        },
      ],
      policies: ['global::is-onboarded'],
    },
  },
  {
    method: 'DELETE',
    path: '/supply-chain-records/arrival-process/:id',
    handler:
      'api::supply-chain-record.supply-chain-record.deleteArrivalProcess',
  },
  {
    method: 'GET',
    path: '/supply-chain-records/departure-process',
    handler:
      'api::supply-chain-record.supply-chain-record.findDepartureProcess',
    config: {
      policies: ['global::is-onboarded'],
    },
  },
  {
    method: 'GET',
    path: '/supply-chain-records/departure-process/:id',
    handler:
      'api::supply-chain-record.supply-chain-record.findOneDepartureProcess',
    config: {
      policies: ['global::is-onboarded'],
    },
  },
  {
    method: 'POST',
    path: '/supply-chain-records/departure-process',
    handler: 'api::supply-chain-record.supply-chain-record.departureProcess',
    config: {
      middlewares: [
        {
          name: 'api::supply-chain-record.validate-supply-chain-record',
          config: { required: true },
        },
      ],
      policies: ['global::is-onboarded'],
    },
  },
  {
    method: 'PUT',
    path: '/supply-chain-records/departure-process/:id',
    handler:
      'api::supply-chain-record.supply-chain-record.updateDepartureProcess',
    config: {
      middlewares: [
        {
          name: 'api::supply-chain-record.validate-supply-chain-record',
          config: { required: false },
        },
      ],
      policies: ['global::is-onboarded'],
    },
  },
  {
    method: 'DELETE',
    path: '/supply-chain-records/departure-process/:id',
    handler:
      'api::supply-chain-record.supply-chain-record.deleteDepartureProcess',
    config: {
      policies: ['global::is-onboarded'],
    },
  },
  {
    method: 'GET',
    path: '/supply-chain-records/view-supply-chain',
    handler: 'api::supply-chain-record.supply-chain-record.viewSupplyChain',
    config: {
      policies: ['global::is-onboarded'],
    },
  },
]

module.exports = customRouter(defaultRouter, myOverrideRoute, myExtraRoutes)
