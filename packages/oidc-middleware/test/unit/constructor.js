const expect = require('chai').expect;
const nock = require('nock');
const os = require('os');
const path = require('path');
const rpt = require ('read-package-tree')

const { ExpressOIDC } = require('../../index.js');
const pkg = require('../../package.json');
const packageRoot = path.join(__dirname, '..', '..');

describe.only('new ExpressOIDC()', () => {
  it('should throw if no issuer is provided', () => {
    function createInstance() {
      new ExpressOIDC();
    }
    expect(createInstance).to.throw();
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
