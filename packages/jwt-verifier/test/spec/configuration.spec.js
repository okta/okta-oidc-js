const OktaJwtVerifier = require('../../lib');

describe('jwt-verifier configuration validation', () => {
  it('should throw if no issuer is provided', () => {
    function createInstance() {
      new OktaJwtVerifier();
    }
    expect(createInstance).toThrow();
  });

  it('should throw if an issuer that does not contain https is provided', () => {
    function createInstance() {
      new OktaJwtVerifier({
        issuer: 'http://foo.com'
      });
    }
    expect(createInstance).toThrow();
  });

  it('should not throw if https issuer validation is skipped', () => {
    jest.spyOn(console, 'warn');
    function createInstance() {
      new OktaJwtVerifier({
        issuer: 'http://foo.com',
        testing: {
          disableHttpsCheck: true
        }
      });
    }
    expect(createInstance).not.toThrow();
    expect(console.warn).toBeCalledWith('Warning: HTTPS check is disabled. This allows for insecure configurations and is NOT recommended for production use.');
  });

  it('should throw if an issuer matching {yourOktaDomain} is provided', () => {
    function createInstance() {
      new OktaJwtVerifier({
        issuer: 'https://{yourOktaDomain}'
      });
    }
    expect(createInstance).toThrow();
  });

  it('should throw if an issuer matching -admin.okta.com is provided', () => {
    function createInstance() {
      new OktaJwtVerifier({
        issuer: 'https://foo-admin.okta.com'
      });
    }
    expect(createInstance).toThrow();
  });

  it('should throw if an issuer matching -admin.oktapreview.com is provided', () => {
    function createInstance() {
      new OktaJwtVerifier({
        issuer: 'https://foo-admin.oktapreview.com'
      });
    }
    expect(createInstance).toThrow();
  });

  it('should throw if an issuer matching -admin.okta-emea.com is provided', () => {
    function createInstance() {
      new OktaJwtVerifier({
        issuer: 'https://foo-admin.okta-emea.com'
      });
    }
    expect(createInstance).toThrow();
  });

  it('should throw if an issuer matching more than one ".com" is provided', () => {
    function createInstance() {
      new OktaJwtVerifier({
        issuer: 'https://foo.okta.com.com'
      });
    }
    expect(createInstance).toThrow();
  });

  it('should throw if an issuer matching more than one sequential "://" is provided', () => {
    function createInstance() {
      new OktaJwtVerifier({
        issuer: 'https://://foo.okta.com'
      });
    }
    expect(createInstance).toThrow();
  });

  it('should throw if an issuer matching more than one "://" is provided', () => {
    function createInstance() {
      new OktaJwtVerifier({
        issuer: 'https://foo.okta://.com'
      });
    }
    expect(createInstance).toThrow();
  });

  it('should NOT throw if client_id not matching {clientId} is provided', () => {
    function createInstance() {
      new OktaJwtVerifier({
        issuer: 'https://foo',
        client_id: '123456',
      });
    }
    expect(createInstance).not.toThrow();
  });

});
