'use strict'

const { yup } = require('@strapi/utils')

const createNewsPostSchema = {
  body: yup.object().shape({
    data: yup.object().shape({
      title: yup.string().trim().max(50).required().label('Title'),
      content: yup.string().trim().required().label('Content'),
      categories: yup.array().of(yup.number()).max(2).required(),
      thumbnail: yup.number().required(),
    }),
  }),
}

const updateNewsPostSchema = {
  body: yup.object().shape({
    data: yup.object().shape({
      title: yup.string().trim().max(50).label('Title'),
      content: yup.string().trim().label('Content'),
      categories: yup.array().of(yup.number()).max(2),
      thumbnail: yup.number(),
    }),
  }),
}

module.exports = {
  createNewsPostSchema,
  updateNewsPostSchema,
}
