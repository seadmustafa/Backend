'use strict'

/**
 * A set of functions called "actions" for `health-check`
 */
const axios = require('axios')
const { Connection } = require('../../../utils/blockchain')

module.exports = {
  checkAllService: async (ctx) => {
    try {
      // Check block chain
      await Connection.contract.evaluateTransaction('testConnection')
      // Check FE
      await axios.get(`${process.env.FE_URL}`)
      // Check meilisearch
      await axios.get(`${process.env.MEILI_HOST}/health`)

      return ctx.send({ data: 'Healthy' }, 200)
    } catch {
      return ctx.internalServerError('Something went wrong!')
    }
  },
}
