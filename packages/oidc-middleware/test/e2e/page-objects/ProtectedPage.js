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

const constants = require('../util/constants');
const EC = protractor.ExpectedConditions;

module.exports = class ProtectedPage {
  constructor() {
    this.body = $('body');
  }

  async load() {
    await browser.get('/protected');
  }

  async waitUntilVisible() {
    await browser.wait(EC.urlIs(constants.BASE_URI + '/protected'), 10000, 'wait for protected url');
  }

  async getBodyText() {
    return this.body.getText();
  }
}
