import AuthService from '../../src/AuthService';
import AuthJS from '@okta/okta-auth-js'
import Emitter from 'tiny-emitter';

const pkg = require('../../package.json');

jest.mock('@okta/okta-auth-js');

describe('AuthService configuration', () => {
  let mockAuthJsInstance;

  beforeEach(() => {
    mockAuthJsInstance = {
      userAgent: 'okta-auth-js',
      emitter: new Emitter()
    };
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    });
  })

  it('should throw if no issuer is provided', () => {
    function createInstance () {
      return new AuthService();
    }
    expect(createInstance).toThrow()
  });

  it('should throw if an issuer that does not contain https is provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'http://foo.com'
      });
    }
    expect(createInstance).toThrow()
  });

  it('should throw if an issuer matching {yourOktaDomain} is provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://{yourOktaDomain}'
      });
    }
    expect(createInstance).toThrow()
  });

  it('should throw if an issuer matching -admin.okta.com is provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo-admin.okta.com'
      });
    }
    expect(createInstance).toThrow()
  });

  it('should throw if an issuer matching -admin.oktapreview.com is provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo-admin.oktapreview.com'
      });
    }
    expect(createInstance).toThrow()
  });

  it('should throw if an issuer matching -admin.okta-emea.com is provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo-admin.okta-emea.com'
      });
    }
    expect(createInstance).toThrow()
  });

  it('should throw if the clientId is not provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo/oauth2/default'
      });
    }
    expect(createInstance).toThrow()
  });

  it('should throw if a clientId matching {clientId} is provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: '{clientId}',
      });
    }
    expect(createInstance).toThrow()
  });

  it('should throw if the redirectUri is not provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo'
      });
    }
    expect(createInstance).toThrow();
  });

  it('should throw if a redirectUri matching {redirectUri} is provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: '{redirectUri}'
      });
    }
    expect(createInstance).toThrow();
  });

  it('accepts options in camel case', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect'
      });
    }
    expect(createInstance).not.toThrow();
  });

  it('accepts the `pkce` option', () => {
    jest.spyOn(AuthJS.prototype, 'constructor');
    const options = {
      clientId: 'foo',
      issuer: 'https://foo/oauth2/default',
      onSessionExpired: expect.any(Function),
      redirectUri: 'foo',
      pkce: true,
    }

    new AuthService(options);
    expect(AuthJS.prototype.constructor).toHaveBeenCalledWith(options);
  });

  it('Passes tokenManager config to AuthJS', () => {
    jest.spyOn(AuthJS.prototype, 'constructor');
    const options = {
      clientId: 'foo',
      issuer: 'https://foo/oauth2/default',
      onSessionExpired: expect.any(Function),
      redirectUri: 'foo',
      pkce: true,
      tokenManager: {
        secure: true,
        storage: 'cookie'
      }
    }

    new AuthService(options);
    expect(AuthJS.prototype.constructor).toHaveBeenCalledWith(options);
  });

});

describe('AuthService', () => {
  let mockAuthJsInstance;
  let validConfig;
  let accessTokenParsed;
  let idTokenParsed;

  beforeEach(() => {
    validConfig = {
      issuer: 'https://foo/oauth2/default',
      clientId: 'foo',
      redirectUri: 'https://foo/redirect',
    };
    accessTokenParsed = {
      accessToken: 'i am a fake access token'
    };
    idTokenParsed = {
      idToken: 'i am a fake id token'
    };
    mockAuthJsInstance = {
      userAgent: 'okta-auth-js',
      emitter: new Emitter(),
      tokenManager: {
          add: jest.fn(),
          get: jest.fn().mockImplementation(tokenName => {
            if (tokenName === 'idToken') {
              return Promise.resolve(idTokenParsed);
            } else if (tokenName === 'accessToken') {
              return Promise.resolve(accessTokenParsed);
            } else {
              throw new Error('Unknown token name: ' + tokenName);
            }
          })
      },
      token: {
        getWithRedirect: jest.fn(),
        parseFromUrl: jest.fn()
      },
      signOut: jest.fn().mockReturnValue(Promise.resolve())
    };
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    });
    jest.spyOn(window.location, 'assign').mockImplementation(() => {});
  });

  function extendConfig(config) {
    return Object.assign({}, validConfig, config);
  }
  
  describe('TokenManager', () => {
    it('Exposes the token manager', () => {
      const authService = new AuthService(validConfig);
      const tokenManager = authService.getTokenManager();
      expect(tokenManager).toBeTruthy();
      expect(tokenManager).toBe(authService._oktaAuth.tokenManager);
    });
  });

  describe('onSessionExpired', () => {
    it('By default, sets a handler for "onSessionExpired" which calls clearAuthState()', () => {
      jest.spyOn(AuthService.prototype, 'clearAuthState').mockReturnValue(undefined);
      const authService = new AuthService(validConfig);
      const config = authService._config;
      expect(config.onSessionExpired).toBeDefined();
      config.onSessionExpired();
      expect(AuthService.prototype.clearAuthState).toHaveBeenCalled();
    });

    it('Should call both clearAuthState and customized onSessionExpired callback', () => {
      jest.spyOn(AuthService.prototype, 'clearAuthState').mockReturnValue(undefined);
      const onSessionExpired = jest.fn();
      const authService = new AuthService(extendConfig({ onSessionExpired }));
      const config = authService._config;
      config.onSessionExpired();
      expect(onSessionExpired).toHaveBeenCalled();
      expect(AuthService.prototype.clearAuthState).toHaveBeenCalled();
    });
  });

  describe('logout', () => {

    test('defaults to passing an empty options to signOut', async () => {
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'foo',
      });
      await authService.logout();
      expect(mockAuthJsInstance.signOut).toHaveBeenCalledWith({});
    });

    test('can pass options to signOut', async () => {
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'foo',
      });
      await authService.logout({ foo: 'bar' });
      expect(mockAuthJsInstance.signOut).toHaveBeenCalledWith({ foo: 'bar'});
    });

    test('if an absolute url string is passed, it will be used as history path', async () => {
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'foo',
      });
      const testPath = 'http://example.com/fake/blah';
      await authService.logout(testPath);
      expect(mockAuthJsInstance.signOut).toHaveBeenCalledWith({ postLogoutRedirectUri: testPath });
    });

    test('if a relative url string is passed, it will be converted to absolute', async () => {
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'foo',
      });
      const testPath = '/fake/blah';
      await authService.logout(testPath);
      expect(mockAuthJsInstance.signOut).toHaveBeenCalledWith({ postLogoutRedirectUri: window.location.origin + testPath });
    });

    test('returns a promise', async () => {
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'foo',
        history: {
          push: jest.fn()
        }
      });
      const res = authService.logout();
      expect(typeof res.then).toBe('function');
      expect(typeof res.catch).toBe('function');
      return res;
    });

    test('can throw', async () => {
      const testError = new Error('test error');
      mockAuthJsInstance.signOut = jest.fn().mockReturnValue(Promise.reject(testError));
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'foo',
      });
      return authService.logout()
        .catch(e => {
          expect(e).toBe(testError);
        })
        .then(() => {
          expect(window.location.assign).not.toHaveBeenCalled();
        });
    })
  });

  test('sets the right user agent on AuthJS', () => {
    const authService = new AuthService({
      issuer: 'https://foo/oauth2/default',
      clientId: 'foo',
      redirectUri: 'foo'
    });
    const expectedUserAgent = `${pkg.name}/${pkg.version} okta-auth-js`;
    expect(authService._oktaAuth.userAgent).toMatch(expectedUserAgent);
  });

  test('can retrieve an accessToken from the tokenManager', async (done) => {
    const authService = new AuthService({
      issuer: 'https://foo/oauth2/default',
      clientId: 'foo',
      redirectUri: 'foo'
    });
    const accessToken = await authService.getAccessToken();
    expect(accessToken).toBe(accessTokenParsed.accessToken);
    done();
  });

  test('builds the authorize request with correct params', () => {
    const authService = new AuthService({
      issuer: 'https://foo/oauth2/default',
      clientId: 'foo',
      redirectUri: 'foo'
    });
    authService.redirect();
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'email', 'profile']
    });
  });

  test('can override the authorize request builder scope with config params', () => {
    const authService = new AuthService({
      issuer: 'https://foo/oauth2/default',
      clientId: 'foo',
      redirectUri: 'foo',
      scope: ['openid', 'foo']
    });
    authService.redirect();
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'foo']
    });
  });

  test('can override the authorize request builder responseType with config params', () => {
    const authService = new AuthService({
      issuer: 'https://foo/oauth2/default',
      clientId: 'foo',
      redirectUri: 'foo',
      response_type: ['id_token']
    });
    authService.redirect();
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token'],
      scopes: ['openid', 'email', 'profile']
    });
  });

  test('can override the authorize request builder with redirect params', () => {
    const authService = new AuthService({
      issuer: 'https://foo/oauth2/default',
      clientId: 'foo',
      redirectUri: 'foo'
    });
    const overrides = {
      scopes: ['openid', 'foo'],
      responseType: ['fake'],
    };
    authService.redirect(overrides);
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith(overrides);
  });

  test('redirect params: can use legacy param format (scope string)', () => {
    const authService = new AuthService({
      issuer: 'https://foo/oauth2/default',
      clientId: 'foo',
      redirectUri: 'foo'
    });
    const overrides = {
      scope: 'openid foo',
      response_type: ['fake']
    };
    authService.redirect(overrides);
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith(Object.assign(overrides, {
      scopes: ['openid', 'foo'],
      responseType: ['fake'],
    }));
  });

  test('redirect params: can use legacy param format (scope array)', () => {
    const authService = new AuthService({
      issuer: 'https://foo/oauth2/default',
      clientId: 'foo',
      redirectUri: 'foo'
    });
    const overrides = {
      scope: ['openid', 'foo'],
      response_type: ['fake']
    };
    authService.redirect(overrides);
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith(Object.assign(overrides, {
      scopes: ['openid', 'foo'],
      responseType: ['fake'],
    }));
  });

  test('can append the authorize request builder with additionalParams through authService.redirect', async () => {
    const authService = new AuthService({
      issuer: 'https://foo/oauth2/default',
      clientId: 'foo',
      redirectUri: 'foo'
    });
    await authService.redirect({foo: 'bar'});
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'email', 'profile'],
      foo: 'bar'
    });
  });

  test('can append the authorize request builder with additionalParams through authService.login', async () => {
    const authService = new AuthService({
      issuer: 'https://foo/oauth2/default',
      clientId: 'foo',
      redirectUri: 'foo'
    });
    await authService.login('/', {foo: 'bar'});
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'email', 'profile'],
      foo: 'bar'
    });
  });

  describe('setFromUri', () => {
    it('Saves the fromUri in localStorage', () => {
      localStorage.setItem('secureRouterReferrerPath', '');
      expect(localStorage.getItem('secureRouterReferrerPath')).toBe('');
      const fromUri = 'http://localhost/foo/random';
      const authService = new AuthService(validConfig);
      authService.setFromUri(fromUri);
      const val = localStorage.getItem('secureRouterReferrerPath');
      expect(val).toBe(fromUri);
    });

    it('Saves the window.location.href by default', () => {
      localStorage.setItem('secureRouterReferrerPath', '');
      expect(localStorage.getItem('secureRouterReferrerPath')).toBe('');
      const authService = new AuthService(validConfig);
      authService.setFromUri();
      const val = localStorage.getItem('secureRouterReferrerPath');
      expect(val).toBe(window.location.href);
    });

  });

  describe('getFromUri', () => {
    test('clears referrer from localStorage', () => {
      const TEST_VALUE = 'foo-bar';
      localStorage.setItem('secureRouterReferrerPath', TEST_VALUE );
      const authService = new AuthService(validConfig);
      const res = authService.getFromUri();
      expect(res).toBe(TEST_VALUE);
      expect(localStorage.getItem('referrerPath')).not.toBeTruthy();
    });
  });

  describe('login()', () => {
    it('By default, it will call redirect()', async () => {
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      const expectedVal = 'fakey';
      jest.spyOn(authService, 'redirect').mockReturnValue(expectedVal);
  
      const retVal = await authService.login('/');
      expect(retVal).toBe(expectedVal);
      expect(authService.redirect).toHaveBeenCalled();
    });
  
    it('will call a custom method "onAuthRequired" instead of redirect()', async () => {
      const expectedVal = 'fakey';
      const onAuthRequired = jest.fn().mockReturnValue(expectedVal);
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
        onAuthRequired,
      });
      jest.spyOn(authService, 'redirect');
  
      const retVal = await authService.login('/');
      expect(retVal).toBe(expectedVal);
      expect(onAuthRequired).toHaveBeenCalledWith(authService);
      expect(authService.redirect).not.toHaveBeenCalled();
    });
  });

  describe('AuthState tracking', () => { 

    it('should call updateAuthState method when expired event happen', () => {
      jest.spyOn(AuthService.prototype, 'updateAuthState');
      const authService = new AuthService(validConfig);
      authService.emit('expired');
      expect(AuthService.prototype.updateAuthState).toHaveBeenCalled();
    });

    it('should trigger registered callback when "authStateChange" event triggered', () => {
      expect.assertions(1);
      const mockState = 'mock state';
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      authService.on('authStateChange', (state) => {
        expect(state).toEqual(mockState);
      });
      authService.emit('authStateChange', mockState);
    });

    it('has an authState of pending initially', async () => { 
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
  
      expect(authService._authState).toEqual({
        isPending: true,
        isAuthenticated: null,
        idToken: null,
        accessToken: null,
      });
    });

    it('emits an "authStateChange" event when updateAuthState() is called', async () => { 
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      authService.on('authStateChange', () => resolve(authService.getAuthState()) );

      authService.updateAuthState();
      return wasCalled.then( authState => {
        expect(authState).toEqual({ 
          isAuthenticated: true,
          idToken: 'i am a fake id token',
          accessToken: 'i am a fake access token',
        });
      });
    });

    it('emits an authState of pending when clearAuthState() is called', async () => { 
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      authService.on('authStateChange', authState => resolve(authState) );

      authService.clearAuthState();
      return wasCalled.then( authState => {
        expect(authState).toEqual({ 
          isPending: true,
          isAuthenticated: null,
          idToken: null,
          accessToken: null,
        });
      });
    });

    it('emits an authState of isAuthenticated when the TokenManager returns an access token', async () => { 
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(authService, 'getIdToken').mockReturnValue(Promise.resolve(null));
      
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      authService.on('authStateChange', authState => resolve(authState) );
      
      authService.updateAuthState();
      return wasCalled.then( authState => { 
        expect(authState).toEqual({ 
          isAuthenticated: true, 
          idToken: null,
          accessToken: 'i am a fake access token',
        });
      });
    });

    it('emits an authState of isAuthenticated when the TokenManager returns an id token', async () => { 
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(authService, 'getAccessToken').mockReturnValue(Promise.resolve(null));
      
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      authService.on('authStateChange', authState => resolve(authState) );
      
      authService.updateAuthState();
      return wasCalled.then( authState => { 
        expect(authState).toEqual({ 
          isAuthenticated: true, 
          idToken: 'i am a fake id token',
          accessToken: null,
        });
      });
    });

    it('emits an authState where isAuthenticated is false when the the TokenManager does not return an access token or an id token', async () => { 
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(authService, 'getAccessToken').mockReturnValue(Promise.resolve(null));
      jest.spyOn(authService, 'getIdToken').mockReturnValue(Promise.resolve(null));
      
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      authService.on('authStateChange', authState => resolve(authState) );
      
      authService.updateAuthState();
      return wasCalled.then( authState => { 
        expect(authState).toEqual({ 
          isAuthenticated: false, 
          idToken: null,
          accessToken: null,
        });
      });
    });

    it('emits an authenticated authState if the override isAuthenticated() callback returns true', async () => { 
      const isAuthenticated = jest.fn().mockReturnValue(Promise.resolve(true));

      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
        isAuthenticated,
      });
      jest.spyOn(authService, 'getAccessToken').mockReturnValue(Promise.resolve(null));
      jest.spyOn(authService, 'getIdToken').mockReturnValue(Promise.resolve(null));
      
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      authService.on('authStateChange', authState => resolve(authState) );
      
      authService.updateAuthState();
      return wasCalled.then( authState => { 
        expect(isAuthenticated).toHaveBeenCalled();
        expect(authState).toEqual({ 
          isAuthenticated: true, 
          idToken: null,
          accessToken: null,
        });
      });
    });

    it('emits an authState that is not authenticated if override isAuthenticated() callback returns false', async () => { 
      const isAuthenticated = jest.fn().mockReturnValue( Promise.resolve(false));

      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
        isAuthenticated,
      });
      jest.spyOn(authService, 'getAccessToken').mockReturnValue(Promise.resolve(null));
      jest.spyOn(authService, 'getIdToken').mockReturnValue(Promise.resolve(null));
      
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      authService.on('authStateChange', authState => resolve(authState) );
      
      authService.updateAuthState();
      return wasCalled.then( authState => { 
        expect(isAuthenticated).toHaveBeenCalled();
        expect(authState).toEqual({ 
          isAuthenticated: false,
          idToken: null,
          accessToken: null,
        });
      });
    });

    it('emits an authState that is not authenticated if override isAuthenticated() callback rejects', async () => { 
      const isAuthenticated = jest.fn().mockReturnValue( Promise.reject('!!!!11eleventy-one!'));

      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
        isAuthenticated,
      });
      jest.spyOn(authService, 'getAccessToken').mockReturnValue(Promise.resolve(null));
      jest.spyOn(authService, 'getIdToken').mockReturnValue(Promise.resolve(null));
      
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      authService.on('authStateChange', authState => resolve(authState) );
      
      authService.updateAuthState();
      return wasCalled.then( authState => { 
        expect(isAuthenticated).toHaveBeenCalled();
        expect(authState).toEqual({ 
          isAuthenticated: false, 
          idToken: null,
          accessToken: null,
          error: '!!!!11eleventy-one!',
        });
      });
    });

    it('concurrent calls to "updateAuthState" will share the same execution', () => {
      const authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      let resolvePromise;
      jest.spyOn(authService, 'getAccessToken').mockImplementation(() => {
        return new Promise(resolve => {
          resolvePromise = resolve;
        });
      });
      jest.spyOn(authService, 'emitAuthState');
      jest.spyOn(authService, 'getIdToken');
      const p1 = authService.updateAuthState();
      const p2 = authService.updateAuthState();

      expect(authService.getIdToken).not.toHaveBeenCalled();
      resolvePromise('fake access token');
      return p1
        .then(() => {
          const authState = authService.getAuthState();
          expect(authState.accessToken).toBe('fake access token');
          return p2;
        })
        .then(() => {
          const authState = authService.getAuthState();
          expect(authState.accessToken).toBe('fake access token');
          expect(authService.emitAuthState).toHaveBeenCalledTimes(1);
          expect(authService.emitAuthState).toHaveBeenCalledWith(authState);
          expect(authService.getAccessToken).toHaveBeenCalledTimes(1);
          expect(authService.getIdToken).toHaveBeenCalledTimes(1);
        });
    });
  });

  describe('handleAuthentication', () => {
    let authService;
    beforeEach(() => {
      authService = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
    })
    it('puts tokens in the TokenManager', () => {
      const accessToken = {
        accessToken: 'fake access'
      };
      const idToken = {
        idToken: 'fake id'
      };
      jest.spyOn(authService._oktaAuth.token, 'parseFromUrl').mockReturnValue({ tokens: { accessToken, idToken }});
      jest.spyOn(authService._oktaAuth.tokenManager, 'add');
      return authService.handleAuthentication()
        .then(() => {
          expect(authService._oktaAuth.tokenManager.add).toHaveBeenCalledTimes(2);
          expect(authService._oktaAuth.tokenManager.add.mock.calls[0]).toEqual(['idToken', idToken]);
          expect(authService._oktaAuth.tokenManager.add.mock.calls[1]).toEqual(['accessToken', accessToken]);
        });
    });

    it('redirects if isAuthenticated', () => {
      const mockLocation = 'http://localhost/fake-redirect';
      const mockAuthState = {
        isAuthenticated: true
      };
      jest.spyOn(window.location, 'assign');
      jest.spyOn(authService, 'getFromUri').mockReturnValue(mockLocation);
      jest.spyOn(authService, 'updateAuthState').mockImplementation( () => { 
        jest.spyOn(authService, 'getAuthState').mockReturnValue(mockAuthState);
      });
      jest.spyOn(authService._oktaAuth.token, 'parseFromUrl').mockReturnValue(Promise.resolve({ tokens: {} }));
      return authService.handleAuthentication()
        .then(() => {
          expect(window.location.assign).toHaveBeenCalledWith(mockLocation);
        });
    });

    it('emits authState with an error if parseFromUrl throws', async () => {
      const error = new Error('a test error');
      jest.spyOn(authService, 'emitAuthState');
      jest.spyOn(authService._oktaAuth.token, 'parseFromUrl').mockReturnValue(Promise.reject(error));
      return authService.handleAuthentication()
        .then(() => {
          expect(authService.emitAuthState).toHaveBeenCalledWith({
            isAuthenticated: false,
            error,
            idToken: null,
            accessToken: null,
          });
        });
    });

    it('concurrency: only the first call to "handleAuthentication" will perform the logic and receive an update', async () => {
      let resolveParsePromise;
      jest.spyOn(authService._oktaAuth.token, 'parseFromUrl').mockImplementation(() => new Promise(resolve => {
        resolveParsePromise = resolve;
      }));
      jest.spyOn(authService, 'updateAuthState').mockReturnValue(Promise.resolve());
      const p1 = authService.handleAuthentication();
      const p2 = authService.handleAuthentication();
      expect(authService.updateAuthState).not.toHaveBeenCalled();
      resolveParsePromise({ tokens: {} });
      return p1
        .then(() => p2) // make sure both are finished
        .then(() => {
          expect(authService._oktaAuth.token.parseFromUrl).toHaveBeenCalledTimes(1);
          expect(authService.updateAuthState).toHaveBeenCalledTimes(1);
        });
    });
  });
});
