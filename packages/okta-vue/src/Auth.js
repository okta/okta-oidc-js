import {
  assertIssuer,
  assertClientId,
  assertRedirectUri,
  buildConfigObject
} from '@okta/configuration-validation'
import AuthJS from '@okta/okta-auth-js'
import packageInfo from './packageInfo'
import ImplicitCallback from './components/ImplicitCallback'

class Auth {
  constructor (options) {
    this.config = initConfig(options)
    this.oktaAuth = new AuthJS(this.config)
    this.oktaAuth.userAgent = `${packageInfo.name}/${packageInfo.version} ${this.oktaAuth.userAgent}`

    // Automatically enters login flow if token renew fails.
    // The default behavior can be overriden by passing a function via config: `config.onTokenError`
    this.getTokenManager().on('error', this.config.onTokenError || this._onTokenError.bind(this))
  }

  async login (fromUri, additionalParams) {
    this.setFromUri(fromUri || window.location.pathname)

    // Custom login flow
    if (this.config.onAuthRequired) {
      return this.config.onAuthRequired({ fromUri, additionalParams })
    }
    // Default flow
    return this.loginRedirect(fromUri, additionalParams)
  }

  async loginRedirect (fromUri, additionalParams) {
    if (fromUri) {
      this.setFromUri(fromUri)
    }
    let params = buildConfigObject(additionalParams)
    params.scopes = params.scopes || this.config.scopes
    params.responseType = params.responseType || this.config.responseType
    return this.oktaAuth.token.getWithRedirect(params)
  }

  async logout () {
    this.oktaAuth.tokenManager.clear()
    await this.oktaAuth.signOut()
  }

  async isAuthenticated () {
    // Support a user-provided method to check authentication
    if (this.config.isAuthenticated) {
      return (this.config.isAuthenticated)()
    }

    return !!(await this.getAccessToken()) || !!(await this.getIdToken())
  }

  async handleAuthentication () {
    const tokens = await this.oktaAuth.token.parseFromUrl()
    tokens.forEach(token => {
      if (token.accessToken) this.oktaAuth.tokenManager.add('accessToken', token)
      if (token.idToken) this.oktaAuth.tokenManager.add('idToken', token)
    })
  }

  setFromUri (fromUri) {
    localStorage.setItem('referrerPath', fromUri)
  }

  getFromUri () {
    const path = localStorage.getItem('referrerPath') || '/'
    localStorage.removeItem('referrerPath')
    return path
  }

  async getIdToken () {
    try {
      const idToken = await this.oktaAuth.tokenManager.get('idToken')
      return idToken.idToken
    } catch (err) {
      // The user no longer has an existing SSO session in the browser.
      // (OIDC error `login_required`)
      // Ask the user to authenticate again.
      return undefined
    }
  }

  async getAccessToken () {
    try {
      const accessToken = await this.oktaAuth.tokenManager.get('accessToken')
      return accessToken.accessToken
    } catch (err) {
      // The user no longer has an existing SSO session in the browser.
      // (OIDC error `login_required`)
      // Ask the user to authenticate again.
      return undefined
    }
  }

  async getUser () {
    const accessToken = await this.oktaAuth.tokenManager.get('accessToken')
    const idToken = await this.oktaAuth.tokenManager.get('idToken')
    if (accessToken && idToken) {
      const userinfo = await this.oktaAuth.token.getUserInfo(accessToken)
      if (userinfo.sub === idToken.claims.sub) {
        // Only return the userinfo response if subjects match to
        // mitigate token substitution attacks
        return userinfo
      }
    }
    return idToken ? idToken.claims : undefined
  }

  authRedirectGuard () {
    return async (to, from, next) => {
      if (to.matched.some(record => record.meta.requiresAuth) && !(await this.isAuthenticated())) {
        this.login(to.path)
      } else {
        next()
      }
    }
  }

  getTokenManager () {
    return this.oktaAuth.tokenManager
  }

  // Handle token manager errors: Default implementation
  _onTokenError (error) {
    if (error.errorCode === 'login_required') {
      this.login()
    }
  }
}

function install (Vue, options) {
  const auth = new Auth(options)
  Vue.prototype.$auth = auth
}

function handleCallback () { return ImplicitCallback }

const initConfig = options => {
  // Normalize config object
  let auth = buildConfigObject(options)

  // Assert configuration
  assertIssuer(auth.issuer, auth.testing)
  assertClientId(auth.clientId)
  assertRedirectUri(auth.redirectUri)

  // Ensure "openid" exists in the scopes
  auth.scopes = auth.scopes || []
  if (auth.scopes.indexOf('openid') < 0) {
    auth.scopes.unshift('openid')
  }

  // Set default responseType if not specified
  auth.responseType = auth.responseType || ['id_token', 'token']

  return auth
}

export default { install, handleCallback }
