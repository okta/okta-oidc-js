import AuthService from '../../src/AuthService';
import AuthJS from '@okta/okta-auth-js'

const pkg = require('../../package.json');

jest.mock('@okta/okta-auth-js');

describe('AuthService configuration', () => {

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

  it('should throw if an issuer matching more than one ".com" is provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo.okta.com.com'
      });
    }
    expect(createInstance).toThrow()
  });

  it('should throw if an issuer matching more than one sequential "://" is provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://://foo.okta.com'
      });
    }
    expect(createInstance).toThrow()
  });

  it('should throw if an issuer matching more than one "://" is provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo.okta://.com'
      });
    }
    expect(createInstance).toThrow()
  });

  it('should throw if the client_id is not provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo/oauth2/default'
      });
    }
    expect(createInstance).toThrow()
  });

  it('should throw if a client_id matching {clientId} is provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo/oauth2/default',
        client_id: '{clientId}',
      });
    }
    expect(createInstance).toThrow()
  });

  it('should throw if the redirect_uri is not provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo'
      });
    }
    expect(createInstance).toThrow();
  });

  it('should throw if a redirect_uri matching {redirectUri} is provided', () => {
    function createInstance () {
      return new AuthService({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: '{redirectUri}'
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
      tokenManager: {
          get: jest.fn().mockImplementation(tokenName => {
            if (tokenName === 'idToken') {
              return Promise.resolve(idTokenParsed);
            } else if (tokenName === 'accessToken') {
              return Promise.resolve(accessTokenParsed);
            } else {
              throw new Error('Unknown token name: ' + tokenName);
            }
          }),
      },
      token: {
        getWithRedirect: jest.fn()
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
      const service = new AuthService(validConfig);
      const val = service.getTokenManager();
      expect(val).toBeTruthy();
      expect(val).toBe(service._oktaAuth.tokenManager);
    });
  });

  describe('onSessionExpired', () => {
    it('By default, sets a handler for "onSessionExpired" which calls login()', () => {
      jest.spyOn(AuthService.prototype, 'login').mockReturnValue(undefined);
      const service = new AuthService(validConfig);
      const config = service._config;
      expect(config.onSessionExpired).toBeDefined();
      config.onSessionExpired();
      expect(AuthService.prototype.login).toHaveBeenCalled();
    });

    it('Accepts custom function "onSessionExpired" via config which disables default handler', () => {
      jest.spyOn(AuthService.prototype, 'login').mockReturnValue(undefined);
      const onSessionExpired = jest.fn();
      const service = new AuthService(extendConfig({ onSessionExpired }));
      const config = service._config;
      expect(config.onSessionExpired).toBe(onSessionExpired);
      config.onSessionExpired();
      expect(onSessionExpired).toHaveBeenCalled();
      expect(AuthService.prototype.login).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {

    test('by default, it will set history location to "/"', async () => {
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
      });
      await auth.logout();
      expect(window.location.assign).toHaveBeenCalledWith(window.location.origin + '/');
    });

    test('can pass unknown options without affecting default', async () => {
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
      });
      await auth.logout({ foo: 'bar' });
      expect(window.location.assign).toHaveBeenCalledWith(window.location.origin + '/');
    });

    test('if a string is passed, it will be used as history path', async () => {
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
      });
      const testPath = '/fake/blah';
      await auth.logout(testPath);
      expect(window.location.assign).toHaveBeenCalledWith(window.location.origin + testPath);
    });

    test('Will not update history if "postLogoutRedirectUri" is in options passed to logout()', async () => {
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
      });
      const postLogoutRedirectUri = 'http://fake/after';
      await auth.logout({ postLogoutRedirectUri });
      expect(window.location.assign).not.toHaveBeenCalled();
      expect(mockAuthJsInstance.signOut).toHaveBeenCalledWith({ postLogoutRedirectUri });
    });

    test('Will not update history if "postLogoutRedirectUri" is in options passed to constructor', async () => {
      const postLogoutRedirectUri = 'http://fake/after';
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
        postLogoutRedirectUri
      });
      jest.spyOn(window.location, 'assign');
      await auth.logout();
      expect(window.location.assign).not.toHaveBeenCalled();
      expect(mockAuthJsInstance.signOut).toHaveBeenCalledWith({});
    });

    test('returns a promise', async () => {
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
        history: {
          push: jest.fn()
        }
      });
      const res = auth.logout();
      expect(typeof res.then).toBe('function');
      expect(typeof res.catch).toBe('function');
      return res;
    });

    test('can throw', async () => {
      const testError = new Error('test error');
      mockAuthJsInstance.signOut = jest.fn().mockReturnValue(Promise.reject(testError));
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
      });
      return auth.logout()
        .catch(e => {
          expect(e).toBe(testError);
        })
        .then(() => {
          expect(window.location.assign).not.toHaveBeenCalled();
        });
    })
  });

  test('sets the right user agent on AuthJS', () => {
    const auth = new AuthService({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    const expectedUserAgent = `${pkg.name}/${pkg.version} okta-auth-js`;
    expect(auth._oktaAuth.userAgent).toMatch(expectedUserAgent);
  });

  test('can retrieve an accessToken from the tokenManager', async (done) => {
    const auth = new AuthService({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    const accessToken = await auth.getAccessToken();
    expect(accessToken).toBe(accessTokenParsed.accessToken);
    done();
  });

  test('builds the authorize request with correct params', () => {
    const auth = new AuthService({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    auth.redirect();
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'email', 'profile']
    });
  });

  test('can override the authorize request builder scope with config params', () => {
    const auth = new AuthService({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo',
      scope: ['openid', 'foo']
    });
    auth.redirect();
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'foo']
    });
  });

  test('can override the authorize request builder responseType with config params', () => {
    const auth = new AuthService({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo',
      response_type: ['id_token']
    });
    auth.redirect();
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token'],
      scopes: ['openid', 'email', 'profile']
    });
  });

  test('can override the authorize request builder with redirect params', () => {
    const auth = new AuthService({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    const overrides = {
      scopes: ['openid', 'foo'],
      responseType: ['fake'],
    };
    auth.redirect(overrides);
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith(overrides);
  });

  test('redirect params: can use legacy param format (scope string)', () => {
    const auth = new AuthService({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    const overrides = {
      scope: 'openid foo',
      response_type: ['fake']
    };
    auth.redirect(overrides);
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith(Object.assign(overrides, {
      scopes: ['openid', 'foo'],
      responseType: ['fake'],
    }));
  });

  test('redirect params: can use legacy param format (scope array)', () => {
    const auth = new AuthService({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    const overrides = {
      scope: ['openid', 'foo'],
      response_type: ['fake']
    };
    auth.redirect(overrides);
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith(Object.assign(overrides, {
      scopes: ['openid', 'foo'],
      responseType: ['fake'],
    }));
  });

  test('can append the authorize request builder with additionalParams through auth.redirect', async () => {
    const auth = new AuthService({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    await auth.redirect({foo: 'bar'});
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'email', 'profile'],
      foo: 'bar'
    });
  });

  test('can append the authorize request builder with additionalParams through auth.login', async () => {
    const auth = new AuthService({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    await auth.login('/', {foo: 'bar'});
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
      const auth = new AuthService(validConfig);
      auth.setFromUri(fromUri);
      const val = localStorage.getItem('secureRouterReferrerPath');
      expect(val).toBe(fromUri);
    });

    it('Saves the window.location.href by default', () => {
      localStorage.setItem('secureRouterReferrerPath', '');
      expect(localStorage.getItem('secureRouterReferrerPath')).toBe('');
      const auth = new AuthService(validConfig);
      auth.setFromUri();
      const val = localStorage.getItem('secureRouterReferrerPath');
      expect(val).toBe(window.location.href);
    });

  });

  describe('getFromUri', () => {
    test('clears referrer from localStorage', () => {
      const TEST_VALUE = 'foo-bar';
      localStorage.setItem('secureRouterReferrerPath', TEST_VALUE );
      const auth = new AuthService(validConfig);
      const res = auth.getFromUri();
      expect(res).toBe(TEST_VALUE);
      expect(localStorage.getItem('referrerPath')).not.toBeTruthy();
    });
  });

  describe('login()', () => {
    it('By default, it will call redirect()', async () => {
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      const expectedVal = 'fakey';
      jest.spyOn(auth, 'redirect').mockReturnValue(expectedVal);
  
      const retVal = await auth.login('/');
      expect(retVal).toBe(expectedVal);
      expect(auth.redirect).toHaveBeenCalled();
    });
  
    it('will call a custom method "onAuthRequired" instead of redirect()', async () => {
      const expectedVal = 'fakey';
      const onAuthRequired = jest.fn().mockReturnValue(expectedVal);
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
        onAuthRequired,
      });
      jest.spyOn(auth, 'redirect');
  
      const retVal = await auth.login('/');
      expect(retVal).toBe(expectedVal);
      expect(onAuthRequired).toHaveBeenCalledWith(auth);
      expect(auth.redirect).not.toHaveBeenCalled();
    });
  });

  describe('AuthState tracking', () => { 

    test('initial authState ', async () => { 
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
  
      expect(auth._authState).toEqual({
        isAuthenticated: null,
        idToken: null,
        accessToken: null,
      });
    });

    it('allows subscribing to an "authStateChange" event', async () => { 
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      const callback = jest.fn();

      expect(Object.values(auth._listeners.authStateChange).length).toBe(0);
      auth.on('authStateChange', callback);
      expect(Object.values(auth._listeners.authStateChange).length).toBe(1);
      auth.emit('authStateChange', "test");
      expect(callback).toHaveBeenCalledWith("test");
    });

    it('emits an "authStateChange" event when updateAuthState() is called', async () => { 
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      auth.on('authStateChange', authState => resolve(authState) );

      auth.updateAuthState();
      return wasCalled.then( authState => {
        expect(authState).toEqual({ 
          isAuthenticated: true,
          idToken: 'i am a fake id token',
          accessToken: 'i am a fake access token',
        });
      });
    });

    it('emits an authState of pending when clearAuthState() is called', async () => { 
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      auth.on('authStateChange', authState => resolve(authState) );

      auth.clearAuthState();
      return wasCalled.then( authState => {
        expect(authState).toEqual({ 
          isAuthenticated: null,
          idToken: null,
          accessToken: null,
        });
      });
    });

    it('emits an authState of isAuthenticated when the TokenManager returns an access token', async () => { 
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(auth, 'getIdToken').mockReturnValue(Promise.resolve(null));
      
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      auth.on('authStateChange', authState => resolve(authState) );
      
      auth.updateAuthState();
      return wasCalled.then( authState => { 
        expect(authState).toEqual({ 
          isAuthenticated: true, 
          idToken: null,
          accessToken: 'i am a fake access token',
        });
      });
    });

    it('emits an authState of isAuthenticated when the TokenManager returns an id token', async () => { 
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(auth, 'getAccessToken').mockReturnValue(Promise.resolve(null));
      
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      auth.on('authStateChange', authState => resolve(authState) );
      
      auth.updateAuthState();
      return wasCalled.then( authState => { 
        expect(authState).toEqual({ 
          isAuthenticated: true, 
          idToken: 'i am a fake id token',
          accessToken: null,
        });
      });
    });

    it('emits an authState where isAuthenticated is false when the the TokenManager does not return an access token or an id token', async () => { 
      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(auth, 'getAccessToken').mockReturnValue(Promise.resolve(null));
      jest.spyOn(auth, 'getIdToken').mockReturnValue(Promise.resolve(null));
      
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      auth.on('authStateChange', authState => resolve(authState) );
      
      auth.updateAuthState();
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

      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
        isAuthenticated,
      });
      jest.spyOn(auth, 'getAccessToken').mockReturnValue(Promise.resolve(null));
      jest.spyOn(auth, 'getIdToken').mockReturnValue(Promise.resolve(null));
      
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      auth.on('authStateChange', authState => resolve(authState) );
      
      auth.updateAuthState();
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
      const isAuthenticated = jest.fn().mockReturnValue( Promise.resolve(false));;

      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
        isAuthenticated,
      });
      jest.spyOn(auth, 'getAccessToken').mockReturnValue(Promise.resolve(null));
      jest.spyOn(auth, 'getIdToken').mockReturnValue(Promise.resolve(null));
      
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      auth.on('authStateChange', authState => resolve(authState) );
      
      auth.updateAuthState();
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
      const isAuthenticated = jest.fn().mockReturnValue( Promise.reject('!!!!11eleventy-one!'));;

      const auth = new AuthService({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
        isAuthenticated,
      });
      jest.spyOn(auth, 'getAccessToken').mockReturnValue(Promise.resolve(null));
      jest.spyOn(auth, 'getIdToken').mockReturnValue(Promise.resolve(null));
      
      let resolve;
      const wasCalled = new Promise( (res) => resolve = res );
      auth.on('authStateChange', authState => resolve(authState) );
      
      auth.updateAuthState();
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

  });
});
