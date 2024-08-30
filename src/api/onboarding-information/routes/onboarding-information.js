'use strict'

const { customRouter } = require('../../../utils/custom-router')

/**
 * onboarding-information router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

const defaultRouter = createCoreRouter(
  'api::onboarding-information.onboarding-information',
  {
    config: {
      create: {
        policies: ['is-not-filled-onboarding-information'],
        middlewares: [
          {
            name: 'api::onboarding-information.validate-onboarding',
            config: { required: true },
          },
        ],
      },
      update: {
        middlewares: [
          {
            name: 'api::onboarding-information.validate-onboarding',
            config: { required: false },
          },
        ],
      },
    },
    except: ['delete'],
  }
)

const myOverrideRoute = []

const myExtraRoutes = [
  {
    method: 'GET',
    path: '/onboarding-informations/list-certificate-reviewer',
    handler:
      'api::onboarding-information.onboarding-information.listCertificateReviewer',
  },
]

module.exports = customRouter(defaultRouter, myOverrideRoute, myExtraRoutes)
