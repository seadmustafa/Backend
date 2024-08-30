'use strict'

const { yup } = require('@strapi/utils')

const createNewsPostCategorySchema = {
  body: yup.object().shape({
    data: yup.object().shape({
      name: yup.string().trim().max(30).required().label('Name'),
    }),
  }),
}

module.exports = {
  createNewsPostCategorySchema,
}
