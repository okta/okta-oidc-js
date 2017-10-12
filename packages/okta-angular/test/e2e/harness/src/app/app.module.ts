import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { environment } from './../environments/environment';

/**
 * Okta Library
 */
import {
  OktaAuthGuard,
  OktaAuthModule,
  OktaCallbackComponent,
  OktaLoginRedirectComponent
} from '@okta/okta-angular';

/**
 * App Components
 */
import { ProtectedComponent } from './protected.component';
import { AppComponent } from './app.component';
import { SessionTokenLogin } from './sessionToken-login.component';

export function onNeedsAuthenticationGuard({ oktaAuth, router }) {
  router.navigate(['/sessionToken-login']);
};

export function onNeedsGlobalAuthenticationGuard({ oktaAuth, router }) {
  router.navigate(['/login']);
};

const appRoutes: Routes = [
  {
    path: 'login',
    component: OktaLoginRedirectComponent
  },
  {
    path: 'sessionToken-login',
    component: SessionTokenLogin
  },
  {
    path: 'implicit/callback',
    component: OktaCallbackComponent
  },
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [ OktaAuthGuard ]
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
  onAuthRequired: onNeedsGlobalAuthenticationGuard
};

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    OktaAuthModule.initAuth(config)
  ],
  declarations: [
    AppComponent,
    ProtectedComponent,
    SessionTokenLogin
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
