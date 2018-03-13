import Auth from '../../src/Auth';

const pkg = require('../../package.json');

test('Auth component sets the right user agent on AuthJS', () => {
  const auth = new Auth({
    issuer: 'https://foo/oauth2/default'
  });
  const expectedUserAgent = `${pkg.name}/${pkg.version} okta-auth-js-`;
  expect(auth._oktaAuth.userAgent).toMatch(expectedUserAgent);
});
