'use strict'

/**
 * restaurant-review controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController(
  'api::restaurant-review.restaurant-review',
  ({ strapi }) => ({
    async find(ctx) {
      const id = ctx.query.filters?.['restaurant']?.id?.$eq
      const page = ctx.query?.pagination?.['page']
      const results = await super.find(ctx)
      let count
      if (id && page == 1)
        count = await strapi.db
          .connection('restaurant_reviews')
          .join(
            'restaurant_reviews_restaurant_links',
            'restaurant_reviews.id',
            'restaurant_reviews_restaurant_links.restaurant_review_id'
          )
          .whereRaw('restaurant_reviews_restaurant_links.restaurant_id = ?', [
            id,
          ])
          .sum({
            ...[5, 4, 3, 2, 1].reduce((prev, curr) => {
              prev[curr] = strapi.db.connection.raw(
                'CASE WHEN rating = ? THEN 1 ELSE 0 END',
                [curr]
              )
              return prev
            }, {}),
            all: strapi.db.connection.raw('1'),
          })
      return ctx.send(
        { ...results, ...(count ? { count: count[0] } : {}) },
        200
      )
    },
    async create(ctx) {
      return await strapi.db
        .transaction(async ({ trx }) => {
          // @ts-ignore
          ctx.request.body.data.user = ctx.state.user.id
          // @ts-ignore
          const restaurantId = ctx.request.body.data.restaurant
          await strapi.db.connection
            .raw(
              `
              UPDATE restaurants
              SET sum_rating = (sum_rating + ?)
              WHERE id = ?
            `,
              [
                // @ts-ignore
                ctx.request.body.data.rating,
                restaurantId,
              ]
            )
            .transacting(trx)
          return await super.create(ctx)
        })
        .catch(() => {
          return ctx.internalServerError('Something went wrong!')
        })
    },
  })
)
