import Auth from '../../src/Auth';
import AuthJS from '@okta/okta-auth-js'

const pkg = require('../../package.json');

jest.mock('@okta/okta-auth-js');

describe('Auth configuration', () => {
  it('should throw if no issuer is provided', () => {
    function createInstance () {
      return new Auth();
    }
    expect(createInstance).toThrow()
  });
  it('should throw if an issuer that does not contain https is provided', () => {
    function createInstance () {
      return new Auth({
        issuer: 'http://foo.com'
      });
    }
    expect(createInstance).toThrow()
  });
  it('should throw if an issuer matching {yourOktaDomain} is provided', () => {
    function createInstance () {
      return new Auth({
        issuer: 'https://{yourOktaDomain}'
      });
    }
    expect(createInstance).toThrow()
  });
  it('should throw if an issuer matching -admin.okta.com is provided', () => {
    function createInstance () {
      return new Auth({
        issuer: 'https://foo-admin.okta.com'
      });
    }
    expect(createInstance).toThrow()
  });
  it('should throw if an issuer matching -admin.oktapreview.com is provided', () => {
    function createInstance () {
      return new Auth({
        issuer: 'https://foo-admin.oktapreview.com'
      });
    }
    expect(createInstance).toThrow()
  });
  it('should throw if an issuer matching -admin.okta-emea.com is provided', () => {
    function createInstance () {
      return new Auth({
        issuer: 'https://foo-admin.okta-emea.com'
      });
    }
    expect(createInstance).toThrow()
  });
  it('should throw if an issuer matching more than one ".com" is provided', () => {
    function createInstance () {
      return new Auth({
        issuer: 'https://foo.okta.com.com'
      });
    }
    expect(createInstance).toThrow()
  });
  it('should throw if an issuer matching more than one sequential "://" is provided', () => {
    function createInstance () {
      return new Auth({
        issuer: 'https://://foo.okta.com'
      });
    }
    expect(createInstance).toThrow()
  });
  it('should throw if an issuer matching more than one "://" is provided', () => {
    function createInstance () {
      return new Auth({
        issuer: 'https://foo.okta://.com'
      });
    }
    expect(createInstance).toThrow()
  });
  it('should throw if the client_id is not provided', () => {
    function createInstance () {
      return new Auth({
        issuer: 'https://foo/oauth2/default'
      });
    }
    expect(createInstance).toThrow()
  });
  it('should throw if a client_id matching {clientId} is provided', () => {
    function createInstance () {
      return new Auth({
        issuer: 'https://foo/oauth2/default',
        client_id: '{clientId}',
      });
    }
    expect(createInstance).toThrow()
  });
  it('should throw if the redirect_uri is not provided', () => {
    function createInstance () {
      return new Auth({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo'
      });
    }
    expect(createInstance).toThrow();
  });

  it('should throw if a redirect_uri matching {redirectUri} is provided', () => {
    function createInstance () {
      return new Auth({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: '{redirectUri}'
      });
    }
    expect(createInstance).toThrow();
  });

  it('accepts options in camel case', () => {
    function createInstance () {
      return new Auth({
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

    new Auth(options);
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

    new Auth(options);
    expect(AuthJS.prototype.constructor).toHaveBeenCalledWith(options);
  });

});

describe('Auth component', () => {
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
  });

  function extendConfig(config) {
    return Object.assign({}, validConfig, config);
  }
  
  describe('TokenManager', () => {
    it('Exposes the token manager', () => {
      const service = new Auth(validConfig);
      const val = service.getTokenManager();
      expect(val).toBeTruthy();
      expect(val).toBe(service._oktaAuth.tokenManager);
    });
  });

  describe('onSessionExpired', () => {
    it('By default, sets a handler for "onSessionExpired" which calls login()', () => {
      jest.spyOn(Auth.prototype, 'login').mockReturnValue(undefined);
      const service = new Auth(validConfig);
      const config = service._config;
      expect(config.onSessionExpired).toBeDefined();
      config.onSessionExpired();
      expect(Auth.prototype.login).toHaveBeenCalled();
    });

    it('Accepts custom function "onSessionExpired" via config which disables default handler', () => {
      jest.spyOn(Auth.prototype, 'login').mockReturnValue(undefined);
      const onSessionExpired = jest.fn();
      const service = new Auth(extendConfig({ onSessionExpired }));
      const config = service._config;
      expect(config.onSessionExpired).toBe(onSessionExpired);
      config.onSessionExpired();
      expect(onSessionExpired).toHaveBeenCalled();
      expect(Auth.prototype.login).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    test('by default, it will set history location to "/"', async () => {
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
        history: {
          push: jest.fn()
        }
      });
      await auth.logout();
      expect(auth._history.push).toHaveBeenCalledWith('/');
    });
    test('can pass unknown options without affecting default', async () => {
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
        history: {
          push: jest.fn()
        }
      });
      await auth.logout({ foo: 'bar' });
      expect(auth._history.push).toHaveBeenCalledWith('/');
    });
    test('if a string is passed, it will be used as history path', async () => {
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
        history: {
          push: jest.fn()
        }
      });
      const testPath = '/fake/blah';
      await auth.logout(testPath);
      expect(auth._history.push).toHaveBeenCalledWith(testPath);
    });
    test('Will not update history if "postLogoutRedirectUri" is in options passed to logout()', async () => {
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
        history: {
          push: jest.fn()
        }
      });
      const postLogoutRedirectUri = 'http://fake/after';
      await auth.logout({ postLogoutRedirectUri });
      expect(auth._history.push).not.toHaveBeenCalled();
      expect(mockAuthJsInstance.signOut).toHaveBeenCalledWith({ postLogoutRedirectUri });
    });
    test('Will not update history if "postLogoutRedirectUri" is in options passed to constructor', async () => {
      const postLogoutRedirectUri = 'http://fake/after';
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
        history: {
          push: jest.fn()
        },
        postLogoutRedirectUri
      });

      await auth.logout();
      expect(auth._history.push).not.toHaveBeenCalled();
      expect(mockAuthJsInstance.signOut).toHaveBeenCalledWith({});
    });
    test('returns a promise', async () => {
      const auth = new Auth({
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
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        client_id: 'foo',
        redirect_uri: 'foo',
        history: {
          push: jest.fn()
        }
      });
      return auth.logout()
        .catch(e => {
          expect(e).toBe(testError);
        })
        .then(() => {
          expect(auth._history.push).not.toHaveBeenCalled();
        });
    })
  });
  test('sets the right user agent on AuthJS', () => {
    const auth = new Auth({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    const expectedUserAgent = `${pkg.name}/${pkg.version} okta-auth-js`;
    expect(auth._oktaAuth.userAgent).toMatch(expectedUserAgent);
  });
  test('can retrieve an accessToken from the tokenManager', async (done) => {
    const auth = new Auth({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    const accessToken = await auth.getAccessToken();
    expect(accessToken).toBe(accessTokenParsed.accessToken);
    done();
  });
  test('builds the authorize request with correct params', () => {
    const auth = new Auth({
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
    const auth = new Auth({
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
    const auth = new Auth({
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
    const auth = new Auth({
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
    const auth = new Auth({
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
    const auth = new Auth({
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
    const auth = new Auth({
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
    const auth = new Auth({
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
  test('isAuthenticated() returns true when the TokenManager returns an access token', async () => {
    const auth = new Auth({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    const authenticated = await auth.isAuthenticated();
    expect(mockAuthJsInstance.tokenManager.get).toHaveBeenCalledWith('accessToken');
    expect(authenticated).toBeTruthy();
  });
  test('isAuthenticated() returns false when the TokenManager does not return an access token', async () => {
    mockAuthJsInstance.tokenManager.get = jest.fn().mockImplementation(() => {
      throw new Error();
    });
    const auth = new Auth({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    const authenticated = await auth.isAuthenticated();
    expect(authenticated).toBeFalsy();
  });

  describe('setFromUri', () => {
    it('Saves the fromUri as "pathname" in localStorage', () => {
      localStorage.setItem('secureRouterReferrerPath', '');
      expect(localStorage.getItem('secureRouterReferrerPath')).toBe('');
      const fromUri = '/foo/random';
      const auth = new Auth(validConfig);
      auth.setFromUri(fromUri);
      const val = JSON.parse(localStorage.getItem('secureRouterReferrerPath'));
      expect(val.pathname).toBe(fromUri);
    });

    it('Saves the history.location by default', () => {
      localStorage.setItem('secureRouterReferrerPath', '');
      expect(localStorage.getItem('secureRouterReferrerPath')).toBe('');
      const auth = new Auth(validConfig);
      auth._history = { location: 'test-value' };
      auth.setFromUri();
      const val = JSON.parse(localStorage.getItem('secureRouterReferrerPath'));
      expect(val).toBe(auth._history.location);
    });

  });

  describe('getFromUri', () => {
    test('cleares referrer from localStorage', () => {
      const TEST_VALUE = 'foo-bar';
      localStorage.setItem('secureRouterReferrerPath', JSON.stringify({ pathname: TEST_VALUE }));
      const auth = new Auth(validConfig);
      const res = auth.getFromUri();
      expect(res.pathname).toBe(TEST_VALUE);
      expect(localStorage.getItem('referrerPath')).not.toBeTruthy();
    });
  });

  describe('login()', () => {
    it('By default, it will call redirect()', async () => {
      const auth = new Auth({
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
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
        onAuthRequired,
      });
      auth._history = 'foo';
      jest.spyOn(auth, 'redirect');
  
      const retVal = await auth.login('/');
      expect(retVal).toBe(expectedVal);
      expect(onAuthRequired).toHaveBeenCalledWith({ auth, history: auth._history });
      expect(auth.redirect).not.toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('Will be true if both idToken and accessToken are present', async () => {
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(auth, 'getAccessToken').mockReturnValue(Promise.resolve(accessTokenParsed));
      jest.spyOn(auth, 'getIdToken').mockReturnValue(Promise.resolve(idTokenParsed));

      const ret = await auth.isAuthenticated();
      expect(ret).toBe(true);
    });
  
    it('Will be true if accessToken is present', async () => {
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(auth, 'getAccessToken').mockReturnValue(Promise.resolve(accessTokenParsed));
      jest.spyOn(auth, 'getIdToken').mockReturnValue(Promise.resolve(null));

      const ret = await auth.isAuthenticated();
      expect(ret).toBe(true);
      expect(auth.getAccessToken).toHaveBeenCalled();
    });

    it('Will be true if idToken is present', async () => {
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(auth, 'getAccessToken').mockReturnValue(Promise.resolve(null));
      jest.spyOn(auth, 'getIdToken').mockReturnValue(Promise.resolve(idTokenParsed));

      const ret = await auth.isAuthenticated();
      expect(ret).toBe(true);

      expect(auth.getIdToken).toHaveBeenCalled();
    });
    
    it('Will be false if neither idToken nor accessToken are present', async () => {
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(auth, 'getAccessToken').mockReturnValue(Promise.resolve(null));
      jest.spyOn(auth, 'getIdToken').mockReturnValue(Promise.resolve(null));

      const ret = await auth.isAuthenticated();
      expect(ret).toBe(false);
    });

    it('Will return null if there is idToken in the URL', async () => {
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(auth, 'getAccessToken');
      jest.spyOn(auth, 'getIdToken');

      location.hash = 'id_token=foo';
      const ret = await auth.isAuthenticated();
      expect(ret).toBe(null);

      expect(auth.getAccessToken).not.toHaveBeenCalled();
      expect(auth.getIdToken).not.toHaveBeenCalled();
    });

    it('Will return null if there is accesstoken in the URL', async () => {
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(auth, 'getAccessToken');
      jest.spyOn(auth, 'getIdToken');

      location.hash = 'access_token=foo';
      const ret = await auth.isAuthenticated();
      expect(ret).toBe(null);

      expect(auth.getAccessToken).not.toHaveBeenCalled();
      expect(auth.getIdToken).not.toHaveBeenCalled();
    });

    it('Will return null if there is code in the URL', async () => {
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
      });
      jest.spyOn(auth, 'getAccessToken');
      jest.spyOn(auth, 'getIdToken');

      location.hash = 'code=foo';
      const ret = await auth.isAuthenticated();
      expect(ret).toBe(null);

      expect(auth.getAccessToken).not.toHaveBeenCalled();
      expect(auth.getIdToken).not.toHaveBeenCalled();
    });

    it('Will call a custom function if "config.isAuthenticated" was set', async () => {
      const isAuthenticated = jest.fn().mockReturnValue(Promise.resolve('foo'));
      const auth = new Auth({
        issuer: 'https://foo/oauth2/default',
        clientId: 'foo',
        redirectUri: 'https://foo/redirect',
        isAuthenticated,
      });
      jest.spyOn(auth, 'getAccessToken');
      jest.spyOn(auth, 'getIdToken');
      const ret = await auth.isAuthenticated();
      expect(ret).toBe('foo');
      expect(isAuthenticated).toHaveBeenCalled();
      expect(auth.getAccessToken).not.toHaveBeenCalled();
      expect(auth.getIdToken).not.toHaveBeenCalled();
    });
  });

});
