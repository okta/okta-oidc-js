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

const JUnitXmlReporter = require('jasmine-reporters').JUnitXmlReporter;
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const { ProtractorBrowserLogReporter } = require('jasmine-protractor-browser-log-reporter');

exports.config = {
  framework: 'jasmine2',
  onPrepare() {
    jasmine.getEnv().addReporter(new ProtractorBrowserLogReporter());
    jasmine.getEnv().addReporter(new JUnitXmlReporter({
      savePath: 'reports/junit',
      filePrefix: 'results',
    }));
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: true
      }
    }));
  },

  jasmineNodeOpts: {
    print: () => {},
    defaultTimeoutInterval: 2 * 60 * 1000 // 2 minutes
  },
  directConnect: true,
  specs: ['specs/*.js'],
  baseUrl: 'http://localhost:8080/',
  loggingPrefs: {
    'browser': 'ALL' // for reporter
  },
  capabilities: {
    browserName: 'chrome',
    loggingPrefs: { "driver": "INFO", "browser": "INFO" }, // for webdriver
    chromeOptions: {
      args: [
        '--headless',
        '--disable-gpu',
        '--window-size=800,600',
        '--no-sandbox'
      ]
     }
  }
}
