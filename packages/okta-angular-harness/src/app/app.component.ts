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

import { Component, OnInit } from '@angular/core';

import { OktaAuthService } from '@okta/okta-angular';

@Component({
  selector: 'app-root',
  template: `
  <button id="home-button" routerLink="/"> Home </button>
  <button id="login-button" *ngIf="!isAuthenticated" routerLink="/login"> Login </button>
  <button id="logout-button" *ngIf="isAuthenticated" (click)="logout()"> Logout </button>
  <button id="protected-button" routerLink="/protected"> Protected </button>
  <button id="protected-login-button" routerLink="/protected-with-data"> Protected Page w/ custom config </button>

  <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean;

  constructor(public oktaAuth: OktaAuthService) {
    this.oktaAuth.$authenticationState.subscribe(isAuthenticated => this.isAuthenticated = isAuthenticated);
  }

  async ngOnInit() {
    this.isAuthenticated = await this.oktaAuth.isAuthenticated();
  }

  logout() {
    this.oktaAuth.logout('/');
  }
}
