'use strict'

const { yup, validateYupSchema } = require('@strapi/utils')

const deleteRoleSchema = yup.object().shape({
  role: yup.strapiID().required(),
})

const createRoleSchema = {
  body: yup.object().shape({
    paticipants: yup.array().of(yup.string().email()).label('paticipants'),
    type: yup
      .string()
      .required()
      .label('type')
      .notOneOf(['authenticated', 'public', 'site_admin']),
    name: yup.string().required().label('name').max(40),
    description: yup.string().label('description').max(300).nullable(),
    category: yup.number().required().label('category'),
    religion: yup.number().required().label('religion'),
    releaseQR: yup.boolean().label('releaseQR'),
    permissions: yup.mixed().required().label('permissions'),
  }),
}

const updateRoleSchema = {
  body: yup.object().shape({
    paticipants: yup.array().of(yup.string().email()).label('paticipants'),
    name: yup.string().label('name').max(40),
    description: yup.string().label('description').max(300).nullable(),
    category: yup.number().label('category'),
    religion: yup.number().label('religion'),
    releaseQR: yup.boolean().label('releaseQR'),
    permissions: yup.mixed().label('permissions'),
    deletePaticipants: yup.array().of(yup.number()).label('deletePaticipants'),
  }),
}

module.exports = {
  validateDeleteRoleBody: validateYupSchema(deleteRoleSchema),
  createRoleSchema,
  updateRoleSchema,
}
