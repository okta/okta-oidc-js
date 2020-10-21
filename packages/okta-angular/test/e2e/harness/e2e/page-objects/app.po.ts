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

import { browser, by, element, ExpectedConditions } from 'protractor';

export class AppPage {
  public path;

  constructor(path: string = '/') {
    this.path = path;
  }

  navigateTo(query: string = '') {
    return browser.get(this.path + query);
  }

  waitUntilVisible(query: string = '') {
    browser.wait(ExpectedConditions.urlContains(this.path + query), 20000);
    const loginExists = ExpectedConditions.presenceOf(this.getLoginButton());
    const logoutExists = ExpectedConditions.presenceOf(this.getLogoutButton());
    browser.wait(ExpectedConditions.or(loginExists, logoutExists), 5000);
  }

  waitUntilLoggedOut() {
    browser.wait(ExpectedConditions.presenceOf(this.getLoginButton()), 20000);
  }

  waitUntilLoggedIn() {
    browser.wait(ExpectedConditions.presenceOf(this.getLogoutButton()), 20000);
  }

  waitUntilTextVisible(id: string, text: string) {
    const el = element(by.id(id));
    browser.wait(ExpectedConditions.textToBePresentInElement(el, text), 5000);
  }

  waitForElement(id: string) {
    const el = element(by.id(id));
    browser.wait(ExpectedConditions.presenceOf(el), 5000);
  }

  getLoginButton() {
    return element(by.id('login-button'));
  }

  getLogoutButton() {
    return element(by.id('logout-button'));
  }

  getProtectedButton() {
    return element(by.id('protected-button'));
  }
}
