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
const util = require('../util/util');
let widgetVersion = '5.4.2';
const options = {};

// This is used as PDV for widget after artifact promotion to CDN
if(process.env.NPM_TARBALL_URL) {
  // Extract the version of sign-in widget from the NPM_TARBALL_URL variable
  // The variable is of the format https:<artifactory_url>/@okta/okta-signin-widget-3.0.6.tgz
  const url = process.env.NPM_TARBALL_URL;
  const i = url.lastIndexOf('-');
  widgetVersion = url.substring(i + 1, url.length - 4);

  // We also test i18n assets on CDN
  options.language = 'fr';
  options.i18n = {
    fr: {
      'primaryauth.title': 'Connectez-vous à Acme',
    }
  }
}

const cdnUrl = `https://global.oktacdn.com/okta-signin-widget/${widgetVersion}`;
console.log(`Using CDN url - ${cdnUrl}`);

const serverOptions = {
  issuer: constants.ISSUER,
  client_id: constants.CLIENT_ID,
  client_secret: constants.CLIENT_SECRET,
  appBaseUrl: constants.APP_BASE_URL,
  testing: {
    disableHttpsCheck: constants.OKTA_TESTING_DISABLEHTTPSCHECK
  },
  cdnUrl: cdnUrl,
  options: options
}

console.log('serverOptions', serverOptions);
let server = util.createDemoServerWithCustomLoginPage(serverOptions);
server.start();
