'use strict'

/**
 * otp service
 */

const { createCoreService } = require('@strapi/strapi').factories
const ms = require('ms')
const uuidv4 = require('uuid').v4

module.exports = createCoreService('api::otp.otp', ({ strapi }) => ({
  generateRandomString(length = 6) {
    const chars = '0123456789'
    let otp = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      otp += chars[randomIndex]
    }
    return otp
  },

  async generateOtp(email, length) {
    if (process.env.BYPASS_OTP) return
    const otp = this.generateRandomString(length)
    const data = {
      otp: otp,
      expire: new Date(new Date().valueOf() + ms(process.env.OTP_TTL)),
      publishedAt: new Date().toISOString(),
    }
    let otpDoc = await strapi.db.query('api::otp.otp').findOne({
      where: { email: email },
    })
    if (otpDoc) {
      otpDoc = await strapi.db.query('api::otp.otp').update({
        where: { id: otpDoc.id },
        data: data,
      })
    } else {
      otpDoc = await strapi.db
        .query('api::otp.otp')
        .create({ data: { ...data, email: email } })
    }
    return otpDoc.otp
  },

  async verifyOtp(email, otp) {
    if (process.env.BYPASS_OTP) return true
    const otpDoc = await strapi.db.query('api::otp.otp').findOne({
      where: { email: email, otp: otp },
    })
    if (!otpDoc || otpDoc.expire < new Date()) return false
    await strapi.entityService.update('api::otp.otp', otpDoc.id, {
      data: {
        expire: new Date(Date.now() - 1),
      },
    })
    return true
  },

  /**
   *
   * @param {string} to
   * @param {string} otp
   * @param {{ name: string }} additionalData
   * @returns
   */
  async sendMailOtp(to, otp, additionalData = { name: '' }) {
    // templateReferenceId: id of the template designed in CMS
    if (process.env.BYPASS_OTP) return
    return strapi
      .plugin('email-designer')
      .service('email')
      .sendTemplatedEmail(
        { to: to },
        { templateReferenceId: process.env.OTP_TEMPLATE_EMAIL },
        {
          OTP: otp,
          ...additionalData,
          ref: uuidv4(),
          createdAt: formatDate(new Date()),
        }
      )
  },
}))

/**
 *
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const day = date.getDate().toString().padStart(2, '0')
  const monthIndex = date.getMonth()
  const year = date.getFullYear()

  // Construct the formatted date string
  return `${day} ${monthNames[monthIndex]} ${year}`
}

module.exports.formatDate = formatDate
