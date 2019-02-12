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

import {
  AppPage,
  OktaSignInPage,
  LoginPage,
  ProtectedPage,
  SessionTokenSignInPage
} from './page-objects';

import { environment } from '../src/environments/environment';
import { Utils } from './utils';

describe('Angular + Okta App', () => {
  let page: AppPage;
  let oktaLoginPage: OktaSignInPage;
  let loginPage: LoginPage;
  let protectedPage: ProtectedPage;
  let sessionTokenSignInPage: SessionTokenSignInPage;

  beforeEach(() => {
    page = new AppPage();
    loginPage = new LoginPage();
    oktaLoginPage = new OktaSignInPage();
    protectedPage = new ProtectedPage();
    sessionTokenSignInPage = new SessionTokenSignInPage();
  });

  it('should redirect to Okta for login when trying to access a protected page', () => {
    protectedPage.navigateTo();

    oktaLoginPage.waitUntilVisible(environment.ISSUER);
    oktaLoginPage.signIn({
      username: environment.USERNAME,
      password: environment.PASSWORD
    });

    protectedPage.waitUntilVisible();
    expect(protectedPage.getLogoutButton().isPresent()).toBeTruthy();

    // Verify the user object was returned
    protectedPage.waitUntilTextVisible('userinfo-container', 'email');
    protectedPage.getUserInfo().getText()
    .then(userInfo => {
      expect(userInfo).toContain('email');
    });

    // Logout
    protectedPage.getLogoutButton().click();
    protectedPage.waitForElement('login-button');
    expect(protectedPage.getLoginButton().isPresent()).toBeTruthy();
  });

  /**
   * Hack to slowdown the tests due to the Okta session
   * not being removed in time for the second login call.
   */
  const util = new Utils();
  util.slowDown(100);

  it('should preserve query paramaters after redirecting to Okta', () => {
    protectedPage.navigateToWithQuery();

    oktaLoginPage.waitUntilVisible(environment.ISSUER);
    oktaLoginPage.signIn({
      username: environment.USERNAME,
      password: environment.PASSWORD
    });

    protectedPage.waitUntilQueryVisible();
    expect(protectedPage.getLogoutButton().isPresent()).toBeTruthy();

    // Logout
    protectedPage.getLogoutButton().click();
    protectedPage.waitForElement('login-button');
    expect(protectedPage.getLoginButton().isPresent()).toBeTruthy();
  });

  it('should redirect to Okta for login', () => {
    loginPage.navigateTo();

    oktaLoginPage.waitUntilVisible(environment.ISSUER);
    oktaLoginPage.signIn({
      username: environment.USERNAME,
      password: environment.PASSWORD
    });

    loginPage.waitUntilVisible();
    expect(loginPage.getLogoutButton().isPresent()).toBeTruthy();

    // Logout
    loginPage.getLogoutButton().click();
    loginPage.waitForElement('login-button');
    expect(loginPage.getLoginButton().isPresent()).toBeTruthy();
  });

  it('should allow passing sessionToken to skip Okta login', () => {
    sessionTokenSignInPage.navigateTo();

    sessionTokenSignInPage.waitUntilVisible();
    sessionTokenSignInPage.signIn({
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    });

    page.waitUntilLoggedIn();
    expect(page.getLogoutButton().isPresent()).toBeTruthy();

    // Logout
    page.getLogoutButton().click();
    page.waitForElement('login-button');
    expect(page.getLoginButton().isPresent()).toBeTruthy();
  });
});
