import {
  assertIssuer,
  assertClientId,
  assertRedirectUri,
  buildConfigObject
} from '@okta/configuration-validation'

export default function initConfig (options) {
  // Normalize config object
  let auth = buildConfigObject(options)

  // Assert configuration
  assertIssuer(auth.issuer, auth.testing)
  assertClientId(auth.clientId)
  assertRedirectUri(auth.redirectUri)

  // Default scopes, override as needed
  auth.scopes = auth.scopes || ['openid', 'email', 'profile']
  // Force 'openid' as a scope
  if (!auth.scopes.includes('openid')) {
    auth.scopes.unshift('openid')
  }

  // Set default responseType if not specified
  auth.responseType = auth.responseType || ['id_token', 'token']

  return auth
}
