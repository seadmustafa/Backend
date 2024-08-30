'use strict'

const { customRouter } = require('../../../utils/custom-router')

/**
 * otp router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories

const defaultRouter = createCoreRouter('api::otp.otp', { only: [] })

const myOverrideRoute = []

const myExtraRoutes = [
  {
    method: 'POST',
    path: '/otps/verify-otp',
    handler: 'api::otp.otp.verifyOtp',
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/otps/resend-otp',
    handler: 'api::otp.otp.resendOtp',
    config: {
      auth: false,
    },
  },
]

module.exports = customRouter(defaultRouter, myOverrideRoute, myExtraRoutes)
