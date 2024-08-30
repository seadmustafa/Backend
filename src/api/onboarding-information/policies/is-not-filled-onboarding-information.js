module.exports = async (policyContext, config, { strapi }) => {
  const user = policyContext.state.user
  const onboardingInformation = await strapi.db
    .query('api::onboarding-information.onboarding-information')
    .findOne({
      where: {
        user: {
          id: user.id,
        },
      },
    })
  return !onboardingInformation
}
