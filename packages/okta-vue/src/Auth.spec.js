import AuthJS from '@okta/okta-auth-js'
import { createLocalVue } from '@vue/test-utils'
import { default as Auth } from './Auth'

const pkg = require('../package.json')
jest.mock('@okta/okta-auth-js')

const mockAccessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXIiOj' +
                        'EsImp0aSI6IkFULnJ2Ym5TNGlXdTJhRE5jYTNid1RmMEg5Z' +
                        'VdjV2xsS1FlaU5ZX1ZlSW1NWkEiLCJpc3MiOiJodHRwczov' +
                        'L2xib3lldHRlLnRyZXhjbG91ZC5jb20vYXMvb3JzMXJnM3p' +
                        '5YzhtdlZUSk8wZzciLCJhdWQiOiJodHRwczovL2xib3lldH' +
                        'RlLnRyZXhjbG91ZC5jb20vYXMvb3JzMXJnM3p5YzhtdlZUS' +
                        'k8wZzciLCJzdWIiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIs' +
                        'ImlhdCI6MTQ2ODQ2NzY0NywiZXhwIjoxNDY4NDcxMjQ3LCJ' +
                        'jaWQiOiJQZjBhaWZyaFladTF2MFAxYkZGeiIsInVpZCI6Ij' +
                        'AwdTFwY2xhNXFZSVJFRExXQ1FWIiwic2NwIjpbIm9wZW5pZ' +
                        'CIsImVtYWlsIl19.ziKfS8IjSdOdTHCZllTDnLFdE96U9bS' +
                        'IsJzI0MQ0zlnM2QiiA7nvS54k6Xy78ebnkJvmeMCctjXVKk' +
                        'JOEhR6vs11qVmIgbwZ4--MqUIRU3WoFEsr0muLl039QrUa1' +
                        'EQ9-Ua9rPOMaO0pFC6h2lfB_HfzGifXATKsN-wLdxk6cgA'

const standardAccessTokenParsed = {
  accessToken: mockAccessToken,
  expiresAt: new Date().getTime() + 100, // ensure token is active
  scopes: ['openid', 'email'],
  tokenType: 'Bearer',
  authorizeUrl: 'https://foo/oauth2/v1/authorize',
  userinfoUrl: 'https://foo/oauth2/v1/userinfo'
}

const mockAuthJsInstance = {
  userAgent: 'foo',
  token: {
    getWithRedirect: jest.fn()
  },
  tokenManager: {
    get: jest.fn().mockReturnValue(Promise.resolve(standardAccessTokenParsed))
  }
}

AuthJS.mockImplementation(() => {
  return mockAuthJsInstance
})

describe('Auth', () => {
  test('is a Vue plugin', () => {
    expect(Auth.install).toBeTruthy()
  })
  test('sets the right user agent on AuthJS', () => {
    const expectedUserAgent = `${pkg.name}/${pkg.version} foo`
    const localVue = createLocalVue()
    localVue.use(Auth, {
      issuer: '1',
      client_id: '2',
      redirect_uri: '3'
    })
    expect(mockAuthJsInstance.userAgent).toMatch(expectedUserAgent)
  })
  test('sets the right scope and response_type when redirecting to Okta', () => {
    const localVue = createLocalVue()
    localVue.use(Auth, {
      issuer: '1',
      client_id: '2',
      redirect_uri: '3'
    })
    localVue.prototype.$auth.loginRedirect()
    const mockCallValues = mockAuthJsInstance.token.getWithRedirect.mock.calls[0][0]
    expect(mockCallValues.responseType).toEqual(expect.arrayContaining(['id_token', 'token']))
    expect(mockCallValues.scopes).toEqual(expect.arrayContaining(['openid']))
  })
  test('sets the right scope and response_type overrides when redirecting to Okta', () => {
    const localVue = createLocalVue()
    localVue.use(Auth, {
      issuer: '1',
      client_id: '2',
      redirect_uri: '3',
      scope: 'foo bar',
      response_type: 'token'
    })
    localVue.prototype.$auth.loginRedirect()
    const mockCallValues = mockAuthJsInstance.token.getWithRedirect.mock.calls[1][0]
    expect(mockCallValues.responseType).toEqual(expect.arrayContaining(['token']))
    expect(mockCallValues.scopes).toEqual(expect.arrayContaining(['foo', 'bar']))
  })
  test('can retrieve an accessToken from the tokenManager', async (done) => {
    const localVue = createLocalVue()
    localVue.use(Auth, {
      issuer: '1',
      client_id: '2',
      redirect_uri: '3',
      scope: 'foo bar',
      response_type: 'token'
    })
    const accessToken = await localVue.prototype.$auth.getAccessToken()
    expect(accessToken).toBe(mockAccessToken)
    done()
  })
})
