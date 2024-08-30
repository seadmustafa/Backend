'use strict'

/**
 * restaurant-review service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::restaurant-review.restaurant-review')
