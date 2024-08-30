'use strict'

const { yup } = require('@strapi/utils')

const reviewHalalCertificateSchema = {
  body: yup.object().shape({
    data: yup.object().shape({
      details: yup.string().max(300).required().label('details'),
      auditCheck: yup.boolean().required().label('auditCheck'),
      status: yup
        .mixed()
        .oneOf(['Approved', 'Rejected'])
        .label('status')
        .required(),
      siteAuditVisitDate: yup
        .string()
        .required()
        .matches(
          /^\d{4}-\d{2}-\d{2}$/,
          '${label} must be in the format YYYY-MM-DD'
        )
        .test('valid-date', '${label} must be a valid date', (value) => {
          const date = new Date(value)
          return !isNaN(date.getTime())
        })
        .label('siteAuditVisitDate'),
      evidencePaths: yup
        .array()
        .of(yup.number())
        .max(3)
        .nullable()
        .when('status', {
          is: 'Rejected',
          then: (schema) => schema.strip(),
        })
        .label('evidencePaths'),
      reasonReject: yup
        .string()
        .max(300)
        .label('reasonReject')
        .when('status', {
          is: 'Rejected',
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.strip(),
        }),
      expiryDate: yup
        .string()
        .label('expiryDate')
        .when('status', {
          is: 'Approved',
          then: (schema) =>
            schema
              .required()
              .matches(
                /^\d{4}-\d{2}-\d{2}$/,
                '${label} must be in the format YYYY-MM-DD'
              )
              .test('valid-date', '${label} must be a valid date', (value) => {
                const date = new Date(value)
                return !isNaN(date.getTime())
              })
              .test(
                'after-today',
                '${label} must be greater than today',
                (value) => {
                  const date = new Date(value)
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  return date >= today
                }
              ),
          otherwise: (schema) => schema.strip(),
        }),
    }),
  }),
}

module.exports = {
  reviewHalalCertificateSchema,
}
