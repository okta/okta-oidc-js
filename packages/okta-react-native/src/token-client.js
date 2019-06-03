/*!
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import jwt from 'jwt-lite';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import {
  assertIssuer,
  assertClientId,
  assertRedirectUri
} from '@okta/configuration-validation';
import * as util from './util';
import * as clientUtil from './token-client-util';
import * as oidc from './oidc';

export default class TokenClient {
  constructor(config = {}) {

    // Assert configuration
    assertIssuer(config.issuer, config.testing);
    assertClientId(config.client_id);
    assertRedirectUri(config.redirect_uri);

    this.issuer = config.issuer;
    this.authorization_endpoint = config.authorization_endpoint;
    delete config.issuer;
    delete config.authorization_endpoint;

    this._authContext = null;
    this._storageKey = config.storageKey || 'authContext';
    this._keychainService = config.keychainService;
    this._keychainAccessible = SecureStore[config.keychainAccessible || 'WHEN_UNLOCKED_THIS_DEVICE_ONLY'];
    delete config.storageKey;
    delete config.keychainService;
    delete config.keychainAccessible;

    this.config = config;
  }

  async isAuthenticated() {
    return !!(await this.getAccessToken()) || !!(await this.getIdToken());
  }

  async signInWithRedirect(options = {}) {
    return oidc.performPkceCodeFlow(this, options, async function redirect(authorizeUri, redirectUri) {
      const result = await WebBrowser.openAuthSessionAsync(authorizeUri, redirectUri);

      if (result.type === 'cancel') {
        throw new Error('User cancelled the auth flow');
      }

      if (result.type !== 'success') {
        throw new Error(`Could not complete auth flow: ${result.url}`);
      }

      return util.urlFormDecode(result.url.split('?')[1]);
    });
  }

  async getIdToken() {
    const authContext = await clientUtil.getAuthContext(this);
    if (!authContext || !authContext.idToken) return;
    if (authContext.idToken.expiresAt < Math.floor(Date.now()/1000)) {
      delete authContext.idToken;
      await clientUtil.setAuthContext(this, authContext);
      return;
    }
    return authContext.idToken.string;
  }

  async getAccessToken() {
    const authContext = await clientUtil.getAuthContext(this);
    if (!authContext || !authContext.accessToken) return;
    if (authContext.accessToken.expiresAt < Math.floor(Date.now()/1000)) {
      delete authContext.accessToken;
      return oidc.refreshAccessToken(this);
    }
    return authContext.accessToken.string;
  }

  async getUser() {
    const accessToken = await this.getAccessToken();
    if (accessToken) {
      const wellKnown = await clientUtil.getWellKnown(this);
      try {
        return await clientUtil.request(`${wellKnown.userinfo_endpoint}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      } catch(e) {
        if (e.name === 'ApiError' && !e.errorCode) {
          const authContext = await clientUtil.getAuthContext(this);
          delete authContext.accessToken;
          await clientUtil.setAuthContext(this, authContext);
          return;
        }
        throw e;
      }
    }
    const idToken = await this.getIdToken();
    if (idToken) {
      return jwt.decode(idToken).claimsSet;
    }
  }

  async signOut() {
    delete this._authContext;
    await SecureStore.deleteItemAsync(this._storageKey);
  }
}
