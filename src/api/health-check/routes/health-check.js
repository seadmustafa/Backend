module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/health-check',
      handler: 'health-check.checkAllService',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
}
