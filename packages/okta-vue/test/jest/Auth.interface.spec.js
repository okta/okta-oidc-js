import AuthJS from '@okta/okta-auth-js'
import Auth from '../../src/Auth'

const pkg = require('../../package.json')
jest.mock('@okta/okta-auth-js')

const baseConfig = {
  issuer: 'https://foo',
  clientId: 'foo',
  redirectUri: 'foo'
}

function extendMockAuthJS (mockAuthJS) {
  mockAuthJS = mockAuthJS || {}
  mockAuthJS.tokenManager = Object.assign({}, mockAuthJS.tokenManager, {
    on: jest.fn()
  })
  mockAuthJS.token = Object.assign({}, mockAuthJS.token, {
    getWithRedirect: jest.fn()
  })
  return mockAuthJS
}

function createAuth (config) {
  const auth = new Auth(config || baseConfig)
  return auth
}
function extendConfig (config) {
  return Object.assign({}, baseConfig, config)
}

describe('Auth constructor', () => {
  let mockAuthJsInstance

  beforeEach(() => {
    mockAuthJsInstance = extendMockAuthJS({
      userAgent: 'foo'
    })
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
  })

  it('sets the right user agent on AuthJS', () => {
    const expectedUserAgent = `${pkg.name}/${pkg.version} foo`
    createAuth()
    expect(mockAuthJsInstance.userAgent).toMatch(expectedUserAgent)
  })

  it('sets the right scope and response_type when constructing AuthJS instance', () => {
    createAuth()
    expect(AuthJS).toHaveBeenCalledWith(Object.assign({}, baseConfig, {
      scopes: ['openid', 'email', 'profile'],
      responseType: ['id_token', 'token'],
      onSessionExpired: expect.any(Function)
    }))
  })

  it('will not overwrite responseType if set', () => {
    createAuth(extendConfig({
      responseType: ['fake']
    }))
    expect(AuthJS).toHaveBeenCalledWith(Object.assign({}, baseConfig, {
      scopes: ['openid', 'email', 'profile'],
      responseType: ['fake'],
      onSessionExpired: expect.any(Function)
    }))
  })

  it('will add "openid" to scopes if not present', () => {
    createAuth(extendConfig({
      responseType: ['fake'],
      scopes: ['a']
    }))
    expect(AuthJS).toHaveBeenCalledWith(Object.assign({}, baseConfig, {
      scopes: ['openid', 'a'],
      responseType: ['fake'],
      onSessionExpired: expect.any(Function)
    }))
  })
})

describe('onSessionExpired', () => {
  it('By default, sets a handler for "onSessionExpired" which calls login()', () => {
    jest.spyOn(Auth.prototype, 'login').mockReturnValue(undefined)
    const auth = createAuth()
    const config = auth.config
    expect(config.onSessionExpired).toBeDefined()
    config.onSessionExpired()
    expect(Auth.prototype.login).toHaveBeenCalled()
  })

  it('Accepts custom function "onSessionExpired" via config which disables default handler', () => {
    jest.spyOn(Auth.prototype, 'login').mockReturnValue(undefined)
    const onSessionExpired = jest.fn()
    const auth = createAuth(extendConfig({ onSessionExpired }))
    const config = auth.config
    expect(config.onSessionExpired).toBe(onSessionExpired)
    config.onSessionExpired()
    expect(onSessionExpired).toHaveBeenCalled()
    expect(Auth.prototype.login).not.toHaveBeenCalled()
  })
})

describe('login', () => {
  let mockAuthJsInstance
  let auth

  function bootstrap (config) {
    mockAuthJsInstance = extendMockAuthJS({})
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    auth = createAuth(extendConfig(config))
  }

  it('Calls loginRedirect by default', async () => {
    const fromUri = 'https://fake'
    const additionalParams = { foo: 'bar' }
    bootstrap()
    const expectedVal = 'fakey'
    jest.spyOn(auth, 'loginRedirect').mockReturnValue(expectedVal)
    const retVal = await auth.login(fromUri, additionalParams)
    expect(retVal).toBe(expectedVal)
    expect(auth.loginRedirect).toHaveBeenCalledWith(fromUri, additionalParams)
  })

  it('Will call a custom callback "onAuthRequired" if provided', async () => {
    const expectedVal = 'fakey'
    const onAuthRequired = jest.fn().mockReturnValue(expectedVal)
    const fromUri = 'https://fake'
    const additionalParams = { foo: 'bar' }
    bootstrap({ onAuthRequired })
    jest.spyOn(auth, 'loginRedirect')
    const retVal = await auth.login(fromUri, additionalParams)
    expect(retVal).toBe(expectedVal)
    expect(onAuthRequired).toHaveBeenCalledWith({ fromUri, additionalParams })
    expect(auth.loginRedirect).not.toHaveBeenCalled()
  })

  it('calls setFromUri with fromUri if provided', () => {
    const fromUri = 'notrandom'
    bootstrap()
    jest.spyOn(auth, 'setFromUri')
    jest.spyOn(auth, 'loginRedirect').mockReturnValue(null)
    auth.login(fromUri)
    expect(auth.setFromUri).toHaveBeenCalledWith(fromUri)
  })

  it('calls setFromUri with window.location.pathname by default', () => {
    bootstrap()
    jest.spyOn(auth, 'setFromUri')
    jest.spyOn(auth, 'loginRedirect').mockReturnValue(null)
    auth.login()
    expect(auth.setFromUri).toHaveBeenCalledWith(window.location.pathname)
  })
})

describe('loginRedirect', () => {
  let mockAuthJsInstance
  let auth
  beforeEach(() => {
    mockAuthJsInstance = extendMockAuthJS({
      token: {
        getWithRedirect: jest.fn()
      }
    })
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    auth = createAuth()
  })

  it('calls setFromUri if fromUri is provided', () => {
    const fromUri = 'notrandom'
    jest.spyOn(auth, 'setFromUri')
    auth.loginRedirect(fromUri)
    expect(auth.setFromUri).toHaveBeenCalledWith(fromUri)
  })

  it('does not call setFromUri if no fromUri is provided', () => {
    jest.spyOn(auth, 'setFromUri')
    auth.loginRedirect()
    expect(auth.setFromUri).not.toHaveBeenCalled()
  })

  it('loginRedirect: calls oktaAuth.token.getWithRedirect when redirecting to Okta', () => {
    auth.loginRedirect()
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalled()
  })

  it('loginRedirect: can override params', () => {
    const params = {
      scopes: ['foo', 'bar', 'biz'],
      responseType: 'excellent'
    }
    auth.loginRedirect('/', params)
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith(params)
  })

  it('loginRedirect: can override params (legacy format)', () => {
    const params = {
      scope: 'a b c',
      response_type: 'fake type'
    }
    auth.loginRedirect('/', params)
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith(Object.assign({}, params, {
      scopes: ['a', 'b', 'c'],
      responseType: ['fake', 'type']
    }))
  })
})

describe('logout', () => {
  let auth
  let mockAuthJsInstance
  let signoutRes
  beforeEach(() => {
    mockAuthJsInstance = extendMockAuthJS({
      signOut: jest.fn().mockReturnValue(signoutRes),
      tokenManager: {
        clear: jest.fn().mockReturnValue(Promise.resolve())
      }
    })
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    auth = createAuth()
  })

  it('calls "signOut', async () => {
    await auth.logout()
    expect(mockAuthJsInstance.signOut).toHaveBeenCalled()
  })

  it('passes options', async () => {
    const options = { foo: 'bar' }
    await auth.logout(options)
    expect(mockAuthJsInstance.signOut).toHaveBeenCalledWith(options)
  })

  it('returns a promise', async () => {
    const res = auth.logout()
    expect(typeof res.then).toBe('function')
    expect(typeof res.catch).toBe('function')
    return res
  })

  it('can throw', async () => {
    const testError = new Error('test error')
    signoutRes = Promise.reject(testError)
    return auth.logout()
      .catch(e => {
        expect(e).toBe(testError)
      })
  })
})

describe('isAuthenticated', () => {
  let mockAuthJsInstance
  let auth

  function bootstrap (config) {
    mockAuthJsInstance = extendMockAuthJS({})
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    auth = createAuth(extendConfig(config))
  }
  it('isAuthenticated() returns false when the TokenManager throws an error', async () => {
    bootstrap()
    mockAuthJsInstance.tokenManager = {
      get: jest.fn().mockImplementation(() => {
        throw new Error()
      })
    }

    const authenticated = await auth.isAuthenticated()
    expect(authenticated).toBeFalsy()
  })

  it('isAuthenticated() returns false when the TokenManager does not return an access token', async () => {
    bootstrap()
    mockAuthJsInstance.tokenManager = {
      get: jest.fn().mockImplementation(() => {
        return null
      })
    }
    const authenticated = await auth.isAuthenticated()
    expect(authenticated).toBeFalsy()
  })

  it('isAuthenticated() returns true when the TokenManager returns an access token', async () => {
    bootstrap()
    mockAuthJsInstance.tokenManager = {
      get: jest.fn().mockReturnValue(Promise.resolve({ accessToken: 'fake' }))
    }
    const authenticated = await auth.isAuthenticated()
    expect(mockAuthJsInstance.tokenManager.get).toHaveBeenCalledWith('accessToken')
    expect(authenticated).toBeTruthy()
  })

  it('Will call a custom function if "config.isAuthenticated" was set', async () => {
    const isAuthenticated = jest.fn().mockReturnValue(Promise.resolve('foo'))
    bootstrap({ isAuthenticated })
    jest.spyOn(auth, 'getAccessToken')
    jest.spyOn(auth, 'getIdToken')
    const ret = await auth.isAuthenticated()
    expect(ret).toBe('foo')
    expect(isAuthenticated).toHaveBeenCalled()
    expect(auth.getAccessToken).not.toHaveBeenCalled()
    expect(auth.getIdToken).not.toHaveBeenCalled()
  })
})

describe('handleAuthentication', () => {
  let mockAuthJsInstance
  let auth

  function bootstrap (tokens) {
    mockAuthJsInstance = extendMockAuthJS({
      token: {
        parseFromUrl: jest.fn().mockReturnValue(Promise.resolve({ tokens }))
      },
      tokenManager: {
        add: jest.fn()
      }
    })
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    auth = createAuth()
  }

  it('stores accessToken and idToken', async () => {
    var accessToken = { accessToken: 'X' }
    var idToken = { idToken: 'Y' }
    bootstrap({
      accessToken,
      idToken
    })
    await auth.handleAuthentication()
    expect(mockAuthJsInstance.tokenManager.add).toHaveBeenNthCalledWith(1, 'idToken', idToken)
    expect(mockAuthJsInstance.tokenManager.add).toHaveBeenNthCalledWith(2, 'accessToken', accessToken)
  })
})

describe('setFromUri', () => {
  it('sets referrer in localStorage', () => {
    const TEST_VALUE = 'foo-bar'
    localStorage.setItem('referrerPath', '')
    const auth = createAuth()
    auth.setFromUri(TEST_VALUE)
    expect(localStorage.getItem('referrerPath')).toBe(TEST_VALUE)
  })
})

describe('getFromUri', () => {
  it('cleares referrer from localStorage', () => {
    const TEST_VALUE = 'foo-bar'
    localStorage.setItem('referrerPath', TEST_VALUE)
    const auth = createAuth()
    expect(auth.getFromUri()).toBe(TEST_VALUE)
    expect(localStorage.getItem('referrerPath')).not.toBeTruthy()
  })
})

describe('getAccessToken', () => {
  let mockAuthJsInstance
  let auth

  function bootstrap (token) {
    mockAuthJsInstance = extendMockAuthJS({
      tokenManager: {
        get: jest.fn().mockReturnValue(Promise.resolve(token))
      }
    })
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    auth = createAuth()
  }

  it('can retrieve an accessToken from the tokenManager', async () => {
    const accessToken = { accessToken: 'fake' }
    bootstrap(accessToken)
    const val = await auth.getAccessToken()
    expect(val).toBe(accessToken.accessToken)
  })
})

describe('getIdToken', () => {
  let mockAuthJsInstance
  let auth

  function bootstrap (token) {
    mockAuthJsInstance = extendMockAuthJS({
      tokenManager: {
        get: jest.fn().mockReturnValue(Promise.resolve(token))
      }
    })
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    auth = createAuth()
  }

  it('can retrieve an idToken from the tokenManager', async () => {
    const idToken = { idToken: 'fake' }
    bootstrap(idToken)
    const val = await auth.getIdToken()
    expect(val).toBe(idToken.idToken)
  })
})

describe('getUser', () => {
  let mockAuthJsInstance
  let auth

  function bootstrap (options = {}) {
    mockAuthJsInstance = extendMockAuthJS({
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
    })
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    auth = createAuth()
  }

  it('no tokens: returns undefined', async () => {
    bootstrap()
    const val = await auth.getUser()
    expect(val).toBe(undefined)
  })

  it('idToken only: returns claims', async () => {
    const claims = { foo: 'bar' }
    bootstrap({
      idToken: { claims }
    })
    const val = await auth.getUser()
    expect(val).toBe(claims)
  })

  it('idToken and accessToken: calls getUserInfo', async () => {
    bootstrap({
      accessToken: {},
      idToken: { claims: {} },
      userInfo: {}
    })
    await auth.getUser()
    expect(mockAuthJsInstance.token.getUserInfo).toHaveBeenCalled()
  })
})

describe('TokenManager', () => {
  it('Exposes the token manager', () => {
    const auth = createAuth()
    const val = auth.getTokenManager()
    expect(val).toBeTruthy()
    expect(val).toBe(auth.oktaAuth.tokenManager)
  })
})

describe('authRedirectGuard', () => {
  let auth
  let mockAuthJsInstance
  beforeEach(() => {
    mockAuthJsInstance = extendMockAuthJS()
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    auth = createAuth()
  })

  it('does nothing if route does not requireAuth', async () => {
    const route = {
      meta: {
        requiresAuth: false
      }
    }
    const next = jest.fn()
    jest.spyOn(auth, 'isAuthenticated')
    await auth.authRedirectGuard()({ matched: [route] }, null, next)
    expect(auth.isAuthenticated).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('calls next() if authenticated', async () => {
    const route = {
      meta: {
        requiresAuth: true
      }
    }
    const next = jest.fn()
    jest.spyOn(auth, 'isAuthenticated').mockReturnValue(Promise.resolve(true))
    await auth.authRedirectGuard()({ matched: [route] }, null, next)
    expect(auth.isAuthenticated).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('calls login() if not authenticated', async () => {
    const route = {
      meta: {
        requiresAuth: true
      }
    }
    const next = jest.fn()
    jest.spyOn(auth, 'isAuthenticated').mockReturnValue(Promise.resolve(false))
    jest.spyOn(auth, 'login')
    await auth.authRedirectGuard()({ matched: [route] }, null, next)
    expect(auth.isAuthenticated).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
    expect(auth.login).toHaveBeenCalled()
  })
})
