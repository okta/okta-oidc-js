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

  // Ensure "openid" exists in the scopes
  auth.scopes = auth.scopes || []
  if (auth.scopes.indexOf('openid') < 0) {
    auth.scopes.unshift('openid')
  }

  // Set default responseType if not specified
  auth.responseType = auth.responseType || ['id_token', 'token']

  return auth
}
