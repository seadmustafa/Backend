const roleTypeSiteAdmin = 'site_admin'

module.exports = (policyContext, config) => {
  const { allowAdmin = false } = config
  const user = policyContext.state.user
  return user.onboarded || (allowAdmin && user.role.type === roleTypeSiteAdmin)
}
