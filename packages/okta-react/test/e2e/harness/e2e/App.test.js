/*!
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
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
  ProtectedPage,
  SessionTokenSignInPage
} from './page-objects';

describe('React + Okta App', () => {
  let appPage;
  let oktaLoginPage;
  let protectedPage;
  let sessionTokenSignInPage;

  beforeEach(() => {
    appPage = new AppPage();
    oktaLoginPage = new OktaSignInPage();
    protectedPage = new ProtectedPage();
    sessionTokenSignInPage = new SessionTokenSignInPage();
  });

  it('should redirect to Okta for login when trying to access a protected page', () => {
    protectedPage.navigateTo();

    oktaLoginPage.waitUntilVisible();
    oktaLoginPage.signIn({
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    });

    protectedPage.waitUntilVisible();
    expect(protectedPage.getLogoutButton().isPresent()).toBeTruthy();

    protectedPage.waitForElement('userinfo-container');
    protectedPage.getUserInfo().getText()
    .then(userInfo => {
      expect(userInfo).toContain('email');
    });

    // Logout
    protectedPage.getLogoutButton().click();

    appPage.waitUntilLoggedOut();
  });

  it('should redirect to Okta for login', () => {
    appPage.navigateTo();

    appPage.waitUntilVisible();

    appPage.getLoginButton().click();

    oktaLoginPage.waitUntilVisible();

    oktaLoginPage.signIn({
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    });

    appPage.waitUntilVisible();
    expect(protectedPage.getLogoutButton().isPresent()).toBeTruthy();

    // Logout
    appPage.getLogoutButton().click();

    appPage.waitUntilLoggedOut();
  });

  it('should allow passing sessionToken to skip Okta login', () => {
    sessionTokenSignInPage.navigateTo();

    sessionTokenSignInPage.waitUntilVisible();

    sessionTokenSignInPage.signIn({
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    });

    appPage.waitUntilLoggedIn();
    expect(appPage.getLogoutButton().isPresent()).toBeTruthy();

    // Logout
    appPage.getLogoutButton().click();

    appPage.waitUntilLoggedOut();
  });
});
