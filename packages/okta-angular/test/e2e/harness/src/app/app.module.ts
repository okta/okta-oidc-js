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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

import { environment } from './../environments/environment';

/**
 * Okta Library
 */
import {
  OktaAuthGuard,
  OktaAuthModule,
  OktaAuthService,
  OktaCallbackComponent,
  OktaLoginRedirectComponent
} from '@okta/okta-angular';

/**
 * App Components
 */
import { ProtectedComponent } from './protected.component';
import { AppComponent } from './app.component';
import { SessionTokenLoginComponent } from './sessionToken-login.component';

export function onNeedsAuthenticationGuard(oktaAuth: OktaAuthService, router: Router) {
  router.navigate(['/sessionToken-login']);
}

export function onNeedsGlobalAuthenticationGuard(oktaAuth: OktaAuthService, router: Router) {
  router.navigate(['/login']);
}

const appRoutes: Routes = [
  {
    path: 'login',
    component: OktaLoginRedirectComponent
  },
  {
    path: 'sessionToken-login',
    component: SessionTokenLoginComponent
  },
  {
    path: 'implicit/callback',
    component: OktaCallbackComponent
  },
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [ OktaAuthGuard ],
    children: [
      {
        path: 'foo',
        component: ProtectedComponent,
        canActivate: [ OktaAuthGuard ]
      }
    ]
  },
  {
    path: 'protected-with-data',
    component: ProtectedComponent,
    canActivate: [ OktaAuthGuard ],
    data: {
      onAuthRequired: onNeedsAuthenticationGuard
    }
  }
];

const config = {
  issuer: environment.ISSUER,
  redirectUri: environment.REDIRECT_URI,
  clientId: environment.CLIENT_ID,
  scope: 'email',
  responseType: 'id_token token',
  onAuthRequired: onNeedsGlobalAuthenticationGuard,
  testing: {
    disableHttpsCheck: false
  }
};

if (environment.OKTA_TESTING_DISABLEHTTPSCHECK) {
  config.testing = {
    disableHttpsCheck: true
  };
}

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    OktaAuthModule.initAuth(config)
  ],
  declarations: [
    AppComponent,
    ProtectedComponent,
    SessionTokenLoginComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
