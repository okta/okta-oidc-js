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

const mockAuthJsInstance = {
  userAgent: 'okta-auth-js',
  tokenManager: {
    get: jest.fn().mockReturnValue(Promise.resolve(standardAccessTokenParsed))
  },
  token: {
    getWithRedirect: jest.fn()
  }
};

const mockAuthJsInstanceWithError = {
  userAgent: 'okta-auth-js',
  tokenManager: {
    get: jest.fn().mockImplementation(() => {
      throw new Error();
    })
  },
  token: {
    getWithRedirect: jest.fn()
  }
};

describe('Auth component', () => {
  beforeEach(() => {
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstance
    });
  });
  test('sets the right user agent on AuthJS', () => {
    const auth = new Auth({
      client_id: 'foo',
      issuer: 'https://foo.okta.com/oauth2/default',
      redirect_uri: 'https://foo.okta.com/authorization-code/callback'
    });
    const expectedUserAgent = `${pkg.name}/${pkg.version} okta-auth-js`;
    expect(auth._oktaAuth.userAgent).toMatch(expectedUserAgent);
  });
  test('can retrieve an accessToken from the tokenManager', async (done) => {
    const auth = new Auth({
      client_id: 'foo',
      issuer: 'https://foo.okta.com/oauth2/default',
      redirect_uri: 'https://foo.okta.com/authorization-code/callback'
    });
    const accessToken = await auth.getAccessToken();
    expect(accessToken).toBe(mockAccessToken);
    done();
  });
  test('builds the authorize request with correct params', () => {
    const auth = new Auth({
      client_id: 'foo',
      issuer: 'https://foo.okta.com/oauth2/default',
      redirect_uri: 'https://foo.okta.com/authorization-code/callback'
    });
    auth.redirect();
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'email', 'profile']
    });
  });
  test('can override the authorize request builder scope with config params', () => {
    const auth = new Auth({
      client_id: 'foo',
      issuer: 'https://foo.okta.com/oauth2/default',
      redirect_uri: 'https://foo.okta.com/authorization-code/callback',
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
      client_id: 'foo',
      issuer: 'https://foo.okta.com/oauth2/default',
      redirect_uri: 'https://foo.okta.com/authorization-code/callback',
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
      client_id: 'foo',
      issuer: 'https://foo.okta.com/oauth2/default',
      redirect_uri: 'https://foo.okta.com/authorization-code/callback'
    });
    auth.redirect({scope: ['openid', 'foo']});
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'foo']
    });
  });
  test('can append the authorize request builder with additionalParams through auth.redirect', () => {
    const auth = new Auth({
      client_id: 'foo',
      issuer: 'https://foo.okta.com/oauth2/default',
      redirect_uri: 'https://foo.okta.com/authorization-code/callback'
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
      client_id: 'foo',
      issuer: 'https://foo.okta.com/oauth2/default',
      redirect_uri: 'https://foo.okta.com/authorization-code/callback'
    });
    auth.login({foo: 'bar'});
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'email', 'profile'],
      foo: 'bar'
    });
  });
  test('isAuthenticated() returns true when the TokenManager returns an access token', async () => {
    const auth = new Auth({
      client_id: 'foo',
      issuer: 'https://foo.okta.com/oauth2/default',
      redirect_uri: 'https://foo.okta.com/authorization-code/callback'
    });
    const authenticated = await auth.isAuthenticated();
    expect(mockAuthJsInstance.tokenManager.get).toHaveBeenCalledWith('accessToken');
    expect(authenticated).toBeTruthy();
  });
  test('isAuthenticated() returns false when the TokenManager does not return an access token', async () => {
    AuthJS.mockImplementation(() => {
      return mockAuthJsInstanceWithError
    });
    const auth = new Auth({
      client_id: 'foo',
      issuer: 'https://foo.okta.com/oauth2/default',
      redirect_uri: 'https://foo.okta.com/authorization-code/callback'
    });
    const authenticated = await auth.isAuthenticated();
    expect(authenticated).toBeFalsy();
  });
});

const findDomainMessage = 'You can copy your domain from the Okta Developer ' +
'Console. Follow these instructions to find it: https://bit.ly/finding-okta-domain';
const findCredentialsMessage = 'You can copy it from the Okta Developer Console ' +
'in the details for the Application you created. Follow these instructions to ' +
'find it: https://bit.ly/finding-okta-app-credentials';

describe('Cofiguration checks', () => {
  it('should throw if an issuer that does not contain https is provided', () => {
    function createInstance() {
      new Auth({
        issuer: 'http://foo.okta.com'
      });
    }
    const errorMsg = `Your Okta URL must start with https. Current value: http://foo.okta.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should not throw if https issuer validation is skipped', () => {
    jest.spyOn(global.console, 'warn');
    function createInstance() {
      new Auth({
        issuer: 'http://foo.okta.com',
        testing: {
          disableHttpsCheck: true
        }
      });
    }
    const errorMsg = `Your Okta URL must start with https. Current value: http://foo.okta.com. ${findDomainMessage}`;
    expect(createInstance).not.toThrow(errorMsg);
    expect(console.warn).toHaveBeenCalledWith('Warning: HTTPS check is disabled. This allows for insecure configurations and is NOT recommended for production use.');
  });

  it('should throw if an issuer matching {yourOktaDomain} is provided', () => {
    function createInstance() {
      new Auth({
        issuer: 'https://{yourOktaDomain}'
      });
    }
    const errorMsg = `Replace {yourOktaDomain} with your Okta domain. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer matching -admin.okta.com is provided', () => {
    function createInstance() {
      new Auth({
        issuer: 'https://foo-admin.okta.com'
      });
    }
    const errorMsg = 'Your Okta domain should not contain -admin. Current value: ' +
      `https://foo-admin.okta.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer matching -admin.oktapreview.com is provided', () => {
    function createInstance() {
      new Auth({
        issuer: 'https://foo-admin.oktapreview.com'
      });
    }
    const errorMsg = 'Your Okta domain should not contain -admin. Current value: ' +
      `https://foo-admin.oktapreview.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer matching -admin.okta-emea.com is provided', () => {
    function createInstance() {
      new Auth({
        issuer: 'https://foo-admin.okta-emea.com'
      });
    }
    const errorMsg = 'Your Okta domain should not contain -admin. Current value: ' +
      `https://foo-admin.okta-emea.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer matching more than one ".com" is provided', () => {
    function createInstance() {
      new Auth({
        issuer: 'https://foo.okta.com.com'
      });
    }
    const errorMsg = 'It looks like there\'s a typo in your Okta domain. ' +
      `Current value: https://foo.okta.com.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer matching more than one sequential "://" is provided', () => {
    function createInstance() {
      new Auth({
        issuer: 'https://://foo.okta.com'
      });
    }
    const errorMsg = 'It looks like there\'s a typo in your Okta domain. ' +
      `Current value: https://://foo.okta.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer matching more than one "://" is provided', () => {
    function createInstance() {
      new Auth({
        issuer: 'https://foo.okta://.com'
      });
    }
    const errorMsg = 'It looks like there\'s a typo in your Okta domain. ' +
      `Current value: https://foo.okta://.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if the client_id is not provided', () => {
    function createInstance() {
      new Auth({
        issuer: 'https://foo.okta.com'
      });
    }
    const errorMsg = `Your client ID is missing. ${findCredentialsMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if a client_id matching {clientId} is provided', () => {
    function createInstance() {
      new Auth({
        client_id: '{clientId}',
        issuer: 'https://foo.okta.com'
      });
    }
    const errorMsg = `Replace {clientId} with the client ID of your Application. ${findCredentialsMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if the redirect_uri is not provided', () => {
    function createInstance() {
      new Auth({
        client_id: 'foo',
        issuer: 'https://foo.okta.com'
      });
    }
    const errorMsg = 'Your redirect URI is missing.';
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if a redirect_uri matching {redirectUri} is provided', () => {
    function createInstance() {
      new Auth({
        redirect_uri: '{redirectUri}',
        client_id: 'foo',
        issuer: 'https://foo.okta.com'
      });
    }
    const errorMsg = 'Replace {redirectUri} with the redirect URI of your Application.'
    expect(createInstance).toThrow(errorMsg);
  });
});
