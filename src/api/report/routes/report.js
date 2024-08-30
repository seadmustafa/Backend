'use strict'

const { customRouter } = require('../../../utils/custom-router')
const {
  createReportSchema,
  updateReportSchema,
} = require('../validation/report')

/**
 * report router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

const defaultRouter = createCoreRouter('api::report.report', {
  config: {
    create: {
      middlewares: [
        {
          name: 'global::validate-schema',
          config: { schema: createReportSchema },
        },
      ],
      policies: ['global::is-onboarded'],
    },
    update: {
      middlewares: [
        {
          name: 'global::validate-schema',
          config: { schema: updateReportSchema },
        },
      ],
      policies: ['global::is-onboarded'],
    },
  },
})

const myOverrideRoute = []

const myExtraRoutes = [
  {
    method: 'GET',
    path: '/reports/reviewers',
    handler: 'api::report.report.listReviewers',
  },
]

module.exports = customRouter(defaultRouter, myOverrideRoute, myExtraRoutes)
