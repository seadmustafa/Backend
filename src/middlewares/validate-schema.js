'use strict'

const _ = require('lodash')
const { yup, errors } = require('@strapi/utils')
const { ValidationError } = errors

module.exports = (config) => {
  return async (ctx, next) => {
    const validateOptions = {
      abortEarly: false,
      stripUnknown: true,
    }

    const { schema } = config
    const validSchema = _.pick(schema, ['query', 'params', 'body'])
    const validateData = _.pick(ctx.request, Object.keys(validSchema))

    try {
      const value = await yup
        .object(validSchema)
        .validate(validateData, validateOptions)

      Object.assign(ctx.request, value)

      return next()
    } catch (err) {
      throw new ValidationError(err.message, err.errors)
    }
  }
}
