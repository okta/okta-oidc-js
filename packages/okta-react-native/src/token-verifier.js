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

import jwt from 'jwt-lite';
import * as util from './token-client-util';

export default class TokenVerifier {
  constructor(options = {}) {
    if (!options.jwks_uri) {
      throw new Error('Must provide a jwks_uri');
    }
    this._jwks_uri = options.jwks_uri;
  }

  async verify(token) {
    const decoded = jwt.decode(token);
    if (!decoded.header || !decoded.header.kid) {
      throw new Error('No token header kid to verify signature');
    }
    
    // Get the jwks list
    const jwks = await util.request(this._jwks_uri);

    let publicKey;
    for (let key of jwks.keys) {
      if (key.kid === decoded.header.kid) {
        publicKey = key;
        break;
      }
    }
    if (!publicKey) {
      throw new Error(`No key available with an id of ${decoded.header.kid}`);
    }
    try {
      return await jwt.verify(token, publicKey);
    } catch(e) {
      throw new Error(`Unable to verify token: ${e.message}`);
    }
  }
}
