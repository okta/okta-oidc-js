import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/**
 * Okta Library
 */
import {
  OktaAuthGuard,
  OktaAuthModule,
  OktaCallbackComponent,
  OktaLoginRedirectComponent
} from '../../../../../src/';

/**
 * App Components
 */
import { ProtectedComponent } from './protected.component';
import { AppComponent } from './app.component';

import { Constants } from '../constants';

const appRoutes: Routes = [
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
    path: 'login',
    component: OktaLoginRedirectComponent
  }
];

const config = {
  issuer: Constants.ISSUER,
  redirectUri: Constants.REDIRECT_URI,
  clientId: Constants.CLIENT_ID
};

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    OktaAuthModule.initAuth(config)
  ],
  declarations: [
    AppComponent,
    ProtectedComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
