'use strict'

const { yup } = require('@strapi/utils')

const updateUserSchema = {
  body: yup.object().shape({
    name: yup.string().trim().max(50).label('Name'),
    avatar: yup.number().nullable().label('Avatar'),
    isViewedCommercial: yup.boolean(),
  }),
  params: yup.object().shape({
    id: yup.number().required(),
  }),
}

module.exports = {
  updateUserSchema,
}
