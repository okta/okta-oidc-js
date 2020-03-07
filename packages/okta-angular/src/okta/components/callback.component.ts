/*
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

import { Component, OnInit } from '@angular/core';

import { OktaAuthService } from '../services/okta.service';

@Component({
  template: `<div>{{error}}</div>`
})
export class OktaCallbackComponent implements OnInit {
  error: string;

  constructor(private okta: OktaAuthService) {}

  async ngOnInit() {
    /**
     * Handles the response from Okta and parses tokens.
     */
    return this.okta.handleAuthentication()
      .then(() => {
        /**
         * Navigate back to the saved uri, or root of application.
         */
        const fromUri = this.okta.getFromUri();
        window.location.replace(fromUri);
      })
      .catch(e => {
        this.error = e.toString();
      });
  }
}
