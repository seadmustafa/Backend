'use strict'

const { yup } = require('@strapi/utils')

const createSensitiveWordSchema = {
  body: yup.object().shape({
    data: yup.object().shape({
      words: yup.string().max(30).required().label('words'),
    }),
  }),
}

module.exports = {
  createSensitiveWordSchema,
}
