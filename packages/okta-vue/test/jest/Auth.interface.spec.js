import AuthJS from '@okta/okta-auth-js'
import { createLocalVue } from '@vue/test-utils'
import { default as Auth } from '../../src/Auth'

const pkg = require('../../package.json')
jest.mock('@okta/okta-auth-js')

const baseConfig = {
  issuer: 'https://foo',
  clientId: 'foo',
  redirectUri: 'foo'
}

describe('Auth constructor', () => {
  let mockAuthJsInstance

  beforeEach(() => {
    mockAuthJsInstance = {
      userAgent: 'foo'
    }
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
    localVue.use(Auth, baseConfig)
    expect(mockAuthJsInstance.userAgent).toMatch(expectedUserAgent)
  })

  it('sets the right scope and response_type when constructing AuthJS instance', () => {
    const localVue = createLocalVue()
    localVue.use(Auth, baseConfig)
    expect(AuthJS).toHaveBeenCalledWith(Object.assign({}, baseConfig, {
      scopes: ['openid'],
      responseType: ['id_token', 'token']
    }))
  })

  test('sets the right scope and response_type overrides (legacy config)', async () => {
    const localVue = createLocalVue()
    const legacyConfig = {
      issuer: 'https://foo',
      client_id: 'foo',
      redirect_uri: 'foo',
      scope: 'foo bar',
      response_type: 'token foo'
    }
    localVue.use(Auth, legacyConfig)
    expect(AuthJS).toHaveBeenCalledWith(Object.assign({}, legacyConfig, {
      clientId: 'foo',
      redirectUri: 'foo',
      scopes: ['openid', 'foo', 'bar'],
      responseType: ['token', 'foo']
    }))
  })

  it('will not overwrite responseType if set', () => {
    const localVue = createLocalVue()
    localVue.use(Auth, Object.assign({}, baseConfig, {
      responseType: ['fake']
    }))
    expect(AuthJS).toHaveBeenCalledWith(Object.assign({}, baseConfig, {
      scopes: ['openid'],
      responseType: ['fake']
    }))
  })

  it('will add "openid" to scopes if not present', () => {
    const localVue = createLocalVue()
    localVue.use(Auth, Object.assign({}, baseConfig, {
      responseType: ['fake'],
      scopes: ['a']
    }))
    expect(AuthJS).toHaveBeenCalledWith(Object.assign({}, baseConfig, {
      scopes: ['openid', 'a'],
      responseType: ['fake']
    }))
  })
})

describe('loginRedirect', () => {
  let mockAuthJsInstance
  let localVue
  beforeEach(() => {
    mockAuthJsInstance = {
      token: {
        getWithRedirect: jest.fn()
      }
    }
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    localVue = createLocalVue()
    localVue.use(Auth, baseConfig)
  })

  it('loginRedirect: calls oktaAuth.token.getWithRedirect when redirecting to Okta', () => {
    localVue.prototype.$auth.loginRedirect()
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalled()
  })

  it('loginRedirect: can override params', () => {
    const params = {
      scopes: ['foo', 'bar', 'biz'],
      responseType: 'excellent'
    }
    localVue.prototype.$auth.loginRedirect('/', params)
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith(params)
  })

  it('loginRedirect: can override params (legacy format)', () => {
    const params = {
      scope: 'a b c',
      response_type: 'fake type'
    }
    localVue.prototype.$auth.loginRedirect('/', params)
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith(Object.assign({}, params, {
      scopes: ['a', 'b', 'c'],
      responseType: ['fake', 'type']
    }))
  })
})

describe('logout', () => {
  let localVue
  let mockAuthJsInstance
  beforeEach(() => {
    mockAuthJsInstance = {
      signOut: jest.fn().mockReturnValue(null),
      tokenManager: {
        clear: jest.fn().mockReturnValue(Promise.resolve())
      }
    }
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    localVue = createLocalVue()
    localVue.use(Auth, baseConfig)
    localVue.prototype.$auth.logout()
  })

  test('calls "signOut', () => {
    expect(mockAuthJsInstance.signOut).toHaveBeenCalled()
  })

  test('clears tokens', () => {
    expect(mockAuthJsInstance.tokenManager.clear).toHaveBeenCalled()
  })
})

describe('isAuthenticated', () => {
  let mockAuthJsInstance
  let localVue

  beforeEach(() => {
    mockAuthJsInstance = {}
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    localVue = createLocalVue()
    localVue.use(Auth, baseConfig)
  })

  test('isAuthenticated() returns false when the TokenManager throws an error', async () => {
    mockAuthJsInstance.tokenManager = {
      get: jest.fn().mockImplementation(() => {
        throw new Error()
      })
    }

    const authenticated = await localVue.prototype.$auth.isAuthenticated()
    expect(authenticated).toBeFalsy()
  })

  test('isAuthenticated() returns false when the TokenManager does not return an access token', async () => {
    mockAuthJsInstance.tokenManager = {
      get: jest.fn().mockImplementation(() => {
        return null
      })
    }
    const authenticated = await localVue.prototype.$auth.isAuthenticated()
    expect(authenticated).toBeFalsy()
  })

  test('isAuthenticated() returns true when the TokenManager returns an access token', async () => {
    mockAuthJsInstance.tokenManager = {
      get: jest.fn().mockReturnValue(Promise.resolve({ accessToken: 'fake' }))
    }
    const authenticated = await localVue.prototype.$auth.isAuthenticated()
    expect(mockAuthJsInstance.tokenManager.get).toHaveBeenCalledWith('accessToken')
    expect(authenticated).toBeTruthy()
  })
})

describe('handleAuthentication', () => {
  let mockAuthJsInstance
  let localVue

  function bootstrap (tokens) {
    mockAuthJsInstance = {
      token: {
        parseFromUrl: jest.fn().mockReturnValue(Promise.resolve(tokens))
      },
      tokenManager: {
        add: jest.fn()
      }
    }
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    localVue = createLocalVue()
    localVue.use(Auth, baseConfig)
  }

  it('stores accessToken and idToken', async () => {
    var accessToken = { accessToken: 'X' }
    var idToken = { idToken: 'Y' }
    bootstrap([
      accessToken,
      idToken
    ])
    await localVue.prototype.$auth.handleAuthentication()
    expect(mockAuthJsInstance.tokenManager.add).toHaveBeenNthCalledWith(1, 'accessToken', accessToken)
    expect(mockAuthJsInstance.tokenManager.add).toHaveBeenNthCalledWith(2, 'idToken', idToken)
  })
})

describe('getFromUri', () => {
  test('cleares referrer from localStorage', () => {
    const TEST_VALUE = 'foo-bar'
    localStorage.setItem('referrerPath', TEST_VALUE)

    const localVue = createLocalVue()
    localVue.use(Auth, baseConfig)
    expect(localVue.prototype.$auth.getFromUri()).toBe(TEST_VALUE)
    expect(localStorage.getItem('referrerPath')).not.toBeTruthy()
  })
})

describe('getAccessToken', () => {
  let mockAuthJsInstance
  let localVue

  function bootstrap (token) {
    mockAuthJsInstance = {
      tokenManager: {
        get: jest.fn().mockReturnValue(Promise.resolve(token))
      }
    }
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    localVue = createLocalVue()
    localVue.use(Auth, baseConfig)
  }

  test('can retrieve an accessToken from the tokenManager', async () => {
    const accessToken = { accessToken: 'fake' }
    bootstrap(accessToken)
    const val = await localVue.prototype.$auth.getAccessToken()
    expect(val).toBe(accessToken.accessToken)
  })
})

describe('getIdToken', () => {
  let mockAuthJsInstance
  let localVue

  function bootstrap (token) {
    mockAuthJsInstance = {
      tokenManager: {
        get: jest.fn().mockReturnValue(Promise.resolve(token))
      }
    }
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    localVue = createLocalVue()
    localVue.use(Auth, baseConfig)
  }

  test('can retrieve an idToken from the tokenManager', async () => {
    const idToken = { idToken: 'fake' }
    bootstrap(idToken)
    const val = await localVue.prototype.$auth.getIdToken()
    expect(val).toBe(idToken.idToken)
  })
})

describe('getUser', () => {
  let mockAuthJsInstance
  let localVue

  function bootstrap (options = {}) {
    mockAuthJsInstance = {
      token: {
        getUserInfo: jest.fn().mockReturnValue(Promise.resolve(options.userInfo))
      },
      tokenManager: {
        get: jest.fn().mockImplementation(key => {
          if (key === 'accessToken') {
            return options.accessToken
          } else if (key === 'idToken') {
            return options.idToken
          }
        })
      }
    }
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    localVue = createLocalVue()
    localVue.use(Auth, baseConfig)
  }

  test('no tokens: returns undefined', async () => {
    bootstrap()
    const val = await localVue.prototype.$auth.getUser()
    expect(val).toBe(undefined)
  })

  test('idToken only: returns claims', async () => {
    const claims = { foo: 'bar' }
    bootstrap({
      idToken: { claims }
    })
    const val = await localVue.prototype.$auth.getUser()
    expect(val).toBe(claims)
  })

  test('idToken and accessToken: calls getUserInfo', async () => {
    bootstrap({
      accessToken: {},
      idToken: { claims: {} },
      userInfo: {}
    })
    await localVue.prototype.$auth.getUser()
    expect(mockAuthJsInstance.token.getUserInfo).toHaveBeenCalled()
  })

  test('idToken and accessToken: matching sub returns userInfo', async () => {
    const sub = 'fake'
    const userInfo = { sub }
    const claims = { sub }
    bootstrap({
      accessToken: {},
      idToken: { claims },
      userInfo
    })
    const val = await localVue.prototype.$auth.getUser()
    expect(val).toBe(userInfo)
  })

  test('idToken and accessToken: mis-matching sub returns claims', async () => {
    const sub = 'fake'
    const userInfo = { sub: 'not-fake?' }
    const claims = { sub }
    bootstrap({
      accessToken: {},
      idToken: { claims },
      userInfo
    })
    const val = await localVue.prototype.$auth.getUser()
    expect(val).toBe(claims)
  })
})
