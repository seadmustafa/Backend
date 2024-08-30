'use strict'

/**
 * product router
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/products',
      handler: 'api::product.product.find',
    },
    {
      method: 'GET',
      path: '/products/:id',
      handler: 'api::product.product.findOne',
    },
  ],
}
