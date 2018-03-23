import AuthJS from '@okta/okta-auth-js'
import packageInfo from './packageInfo'
import ImplicitCallback from './components/ImplicitCallback'

function install (Vue, options) {
  const authConfig = initConfig(options)
  const oktaAuth = new AuthJS({
    clientId: authConfig.client_id,
    issuer: authConfig.issuer,
    redirectUri: authConfig.redirect_uri,
    url: authConfig.issuer.split('/oauth2/')[0]
  })
  oktaAuth.userAgent = `${packageInfo.name}/${packageInfo.version} ${oktaAuth.userAgent}`

  Vue.prototype.$auth = {
    loginRedirect (fromUri, additionalParams) {
      if (fromUri) {
        localStorage.setItem('referrerPath', fromUri)
      }
      return oktaAuth.token.getWithRedirect({
        responseType: authConfig.response_type,
        scopes: authConfig.scope.split(' '),
        ...additionalParams
      })
    },
    async logout () {
      oktaAuth.tokenManager.clear()
      await oktaAuth.signOut()
    },
    async isAuthenticated () {
      return !!(await oktaAuth.tokenManager.get('accessToken')) || !!(await oktaAuth.tokenManager.get('idToken'))
    },
    async handleAuthentication () {
      const tokens = await oktaAuth.token.parseFromUrl()
      tokens.forEach(token => {
        if (token.accessToken) oktaAuth.tokenManager.add('accessToken', token)
        if (token.idToken) oktaAuth.tokenManager.add('idToken', token)
      })
    },
    getFromUri () {
      const path = localStorage.getItem('referrerPath') || '/'
      localStorage.removeItem('referrerPath')
      return path
    },
    async getIdToken () {
      const idToken = oktaAuth.tokenManager.get('idToken')
      return idToken ? idToken.idToken : undefined
    },
    async getAccessToken () {
      const accessToken = oktaAuth.tokenManager.get('accessToken')
      return accessToken ? accessToken.accessToken : undefined
    },
    async getUser () {
      const accessToken = oktaAuth.tokenManager.get('accessToken')
      const idToken = oktaAuth.tokenManager.get('idToken')
      if (accessToken && idToken) {
        const userinfo = await oktaAuth.token.getUserInfo(accessToken)
        if (userinfo.sub === idToken.claims.sub) {
          // Only return the userinfo response if subjects match to
          // mitigate token substitution attacks
          return userinfo
        }
      }
      return idToken ? idToken.claims : undefined
    },
    authRedirectGuard () {
      return async (to, from, next) => {
        if (to.matched.some(record => record.meta.requiresAuth) && !(await this.isAuthenticated())) {
          this.loginRedirect(to.path)
        } else {
          next()
        }
      }
    }
  }
}

function handleCallback () { return ImplicitCallback }

const initConfig = auth => {
  const missing = []
  if (!auth.issuer) missing.push('issuer')
  if (!auth.client_id) missing.push('client_id')
  if (!auth.redirect_uri) missing.push('redirect_uri')
  if (!auth.scope) auth.scope = 'openid'
  if (missing.length) throw new Error(`${missing.join(', ')} must be defined`)

  // Use space separated response_type or default value
  auth.response_type = (auth.response_type || 'id_token token').split(' ')
  return auth
}

export default { install, handleCallback }
