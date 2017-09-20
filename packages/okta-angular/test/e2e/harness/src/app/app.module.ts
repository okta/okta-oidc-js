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
  issuer: environment.ISSUER,
  redirectUri: environment.REDIRECT_URI,
  clientId: environment.CLIENT_ID
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
