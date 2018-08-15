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
  }
};

AuthJS.mockImplementation(() => {
  return mockAuthJsInstance
});

test('Auth component sets the right user agent on AuthJS', () => {
  const auth = new Auth({
    issuer: 'https://foo/oauth2/default'
  });
  const expectedUserAgent = `${pkg.name}/${pkg.version} okta-auth-js`;
  expect(auth._oktaAuth.userAgent).toMatch(expectedUserAgent);
});
test('Auth component can retrieve an accessToken from the tokenManager', async (done) => {
  const auth = new Auth({
    issuer: 'https://foo/oauth2/default'
  });
  const accessToken = await auth.getAccessToken();
  expect(accessToken).toBe(mockAccessToken);
  done();
});
