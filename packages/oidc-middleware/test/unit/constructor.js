const expect = require('chai').expect;
const Issuer = require('openid-client').Issuer;
const nock = require('nock');
const os = require('os');
const path = require('path');
const rpt = require ('read-package-tree')

const { ExpressOIDC } = require('../../index.js');
const pkg = require('../../package.json');
const packageRoot = path.join(__dirname, '..', '..');

describe('new ExpressOIDC()', () => {
  it('should throw if no issuer is provided', () => {
    function createInstance() {
      new ExpressOIDC();
    }
    expect(createInstance).to.throw();
  });

  it('should set the HTTP timeout to 10 seconds', () => {
    new ExpressOIDC({
      client_id: 'foo',
      client_secret: 'foo',
      redirect_uri: 'foo',
      issuer: 'http://foo'
    }).on('error', () => {
      // Ignore errors caused by mock configuration data
    });
    expect(Issuer.defaultHttpOptions.timeout).to.equal(10000);
  });

  it('should allow me to change the HTTP timeout', () => {
    new ExpressOIDC({
      client_id: 'foo',
      client_secret: 'foo',
      redirect_uri: 'foo',
      issuer: 'http://foo',
      timeout: 1
    }).on('error', () => {
      // Ignore errors caused by mock configuration data
    });
    expect(Issuer.defaultHttpOptions.timeout).to.equal(1);
  });

  it('should throw ETIMEOUT if the timeout is reached', (done) => {
    nock('http://foo')
    .get('/.well-known/openid-configuration')
    .reply(200, function cb() {
      // dont reply, we want to timeout
    });
    new ExpressOIDC({
      client_id: 'foo',
      client_secret: 'foo',
      redirect_uri: 'foo',
      issuer: 'http://foo',
      timeout: 1
    }).on('error', (e) => {
      expect(e.code).to.equal('ETIMEDOUT');
      done();
    });
  });

  it('should set the correct User-Agent string', (done) => {
    rpt(packageRoot, function (node, kidName) {
      return kidName.includes('openid');
    }, function (er, data) {
      const openIdPkg = data.children[0].package;
      nock('http://foo')
      .get('/.well-known/openid-configuration')
      .reply(200, function cb() {
        const userAgent = this.req.headers['user-agent'];
        const expectedAgent = `${pkg.name}/${pkg.version} ${openIdPkg.name}/${openIdPkg.version} node/${process.versions.node} ${os.platform()}/${os.release()}`;
        expect(userAgent).to.equal(expectedAgent);
        done();
      });
      new ExpressOIDC({
        client_id: 'foo',
        client_secret: 'foo',
        redirect_uri: 'foo',
        issuer: 'http://foo'
      }).on('error', () => {
        // Because we're mocking and not fulfilling the real response, the client will error
        // Ignore this because we're only asserting what we see on the request
      });
    });
  })
});
