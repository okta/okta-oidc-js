const passport = require('passport');
const OpenIdClient = require('openid-client');
const oidcUtil = require('../../src/oidcUtil.js');

function createMockOpenIdClient(config={}) {
  const Issuer = OpenIdClient.Issuer;

  const defaultConfig = {
    issuer: 'https://foo',
    token_endpoint: 'https://foo/token',
    userinfo_endpoint: 'https://foo/userinfo'
  };
  const issuer = new Issuer({
    ...defaultConfig,
    ...config
  });
  const client = new issuer.Client({
    client_id: 'foo',
    client_secret: 'foo',
  });

  client.callback = jest.fn(() => ({
    access_token: 'token_value'
  }));

  client.userinfo = jest.fn(() => ({
    cid: '123'
  }));

  return client;
}

function createMockRedirectRequest() {
  const request = jest.mock();
  request.method = 'GET';
  request.url = 'http://foo/authorization-code/callback?code=foo';
  request.session = {
    'oidc:foo': {
      response_type: 'code',
    },
  };
  return request;
}

describe('oidcUtil', function () {
  describe('Passport strategy setup', function () {
    beforeEach(function () {
      jest.clearAllMocks();
    });

    it('includes verification function which tolerates authentication repsonses w/o userInfo', function (next) {
      const passportStrategySetter = jest.spyOn(passport, 'use').mockImplementation(() => {});

      const context = {
        options: {
          scope: ['openid']
        },
        client: createMockOpenIdClient({
          userinfo_endpoint: undefined
        })
      };
      oidcUtil.bootstrapPassportStrategy(context);
      const passportStrategy = passportStrategySetter.mock.calls[0][1];

      passportStrategy.success = function (response) {
        expect(response.userinfo).toBe(undefined);
        expect(response.tokens).toEqual({access_token: 'token_value'});
        next();
      }
      passportStrategy.error = function(error) {
        expect(error).toEqual(undefined);
      };
      passportStrategy.authenticate(createMockRedirectRequest());
    });

    it('includes verification function which returns userinfo whenever it is available', function (next) {
      const passportStrategySetter = jest.spyOn(passport, 'use').mockImplementation(() => {});
      const context = {
        options: {
          scope: ['openid', 'profile']
        },
        client: createMockOpenIdClient()
      };

      oidcUtil.bootstrapPassportStrategy(context);
      const passportStrategy = passportStrategySetter.mock.calls[0][1];

      passportStrategy.success = function (response) {
        expect(response.userinfo).toEqual({cid: '123'});
        expect(response.tokens).toEqual({access_token: 'token_value'});
        next();
      };
      passportStrategy.error = function(error) {
        expect(error).toEqual(undefined);
      };
      passportStrategy.authenticate(createMockRedirectRequest());
    })
  })
})
