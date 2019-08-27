import {
  assertIssuer,
  assertClientId,
  assertRedirectUri,
  buildConfigObject
} from '@okta/configuration-validation'
import AuthJS from '@okta/okta-auth-js'
import packageInfo from './packageInfo'
import ImplicitCallback from './components/ImplicitCallback'

function install (Vue, options) {
  const authConfig = initConfig(options)
  const oktaAuth = new AuthJS(authConfig)
  oktaAuth.userAgent = `${packageInfo.name}/${packageInfo.version} ${oktaAuth.userAgent}`

  Vue.prototype.$auth = {
    loginRedirect (fromUri, additionalParams) {
      if (fromUri) {
        localStorage.setItem('referrerPath', fromUri)
      }
      return oktaAuth.token.getWithRedirect({
        responseType: authConfig.responseType,
        scopes: authConfig.scope.split(' '),
        ...additionalParams
      })
    },
    async logout () {
      oktaAuth.tokenManager.clear()
      await oktaAuth.signOut()
    },
    async isAuthenticated () {
      return !!(await this.getAccessToken()) || !!(await this.getIdToken())
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
      try {
        const idToken = await oktaAuth.tokenManager.get('idToken')
        return idToken.idToken
      } catch (err) {
        // The user no longer has an existing SSO session in the browser.
        // (OIDC error `login_required`)
        // Ask the user to authenticate again.
        return undefined
      }
    },
    async getAccessToken () {
      try {
        const accessToken = await oktaAuth.tokenManager.get('accessToken')
        return accessToken.accessToken
      } catch (err) {
        // The user no longer has an existing SSO session in the browser.
        // (OIDC error `login_required`)
        // Ask the user to authenticate again.
        return undefined
      }
    },
    async getUser () {
      const accessToken = await oktaAuth.tokenManager.get('accessToken')
      const idToken = await oktaAuth.tokenManager.get('idToken')
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

const initConfig = options => {
  let auth = buildConfigObject(options)

  // Assert configuration
  assertIssuer(auth.issuer, auth.testing)
  assertClientId(auth.clientId)
  assertRedirectUri(auth.redirectUri)

  if (!auth.scope) auth.scope = 'openid'

  // Use space separated response_type or default value
  auth.responseType = (auth.responseType || 'id_token token').split(' ')
  return auth
}

export default { install, handleCallback }
