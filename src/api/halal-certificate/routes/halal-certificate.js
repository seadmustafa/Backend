'use strict'

const { customRouter } = require('../../../utils/custom-router')
const {
  reviewHalalCertificateSchema,
} = require('../validation/halal-certificate')

/**
 * halal-certificate router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

const defaultRouter = createCoreRouter(
  'api::halal-certificate.halal-certificate',
  { only: ['find', 'findOne'] }
)

const myOverrideRoute = []

const myExtraRoutes = [
  {
    method: 'GET',
    path: '/halal-certificates/request',
    handler: 'api::halal-certificate.halal-certificate.request',
  },
  {
    method: 'POST',
    path: '/halal-certificates/review/:id',
    handler: 'api::halal-certificate.halal-certificate.review',
    config: {
      middlewares: [
        {
          name: 'global::validate-schema',
          config: { schema: reviewHalalCertificateSchema },
        },
      ],
      policies: ['global::is-onboarded'],
    },
  },
]

module.exports = customRouter(defaultRouter, myOverrideRoute, myExtraRoutes)
