'use strict'

const { yup } = require('@strapi/utils')

const createRestaurantReviewSchema = {
  body: yup.object().shape({
    data: yup.object().shape({
      description: yup.string().trim().max(300).required().label('Description'),
      rating: yup.number().min(1).max(5).required().label('Rating'),
      evidence: yup.array().of(yup.number()).max(3).label('Evidence'),
      restaurant: yup.number().required().label('Restaurant'),
    }),
  }),
}

module.exports = {
  createRestaurantReviewSchema,
}
