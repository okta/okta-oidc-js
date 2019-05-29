/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { browser, element, by } from 'protractor';
import { Util } from '../util'

export class ProtectedPage {
  navigateTo(path) {
    return browser.get('/protected' + path);
  }

  waitUntilVisible(path) {
    Util.waitUrlContains('/protected' + path);
  }

  waitForElement(id) {
    const el = element(by.id(id));
    Util.waitElement(el);
  }

  getLogoutButton() {
    return element(by.id('logout-button'));
  }

  getLoginButton() {
    return element(by.id('login-button'));
  }

  getUserInfo() {
    return element(by.id('userinfo-container'));
  }
}
