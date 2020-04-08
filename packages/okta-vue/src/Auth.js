import { buildConfigObject } from '@okta/configuration-validation'
import AuthJS from '@okta/okta-auth-js'
import initConfig from './config'
import packageInfo from './packageInfo'

export default class Auth {
  constructor (config) {
    this.config = initConfig(config)

    // Automatically enter login flow if session has expired or was ended outside the application
    // The default behavior can be overriden by passing your own function via config: `config.onSessionExpired`
    if (!this.config.onSessionExpired) {
      this.config.onSessionExpired = this.login.bind(this)
    }

    this.oktaAuth = new AuthJS(this.config)
    this.oktaAuth.userAgent = `${packageInfo.name}/${packageInfo.version} ${this.oktaAuth.userAgent}`
  }

  async login (fromUri, additionalParams) {
    const currentUri = window.location.href.replace(window.location.origin, '')
    this.setFromUri(fromUri || currentUri)

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

  async logout (options) {
    return this.oktaAuth.signOut(options)
  }

  async isAuthenticated () {
    // Support a user-provided method to check authentication
    if (this.config.isAuthenticated) {
      return (this.config.isAuthenticated)()
    }

    return !!(await this.getAccessToken()) || !!(await this.getIdToken())
  }

  async handleAuthentication () {
    const {tokens} = await this.oktaAuth.token.parseFromUrl()

    if (tokens.idToken) {
      this.oktaAuth.tokenManager.add('idToken', tokens.idToken)
    }
    if (tokens.accessToken) {
      this.oktaAuth.tokenManager.add('accessToken', tokens.accessToken)
    }
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

    if (!accessToken || !idToken) {
      return idToken ? idToken.claims : undefined
    }

    return this.oktaAuth.token.getUserInfo()
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
}
