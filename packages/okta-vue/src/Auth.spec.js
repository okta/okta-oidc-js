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

const mockAuthJsInstanceWithError = {
  userAgent: 'foo',
  token: {
    getWithRedirect: jest.fn()
  },
  tokenManager: {
    get: jest.fn().mockImplementation(() => {
      throw new Error()
    })
  }
}

describe('Auth configuration', () => {
  it('should throw if no issuer is provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {})
    }
    expect(createInstance).toThrow()
  })
  it('should throw if an issuer that does not contain https is provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {
        issuer: 'http://foo.com'
      })
    }
    expect(createInstance).toThrow()
  })
  it('should throw if an issuer matching {yourOktaDomain} is provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {
        issuer: 'https://{yourOktaDomain}'
      })
    }
    expect(createInstance).toThrow()
  })
  it('should throw if an issuer matching -admin.okta.com is provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {
        issuer: 'https://foo-admin.okta.com'
      })
    }
    expect(createInstance).toThrow()
  })
  it('should throw if an issuer matching -admin.oktapreview.com is provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {
        issuer: 'https://foo-admin.oktapreview.com'
      })
    }
    expect(createInstance).toThrow()
  })
  it('should throw if an issuer matching -admin.okta-emea.com is provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {
        issuer: 'https://foo-admin.okta-emea.com'
      })
    }
    expect(createInstance).toThrow()
  })
  it('should throw if an issuer matching more than one ".com" is provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {
        issuer: 'https://foo.okta.com.com'
      })
    }
    expect(createInstance).toThrow()
  })
  it('should throw if an issuer matching more than one sequential "://" is provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {
        issuer: 'https://://foo.okta.com'
      })
    }
    expect(createInstance).toThrow()
  })
  it('should throw if an issuer matching more than one "://" is provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {
        issuer: 'https://foo.okta://.com'
      })
    }
    expect(createInstance).toThrow()
  })
  it('should throw if the client_id is not provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {
        issuer: 'https://foo'
      })
    }
    expect(createInstance).toThrow()
  })
  it('should throw if a client_id matching {clientId} is provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {
        client_id: '{clientId}',
        issuer: 'https://foo'
      })
    }
    expect(createInstance).toThrow()
  })
  it('should throw if the redirect_uri is not provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo'
      })
    }
    expect(createInstance).toThrow()
  })

  it('should throw if a redirect_uri matching {redirectUri} is provided', () => {
    function createInstance () {
      const localVue = createLocalVue()
      localVue.use(Auth, {
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: '{redirectUri}'
      })
    }
    expect(createInstance).toThrow()
  })
})

describe('Auth component', () => {
  beforeEach(() => {
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
  })
  test('is a Vue plugin', () => {
    expect(Auth.install).toBeTruthy()
  })
  test('sets the right user agent on AuthJS', () => {
    const expectedUserAgent = `${pkg.name}/${pkg.version} foo`
    const localVue = createLocalVue()
    localVue.use(Auth, {
      issuer: 'https://foo',
      client_id: 'foo',
      redirect_uri: 'foo'
    })
    expect(mockAuthJsInstance.userAgent).toMatch(expectedUserAgent)
  })
  test('sets the right scope and response_type when redirecting to Okta', () => {
    const localVue = createLocalVue()
    localVue.use(Auth, {
      issuer: 'https://foo',
      client_id: 'foo',
      redirect_uri: 'foo'
    })
    localVue.prototype.$auth.loginRedirect()
    const mockCallValues = mockAuthJsInstance.token.getWithRedirect.mock.calls[0][0]
    expect(mockCallValues.responseType).toEqual(expect.arrayContaining(['id_token', 'token']))
    expect(mockCallValues.scopes).toEqual(expect.arrayContaining(['openid']))
  })
  test('sets the right scope and response_type overrides when redirecting to Okta', () => {
    const localVue = createLocalVue()
    localVue.use(Auth, {
      issuer: 'https://foo',
      client_id: 'foo',
      redirect_uri: 'foo',
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
      issuer: 'https://foo',
      client_id: 'foo',
      redirect_uri: 'foo',
      scope: 'foo bar',
      response_type: 'token'
    })
    const accessToken = await localVue.prototype.$auth.getAccessToken()
    expect(accessToken).toBe(mockAccessToken)
    done()
  })
  test('isAuthenticated() returns true when the TokenManager returns an access token', async () => {
    const localVue = createLocalVue()
    localVue.use(Auth, {
      issuer: 'https://foo',
      client_id: 'foo',
      redirect_uri: 'foo',
      scope: 'foo bar',
      response_type: 'token'
    })
    const authenticated = await localVue.prototype.$auth.isAuthenticated()
    expect(mockAuthJsInstance.tokenManager.get).toHaveBeenCalledWith('accessToken')
    expect(authenticated).toBeTruthy()
  })
  test('isAuthenticated() returns false when the TokenManager does not return an access token', async () => {
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstanceWithError
    })
    const localVue = createLocalVue()
    localVue.use(Auth, {
      issuer: 'https://foo',
      client_id: 'foo',
      redirect_uri: 'foo',
      scope: 'foo bar',
      response_type: 'token'
    })
    const authenticated = await localVue.prototype.$auth.isAuthenticated()
    expect(authenticated).toBeFalsy()
  })
})
