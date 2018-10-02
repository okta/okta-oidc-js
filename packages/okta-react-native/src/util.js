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

import crypto from 'isomorphic-webcrypto';

export function urlFormEncode(object) {
  const pairs = [];
  for (let key in object) {
    const val = object[key];
    if (val !== undefined) {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    }
  }
  return pairs.join('&');
}

export function urlFormDecode(form) {
  const pairs = form.split('&');
  const object = {};
  for (let pair of pairs) {
    const [key, val] = pair.split('=');
    object[decodeURIComponent(key)] = decodeURIComponent(val.replace(/\+/g, ' '));
  }
  return object;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function createRandomString(length) {
  const random = new Uint8Array(length);
  crypto.getRandomValues(random);
  return Array.from(random).map(c => alphabet[c % alphabet.length]).join('');
}
