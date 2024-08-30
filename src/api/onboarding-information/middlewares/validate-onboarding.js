'use strict'

const { yup } = require('@strapi/utils')
const dayjs = require('dayjs')

yup.addMethod(yup.string, 'isValidJsonWithKeys', function (keys) {
  return this.test('isValidJsonWithKeys', function (value) {
    const { path, createError } = this
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed !== 'object' || parsed === null) {
        return createError({
          path,
          message: '${label} must be a valid JSON object',
        })
      }

      for (const key of keys) {
        // eslint-disable-next-line no-prototype-builtins
        if (!parsed.hasOwnProperty(key)) {
          return createError({
            path,
            message: '${label} must contain keys: ' + keys.join(', '),
          })
        }
      }
      return true
    } catch {
      return createError({
        path,
        message: '${label} must be a valid JSON object',
      })
    }
  })
})

const RolePermission = {
  OrganizationName: 'organizationName',
  BrandLogo: 'brandLogo',
  RepresentativeName: 'representativeName',
  ContactInformation: 'contactInformation',
  FarmSize: 'farmSize',
  NumberOfLivestock: 'numberOfLivestock',
  CertificationDate: 'certificationDate',
  ButcherLicense: 'butcherLicense',
  VideoRecording: 'videoRecording',
  MeatFragmentation: 'meatFragmentation',
  VehicleFleetSize: 'vehicleFleetSize',
  VehicleID: 'vehicleID',
  Temperature: 'temperature',
  Route: 'route',
  InspectionStatus: 'inspectionStatus',
  AccreditationStatus: 'accreditationStatus',
  AccreditationExpiration: 'accreditationExpiration',
  EnforcementStatus: 'enforcementStatus',
  RegulationDate: 'regulationDate',
  RegistrationDate: 'registrationDate',
  EnforcementActions: 'enforcementActions',
  LicenseID: 'licenseId',
  License: 'license',
  Location: 'location',
  FarmType: 'farmType',
  Capacity: 'capacity',
  ListOfAccreditedCertificationBodies: 'listOfAccreditedCertificationBodies',
  RegulationsAndPolicies: 'regulationsAndPolicies',
  ProductType: 'productType',
}

const RolePermissionSchema = {
  [RolePermission.OrganizationName]: yup.string().max(50),
  [RolePermission.BrandLogo]: yup.number(),
  [RolePermission.RepresentativeName]: yup.string().max(50),
  [RolePermission.ContactInformation]: yup
    .string()
    // @ts-ignore
    .isValidJsonWithKeys(['email', 'phone', 'address']),
  [RolePermission.FarmSize]: yup
    .string()
    .matches(/^[+-]?\d+(\.\d+)?$/)
    .max(20),
  [RolePermission.CertificationDate]: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, '${label} must be in the format YYYY-MM-DD')
    .test('valid-date', '${label} must be a valid date', (value) => {
      const date = new Date(value)
      return !isNaN(date.getTime())
    })
    .test('before-today', '${label} must be less than today', (value) => {
      const date = new Date(value)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return date <= today
    }),
  [RolePermission.ButcherLicense]: yup.boolean(),
  [RolePermission.VideoRecording]: yup.boolean(),
  [RolePermission.MeatFragmentation]: yup.boolean(),
  // [RolePermission.VehicleFleetSize]: "Vehicle FleetSize",
  // [RolePermission.VehicleID]: "Vehicle ID ",
  // [RolePermission.Temperature]: "Temperature",
  // [RolePermission.Route]: "Route",
  [RolePermission.InspectionStatus]: yup
    .mixed()
    .oneOf(['Pass', 'Fail', 'Pending']),
  [RolePermission.AccreditationStatus]: yup
    .mixed()
    .oneOf(['ConditionalAccreditation', 'NonAccredited', 'Accredited']),
  [RolePermission.AccreditationExpiration]: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, '${label} must be in the format YYYY-MM-DD')
    .test('valid-date', '${label} must be a valid date', (value) => {
      const date = new Date(value)
      return !isNaN(date.getTime())
    }),
  [RolePermission.EnforcementStatus]: yup
    .mixed()
    .oneOf(['Compliant', 'NonCompliant', 'Unknown']),
  [RolePermission.RegulationDate]: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, '${label} must be in the format YYYY-MM-DD')
    .test('valid-date', '${label} must be a valid date', (value) => {
      const date = new Date(value)
      return !isNaN(date.getTime())
    }),
  [RolePermission.RegistrationDate]: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, '${label} must be in the format YYYY-MM-DD')
    .test('valid-date', '${label} must be a valid date', (value) => {
      const date = new Date(value)
      return !isNaN(date.getTime())
    })
    .test('before-today', '${label} must be less than today', (value) => {
      const date = new Date(value)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return date < today
    }),
  [RolePermission.EnforcementActions]: yup.string().trim().max(500),
  [RolePermission.LicenseID]: yup.string().trim().max(30),
  [RolePermission.License]: yup.array().of(yup.number()).max(3),
  [RolePermission.Location]: yup.string().trim().max(200),
  [RolePermission.FarmType]: yup
    .mixed()
    .oneOf([
      'Crop',
      'Livestock',
      'Mixed',
      'Organic',
      'SpecialtyCrop',
      'Subsistence',
      'Commercial',
      'Agroforestry',
    ]),
  [RolePermission.Capacity]: yup
    .string()
    .matches(/^[0-9]+$/)
    .max(20),
  // [RolePermission.ProductTypeAndIngredients]: yup.string().test('is-json', (value) => {
  //   try {
  //     const parsed = JSON.parse(value);
  //     if (!Array.isArray(parsed)) {
  //       return false;
  //     }
  //     return parsed.every(item => typeof item.productType !== 'undefined' && typeof item.ingredients !== 'undefined');
  //   } catch (e) {
  //     return false;
  //   }
  // }),
  [RolePermission.ProductType]: yup.array().of(
    yup.object().shape({
      id: yup.number(),
      productType: yup.string().max(30).required(),
      productIngredients: yup.string().max(300).required(),
    })
  ),
  [RolePermission.ListOfAccreditedCertificationBodies]: yup
    .string()
    .trim()
    .max(500),
  [RolePermission.RegulationsAndPolicies]: yup.string().trim().max(500),
}

const halalCertificateSchema = yup.object().shape({
  certificationBodyId: yup.number().label('certificationBodyId').nullable(),
  type: yup.string().oneOf(['Upload', 'Request']).required(),
  certificationBodyIdOther: yup
    .string()
    .label('certificationBodyIdOther')
    .when('certificationBodyId', {
      is: (value) => value != undefined,
      then: (schema) => schema.strip(),
      otherwise: (schema) => schema.required(),
    }),
  expiryDate: yup
    .string()
    .label('expiryDate')
    .when(['certificationBodyIdOther', 'type'], {
      is: (certificationBodyIdOther, type) =>
        certificationBodyIdOther != undefined && type === 'Upload',
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
  certificatePaths: yup.array().of(yup.number()).max(3).required(),
  certificationBodyName: yup.string().when('certificationBodyIdOther', {
    is: (value) => value != undefined,
    then: (schema) => schema.required(),
  }),
})
const validateSchema = require('../../../middlewares/validate-schema')

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const { required = false } = config
    const user = ctx.state.user
    const roleType = user.role.type
    const onboardingFields = await strapi.db
      .query('api::role-permission.role-permission')
      .findMany({
        where: {
          roleType: roleType,
          function: 'Onboarding',
        },
      })
    const requestCertificatePermission = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({
        where: {
          role: {
            type: roleType,
          },
          action: 'api::halal-certificate.halal-certificate.request',
        },
      })
    let isNeedToSendCert = false
    if (requestCertificatePermission && required == false) {
      const onboardingInformation = await strapi.db
        .query('api::onboarding-information.onboarding-information')
        .findOne({
          where: {
            user: {
              id: user.id,
            },
          },
          populate: ['certificateInfo'],
        })
      const temp = onboardingInformation?.certificateInfo || []
      temp.sort(
        (a, b) =>
          new Date(b?.createdAt).valueOf() - new Date(a?.createdAt).valueOf()
      )
      const lastCertificate = temp?.[0] ?? {}
      isNeedToSendCert =
        (Object?.keys(lastCertificate).length > 0 &&
          (lastCertificate.status == 'Rejected' ||
            (!!lastCertificate.expiryDate &&
              dayjs()
                .startOf('day')
                .isAfter(dayjs(lastCertificate.expiryDate))))) ||
        (Object?.keys(lastCertificate).length == 0 &&
          requestCertificatePermission)
    }
    const schema = {
      body: yup.object().shape({
        data: yup.object().shape({
          ...onboardingFields.reduce((prev, curr) => {
            if (required)
              prev[curr.field] = RolePermissionSchema[curr.field]
                .required()
                .label(curr.field)
            else
              prev[curr.field] = RolePermissionSchema[curr.field].label(
                curr.field
              )
            return prev
          }, {}),
          ...(requestCertificatePermission
            ? required || isNeedToSendCert
              ? { halalCertificate: halalCertificateSchema }
              : {}
            : {}),
        }),
      }),
    }
    await validateSchema({ schema: schema }, { strapi })(ctx, next)
  }
}
