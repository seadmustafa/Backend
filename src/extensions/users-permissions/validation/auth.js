'use strict'

const { yup, validateYupSchema } = require('@strapi/utils')

const resetPasswordSchema = yup
  .object({
    password: yup.string().required(),
    passwordConfirmation: yup.string().required(),
    code: yup.string().required(),
  })
  .noUnknown()

const resetPasswordLinkQuerySchema = yup.object({
  code: yup.string().required(),
})

module.exports = {
  validateResetPasswordBody: validateYupSchema(resetPasswordSchema),
  validateResetPasswordQuery: validateYupSchema(resetPasswordLinkQuerySchema),
}
