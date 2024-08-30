'use strict'

const { yup } = require('@strapi/utils')

const createReportSchema = {
  body: yup.object().shape({
    data: yup.object().shape({
      reviewer: yup.number().required().label('reviewer'),
      detailText: yup.string().max(300).required().label('detailText'),
      detailFiles: yup
        .array()
        .of(yup.number())
        .max(3)
        .label('detailFiles')
        .nullable(),
    }),
  }),
}

const updateReportSchema = {
  body: yup.object().shape({
    data: yup.object().shape({
      reviewer: yup.number().label('reviewer'),
      detailText: yup.string().max(300).label('detailText'),
      detailFiles: yup
        .array()
        .of(yup.number())
        .max(3)
        .label('detailFiles')
        .nullable(),
      PIC: yup.string().max(50).label('PIC'),
      actionTaken: yup.string().max(300).label('actionTaken'),
      auditCheck: yup.boolean().label('auditCheck'),
      status: yup.mixed().oneOf(['Processed', 'Done']).label('status'),
    }),
  }),
}

module.exports = {
  createReportSchema,
  updateReportSchema,
}
