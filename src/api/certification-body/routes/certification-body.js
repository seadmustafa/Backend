'use strict'

/**
 * certification-body router
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/certification-bodies',
      handler: 'api::certification-body.certification-body.find',
    },
    {
      method: 'GET',
      path: '/certification-bodies/:id',
      handler: 'api::certification-body.certification-body.findOne',
    },
  ],
}
