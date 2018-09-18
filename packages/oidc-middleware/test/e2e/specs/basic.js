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

const util = require('../util/util');
const constants = require('../util/constants');

const {
  AppPage,
  OktaSignInPage,
  ProtectedPage
} = require('@okta/okta-oidc-js.harness/page-objects');

browser.waitForAngularEnabled(false);

describe('Basic login redirect', () => {
  let appPage;
  let oktaLoginPage;
  let protectedPage;
  let server;

  beforeEach(async () => {
    server = util.createDemoServer();
    await server.start();

    appPage = new AppPage();
    oktaLoginPage = new OktaSignInPage();
    protectedPage = new ProtectedPage();
  });

  afterEach(async () => await server.stop());

  it('should redirect to Okta if login is required, then return to the protected page', async () => {
    protectedPage.navigateTo();

    // we're not logged in, so we should redirect
    oktaLoginPage.waitUntilVisible();
    oktaLoginPage.signIn({
      username: constants.USERNAME,
      password: constants.PASSWORD
    });

    // wait for protected page to appear with contents
    protectedPage.waitUntilVisible();
    const userInfo = await protectedPage.getBody().getText();
    expect(userInfo).toContain('email');
    expect(userInfo).toContain('access_token');
    expect(userInfo).toContain('id_token');

    // navigate to home page
    appPage.navigateTo();

    const bodyText = await appPage.getBody().getText();
    expect(bodyText).toContain('Welcome home');

    // navigate to logout
    await browser.get(constants.LOGOUT_PATH);
    expect(browser.getPageSource()).not.toContain('Welcome home');
  });
});
