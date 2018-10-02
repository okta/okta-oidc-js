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

import { Component } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';

import { environment } from './../environments/environment';

import OktaAuth from '@okta/okta-auth-js';

@Component({
  selector: 'app-session-login',
  template: `
  <router-outlet></router-outlet>

  <div>
  <br/>
    <label>
      Username:
      <input #username id="username" type="text" />
      Password:
      <input #password id="password" type="password" />
    </label>
    <button id="submit" (click)="signIn(username.value, password.value)">Login</button>
  </div>
  `
})
export class SessionTokenLoginComponent {
  oktaAuth: OktaAuth;

  constructor(private okta: OktaAuthService) {
    const baseUrl = environment.ISSUER.split('/oauth2')[0];
    this.oktaAuth = new OktaAuth({
      url: baseUrl
    });
  }

  signIn(username, password) {
    this.oktaAuth.signIn({
      username: username,
      password: password
    })
    .then(res => this.okta.loginRedirect('/', {
      sessionToken: res.sessionToken
    }))
    .catch(err => console.log('Found an error', err));
  }
}
