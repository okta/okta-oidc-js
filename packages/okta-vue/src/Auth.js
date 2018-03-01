import * as AuthJS from '@okta/okta-auth-js'
import ImplicitCallback from './components/ImplicitCallback'

function install (Vue, options) {
  const authConfig = initConfig(options)
  const oktaAuth = new AuthJS({
    clientId: authConfig.client_id,
    issuer: authConfig.issuer,
    redirectUri: authConfig.redirect_uri,
    url: authConfig.issuer.split('/oauth2/')[0]
  })

  Vue.prototype.$auth = {
    loginRedirect (additionalParams) {
      return oktaAuth.token.getWithRedirect({
        responseType: ['id_token', 'token'],
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
      return accessToken ? oktaAuth.token.getUserInfo(accessToken) : undefined
    },
    authRedirectGuard () {
      return async (to, from, next) => {
        if (to.matched.some(record => record.meta.requiresAuth) && !(await this.isAuthenticated())) {
          localStorage.setItem('referrerPath', to.path || '/')
          this.loginRedirect()
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
  return auth
}

export default { install, handleCallback }
