/*
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const {
  createConfig,
  signIn,
  signOut,
  authenticate,
  getAccessToken,
  getIdToken,
  getUser,
  getUserFromIdToken,
  isAuthenticated,
  revokeAccessToken,
  revokeIdToken,
  revokeRefreshToken,
  introspectAccessToken,
  introspectIdToken,
  introspectRefreshToken,
  refreshTokens,
  clearTokens,
} = jest.requireActual('./');

import { Platform } from 'react-native';

jest.mock('react-native', () => {
  return ({
    NativeModules: {
      OktaSdkBridge: {
        createConfig: jest.fn(),
        signIn: jest.fn(),
        authenticate: jest.fn(),
        signOut: jest.fn(),
        getAccessToken: jest.fn(),
        getIdToken: jest.fn(),
        getUser: jest.fn(),
        isAuthenticated: jest.fn(),
        revokeAccessToken: jest.fn(),
        revokeIdToken: jest.fn(),
        revokeRefreshToken: jest.fn(),
        introspectAccessToken: jest.fn(),
        introspectIdToken: jest.fn(),
        introspectRefreshToken: jest.fn(),
        refreshTokens: jest.fn(),
        clearTokens: jest.fn(),
      },
    },
    Platform: {
      OS: 'ios',
      select: jest.fn()
    },
    NativeEventEmitter: jest.fn(),
  });
});

describe('OktaReactNative', () => {

  describe('createConfigTest', () => {
    let mockCreateConfig;

    const config = {
      clientId: 'dummy_client_id',
      redirectUri: 'dummy://redirect', 
      endSessionRedirectUri: 'dummy://endSessionRedirect', 
      discoveryUri: 'https://dummy_issuer',
      scopes: ['scope1'],
      requireHardwareBackedKeyStore: true
    };

    beforeEach(() => {
      mockCreateConfig = require('react-native').NativeModules.OktaSdkBridge.createConfig;
    });
    
    it('passes in correct parameters on ios device', () => {
      Platform.OS = 'ios';
      const processedScope = config.scopes.join(' ');
      createConfig(config);
      expect(mockCreateConfig).toHaveBeenCalledWith(
        config.clientId,
        config.redirectUri,
        config.endSessionRedirectUri,
        config.discoveryUri,
        processedScope,
      );
    });

    it('passes in correct parameters on android device', () => {
      Platform.OS = 'android';
      createConfig(config);
      expect(mockCreateConfig).toHaveBeenCalledWith(
        config.clientId,
        config.redirectUri,
        config.endSessionRedirectUri,
        config.discoveryUri,
        config.scopes,
        config.requireHardwareBackedKeyStore,
      );
    });
  });

  describe('signInTest', () => {
    let mockSignIn;

    beforeEach(() => {
      mockSignIn = require('react-native').NativeModules.OktaSdkBridge.signIn;
    });

    it('calls native sign in method', () => {
      signIn();
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
  });

  describe('authenticateTest', () => {
    let mockAuthenticate;

    beforeEach(() => {
      mockAuthenticate = require('react-native').NativeModules.OktaSdkBridge.authenticate;
    });

    it('calls native authenticate method', () => {
      authenticate({sessionToken: 'sessionToken'});
      expect(mockAuthenticate).toHaveBeenCalledTimes(1);
    });
  });

  describe('signOutTest', () => {
    let mockSignOut;

    beforeEach(() => {
      mockSignOut = require('react-native').NativeModules.OktaSdkBridge.signOut;
    });

    it('calls native sign out method', () => {
      signOut();
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('getAccessTokenTest', () => {
    let mockGetAccessToken;

    beforeEach(() => {
      mockGetAccessToken = require('react-native').NativeModules.OktaSdkBridge.getAccessToken;
    });

    it('gets access token successfully', async () => {
      mockGetAccessToken.mockReturnValueOnce('dummy_access_token');
      expect.assertions(1);
      const data = await getAccessToken();
      expect(data).toEqual('dummy_access_token');
    });
  });

  describe('getIdTokenTest', () => {
    let mockGetIdToken;

    beforeEach(() => {
      mockGetIdToken = require('react-native').NativeModules.OktaSdkBridge.getIdToken;
    });

    it('gets id token successfully', async () => {
      mockGetIdToken.mockReturnValueOnce('dummy_id_token');
      expect.assertions(1);
      const data = await getIdToken();
      expect(data).toEqual('dummy_id_token');
    });
  });

  describe('getUserTest', () => {
    let mockGetUser;

    beforeEach(() => {
      mockGetUser = require('react-native').NativeModules.OktaSdkBridge.getUser;
    });

    it('gets id token successfully', async () => {
      mockGetUser.mockReturnValueOnce({
        'name': 'Joe Doe',
        'sub': '00uid4BxXw6I6TV4m0g3',
      });
      expect.assertions(1);
      const data = await getUser();
      expect(data).toEqual({
        'name': 'Joe Doe',
        'sub': '00uid4BxXw6I6TV4m0g3',
      });
    });
  });

  describe('getUserFromIdToken', () => {
    let mockGetIdToken;
    let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoiYiJ9.jiMyrsmD8AoHWeQgmxZ5yq8z0lXS67_QGs52AzC8Ru8';

    beforeEach(() => {
      mockGetIdToken = require('react-native').NativeModules.OktaSdkBridge.getIdToken;
    });

    it('gets user from id token successfully', async () => {
      mockGetIdToken.mockReturnValueOnce({
        'id_token': token,
      });
      expect.assertions(1);
      const data = await getUserFromIdToken();
      expect(data).toEqual({
        a: 'b',
      });
    });
  });

  describe('isAuthenticatedTest', () => {
    let mockIsAuthenticated;

    beforeEach(() => {
      mockIsAuthenticated = require('react-native').NativeModules.OktaSdkBridge.isAuthenticated;
    });

    it('is authenticated', async () => {
      mockIsAuthenticated.mockReturnValueOnce(true);
      expect.assertions(1);
      const data = await isAuthenticated();
      expect(data).toEqual(true);
    });
  });

  describe('revokeAccessTokenTest', () => {
    let mockRevokeAccessToken;

    beforeEach(() => {
      mockRevokeAccessToken = require('react-native').NativeModules.OktaSdkBridge.revokeAccessToken;
    });

    it('successfully revokes access token', async () => {
      mockRevokeAccessToken.mockReturnValueOnce(true);
      expect.assertions(1);
      const data = await revokeAccessToken();
      expect(data).toEqual(true);
    });
  });

  describe('revokeIdTokenTest', () => {
    let mockRevokeIdToken;

    beforeEach(() => {
      mockRevokeIdToken = require('react-native').NativeModules.OktaSdkBridge.revokeIdToken;
    });

    it('successfully revokes id token', async () => {
      mockRevokeIdToken.mockReturnValueOnce(true);
      expect.assertions(1);
      const data = await revokeIdToken();
      expect(data).toEqual(true);
    });
  });

  describe('revokeRefreshTokenTest', () => {
    let mockRevokeIdToken;

    beforeEach(() => {
      mockRevokeIdToken = require('react-native').NativeModules.OktaSdkBridge.revokeRefreshToken;
    });

    it('successfully revokes id token', async () => {
      mockRevokeIdToken.mockReturnValueOnce(true);
      expect.assertions(1);
      const data = await revokeRefreshToken();
      expect(data).toEqual(true);
    });
  });

  describe('introspectAccessTokenTest', () => {
    let mockIntrospectAccessToken;

    beforeEach(() => {
      mockIntrospectAccessToken = require('react-native').NativeModules.OktaSdkBridge.introspectAccessToken;
    });

    it('introspects the access token', async () => {
      mockIntrospectAccessToken.mockReturnValueOnce({
        'active': true,
        'token_type': 'Bearer',
        'client_id': 'dummy_client_id'
      });
      expect.assertions(1);
      const data = await introspectAccessToken();
      expect(data).toEqual({
        'active': true,
        'token_type': 'Bearer',
        'client_id': 'dummy_client_id'
      });
    });
  });

  describe('introspectIdTokenTest', () => {
    let mockIntrospectIdToken;

    beforeEach(() => {
      mockIntrospectIdToken = require('react-native').NativeModules.OktaSdkBridge.introspectIdToken;
    });

    it('introspects the id token', async () => {
      mockIntrospectIdToken.mockReturnValueOnce({
        'active': true,
        'client_id': 'dummy_client_id'
      });
      expect.assertions(1);
      const data = await introspectIdToken();
      expect(data).toEqual({
        'active': true,
        'client_id': 'dummy_client_id'
      });
    });
  });

  describe('introspectRefreshTokenTest', () => {
    let mockIntrospectRefreshToken;

    beforeEach(() => {
      mockIntrospectRefreshToken = require('react-native').NativeModules.OktaSdkBridge.introspectRefreshToken;
    });

    it('introspects the refresh token', async () => {
      mockIntrospectRefreshToken.mockReturnValueOnce({
        'active': true,
        'client_id': 'dummy_client_id'
      });
      expect.assertions(1);
      const data = await introspectRefreshToken();
      expect(data).toEqual({
        'active': true,
        'client_id': 'dummy_client_id'
      });
    });
  });

  describe('refreshTokensTest', () => {
    let mockRefreshTokens;

    beforeEach(() => {
      mockRefreshTokens = require('react-native').NativeModules.OktaSdkBridge.refreshTokens;
    });

    it('refreshes tokens', async () => {
      mockRefreshTokens.mockReturnValueOnce(true);
      expect.assertions(1);
      const data = await refreshTokens();
      expect(data).toEqual(true);
    });
  });

  describe('clearTokensTest', () => {
    let mockClearTokens;

    beforeEach(() => {
      mockClearTokens = require('react-native').NativeModules.OktaSdkBridge.clearTokens;
    });

    it('refreshes tokens', async () => {
      mockClearTokens.mockReturnValueOnce(true);
      expect.assertions(1);
      const data = await clearTokens();
      expect(data).toEqual(true);
    });
  });
});

