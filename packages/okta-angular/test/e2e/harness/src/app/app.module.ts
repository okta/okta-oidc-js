import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Okta Library
import {
  OktaAuthGuard,
  OktaAuthModule,
  OktaCallbackComponent,
  OktaLoginRedirectComponent
} from '../../../../../src/';

// App Components
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
  issuer: 'https://{yourOktaOrg}.com',
  redirectUri: 'http://localhost:3000/implicit/callback',
  clientId: '{clientId}'
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
