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

const { AppPage, OktaSignInPage } = require('@okta/okta-oidc-js.harness/page-objects');

browser.waitForAngularEnabled(false);

describe('Custom login page', () => {
  let appPage;
  let oktaLoginPage;
  let server;

  beforeEach(async () => {
    server = util.createDemoServerWithCustomLoginPage();
    await server.start();

    appPage = new AppPage();
    oktaLoginPage = new OktaSignInPage();
  });

  afterEach(async () => await server.stop());

  it('should use the custom login page for authentication', async () => {
    oktaLoginPage.navigateTo('/login');
    oktaLoginPage.waitUntilVisible();
    oktaLoginPage.signIn({
      username: constants.USERNAME,
      password: constants.PASSWORD
    });

    // Keep the existing wait solution for the short term
    // In the future, look for login/logout buttons like other libs
    await browser.sleep(3000);

    // we should be redirected back to the home page
    const bodyText = await appPage.getBody().getText();
    expect(bodyText).toContain('Welcome home');
  });
});
