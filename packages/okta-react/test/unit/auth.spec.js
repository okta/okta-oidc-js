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
      issuer: 'https://foo/oauth2/default'
    });
    const expectedUserAgent = `${pkg.name}/${pkg.version} okta-auth-js`;
    expect(auth._oktaAuth.userAgent).toMatch(expectedUserAgent);
  });
  test('can retrieve an accessToken from the tokenManager', async (done) => {
    const auth = new Auth({
      issuer: 'https://foo/oauth2/default'
    });
    const accessToken = await auth.getAccessToken();
    expect(accessToken).toBe(mockAccessToken);
    done();
  });
  test('builds the authorize request with correct params', () => {
    const auth = new Auth({
      issuer: 'https://foo/oauth2/default'
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
      issuer: 'https://foo/oauth2/default'
    });
    auth.redirect({scope: ['openid', 'foo']});
    expect(mockAuthJsInstance.token.getWithRedirect).toHaveBeenCalledWith({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'foo']
    });
  });
  test('can append the authorize request builder with additionalParams through auth.redirect', () => {
    const auth = new Auth({
      issuer: 'https://foo/oauth2/default'
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
      issuer: 'https://foo/oauth2/default'
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
      issuer: 'https://foo/oauth2/default'
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
      issuer: 'https://foo/oauth2/default'
    });
    const authenticated = await auth.isAuthenticated();
    expect(authenticated).toBeFalsy();
  });
});
