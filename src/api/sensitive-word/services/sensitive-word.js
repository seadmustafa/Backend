'use strict'

/**
 * sensitive-word service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::sensitive-word.sensitive-word')
