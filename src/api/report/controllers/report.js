'use strict'

/**
 * report controller
 */
const _ = require('lodash')
const { REPORT_STATUS } = require('../../../constants/report-status')
const { createCoreController } = require('@strapi/strapi').factories
const { sanitize } = require('@strapi/utils')
const { generateId } = require('../../../utils/generate-id')
const { PREFIX } = require('../../../constants/prefix')
const { PAD } = require('../../../constants/pad')

module.exports = createCoreController('api::report.report', ({ strapi }) => ({
  async create(ctx) {
    return await strapi.db
      .transaction(async () => {
        const userId = ctx.state.user.id
        // @ts-ignore
        ctx.request.body.data.compiler = userId
        const data = await super.create(ctx)
        const reportId = generateId(
          PREFIX.REPORT_ID,
          PAD.REPORT_ID,
          data.data.id
        )
        await strapi.entityService.update('api::report.report', data.data.id, {
          data: {
            reportId: reportId,
          },
        })
        return data
      })
      .catch(() => {
        return ctx.internalServerError('Something went wrong!')
      })
  },

  async update(ctx) {
    const userId = ctx.state.user.id
    const reportId = ctx.params.id

    const report = await strapi.db.query('api::report.report').findOne({
      where: {
        id: reportId,
      },
      populate: ['compiler', 'reviewer'],
    })

    if (!report) {
      return ctx.notFound('Report not found')
    }

    // @ts-ignore
    let { data } = ctx.request.body

    const user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: {
          id: userId,
        },
        populate: ['role', 'role.permissions'],
      })

    const isCompiler = user.role.permissions.some(
      (e) => e.action === 'api::report.report.create'
    )

    // Compiler: Update when status is pending
    if (isCompiler) {
      if (report.compiler.id !== userId) {
        return ctx.notFound('Report not found')
      }

      if (report.status != REPORT_STATUS.PENDING) {
        return ctx.badRequest('Can not edit report that is not pending')
      }
      data = _.pick(data, ['detailText', 'detailFiles', 'reviewer'])
    } else {
      // Reviewer: Mark as processed or done
      data = _.pick(data, ['PIC', 'actionTaken', 'auditCheck', 'status'])
      if (report.status === REPORT_STATUS.DONE) {
        return ctx.badRequest('Report is done!')
      }

      if (!data.status) {
        return ctx.badRequest('Status is required!')
      }

      if (data.status === REPORT_STATUS.PROCESSED && !data?.PIC) {
        return ctx.badRequest('Missing required field: PIC')
      }

      if (data.status === REPORT_STATUS.DONE) {
        const PIC = report.PIC ? report.PIC : data.PIC
        if (!PIC) return ctx.badRequest('Missing required field: PIC')
        const actionTaken = report.actionTaken
          ? report.actionTaken
          : data.actionTaken
        if (!actionTaken)
          return ctx.badRequest('Missing required field: actionTaken')
        const auditCheck = report.auditCheck
          ? report.auditCheck
          : data.auditCheck
        if (!auditCheck)
          return ctx.badRequest('Missing required field: auditCheck')
        data = { ...data, PIC, actionTaken, auditCheck }
      }
    }
    // @ts-ignore
    ctx.request.body.data = data
    return super.update(ctx)
  },

  async find(ctx) {
    const userId = ctx.state.user.id

    const user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: {
          id: userId,
        },
        populate: ['role', 'role.permissions'],
      })

    const isCompiler = user.role.permissions.some(
      (p) => p.action === 'api::report.report.create'
    )
    ctx.query = {
      ...ctx.query,
      populate: isCompiler
        ? 'compiler,reviewer,compiler.role,detailFiles,reviewer.onboarding_information'
        : 'compiler,reviewer,compiler.role,compiler.onboarding_information,detailFiles,reviewer.onboarding_information',
      // @ts-ignore
      filters: {
        // @ts-ignore
        ...ctx.query.filters,
        [isCompiler ? 'compiler' : 'reviewer']: {
          ...ctx.query.filters?.[isCompiler ? 'compiler' : 'reviewer'],
          id: { $eq: userId },
        },
      },
    }

    return super.find(ctx)
  },

  async findOne(ctx) {
    const userId = ctx.state.user.id
    const user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: {
          id: userId,
        },
        populate: ['role', 'role.permissions'],
      })

    const isCompiler = user.role.permissions.some(
      (p) => p.action === 'api::report.report.create'
    )

    const report = await strapi.db.query('api::report.report').findOne({
      populate: isCompiler
        ? [
            'compiler',
            'reviewer',
            'compiler.role',
            'detailFiles',
            'reviewer.onboarding_information',
          ]
        : [
            'compiler',
            'reviewer',
            'compiler.role',
            'compiler.onboarding_information',
            'compiler.onboarding_information.license',
            'compiler.onboarding_information.brandLogo',
            'compiler.onboarding_information.productType',
            'detailFiles',
          ],
      where: {
        id: ctx.params.id,
        [isCompiler ? 'compiler' : 'reviewer']: {
          id: { $eq: userId },
        },
      },
    })

    return { data: await this.sanitizeOutput(report, ctx) }
  },

  async delete(ctx) {
    const userId = ctx.state.user.id

    const report = await strapi.db.query('api::report.report').findOne({
      populate: ['compiler'],
      where: {
        id: ctx.params.id,
        compiler: { id: userId },
      },
    })
    if (!report || report.status !== REPORT_STATUS.PENDING) {
      return ctx.notFound('Report not found')
    }

    return super.delete(ctx)
  },

  async listReviewers() {
    const createReportPermission = await strapi.db
      .query('plugin::users-permissions.permission')
      .findMany({
        populate: ['role'],
        where: {
          action: 'api::report.report.create',
        },
      })
    const Ids = createReportPermission.map((p) => p.role.id)
    const reviewReportPermission = await strapi.db
      .query('plugin::users-permissions.permission')
      .findMany({
        populate: ['role', 'role.users', 'role.users.onboarding_information'],
        where: {
          action: 'api::report.report.update',
          role: {
            id: {
              $notIn: Ids,
            },
          },
        },
      })

    const users = reviewReportPermission.reduce(
      (prev, curr) => [...prev, ...curr.role.users.filter((e) => e.onboarded)],
      []
    )

    return {
      data: await sanitize.contentAPI.output(
        users,
        strapi.getModel('plugin::users-permissions.user')
      ),
    }
  },
}))
