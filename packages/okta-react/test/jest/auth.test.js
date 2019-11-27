import Auth from '../../src/Auth';
import AuthJS from '@okta/okta-auth-js'
const pkg = require('../../package.json');

jest.mock('@okta/okta-auth-js');

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
                        'EQ9-Ua9rPOMaO0pFC6h2lfB_HfzGifXATKsN-wLdxk6cgA';

const standardAccessTokenParsed = {
  accessToken: mockAccessToken,
  expiresAt: new Date().getTime() + 100, // ensure token is active
  scopes: ['openid', 'email'],
  tokenType: 'Bearer',
  authorizeUrl: 'https://foo/oauth2/v1/authorize',
  userinfoUrl: 'https://foo/oauth2/v1/userinfo'
};

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
  beforeEach(() => {
    mockAuthJsInstance = {
      userAgent: 'okta-auth-js',
      tokenManager: {
        get: jest.fn().mockReturnValue(Promise.resolve(standardAccessTokenParsed))
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
    expect(accessToken).toBe(mockAccessToken);
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

  test('can append the authorize request builder with additionalParams through auth.redirect', () => {
    const auth = new Auth({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    auth.redirect({foo: 'bar'});
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'email', 'profile'],
      foo: 'bar'
    });
  });
  test('can append the authorize request builder with additionalParams through auth.login', () => {
    const auth = new Auth({
      issuer: 'https://foo/oauth2/default',
      client_id: 'foo',
      redirect_uri: 'foo'
    });
    auth.login('/', {foo: 'bar'});
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
});
