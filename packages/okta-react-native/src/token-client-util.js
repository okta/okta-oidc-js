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

import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import delve from 'dlv';
import TokenVerifier from './token-verifier';
import { ApiError, OidcError } from './errors';
const packageJson = require('../package.json');

export async function request(url, options) {
  let deviceName;
  switch (Platform.OS) {
    case 'ios':
      deviceName = delve(Constants, 'platform.ios.platform');
      break;
    case 'android':
      deviceName = delve(Constants, 'platform.android.versionCode');
      break;
  }
  options = Object.assign({}, options);
  options.headers = Object.assign({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Okta-User-Agent-Extended': `${packageJson.name}/${packageJson.version} ${Platform.OS}/${Platform.Version} ${deviceName || ''}`.trim()
  }, options.headers);
  const resp = await fetch(url, options);
  let json;
  try {
    json = await resp.json();
  } catch(e) {
    throw new Error(`Unable to parse response for ${options.method || 'GET'} ${url}: ${e.message}`);
  }
  if (resp.ok) {
    return json;
  }
  if (json.error) {
    throw new OidcError(json);
  }
  throw new ApiError(json);
}

export async function getWellKnown(client) {
  if (!client._wellKnown) {
    client._wellKnown = await request(`${client.issuer}/.well-known/openid-configuration`);
  }
  return client._wellKnown;
}

export async function getTokenVerifier(client) {
  if (!client._tokenVerifier) {
    const wellKnown = await getWellKnown(client);
    client._tokenVerifier = new TokenVerifier({
      jwks_uri: wellKnown.jwks_uri
    });
  }
  return client._tokenVerifier;
}

export async function getAuthContext(client) {
  if (!client._authContext) {
    try {
      const authContextStr = await SecureStore.getItemAsync('authContext', {
        keychainService: client._keychainService
      });
      client._authContext = authContextStr && JSON.parse(authContextStr);
    } catch (e) {
      throw new Error(`Unable to read tokens: ${e.message}`);
    }
  }
  return client._authContext;
}

export async function setAuthContext(client, authContext) {
  return SecureStore.setItemAsync('authContext', JSON.stringify(authContext), {
    keychainService: client._keychainService,
    keychainAccessible: client._keychainAccessible
  });
}
