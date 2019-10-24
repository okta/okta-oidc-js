
jest.mock('node-fetch');
const nodeFetch = require('node-fetch');

jest.mock('uuid', () => { return {}; });
const uuid = require('uuid');

const { forceLogoutAndRevoke } = require('../../src/logout');


describe('logout', () => {
  let fetchResponse;
  let fetch;
  let context;
  let logout;
  let req;
  let res;

  // Test values
  const issuer = 'testIssuer';
  const client_id = 'testClientId';
  const client_secret = 'testSecret';
  const id_token = 'testIdToken';
  const logoutRedirectUri = 'testLogoutUri';
  const mockState = 'fake-state';
  const sessionKey = 'fake-session-key';

  // Expected values
  const expectedAuthHeader = 'Basic dGVzdENsaWVudElkOnRlc3RTZWNyZXQ=';
  const expectedUri = `${issuer}/v1/logout?state=${mockState}&id_token_hint=${id_token}&post_logout_redirect_uri=${logoutRedirectUri}`;

  beforeEach(() => {
    fetchResponse = Promise.resolve('OK');
    fetch = jest.fn().mockImplementation(() => {
      return fetchResponse;
    });
    nodeFetch.mockImplementation(fetch);

    uuid.v4 = jest.fn().mockReturnValue(mockState);

    context = {
      options: {
        issuer,
        client_id,
        client_secret,
        logoutRedirectUri,
        sessionKey
      },
      emitter: {
        emit: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        })
      }
    };
    logout = forceLogoutAndRevoke(context);

    req = {
      session: {},
      userContext: {
        tokens: {
          id_token
        }
      }
    };
    res = {
      redirect: jest.fn()
    };
  });

  describe('revoke tokens', () => {
    it('revokes refresh_token', async () => {
      const tokenVal = 'sometoken';
      const tokenType = 'refresh_token';
      req.userContext.tokens[tokenType] = tokenVal;
      await logout(req, res);
      expect(fetch).toHaveBeenCalledWith(`${issuer}/v1/revoke`,{
        body: `token=${tokenVal}&token_type_hint=${tokenType}`, 
        headers: {
          accepts: 'application/json',
          authorization: expectedAuthHeader,
          'content-type': 'application/x-www-form-urlencoded'
        }, 
        'method': 'POST'
      })
    });

    it('revokes access_token', async () => {
      const tokenVal = 'sometoken';
      const tokenType = 'access_token';
      req.userContext.tokens[tokenType] = tokenVal;
      await logout(req, res);
      expect(fetch).toHaveBeenCalledWith(`${issuer}/v1/revoke`,{
        body: `token=${tokenVal}&token_type_hint=${tokenType}`, 
        headers: {
          accepts: 'application/json',
          authorization: expectedAuthHeader,
          'content-type': 'application/x-www-form-urlencoded'
        }, 
        'method': 'POST'
      })
    });

    it('revokes both refresh_token and access_token', async () => {
      const tokenVal = 'sometoken';
      req.userContext.tokens['refresh_token'] = tokenVal;
      req.userContext.tokens['access_token'] = tokenVal;
      await logout(req, res);
      expect(fetch).toHaveBeenNthCalledWith(1, `${issuer}/v1/revoke`,{
        body: `token=${tokenVal}&token_type_hint=refresh_token`, 
        headers: {
          accepts: 'application/json',
          authorization: expectedAuthHeader,
          'content-type': 'application/x-www-form-urlencoded'
        }, 
        'method': 'POST'
      });
      expect(fetch).toHaveBeenNthCalledWith(2, `${issuer}/v1/revoke`,{
        body: `token=${tokenVal}&token_type_hint=access_token`, 
        headers: {
          accepts: 'application/json',
          authorization: expectedAuthHeader,
          'content-type': 'application/x-www-form-urlencoded'
        }, 
        'method': 'POST'
      })
    });
  });

  describe('redirect', () => {
    it('redirects to the logout endpoint, passing id_token', async () => {
      await logout(req, res);
      expect(res.redirect).toHaveBeenCalledWith(expectedUri);
    });

    it('will redirect event if revoke fails', async () => {
      jest.useFakeTimers();

      // In the real world, the emitter will throw
      context.emitter.emit.mockImplementation((type, message) => {
        throw new Error(message);
      })

      // Setup token revoke to fail
      const errorVal = 'NOT OK';
      fetchResponse = Promise.reject(errorVal);
      req.userContext.tokens['refresh_token'] = 'does not matter';
      await logout(req, res); // should not throw
      expect(res.redirect).toHaveBeenCalledWith(expectedUri); // ensure redirect was called

      // prevent exception from being thrown
      context.emitter.emit.mockImplementation(() => {});
      jest.runAllTimers();
      expect(context.emitter.emit).toHaveBeenCalledWith('error', errorVal); // ensure error was emitted
    });
  });

  describe('session', () => {
    it('sets the session object', async () => {
      await logout(req, res);
      expect(req.session[sessionKey]).toEqual({ state: mockState });
    })
  })
})