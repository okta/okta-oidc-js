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

const constants = require('./constants');
const url = require('url');

const util = module.exports;

const DemoServer = require('../harness/server');

const environmentConfig = {
  issuer: constants.ISSUER,
  client_id: constants.CLIENT_ID,
  client_secret: constants.CLIENT_SECRET,
  appBaseUrl: constants.APP_BASE_URL,
  scope: 'profile email openid'
};

util.createDemoServer = (options) => {
  return new DemoServer(Object.assign({}, environmentConfig, options || {}));
};

util.createDemoServerWithCustomLoginPage = (options) => {
  const baseConfig = Object.assign({}, environmentConfig, options || {});
  return new DemoServer(Object.assign(baseConfig, {
    routes: {
      login: {
        viewHandler: (req, res/*, next */) => {
          const baseUrl = url.parse(baseConfig.issuer).protocol + '//' + url.parse(baseConfig.issuer).host;
          res.render('login', {
            csrfToken: req.csrfToken(),
            baseUrl: baseUrl,
            cdnUrl: baseConfig.cdnUrl
          });
        }
      }
    }
  }));
};


util.ensureTrailingSlash = str => {
  if (str.slice(-1) === '/') {
    return str;
  }
  return `${str}/`;
};
