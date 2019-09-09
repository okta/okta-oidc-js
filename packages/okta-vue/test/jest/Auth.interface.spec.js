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

describe('login', () => {
  let mockAuthJsInstance
  let localVue

  function bootstrap (config) {
    mockAuthJsInstance = extendMockAuthJS({})
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    localVue = createLocalVue()
    localVue.use(Auth, Object.assign({}, baseConfig, config))
  }

  it('Calls loginRedirect by default', () => {
    const fromUri = 'https://fake'
    const additionalParams = { foo: 'bar' }
    bootstrap()
    jest.spyOn(localVue.prototype.$auth, 'loginRedirect')
    localVue.prototype.$auth.login(fromUri, additionalParams)
    expect(localVue.prototype.$auth.loginRedirect).toHaveBeenCalledWith(fromUri, additionalParams)
  })

  it('Will call a custom callback "onAuthRequired" if provided', () => {
    const onAuthRequired = jest.fn()
    const fromUri = 'https://fake'
    const additionalParams = { foo: 'bar' }
    bootstrap({ onAuthRequired })
    jest.spyOn(localVue.prototype.$auth, 'loginRedirect')
    localVue.prototype.$auth.login(fromUri, additionalParams)
    expect(onAuthRequired).toHaveBeenCalledWith({ fromUri, additionalParams })
    expect(localVue.prototype.$auth.loginRedirect).not.toHaveBeenCalled()
  })

  it('calls setFromUri with fromUri if provided', () => {
    const fromUri = 'notrandom'
    jest.spyOn(localVue.prototype.$auth, 'setFromUri')
    jest.spyOn(localVue.prototype.$auth, 'loginRedirect').mockReturnValue(null)
    localVue.prototype.$auth.login(fromUri)
    expect(localVue.prototype.$auth.setFromUri).toHaveBeenCalledWith(fromUri)
  })

  it('calls setFromUri with window.location.pathname by default', () => {
    jest.spyOn(localVue.prototype.$auth, 'setFromUri')
    jest.spyOn(localVue.prototype.$auth, 'loginRedirect').mockReturnValue(null)
    localVue.prototype.$auth.login()
    expect(localVue.prototype.$auth.setFromUri).toHaveBeenCalledWith(window.location.pathname)
  })
})

describe('loginRedirect', () => {
  let mockAuthJsInstance
  let localVue
  beforeEach(() => {
    mockAuthJsInstance = extendMockAuthJS({
      token: {
        getWithRedirect: jest.fn()
      }
    })
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    localVue = createLocalVue()
    localVue.use(Auth, baseConfig)
  })

  it('calls setFromUri if fromUri is provided', () => {
    const fromUri = 'notrandom'
    jest.spyOn(localVue.prototype.$auth, 'setFromUri')
    localVue.prototype.$auth.loginRedirect(fromUri)
    expect(localVue.prototype.$auth.setFromUri).toHaveBeenCalledWith(fromUri)
  })

  it('does not call setFromUri if no fromUri is provided', () => {
    jest.spyOn(localVue.prototype.$auth, 'setFromUri')
    localVue.prototype.$auth.loginRedirect()
    expect(localVue.prototype.$auth.setFromUri).not.toHaveBeenCalled()
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
    mockAuthJsInstance = extendMockAuthJS({
      signOut: jest.fn().mockReturnValue(null),
      tokenManager: {
        clear: jest.fn().mockReturnValue(Promise.resolve())
      }
    })
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

  function bootstrap (config) {
    mockAuthJsInstance = extendMockAuthJS({})
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    localVue = createLocalVue()
    localVue.use(Auth, Object.assign({}, baseConfig, config))
  }
  test('isAuthenticated() returns false when the TokenManager throws an error', async () => {
    bootstrap()
    mockAuthJsInstance.tokenManager = {
      get: jest.fn().mockImplementation(() => {
        throw new Error()
      })
    }

    const authenticated = await localVue.prototype.$auth.isAuthenticated()
    expect(authenticated).toBeFalsy()
  })

  test('isAuthenticated() returns false when the TokenManager does not return an access token', async () => {
    bootstrap()
    mockAuthJsInstance.tokenManager = {
      get: jest.fn().mockImplementation(() => {
        return null
      })
    }
    const authenticated = await localVue.prototype.$auth.isAuthenticated()
    expect(authenticated).toBeFalsy()
  })

  test('isAuthenticated() returns true when the TokenManager returns an access token', async () => {
    bootstrap()
    mockAuthJsInstance.tokenManager = {
      get: jest.fn().mockReturnValue(Promise.resolve({ accessToken: 'fake' }))
    }
    const authenticated = await localVue.prototype.$auth.isAuthenticated()
    expect(mockAuthJsInstance.tokenManager.get).toHaveBeenCalledWith('accessToken')
    expect(authenticated).toBeTruthy()
  })

  it('Will call a custom function if "config.isAuthenticated" was set', async () => {
    const isAuthenticated = jest.fn().mockReturnValue(Promise.resolve('foo'))
    bootstrap({ isAuthenticated })
    jest.spyOn(localVue.prototype.$auth, 'getAccessToken')
    jest.spyOn(localVue.prototype.$auth, 'getIdToken')
    const ret = await localVue.prototype.$auth.isAuthenticated()
    expect(ret).toBe('foo')
    expect(isAuthenticated).toHaveBeenCalled()
    expect(localVue.prototype.$auth.getAccessToken).not.toHaveBeenCalled()
    expect(localVue.prototype.$auth.getIdToken).not.toHaveBeenCalled()
  })
})

describe('handleAuthentication', () => {
  let mockAuthJsInstance
  let localVue

  function bootstrap (tokens) {
    mockAuthJsInstance = extendMockAuthJS({
      token: {
        parseFromUrl: jest.fn().mockReturnValue(Promise.resolve(tokens))
      },
      tokenManager: {
        add: jest.fn()
      }
    })
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

describe('setFromUri', () => {
  test('sets referrer in localStorage', () => {
    const TEST_VALUE = 'foo-bar'
    localStorage.setItem('referrerPath', '')
    const localVue = createLocalVue()
    localVue.use(Auth, baseConfig)
    localVue.prototype.$auth.setFromUri(TEST_VALUE)
    expect(localStorage.getItem('referrerPath')).toBe(TEST_VALUE)
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
    mockAuthJsInstance = extendMockAuthJS({
      tokenManager: {
        get: jest.fn().mockReturnValue(Promise.resolve(token))
      }
    })
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
    mockAuthJsInstance = extendMockAuthJS({
      tokenManager: {
        get: jest.fn().mockReturnValue(Promise.resolve(token))
      }
    })
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

describe('TokenManager', () => {
  let mockAuthJsInstance
  let localVue

  function bootstrap (config) {
    mockAuthJsInstance = extendMockAuthJS({})
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    localVue = createLocalVue()
    localVue.use(Auth, Object.assign({}, baseConfig, config))
  }

  it('Exposes the token manager', () => {
    bootstrap()
    const val = localVue.prototype.$auth.getTokenManager()
    expect(val).toBeTruthy()
    expect(val).toBe(localVue.prototype.$auth.oktaAuth.tokenManager)
  })

  it('Listens to errors from token manager', () => {
    bootstrap()
    const val = localVue.prototype.$auth.getTokenManager()
    expect(val.on).toHaveBeenCalledWith('error', expect.any(Function))
  })

  it('_onTokenError: calls loginRedirect for error code "login_required"', () => {
    bootstrap()
    jest.spyOn(localVue.prototype.$auth, 'login').mockReturnValue(null)
    localVue.prototype.$auth._onTokenError({ errorCode: 'login_required' })
    expect(localVue.prototype.$auth.login).toHaveBeenCalled()
  })

  it('_onTokenError: ignores other errors', () => {
    bootstrap()
    jest.spyOn(localVue.prototype.$auth, 'login').mockReturnValue(null)
    localVue.prototype.$auth._onTokenError({ errorCode: 'something' })
    expect(localVue.prototype.$auth.login).not.toHaveBeenCalled()
  })

  it('Accepts custom function "onTokenError" via config', () => {
    const onTokenError = jest.fn()
    bootstrap({ onTokenError })
    const val = localVue.prototype.$auth.getTokenManager()
    expect(val.on).toHaveBeenCalledWith('error', onTokenError)
  })
})

describe('authRedirectGuard', () => {
  let localVue
  let mockAuthJsInstance
  beforeEach(() => {
    mockAuthJsInstance = extendMockAuthJS()
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    })
    localVue = createLocalVue()
    localVue.use(Auth, baseConfig)
  })

  it('does nothing if route does not requireAuth', async () => {
    const route = {
      meta: {
        requiresAuth: false
      }
    }
    const next = jest.fn()
    jest.spyOn(localVue.prototype.$auth, 'isAuthenticated')
    await localVue.prototype.$auth.authRedirectGuard()({ matched: [route] }, null, next)
    expect(localVue.prototype.$auth.isAuthenticated).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('calls next() if authenticated', async () => {
    const route = {
      meta: {
        requiresAuth: true
      }
    }
    const next = jest.fn()
    jest.spyOn(localVue.prototype.$auth, 'isAuthenticated').mockReturnValue(Promise.resolve(true))
    await localVue.prototype.$auth.authRedirectGuard()({ matched: [route] }, null, next)
    expect(localVue.prototype.$auth.isAuthenticated).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('calls login() if not authenticated', async () => {
    const route = {
      meta: {
        requiresAuth: true
      }
    }
    const next = jest.fn()
    jest.spyOn(localVue.prototype.$auth, 'isAuthenticated').mockReturnValue(Promise.resolve(false))
    jest.spyOn(localVue.prototype.$auth, 'login')
    await localVue.prototype.$auth.authRedirectGuard()({ matched: [route] }, null, next)
    expect(localVue.prototype.$auth.isAuthenticated).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
    expect(localVue.prototype.$auth.login).toHaveBeenCalled()
  })
})
