import { NgModule } from '@angular/core';

import { OktaCallbackComponent, OktaLoginRedirectComponent } from './components/';
import { OktaAuthService } from './okta.service';
import { OktaAuthGuard } from './okta.guard';
import { OktaConfig, OKTA_CONFIG } from './okta.config';

@NgModule({
  declarations: [
    OktaCallbackComponent,
    OktaLoginRedirectComponent
  ],
  exports: [
    OktaCallbackComponent,
    OktaLoginRedirectComponent
  ]
})
export class OktaAuthModule {
  static initAuth(config: OktaConfig) {
    return {
      ngModule: OktaAuthModule,
      providers: [
        OktaAuthGuard,
        OktaAuthService,
        { provide: OKTA_CONFIG, useValue: config }
      ]
    }
  }
}
