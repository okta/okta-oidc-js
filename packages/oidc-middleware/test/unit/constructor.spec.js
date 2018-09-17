const Issuer = require('openid-client').Issuer;
const nock = require('nock');
const os = require('os');
const path = require('path');
const rpt = require ('read-package-tree');

const { ExpressOIDC } = require('../../index.js');
const pkg = require('../../package.json');
const packageRoot = path.join(__dirname, '..', '..');

describe('new ExpressOIDC()', () => {
  const findDomainMessage = 'You can copy your domain from the Okta Developer ' +
    'Console. Follow these instructions to find it: https://bit.ly/finding-okta-domain';

  const findCredentialsMessage = 'You can copy it from the Okta Developer Console ' +
    'in the details for the Application you created. Follow these instructions to ' +
    'find it: https://bit.ly/finding-okta-app-credentials';

  it('should throw if no issuer is provided', () => {
    function createInstance() {
      new ExpressOIDC();
    }
    const errorMsg = `Your Okta URL is missing. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer that does not contain https is provided', () => {
    function createInstance() {
      new ExpressOIDC({
        issuer: 'http://foo.com'
      });
    }
    const errorMsg = `Your Okta URL must start with https. Current value: http://foo.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should not throw if https issuer validation is skipped', () => {
    jest.spyOn(console, 'warn');
    function createInstance() {
      new ExpressOIDC({
        issuer: 'http://foo.com',
        testing: {
          disableHttpsCheck: true
        }
      });
    }
    const errorMsg = `Your Okta URL must start with https. Current value: http://foo.com. ${findDomainMessage}`;
    expect(createInstance).not.toThrow(errorMsg);
    expect(console.warn).toBeCalledWith('Warning: HTTPS check is disabled. This allows for insecure configurations and is NOT recommended for production use.');
  });

  it('should throw if an issuer matching {yourOktaDomain} is provided', () => {
    function createInstance() {
      new ExpressOIDC({
        issuer: 'https://{yourOktaDomain}'
      });
    }
    const errorMsg = `Replace {yourOktaDomain} with your Okta domain. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer matching -admin.okta.com is provided', () => {
    function createInstance() {
      new ExpressOIDC({
        issuer: 'https://foo-admin.okta.com'
      });
    }
    const errorMsg = 'Your Okta domain should not contain -admin. Current value: ' +
      `https://foo-admin.okta.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer matching -admin.oktapreview.com is provided', () => {
    function createInstance() {
      new ExpressOIDC({
        issuer: 'https://foo-admin.oktapreview.com'
      });
    }
    const errorMsg = 'Your Okta domain should not contain -admin. Current value: ' +
      `https://foo-admin.oktapreview.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer matching -admin.okta-emea.com is provided', () => {
    function createInstance() {
      new ExpressOIDC({
        issuer: 'https://foo-admin.okta-emea.com'
      });
    }
    const errorMsg = 'Your Okta domain should not contain -admin. Current value: ' +
      `https://foo-admin.okta-emea.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer matching more than one ".com" is provided', () => {
    function createInstance() {
      new ExpressOIDC({
        issuer: 'https://foo.okta.com.com'
      });
    }
    const errorMsg = 'It looks like there\'s a typo in your Okta domain. ' +
      `Current value: https://foo.okta.com.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer matching more than one sequential "://" is provided', () => {
    function createInstance() {
      new ExpressOIDC({
        issuer: 'https://://foo.okta.com'
      });
    }
    const errorMsg = 'It looks like there\'s a typo in your Okta domain. ' +
      `Current value: https://://foo.okta.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if an issuer matching more than one "://" is provided', () => {
    function createInstance() {
      new ExpressOIDC({
        issuer: 'https://foo.okta://.com'
      });
    }
    const errorMsg = 'It looks like there\'s a typo in your Okta domain. ' +
      `Current value: https://foo.okta://.com. ${findDomainMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if the client_id is not provided', () => {
    function createInstance() {
      new ExpressOIDC({
        issuer: 'https://foo'
      });
    }
    const errorMsg = `Your client ID is missing. ${findCredentialsMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if the client_secret is not provided', () => {
    function createInstance() {
      new ExpressOIDC({
        client_id: 'foo',
        issuer: 'https://foo'
      });
    }
    const errorMsg = `Your client secret is missing. ${findCredentialsMessage}`;
  expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if a client_id matching {clientId} is provided', () => {
    function createInstance() {
      new ExpressOIDC({
        client_id: '{clientId}',
        issuer: 'https://foo'
      });
    }
    const errorMsg = `Replace {clientId} with the client ID of your Application. ${findCredentialsMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if a client_secret matching {clientSecret} is provided', () => {
    function createInstance() {
      new ExpressOIDC({
        client_secret: '{clientSecret}',
        client_id: 'foo',
        issuer: 'https://foo'
      });
    }
    const errorMsg = `Replace {clientSecret} with the client secret of your Application. ${findCredentialsMessage}`;
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if the redirect_uri is not provided', () => {
    function createInstance() {
      new ExpressOIDC({
        client_secret: 'foo',
        client_id: 'foo',
        issuer: 'https://foo'
      });
    }
    const errorMsg = 'Your redirect URI is missing.';
    expect(createInstance).toThrow(errorMsg);
  });

  it('should throw if a redirect_uri matching {redirectUri} is provided', () => {
    function createInstance() {
      new ExpressOIDC({
        redirect_uri: '{redirectUri}',
        client_secret: 'foo',
        client_id: 'foo',
        issuer: 'https://foo'
      });
    }
    const errorMsg = 'Replace {redirectUri} with the redirect URI of your Application.'
    expect(createInstance).toThrow(errorMsg);
  });

  it('should set the HTTP timeout to 10 seconds', () => {
    new ExpressOIDC({
      client_id: 'foo',
      client_secret: 'foo',
      redirect_uri: 'foo',
      issuer: 'https://foo'
    }).on('error', () => {
      // Ignore errors caused by mock configuration data
    });
    expect(Issuer.defaultHttpOptions.timeout).toBe(10000);
  });

  it('should allow me to change the HTTP timeout', () => {
    new ExpressOIDC({
      client_id: 'foo',
      client_secret: 'foo',
      redirect_uri: 'foo',
      issuer: 'https://foo',
      timeout: 1
    }).on('error', () => {
      // Ignore errors caused by mock configuration data
    });
    expect(Issuer.defaultHttpOptions.timeout).toBe(1);
  });

  it('should throw ETIMEOUT if the timeout is reached', (done) => {
    nock('https://foo')
    .get('/.well-known/openid-configuration')
    .reply(200, function cb() {
      // dont reply, we want to timeout
    });
    new ExpressOIDC({
      client_id: 'foo',
      client_secret: 'foo',
      redirect_uri: 'foo',
      issuer: 'https://foo',
      timeout: 1
    }).on('error', (e) => {
      expect(e.code).toBe('ETIMEDOUT');
      done();
    });
  });

  it('should set the correct User-Agent string', (done) => {
    rpt(packageRoot, function (node, kidName) {
      return kidName.includes('openid');
    }, function (er, data) {
      const openIdPkg = data.children[0].package;
      nock('https://foo')
      .get('/.well-known/openid-configuration')
      .reply(200, function cb() {
        const userAgent = this.req.headers['user-agent'];
        const expectedAgent = `${pkg.name}/${pkg.version} ${openIdPkg.name}/${openIdPkg.version} node/${process.versions.node} ${os.platform()}/${os.release()}`;
        expect(userAgent).toBe(expectedAgent);
        done();
      });
      new ExpressOIDC({
        client_id: 'foo',
        client_secret: 'foo',
        redirect_uri: 'foo',
        issuer: 'https://foo'
      }).on('error', () => {
        // Because we're mocking and not fulfilling the real response, the client will error
        // Ignore this because we're only asserting what we see on the request
      });
    });
  })
});
