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

import { browser, protractor } from 'protractor';

export class Utils {

  slowDown(milliseconds) {
    const origFn = browser.driver.controlFlow().execute;

    // Typescript does not allow 'arguments'
    // See: https://github.com/Microsoft/TypeScript/issues/1609#issuecomment-71885490
    browser.driver.controlFlow().execute = function() {
      origFn.call(browser.driver.controlFlow(), function() {
        return protractor.promise.delayed(milliseconds);
      });

      return origFn.apply(browser.driver.controlFlow(), arguments);
    };
  }
}
