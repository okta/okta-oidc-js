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

import { browser, by, element, ExpectedConditions } from 'protractor';

export class OktaSignInPage {
    waitUntilVisible() {
      browser.wait(ExpectedConditions.presenceOf(this.getSubmitButton()), 5000);
    }

    getUsernameField() {
      return element(by.id('okta-signin-username'));
    }

    getPasswordField() {
      return element(by.id('okta-signin-password'));
    }

    getSubmitButton() {
      return element(by.id('okta-signin-submit'));
    }

    signIn({username, password}) {
      this.getUsernameField().sendKeys(username);
      this.getPasswordField().sendKeys(password);
      this.getSubmitButton().click();
    }
}
