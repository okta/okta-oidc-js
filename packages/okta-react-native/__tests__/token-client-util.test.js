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
  mockFetch,
  clearMocks,
  setMocks,
  rateLimitError
} from '../__mocks__/mocks';
import { Platform } from 'react-native';
import TokenClient from '../src/token-client';
import * as tokenClientUtil from '../src/token-client-util';
const packageJson = require('../package.json');

beforeEach(() => {
  clearMocks();
  setMocks();
});

describe('TokenClientUtil', () => {
  let context;
  beforeEach(() => {
    context = {};
    context.tokenClient = new TokenClient({
      issuer: 'https://dummy_issuer',
      redirect_uri: 'dummy://redirect',
      client_id: 'dummy_client_id'
    });
  });

  describe('request', () => {
    it('sends correct user-agent for iOS', async () => {
      Object.getOwnPropertyDescriptor(Platform, 'OS').get.mockReturnValue('ios');
      mockFetch([
        {
          req: {
            url: 'https://dummy_issuer/.well-known/openid-configuration',
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Okta-User-Agent-Extended': `@okta/okta-react-native/${packageJson.version} ios/test-version ios-platform`,
            }
          }
        }
      ]);
      // Anything to make a well-known request
      await tokenClientUtil.getWellKnown(context.tokenClient);
    });
    it('sends correct user-agent for Android', async () => {
      Object.getOwnPropertyDescriptor(Platform, 'OS').get.mockReturnValue('android');
      mockFetch([
        {
          req: {
            url: 'https://dummy_issuer/.well-known/openid-configuration',
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Okta-User-Agent-Extended': `@okta/okta-react-native/${packageJson.version} android/test-version android-platform`,
            }
          }
        }
      ]);
      // Anything to make a well-known request
      await tokenClientUtil.getWellKnown(context.tokenClient);
    });
    it('throws an error if unable to parse response', async () => {
      return expect(tokenClientUtil.getWellKnown(context.tokenClient))
        .rejects.toThrow('Unable to parse response for GET https://dummy_issuer/.well-known/openid-configuration');
    });
    it('throws an error if an Okta error is returned', async () => {
      mockFetch([
        {
          res: rateLimitError
        }
      ]);
      let error;
      try {
        await tokenClientUtil.getWellKnown(context.tokenClient);
      } catch(e) {
        error = e;
      } finally {
        expect(error).toBeDefined();
        expect(error.name).toEqual('ApiError');
        expect(error.message).toEqual('API call exceeded rate limit due to too many requests.');
        expect(error.errorCode).toEqual('E0000047');
        expect(error.errorSummary).toEqual('API call exceeded rate limit due to too many requests.');
        expect(error.errorLink).toEqual('E0000047');
        expect(error.errorId).toEqual('dummy_error_id');
        expect(error.errorCauses).toEqual([]);
      }
    });
  });
});
