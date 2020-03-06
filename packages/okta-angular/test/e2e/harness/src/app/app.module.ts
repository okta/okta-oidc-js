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
import { NgModule, Injector } from '@angular/core';
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
  OktaLoginRedirectComponent,
  OKTA_CONFIG
} from '@okta/okta-angular';

/**
 * App Components
 */
import { ProtectedComponent } from './protected.component';
import { AppComponent } from './app.component';
import { SessionTokenLoginComponent } from './sessionToken-login.component';

export function onNeedsAuthenticationGuard(oktaAuth: OktaAuthService, injector: Injector) {
  const router = injector.get(Router);
  router.navigate(['/sessionToken-login']);
}

export function onNeedsGlobalAuthenticationGuard(oktaAuth: OktaAuthService, injector: Injector) {
  const router = injector.get(Router);
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
    path: 'pkce/callback',
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

// To perform end-to-end PKCE flow we must be configured on both ends: when the login is initiated, and on the callback
// The login page is loaded with a query param. This will select a unique callback url
// On the callback load we detect PKCE by inspecting the pathname
const url = new URL(window.location.href);
const pkce = !!url.searchParams.get('pkce') || url.pathname.indexOf('pkce/callback') >= 0;
const redirectUri = window.location.origin + (pkce ? '/pkce/callback' : '/implicit/callback');

const config = {
  issuer: environment.ISSUER,
  pkce,
  redirectUri,
  clientId: environment.CLIENT_ID,
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
    OktaAuthModule
  ],
  declarations: [
    AppComponent,
    ProtectedComponent,
    SessionTokenLoginComponent
  ],
  providers: [{
    provide: OKTA_CONFIG,
    useValue: config
  }],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
