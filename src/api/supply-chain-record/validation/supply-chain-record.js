'use strict'

const { yup } = require('@strapi/utils')

const updateArrivalProcessSchema = {
  body: yup.object().shape({
    data: yup.object().shape({
      deliveryStatus: yup
        .string()
        .required()
        .oneOf(['Received', 'Rejected'])
        .label('deliveryStatus'),
      reasonReject: yup
        .string()
        .max(100)
        .label('reasonReject')
        .when('deliveryStatus', {
          is: 'Rejected',
          then: (schema) => schema.required(),
        }),
      reasonRejectFiles: yup
        .array()
        .of(yup.number())
        .label('reasonRejectFiles')
        .when('deliveryStatus', {
          is: 'Rejected',
          then: (schema) => schema.required(),
        }),
    }),
  }),
}

module.exports = {
  updateArrivalProcessSchema,
}
