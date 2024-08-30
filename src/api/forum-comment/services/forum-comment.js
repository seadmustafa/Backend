'use strict'

/**
 * forum-comment service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::forum-comment.forum-comment')
