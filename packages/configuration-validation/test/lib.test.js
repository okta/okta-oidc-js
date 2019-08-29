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

    it('can be called with no arguments', () => {
      expect(buildConfigObject()).toEqual({});
    });

    it('pass-through: empty config', () => {
      const passedConfig = {};
      expect(buildConfigObject(passedConfig)).toEqual(passedConfig);
    });

    it('pass-through: leaves config object unchanged when all parameters are passed in preferred format', () => {
      const passedConfig = {
        clientId: '{clientId}',
        issuer: '{issuer}',
        redirectUri: '{redirectUri}',
        responseType: '{responseType}',
        scopes: ['a', 'b', 'c'],
        tokenManager: {
          storage: '{storage}',
          autoRenew: '{autoRenew}',
          secure: true,
        }
      };

      expect(buildConfigObject(passedConfig)).toEqual(passedConfig);
    });

    it('pass-through: Allows passing extra config properties at top-level', () => {
      function f() {}
      const passedConfig = {
        onAuthComplete: f
      }

      expect(buildConfigObject(passedConfig)).toEqual(passedConfig);
    });

    it('pass-through: tokenManager section', () => {
      const passedConfig = {
        tokenManager: {
          blar: 'foo',
          storage: 'a',
          autoRenew: false,
        }
      };

      expect(buildConfigObject(passedConfig)).toEqual(passedConfig);
    });

    it('returns correct config object when parameters are passed in camelCase', () => {
      const passedConfig = {
        clientId: '{clientId}',
        redirectUri: '{redirectUri}',
        responseType: '{responseType}',
        autoRenew: '{autoRenew}'
      }

      expect(buildConfigObject(passedConfig)).toEqual({
        clientId: '{clientId}',
        redirectUri: '{redirectUri}',
        responseType: '{responseType}',
        autoRenew: '{autoRenew}',
        tokenManager: {
          autoRenew: '{autoRenew}'
        }
      });
    });

    it('returns correct config object when parameters are passed in underscore_case', () => {
      const passedConfig = {
        client_id: '{client_id}',
        redirect_uri: '{redirect_uri}',
        response_type: '{response_type}',
        auto_renew: '{auto_renew}'
      }

      expect(buildConfigObject(passedConfig)).toEqual({
        clientId: '{client_id}',
        client_id: '{client_id}',
        redirectUri: '{redirect_uri}',
        redirect_uri: '{redirect_uri}',
        responseType: '{response_type}',
        response_type: '{response_type}',
        auto_renew: '{auto_renew}',
        tokenManager: {
          autoRenew: '{auto_renew}',
        }
      });
    });

    it('returns correct config object from camelCase parameters when both camelCase and underscore_case parameters are passed', () => {
      const passedConfig = {
        clientId: '{clientId}',
        client_id: '{client_id}',
        redirectUri: '{redirectUri}',
        redirect_uri: '{redirect_uri}',
        autoRenew: '{autoRenew}',
        auto_renew: '{auto_renew}'
      }

      expect(buildConfigObject(passedConfig)).toEqual({
        clientId: '{clientId}',
        client_id: '{client_id}',
        redirectUri: '{redirectUri}',
        redirect_uri: '{redirect_uri}',
        autoRenew: '{autoRenew}',
        auto_renew: '{auto_renew}',
        tokenManager: {
          autoRenew: '{autoRenew}',
        }
      });
    });

    it('tokenManager section: accepts top-level "storage" prop', () => {
      const passedConfig = {
        storage: 'foo',
      };

      expect(buildConfigObject(passedConfig)).toEqual({
        storage: 'foo',
        tokenManager: {
          storage: 'foo'
        }
      });
    });

    it('tokenManager section: will not overwrite "storage" prop if set within section', () => {
      const passedConfig = {
        storage: 'foo',
        tokenManager: {
          storage: 'bar'
        }
      };

      expect(buildConfigObject(passedConfig)).toEqual({
        storage: 'foo',
        tokenManager: {
          storage: 'bar'
        }
      });
    });

    it('tokenManager section: accepts top-level "autoRenew" prop', () => {
      const passedConfig = {
        autoRenew: true,
      };

      expect(buildConfigObject(passedConfig)).toEqual({
        autoRenew: true,
        tokenManager: {
          autoRenew: true,
        }
      });
    });

    it('tokenManager section: will not overwrite "autoRenew" prop if set within section', () => {
      const passedConfig = {
        autoRenew: true,
        tokenManager: {
          autoRenew: false,
        }
      };

      expect(buildConfigObject(passedConfig)).toEqual({
        autoRenew: true,
        tokenManager: {
          autoRenew: false,
        }
      });
    });

    it('tokenManager section: Allows passing extra config to tokenManager + top-level props', () => {
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
        tokenManager: {
          storage: '{storage}',
          autoRenew: '{autoRenew}',
          secure: true
        }
      });
    });

    it('Converts "scope" (string) to "scopes" (array)', () => {
      const scope = 'a b c';
      const passedConfig = {
        scope
      };

      expect(buildConfigObject(passedConfig)).toEqual({
        scopes: ['a', 'b', 'c'],
        scope,
      });
    });

    it('Converts "scope" (string) to "scopes" (array) (multiple spaces)', () => {
      const scope = 'a  b  c';
      const passedConfig = {
        scope
      };

      expect(buildConfigObject(passedConfig)).toEqual({
        scopes: ['a', 'b', 'c'],
        scope,
      });
    });


    it('Accepts "scope" (as an array)', () => {
      const scope = ['a', 'b', 'c'];
      const passedConfig = {
        scope
      };

      expect(buildConfigObject(passedConfig)).toEqual({
        scopes: scope,
        scope,
      });
    });


    it('Accepts single "responseType" (as a string)', () => {
      const responseType = 'a';
      const passedConfig = {
        responseType
      };

      expect(buildConfigObject(passedConfig)).toEqual({
        responseType: 'a'
      });
    });

    it('Accepts multiple "responseType" (as a string) and converts to array', () => {
      const responseType = 'a b';
      const passedConfig = {
        responseType
      };

      expect(buildConfigObject(passedConfig)).toEqual({
        responseType: ['a', 'b']
      });
    });


    it('Accepts multiple "responseType" (as a string) and converts to array (multi space)', () => {
      const responseType = 'a   b   x';
      const passedConfig = {
        responseType
      };

      expect(buildConfigObject(passedConfig)).toEqual({
        responseType: ['a', 'b', 'x']
      });
    });


    it('Accepts multiple "responseType" (as an array)', () => {
      const responseType = ['a', 'b'];
      const passedConfig = {
        responseType
      };

      expect(buildConfigObject(passedConfig)).toEqual({
        responseType: ['a', 'b']
      });
    });
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
