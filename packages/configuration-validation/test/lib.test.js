const {
  assertIssuer,
  assertClientId,
  assertClientSecret,
  assertRedirectUri,
  assertAppBaseUrl,
  buildConfigObject
} = require('../src/lib');

describe('Configuration Validation', () => {
  const findDomainMessage = 'You can copy your domain from the Okta Developer ' +
    'Console. Follow these instructions to find it: https://bit.ly/finding-okta-domain';

  const findCredentialsMessage = 'You can copy it from the Okta Developer Console ' +
    'in the details for the Application you created. Follow these instructions to ' +
    'find it: https://bit.ly/finding-okta-app-credentials';

  describe('buildConfigObject', () => {
    it('returns correct config object when parameters are passed in camelCase', () => {
      const passedConfig = {
        clientId: '{clientId}',
        issuer: '{issuer}',
        redirectUri: '{redirectUri}',
        storage: '{storage}',
        autoRenew: '{autoRenew}'
      }

      expect(buildConfigObject(passedConfig)).toEqual({
        clientId: '{clientId}',
        issuer: '{issuer}',
        redirectUri: '{redirectUri}',
        storage: '{storage}',
        autoRenew: '{autoRenew}',
        tokenManager: {
          storage: '{storage}',
          autoRenew: '{autoRenew}'
        }
      });
    });

    it('returns correct config object when parameters are passed in underscore_case', () => {
      const passedConfig = {
        client_id: '{client_id}',
        issuer: '{issuer}',
        redirect_uri: '{redirect_uri}',
        storage: '{storage}',
        auto_renew: '{auto_renew}'
      }

      expect(buildConfigObject(passedConfig)).toEqual({
        clientId: '{client_id}',
        client_id: '{client_id}',
        issuer: '{issuer}',
        redirectUri: '{redirect_uri}',
        redirect_uri: '{redirect_uri}',
        storage: '{storage}',
        auto_renew: '{auto_renew}',
        tokenManager: {
          storage: '{storage}',
          autoRenew: '{auto_renew}',
        }
      });
    });

    it('returns correct config object from camelCase parameters when both camelCase and underscore_case parameters are passed', () => {
      const passedConfig = {
        clientId: '{clientId}',
        client_id: '{client_id}',
        issuer: '{issuer}',
        redirectUri: '{redirectUri}',
        redirect_uri: '{redirect_uri}',
        storage: '{storage}',
        autoRenew: '{autoRenew}',
        auto_renew: '{auto_renew}'
      }

      expect(buildConfigObject(passedConfig)).toEqual({
        clientId: '{clientId}',
        client_id: '{client_id}',
        issuer: '{issuer}',
        redirectUri: '{redirectUri}',
        redirect_uri: '{redirect_uri}',
        storage: '{storage}',
        autoRenew: '{autoRenew}',
        auto_renew: '{auto_renew}',
        tokenManager: {
          storage: '{storage}',
          autoRenew: '{autoRenew}',
        }
      });
    });

    it('Allows passing extra config to tokenManager', () => {
      const passedConfig = {
        storage: '{storage}',
        autoRenew: '{autoRenew}',
        tokenManager: {
          secure: true
        }
      }

      expect(buildConfigObject(passedConfig)).toEqual({
        storage: '{storage}',
        autoRenew: '{autoRenew}',
        clientId: undefined,
        redirectUri: undefined,
        tokenManager: {
          storage: '{storage}',
          autoRenew: '{autoRenew}',
          secure: true
        }
      });
    });

    it('Can override tokenManager config', () => {
      const passedConfig = {
        storage: '{storage}',
        tokenManager: {
          storage: '{overridden}'
        }
      }

      expect(buildConfigObject(passedConfig)).toEqual({
        storage: '{storage}',
        clientId: undefined,
        redirectUri: undefined,
        tokenManager: {
          storage: '{overridden}',
        }
      });
    });

    it('Allows passing extra config properties at top-level', () => {
      function f() {}
      const passedConfig = {
        onAuthComplete: f
      }

      expect(buildConfigObject(passedConfig)).toEqual({
        onAuthComplete: f,
        clientId: undefined,
        redirectUri: undefined,
        tokenManager: {
          storage: undefined,
          autoRenew: undefined,
        }
      });
    })
  });

  describe('assertIssuer', () => {
    it('should throw if no issuer is provided', () => {
      const errorMsg = `Your Okta URL is missing. ${findDomainMessage}`;
      expect(() => assertIssuer()).toThrow(errorMsg);
    });

    it('should throw if an issuer that does not contain https is provided', () => {
      const errorMsg = `Your Okta URL must start with https. Current value: http://foo.com. ${findDomainMessage}`;
      expect(() => assertIssuer('http://foo.com')).toThrow(errorMsg);
    });

    it('should not throw if https issuer validation is skipped', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {}); // silence for testing
      const errorMsg = `Your Okta URL must start with https. Current value: http://foo.com. ${findDomainMessage}`;
      expect(() => {
        assertIssuer('http://foo.com', {
          disableHttpsCheck: true
        })
      }).not.toThrow(errorMsg);
      /* eslint-disable-next-line no-console */
      expect(console.warn).toBeCalledWith('Warning: HTTPS check is disabled. This allows for insecure configurations and is NOT recommended for production use.');
    });

    it('should throw if an issuer matching {yourOktaDomain} is provided', () => {
      const errorMsg = `Replace {yourOktaDomain} with your Okta domain. ${findDomainMessage}`;
      expect(() => assertIssuer('https://{yourOktaDomain}')).toThrow(errorMsg);
    });

    it('should throw if an issuer matching -admin.okta.com is provided', () => {
      const errorMsg = 'Your Okta domain should not contain -admin. Current value: ' +
        `https://foo-admin.okta.com. ${findDomainMessage}`;
      expect(() => assertIssuer('https://foo-admin.okta.com')).toThrow(errorMsg);
    });

    it('should throw if an issuer matching -admin.oktapreview.com is provided', () => {
      const errorMsg = 'Your Okta domain should not contain -admin. Current value: ' +
        `https://foo-admin.oktapreview.com. ${findDomainMessage}`;
      expect(() => assertIssuer('https://foo-admin.oktapreview.com')).toThrow(errorMsg);
    });

    it('should throw if an issuer matching -admin.okta-emea.com is provided', () => {
      const errorMsg = 'Your Okta domain should not contain -admin. Current value: ' +
        `https://foo-admin.okta-emea.com. ${findDomainMessage}`;
      expect(() => assertIssuer('https://foo-admin.okta-emea.com')).toThrow(errorMsg);
    });

    it('should throw if an issuer matching more than one ".com" is provided', () => {
      const errorMsg = 'It looks like there\'s a typo in your Okta domain. ' +
        `Current value: https://foo.okta.com.com. ${findDomainMessage}`;
      expect(() => assertIssuer('https://foo.okta.com.com')).toThrow(errorMsg);
    });

    it('should throw if an issuer matching more than one sequential "://" is provided', () => {
      const errorMsg = 'It looks like there\'s a typo in your Okta domain. ' +
        `Current value: https://://foo.okta.com. ${findDomainMessage}`;
      expect(() => assertIssuer('https://://foo.okta.com')).toThrow(errorMsg);
    });

    it('should throw if an issuer matching more than one "://" is provided', () => {
      const errorMsg = 'It looks like there\'s a typo in your Okta domain. ' +
        `Current value: https://foo.okta://.com. ${findDomainMessage}`;
      expect(() => assertIssuer('https://foo.okta://.com')).toThrow(errorMsg);
    });
  });

  describe('assertClientId', () => {
    it('should throw if the client_id is not provided', () => {
      const errorMsg = `Your client ID is missing. ${findCredentialsMessage}`;
      expect(() => assertClientId()).toThrow(errorMsg);
    });

    it('should throw if a client_id matching {clientId} is provided', () => {
      const errorMsg = `Replace {clientId} with the client ID of your Application. ${findCredentialsMessage}`;
      expect(() => assertClientId('{clientId}')).toThrow(errorMsg);
    });
  });

  describe('assertClientSecret', () => {
    it('should throw if the client_secret is not provided', () => {
      const errorMsg = `Your client secret is missing. ${findCredentialsMessage}`;
      expect(() => assertClientSecret()).toThrow(errorMsg);
    });

    it('should throw if a client_secret matching {clientSecret} is provided', () => {
      const errorMsg = `Replace {clientSecret} with the client secret of your Application. ${findCredentialsMessage}`;
      expect(() => assertClientSecret('{clientSecret}')).toThrow(errorMsg);
    });
  });

  describe('assertRedirectUri', () => {
    it('should throw if the redirect_uri is not provided', () => {
      const errorMsg = 'Your redirect URI is missing.';
      expect(() => assertRedirectUri()).toThrow(errorMsg);
    });

    it('should throw if a redirect_uri matching {redirectUri} is provided', () => {
      const errorMsg = 'Replace {redirectUri} with the redirect URI of your Application.'
      expect(() => assertRedirectUri('{redirectUri}')).toThrow(errorMsg);
    });
  });

  describe('assertAppBaseUrl', () => { 
    it('should throw if the appBaseUrl is not provided', () => {
      const errorMsg = 'Your appBaseUrl is missing.';
      expect(() => assertAppBaseUrl()).toThrow(errorMsg);
    });

    it('should throw if a appBaseUrl matching {appBaseUrl} is provided', () => {
      const errorMsg = 'Replace {appBaseUrl} with the base URL of your Application.'
      expect(() => assertAppBaseUrl('{appBaseUrl}')).toThrow(errorMsg);
    });

    it('should throw if an appBaseUrl without a protocol is provided', () => {
      const errorMsg = 'Your appBaseUrl must contain a protocol (e.g. https://). Current value: foo.example.com.';
      expect(() => assertAppBaseUrl('foo.example.com')).toThrow(errorMsg);
    });

    it('should throw if an appBaseUrl that ends in a slash is provided', () => {
      const errorMsg = `Your appBaseUrl must not end in a '/'. Current value: https://foo.example.com/.`;
      expect(() => assertAppBaseUrl('https://foo.example.com/')).toThrow(errorMsg);
    });
  });

});
