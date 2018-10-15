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

import { SecureStore, WebBrowser, Constants } from 'expo';
import { Platform } from 'react-native';
import { URL } from 'url';

jest.mock('react-native', () => {
  const Platform = {};
  Object.defineProperty(Platform, 'OS', { get: jest.fn() });
  Object.defineProperty(Platform, 'Version', { get: jest.fn() });
  return { Platform };
});

jest.mock('expo', () => {
  const Constants = {};
  Object.defineProperty(Constants, 'platform', { get: jest.fn() });
  return {
    SecureStore: {
      getItemAsync: jest.fn(),
      setItemAsync: jest.fn(),
      deleteItemAsync: jest.fn()
    },
    WebBrowser: {
      openAuthSessionAsync: jest.fn()
    },
    Constants
  };
});

Date.now = jest.fn();

export function setMocks() {
  Date.now.mockReturnValue(1510000000000);
  Object.getOwnPropertyDescriptor(Platform, 'OS').get.mockReturnValue('ios');
  Object.getOwnPropertyDescriptor(Platform, 'Version').get.mockReturnValue('test-version');
  Object.getOwnPropertyDescriptor(Constants, 'platform').get.mockReturnValue({
    ios: {
      platform: 'ios-platform'
    },
    android: {
      versionCode: 'android-platform'
    }
  });
}

export function clearMocks() {
  Date.now.mock && Date.now.mockClear();
  fetch.mock && fetch.mockClear();
  SecureStore.getItemAsync.mockClear();
  SecureStore.setItemAsync.mockClear();
  SecureStore.deleteItemAsync.mockClear();
  WebBrowser.openAuthSessionAsync.mockClear();
}

export function mockAuthContext(authContext) {
  SecureStore.getItemAsync.mockReturnValueOnce(typeof authContext === 'string' ?
    authContext : JSON.stringify(authContext));
}

export function expectAuthContext(authContext, index = 0) {
  const [key, value] = SecureStore.setItemAsync.mock.calls[index];
  const actualAuthContext = JSON.parse(value);
  expect(key).toEqual('authContext');
  expect(actualAuthContext).toEqual(authContext);
}

export function mockFetch(pairs = []) {
  fetch = jest.fn();
  for (let pair of pairs) {
    pair.req = pair.req || {};
    pair.res = pair.res || {};
    fetch.mockImplementationOnce((url, options) => {
      if (pair.req.url) expect(url).toEqual(pair.req.url);
      if (pair.req.method) expect(options.method || 'GET').toEqual(pair.req.method);
      if (pair.req.headers) expect(options.headers).toEqual(pair.req.headers);
      if (pair.req.body) expect(options.body).toEqual(pair.req.body);
      const status = pair.res.status || 200;
      return {
        ok: (200 <= status && status < 300) ? true : false,
        status: status,
        json: () => Promise.resolve(pair.res.json)
      };
    });
  }
}

export function mockRedirect(options) {
  WebBrowser.openAuthSessionAsync.mockImplementation((authorizeUri, redirectUri) => {
    if (options.authorizeUri) {
      const parsedAuthorizeUri = new URL(authorizeUri);
      if (options.authorizeUri.origin) {
        expect(parsedAuthorizeUri.origin).toEqual(options.authorizeUri.origin);
      }
      if (options.authorizeUri.pathname) {
        expect(parsedAuthorizeUri.pathname).toEqual(options.authorizeUri.pathname);
      }
      const searchParams = options.authorizeUri.searchParams;
      if (searchParams) {
        const authParams = parsedAuthorizeUri.searchParams;
        expect(authParams.get('response_type')).toEqual(searchParams['response_type']);
        expect(authParams.get('scope')).toEqual(searchParams['scope']);
        expect(authParams.get('code_challenge_method')).toEqual(searchParams['code_challenge_method']);
        expect(authParams.get('code_challenge')).toBeDefined();
        expect(authParams.get('state')).toBeDefined();
        expect(authParams.get('nonce')).toBeDefined();
        expect(authParams.get('redirect_uri')).toEqual(searchParams['redirect_uri']);
        expect(authParams.get('client_id')).toEqual(searchParams['client_id']);
      }
    }
    if (options.redirectUri) {
      const parsedRedirectUri = new URL(redirectUri);
      if (options.redirectUri.href) {
        expect(parsedRedirectUri.href).toEqual(options.redirectUri.href);
      }
    }
    return Promise.resolve(options.result);
  });
}

export const requests = {
  token: {
    req: {
      url: 'https://dummy_issuer/token',
      method: 'POST'
    },
    res: {
      json: {
        id_token: 'eyJraWQiOiJVNVI4Y0hiR3c0NDVRYnE4elZPMVBjQ3BYTDh5RzZJY292VmEzbGFDb3hNIiwiYWxnIjoiUlMyNTYiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE1MTAwMDAzMDB9.xB7fGjmWUnBBlViTJ_0d_dIC8eNjNdk6pAR-luFstrDTs9B3yZzwN9DDgpINB5qJVSHK-COFgyuK3OCeC-VWvhLA4vn92eld2Lw266f7jRCeU2wJhcYAsw35qTd-jpbA3JjzXkuxMYiB8Y1QQhXHYycK60UB-TT_XCgxmp-oupE',
        refresh_token: 'dummy_refresh_token',
        access_token: 'dummy_access_token',
        expires_in: 300,
      }
    }
  },
  wellKnown: {
    req: {
      url: 'https://dummy_issuer/.well-known/openid-configuration',
      method: 'GET'
    },
    res: {
      json: {
        authorization_endpoint: 'https://dummy_issuer/authorize',
        token_endpoint: 'https://dummy_issuer/token',
        userinfo_endpoint: 'https://dummy_issuer/userinfo',
        jwks_uri: 'https://dummy_issuer/jwks'
      }
    }
  },
  jwks: {
    req: {
      url: 'https://dummy_issuer/jwks',
      method: 'GET'
    },
    res: {
      json: {
        keys: [{
          alg: 'RS256',
          kty: 'RSA',
          n: '3ZWrUY0Y6IKN1qI4BhxR2C7oHVFgGPYkd38uGq1jQNSqEvJFcN93CYm16_G78FAFKWqwsJb3Wx-nbxDn6LtP4AhULB1H0K0g7_jLklDAHvI8yhOKlvoyvsUFPWtNxlJyh5JJXvkNKV_4Oo12e69f8QCuQ6NpEPl-cSvXIqUYBCs',
          e: 'AQAB',
          use: 'sig',
          kid: 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM'
        }]
      }
    }
  }
};

export const rateLimitError = {
  status: 429,
  json: {
    errorCode: 'E0000047',
    errorSummary: 'API call exceeded rate limit due to too many requests.',
    errorLink: 'E0000047',
    errorId: 'dummy_error_id',
    errorCauses: []
  }
};
