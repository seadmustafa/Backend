'use strict'

// @ts-ignore
const otpDocOverride = require('./api/otp/documentation/1.0.0/overrides/otp.json')
// @ts-ignore
const onboardingDocOverride = require('./api/onboarding-information/documentation/1.0.0/overrides/onboarding-information.json')
// @ts-ignore
const forumOverride = require('./api/forum-post/documentation/1.0.0/overrides/forum-post.json')
// @ts-ignore
const authDocOverride = require('./extensions/users-permissions/documentation/1.0.0/overrides/auth.json')
// @ts-ignore
const certificationBodyDocOverride = require('./api/certification-body/documentation/1.0.0/overrides/certification-body.json')
// @ts-ignore
const productDocOverride = require('./api/product/documentation/1.0.0/overrides/product.json')
// @ts-ignore
const healthCheckDocOverride = require('./api/health-check/documentation/1.0.0/overrides/health-check.json')

const { Connection } = require('./utils/blockchain')

async function blockchain() {
  const connection = new Connection()
  await connection.init()
}

blockchain().catch((error) => {
  console.error('Failed to start application:', error)
})

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    if (strapi.plugin('documentation')) {
      const overrideService = strapi.plugin('documentation').service('override')
      overrideService.registerOverride(otpDocOverride)
      overrideService.registerOverride(onboardingDocOverride)
      overrideService.registerOverride(authDocOverride)
      overrideService.registerOverride(forumOverride)
      overrideService.registerOverride(certificationBodyDocOverride)
      overrideService.registerOverride(productDocOverride)
      overrideService.registerOverride(healthCheckDocOverride)
    }
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {},
}
