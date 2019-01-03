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

import { browser, element, by, ExpectedConditions } from 'protractor';

export class ProtectedPage {

  navigateTo() {
    return browser.get('/protected');
  }

  navigateToWithQuery() {
    return browser.get('/protected/foo?state=bar');
  }

  waitUntilVisible() {
    browser.wait(ExpectedConditions.urlContains('/protected'), 5000);
  }

  waitUntilQueryVisible() {
    browser.wait(ExpectedConditions.urlContains('/protected/foo?state=bar'), 5000);
  }

  waitUntilTextVisible(id: string, text: string) {
    const el = element(by.id(id));
    browser.wait(ExpectedConditions.textToBePresentInElement(el, text), 5000);
  }

  waitForElement(id: string) {
    const el = element(by.id(id));
    browser.wait(ExpectedConditions.presenceOf(el), 5000);
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
