import { BrowserModule }        from '@angular/platform-browser';
import { NgModule }             from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Okta Library
import { 
  OKTA_CONFIG,
  OktaAuthGuard,
  OktaAuthModule,
  OktaAuthService,
  OktaCallbackComponent,
  OktaLoginRedirectComponent
} from '../../../../../src/';

// App Components
import { ProtectedComponent } from './protected.component';
import { AppComponent }       from './app.component';

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
]

const config = {
  issuer: 'https://jordandemo.oktapreview.com',
  redirectUri: 'http://localhost:3000/implicit/callback',
  clientId: '0oab8olsehwF1x7bM0h7'
}

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    OktaAuthModule
  ],
  declarations: [
    AppComponent,
    ProtectedComponent
  ],
  providers: [
    OktaAuthGuard,
    OktaAuthService,
    { provide: OKTA_CONFIG, useValue: config },
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
