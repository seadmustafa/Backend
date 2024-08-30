'use strict'

const {
  createRestaurantReviewSchema,
} = require('../validation/restaurant-review')

/**
 * restaurant-review router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

module.exports = createCoreRouter('api::restaurant-review.restaurant-review', {
  only: ['find', 'create', 'findOne'],
  config: {
    create: {
      middlewares: [
        {
          name: 'global::validate-schema',
          config: { schema: createRestaurantReviewSchema },
        },
      ],
    },
  },
})
