'use strict'

/**
 * role-permission-field service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService(
  'api::role-permission-field.role-permission-field'
)
