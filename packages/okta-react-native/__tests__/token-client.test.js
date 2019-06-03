/*!
 * Copyright (c) 2018-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import {
  requests,
  mockFetch,
  clearMocks,
  setMocks,
  mockAuthContext,
  expectAuthContext,
  mockRedirect,
  rateLimitError
} from '../__mocks__/mocks';
import * as SecureStore from 'expo-secure-store';
import TokenClient from '../src';
const packageJson = require('../package.json');

beforeEach(() => {
  clearMocks();
  setMocks();
});

describe('TokenClient', () => {
  let ctx;
  beforeEach(() => {
    ctx = {};
    ctx.tokenClient = new TokenClient({
      issuer: 'https://dummy_issuer',
      redirect_uri: 'dummy://redirect',
      client_id: 'dummy_client_id'
    });
  });

  describe('constructor', () => {
    it('should throw if no issuer is provided', () => {
      function createInstance() {
        new TokenClient();
      }
      expect(createInstance).toThrow();
    });
    it('should throw if an issuer that does not contain https is provided', () => {
      function createInstance() {
        new TokenClient({
          issuer: 'http://foo.com'
        });
      }
      expect(createInstance).toThrow();
    });
    it('should not throw if https issuer validation is skipped', () => {
      jest.spyOn(console, 'warn');
      function createInstance() {
        new TokenClient({
          issuer: 'http://foo.com',
          client_id: 'foo',
          redirect_uri: 'dummy://redirect',
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
        new TokenClient({
          issuer: 'https://{yourOktaDomain}'
        });
      }
      expect(createInstance).toThrow();
    });
    it('should throw if an issuer matching -admin.okta.com is provided', () => {
      function createInstance() {
        new TokenClient({
          issuer: 'https://foo-admin.okta.com'
        });
      }
      expect(createInstance).toThrow();
    });
    it('should throw if an issuer matching -admin.oktapreview.com is provided', () => {
      function createInstance() {
        new TokenClient({
          issuer: 'https://foo-admin.oktapreview.com'
        });
      }
      expect(createInstance).toThrow();
    });
    it('should throw if an issuer matching -admin.okta-emea.com is provided', () => {
      function createInstance() {
        new TokenClient({
          issuer: 'https://foo-admin.okta-emea.com'
        });
      }
      expect(createInstance).toThrow();
    });
    it('should throw if an issuer matching more than one ".com" is provided', () => {
      function createInstance() {
        new TokenClient({
          issuer: 'https://foo.okta.com.com'
        });
      }
      expect(createInstance).toThrow();
    });
    it('should throw if an issuer matching more than one sequential "://" is provided', () => {
      function createInstance() {
        new TokenClient({
          issuer: 'https://://foo.okta.com'
        });
      }
      expect(createInstance).toThrow();
    });
    it('should throw if an issuer matching more than one "://" is provided', () => {
      function createInstance() {
        new TokenClient({
          issuer: 'https://foo.okta://.com'
        });
      }
      expect(createInstance).toThrow();
    });
    it('should throw if the client_id is not provided', () => {
      function createInstance() {
        new TokenClient({
          issuer: 'https://foo'
        });
      }
      expect(createInstance).toThrow();
    });
    it('should throw if a client_id matching {clientId} is provided', () => {
      function createInstance() {
        new TokenClient({
          client_id: '{clientId}',
          issuer: 'https://foo'
        });
      }
      expect(createInstance).toThrow();
    });
  });

  describe('signOut', () => {
    it('removes any tokens in the secure store', async () => {
      // Set a cached authContext first
      ctx.tokenClient._authContext = {};
      expect(await ctx.tokenClient.signOut()).toBeUndefined();
      expect(ctx.tokenClient._authContext).toBeUndefined();
      expect(SecureStore.deleteItemAsync.mock.calls[0]).toEqual(['authContext']);
    });
  });

  describe('getIdToken', () => {
    it('returns undefined if no token in secure storage', async () => {
      expect(await ctx.tokenClient.getIdToken()).toBeUndefined();
    });

    it('returns the id_token from secure storage if not expired', async () => {
      mockAuthContext({
        idToken: {
          expiresAt: 1510000001,
          string: 'dummy_id_token'
        }
      });
      expect(await ctx.tokenClient.getIdToken()).toEqual('dummy_id_token');
    });

    it('returns undefined if token is expired', async () => {
      mockAuthContext({
        idToken: {
          expiresAt: 1509999999,
          string: 'dummy_id_token'
        }
      });
      expect(await ctx.tokenClient.getIdToken()).toBeUndefined();
    });
  });

  describe('isAuthenticated', () => {
    it('returns false if there is no token in secure storage', async () => {
      expect(await ctx.tokenClient.isAuthenticated()).toEqual(false);
    });

    it('returns true if there is a valid id token in secure storage', async () => {
      mockAuthContext({
        idToken: {
          expiresAt: 1510000001,
          string: 'dummy_id_token'
        }
      });
      expect(await ctx.tokenClient.getIdToken()).toEqual('dummy_id_token');
      expect(await ctx.tokenClient.isAuthenticated()).toEqual(true);
    });

    it('returns true if there is a valid access token in secure storage', async () => {
      mockAuthContext({
        accessToken: {
          expiresAt: 1510000001,
          string: 'dummy_access_token'
        }
      });
      expect(await ctx.tokenClient.getAccessToken()).toEqual('dummy_access_token');
      expect(await ctx.tokenClient.isAuthenticated()).toEqual(true);
    });
  });

  describe('getAccessToken', () => {
    it('returns undefined if no token in secure storage', async () => {
      expect(await ctx.tokenClient.getIdToken()).toBeUndefined();
    });

    it('returns the access_token from secure storage if not expired', async () => {
      mockAuthContext({
        accessToken: {
          expiresAt: 1510000001,
          string: 'dummy_access_token'
        }
      });
      expect(await ctx.tokenClient.getAccessToken()).toEqual('dummy_access_token');
    });

    it('attempts to refresh token if token is expired', async () => {
      mockAuthContext({
        accessToken: {
          expiresAt: 1509999999,
          string: 'dummy_access_token'
        },
        refreshToken: {
          string: 'dummy_refresh_token'
        }
      });
      mockFetch([
        requests.wellKnown,
        {
          req: {
            url: 'https://dummy_issuer/token',
            method: 'POST',
            body: 'grant_type=refresh_token&refresh_token=dummy_refresh_token'
          },
          res: {
            json: {
              access_token: 'new_dummy_access_token',
              expires_in: 300,
              refresh_token: 'new_dummy_refresh_token'
            }
          }
        }
      ]);
      expect(await ctx.tokenClient.getAccessToken()).toEqual('new_dummy_access_token');
      expectAuthContext({
        accessToken: {
          expiresAt: 1510000300,
          string: 'new_dummy_access_token'
        },
        refreshToken: {
          string: 'new_dummy_refresh_token'
        }
      });
    });

    it('returns undefined if no refresh_token', async () => {
      mockAuthContext({
        accessToken: {
          expiresAt: 1509999999,
          string: 'dummy_access_token'
        }
      });
      expect(await ctx.tokenClient.getAccessToken()).toBeUndefined();
    });

    it('returns undefined if expired and cannot be refreshed', async () => {
      mockAuthContext({
        accessToken: {
          expiresAt: 1509999999,
          string: 'dummy_access_token'
        },
        refreshToken: {
          string: 'dummy_refresh_token'
        }
      });
      mockFetch([
        requests.wellKnown,
        {
          req: {
            url: 'https://dummy_issuer/token',
            method: 'POST'
          },
          res: {
            status: 401,
            json: {
              error: 'invalid_request'
            }
          }
        }
      ]);
      expect(await ctx.tokenClient.getAccessToken()).toBeUndefined();
    });

    it('throw an ApiError if a non-OIDC error is thrown during refresh', async () => {
      mockAuthContext({
        accessToken: {
          expiresAt: 1509999999,
          string: 'dummy_access_token'
        },
        refreshToken: {
          string: 'dummy_refresh_token'
        }
      });
      mockFetch([
        requests.wellKnown,
        {
          req: {
            url: 'https://dummy_issuer/token',
            method: 'POST'
          },
          res: rateLimitError
        }
      ]);
      let error;
      try {
        await ctx.tokenClient.getAccessToken();
      } catch(e) {
        error = e;
      } finally {
        expect(error).toBeDefined();
        expect(error.name).toEqual('ApiError');
        expect(error.message).toEqual('API call exceeded rate limit due to too many requests.');
      }
    });
  });

  describe('getUser', () => {
    it('throws an error if unable to parse authContext', async () => {
      mockAuthContext('not json');
      await expect(ctx.tokenClient.getUser()).rejects.toThrow('Unable to read tokens');
    });

    it('returns undefined if no tokens', async () => {
      expect(await ctx.tokenClient.getUser()).toBeUndefined();
    });

    it('returns id token claims if no access token', async () => {
      mockAuthContext({
        idToken: {
          expiresAt: 1510000001,
          string: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoiYiJ9.jiMyrsmD8AoHWeQgmxZ5yq8z0lXS67_QGs52AzC8Ru8'
        }
      });
      expect(await ctx.tokenClient.getUser()).toEqual({a: 'b'});
    });

    it('returns results of /userinfo if access token', async () => {
      mockAuthContext({
        accessToken: {
          expiresAt: 1510000001,
          string: 'dummy_access_token'
        }
      });
      mockFetch([
        requests.wellKnown,
        {
          req: {
            url: 'https://dummy_issuer/userinfo',
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Bearer dummy_access_token',
              'Content-Type': 'application/json',
              'X-Okta-User-Agent-Extended': `@okta/okta-react-native/${packageJson.version} ios/test-version ios-platform`,
            }
          },
          res: {
            json: {
              a: 'b'
            }
          }
        }
      ]);
      expect(await ctx.tokenClient.getUser()).toEqual({a: 'b'});
    });

    it('returns undefined and removes accessToken if access token invalid against /userinfo', async () => {
      mockAuthContext({
        accessToken: {
          expiresAt: 1510000001,
          string: 'dummy_access_token'
        }
      });
      mockFetch([
        requests.wellKnown,
        {
          req: {
            url: 'https://dummy_issuer/userinfo',
            method: 'GET'
          },
          res: {
            status: 400,
            json: {}
          }
        }
      ]);
      expect(await ctx.tokenClient.getUser()).toBeUndefined();
      expectAuthContext({});
    });

    it('throws an error and removes accessToken if error requesting /userinfo', async () => {
      mockAuthContext({
        accessToken: {
          expiresAt: 1510000001,
          string: 'dummy_access_token'
        }
      });
      mockFetch([
        requests.wellKnown,
        {
          req: {
            url: 'https://dummy_issuer/userinfo',
            method: 'GET'
          },
          res: rateLimitError
        }
      ]);
      let error;
      try {
        await ctx.tokenClient.getUser();
      } catch(e) {
        error = e;
      } finally {
        expect(error).toBeDefined();
        expect(error.name).toEqual('ApiError');
        expect(error.message).toEqual('API call exceeded rate limit due to too many requests.');
      }
    });
  });

  describe('signInWithRedirect', () => {
    it('redirects to window with PKCE params, exchanges the code for tokens, then saves them to secure storage', async () => {
      mockFetch([
        requests.wellKnown,
        requests.token,
        requests.jwks,
        requests.token,
        requests.jwks
      ]);
      mockRedirect({
        authorizeUri: {
          searchParams: {
            response_type: 'code',
            scope: 'openid',
            code_challenge_method: 'S256',
            redirect_uri: 'dummy://redirect',
            client_id: 'dummy_client_id'
          }
        },
        redirectUri: {
          href: 'dummy://redirect'
        },
        result: {
          type: 'success',
          url: 'dummy://redirect?code=dummy_code&state=dummy_state'
        }
      });
      const tokenResponse = await ctx.tokenClient.signInWithRedirect();
      expectAuthContext({
        idToken: {
          expiresAt: 1510000300,
          string: 'eyJraWQiOiJVNVI4Y0hiR3c0NDVRYnE4elZPMVBjQ3BYTDh5RzZJY292VmEzbGFDb3hNIiwiYWxnIjoiUlMyNTYiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE1MTAwMDAzMDB9.xB7fGjmWUnBBlViTJ_0d_dIC8eNjNdk6pAR-luFstrDTs9B3yZzwN9DDgpINB5qJVSHK-COFgyuK3OCeC-VWvhLA4vn92eld2Lw266f7jRCeU2wJhcYAsw35qTd-jpbA3JjzXkuxMYiB8Y1QQhXHYycK60UB-TT_XCgxmp-oupE'
        },
        accessToken: {
          expiresAt: 1510000300,
          string: 'dummy_access_token'
        },
        refreshToken: {
          string: 'dummy_refresh_token'
        }
      });
    });

    it('reuses well-known response for subsequent sign-ins', async () => {
      mockFetch([
        requests.wellKnown,
        requests.token,
        requests.jwks,
        requests.token,
        requests.jwks
      ]);
      mockRedirect({
        result: {
          type: 'success',
          url: 'dummy://redirect?code=dummy_code&state=dummy_state'
        }
      });
      const tokenResponse = await ctx.tokenClient.signInWithRedirect();
      const tokenResponse2 = await ctx.tokenClient.signInWithRedirect();
      expectAuthContext({
        idToken: {
          expiresAt: 1510000300,
          string: 'eyJraWQiOiJVNVI4Y0hiR3c0NDVRYnE4elZPMVBjQ3BYTDh5RzZJY292VmEzbGFDb3hNIiwiYWxnIjoiUlMyNTYiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE1MTAwMDAzMDB9.xB7fGjmWUnBBlViTJ_0d_dIC8eNjNdk6pAR-luFstrDTs9B3yZzwN9DDgpINB5qJVSHK-COFgyuK3OCeC-VWvhLA4vn92eld2Lw266f7jRCeU2wJhcYAsw35qTd-jpbA3JjzXkuxMYiB8Y1QQhXHYycK60UB-TT_XCgxmp-oupE'
        },
        accessToken: {
          expiresAt: 1510000300,
          string: 'dummy_access_token'
        },
        refreshToken: {
          string: 'dummy_refresh_token'
        }
      }, 1);
    });

    it('stores an empty object in secure storage if no tokens are returned', async () => {
      mockFetch([
        requests.wellKnown,
        Object.assign(requests.token, {
          res: {
            json: {}
          }
        })
      ]);
      mockRedirect({
        result: {
          type: 'success',
          url: 'dummy://redirect?code=dummy_code&state=dummy_state'
        }
      });
      const tokenResponse = await ctx.tokenClient.signInWithRedirect();
      expectAuthContext({});
    });

    it('throws an OidcError if the /authorize call returns an error', async () => {
      mockFetch([
        requests.wellKnown
      ]);
      mockRedirect({
        result: {
          type: 'success',
          url: 'dummy://redirect?error=invalid_scope&error_description=The+requested+scope+is+invalid%2C+unknown%2C+or+malformed'
        }
      });
      let error;
      try {
        await ctx.tokenClient.signInWithRedirect();
      } catch(e) {
        error = e;
      } finally {
        expect(error).toBeDefined();
        expect(error.name).toEqual('OidcError');
        expect(error.message).toEqual('The requested scope is invalid, unknown, or malformed');
        expect(error.error).toEqual('invalid_scope');
        expect(error.error_description).toEqual('The requested scope is invalid, unknown, or malformed');
      }
    });

    it('throws an error if the user cancels the flow', async () => {
      mockFetch([
        requests.wellKnown
      ]);
      mockRedirect({
        result: {
          type: 'cancel'
        }
      });
      return expect(ctx.tokenClient.signInWithRedirect())
        .rejects.toThrow('User cancelled the auth flow');
    });

    it('throws an error if not cancelled or successful', async () => {
      mockFetch([
        requests.wellKnown
      ]);
      mockRedirect({
        result: {
          type: 'error'
        }
      });
      return expect(ctx.tokenClient.signInWithRedirect())
        .rejects.toThrow('Could not complete auth flow');
    });

    it('allows passing a custom authorization_endpoint', async () => {
      mockFetch([
        requests.wellKnown,
        requests.token
      ]);
      mockRedirect({
        authorizeUri: {
          origin: 'http://custom_issuer',
          pathname: '/authorize'
        },
        result: {
          type: 'success',
          url: 'dummy://redirect?code=dummy_code&state=dummy_state'
        }
      });
      await ctx.tokenClient.signInWithRedirect({
        authorization_endpoint: 'http://custom_issuer/authorize'
      });
    });
  });
});
