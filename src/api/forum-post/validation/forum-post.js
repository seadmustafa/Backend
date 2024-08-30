'use strict'

const { yup } = require('@strapi/utils')

const createForumPostSchema = {
  body: yup.object().shape({
    data: yup.object().shape({
      content: yup.string().max(500).required().label('content'),
      media: yup.array().of(yup.number()).max(3).nullable().label('media'),
    }),
  }),
}

const updateForumPostSchema = {
  body: yup.object().shape({
    data: yup.object().shape({
      content: yup.string().max(500).label('content'),
      media: yup.array().of(yup.number()).max(3).nullable().label('media'),
    }),
  }),
}

module.exports = {
  createForumPostSchema,
  updateForumPostSchema,
}
