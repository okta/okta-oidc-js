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

const util = require('../util/util');
const constants = require('../util/constants');
const CustomLoginPage = require('../page-objects/CustomLoginPage');
const HomePage = require('../page-objects/HomePage');

browser.waitForAngularEnabled(false);

describe('Custom login page', () => {

  beforeEach(async () => {
    server = util.createDemoServerWithCustomLoginPage();
    await server.start();
  });

  afterEach(async () => await server.stop());

  it('should use the custom login page for authentication', async () => {
    const signInPage = new CustomLoginPage();
    await signInPage.load();
    await browser.sleep(3000);
    await signInPage.waitUntilVisible();

    await signInPage.signIn({
      username: constants.USERNAME,
      password: constants.PASSWORD
    });

    // we should be redirected back to the home page
    const homePage = new HomePage();
    await homePage.waitUntilVisible();
    expect(homePage.getBodyText()).toContain('Welcome home');
  });
});
