import * as AuthJS from '@okta/okta-auth-js'
import { Utils } from './utils/Utils'
import ImplicitCallback from './components/ImplicitCallback'

function install (Vue, options) {
  const authConfig = Utils.initConfig(options)
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
        scopes: authConfig.scopes,
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
      // Navigate back to path
      return Utils.getFromUri()
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
      return async (from, to, next) => {
        if (from.matched.some(record => record.meta.requiresAuth) && !(await this.isAuthenticated())) {
          localStorage.setItem('referrerPath', from.path || '/')
          this.loginRedirect()
        } else {
          next()
        }
      }
    }
  }
}

function handleCallback () { return ImplicitCallback }

export default { install, handleCallback }
