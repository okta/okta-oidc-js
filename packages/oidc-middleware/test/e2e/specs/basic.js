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
const OktaSignInPage = require('../page-objects/OktaSignInPage');
const ProtectedPage = require('../page-objects/ProtectedPage');
const HomePage = require('../page-objects/HomePage');

browser.waitForAngularEnabled(false);

describe('Basic login redirect', () => {

  let server;
  beforeEach(async () => {
    server = util.createDemoServer();
    await server.start();
  });

  afterEach(async () => await server.stop());

  it('should redirect to Okta if login is required, then return to the protected page', async () => {
    // attempt to navigate to a protected page
    const privatePage = new ProtectedPage();
    await privatePage.load();

    // we're not logged in, so we should redirect
    const signInPage = new OktaSignInPage();
    await signInPage.waitUntilVisible();
    await signInPage.signIn({
      username: constants.USERNAME,
      password: constants.PASSWORD
    });

    // wait for protected page to appear with contents
    await privatePage.waitUntilVisible();
    expect(privatePage.getBodyText()).toContain('sub');

    // navigate to home page
    const homePage = new HomePage();
    await homePage.load();
    await homePage.waitUntilVisible();
    expect(homePage.getBodyText()).toContain('Welcome home');

    // navigate to logout
    await browser.get(constants.LOGOUT_PATH);
    await homePage.waitUntilVisible();
    expect(browser.getPageSource()).not.toContain('Welcome home');
  });
});
