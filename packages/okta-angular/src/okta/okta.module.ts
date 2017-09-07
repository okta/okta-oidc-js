import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { OktaCallbackComponent, OktaLoginRedirectComponent } from './components/';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    OktaCallbackComponent,
    OktaLoginRedirectComponent
  ],
  exports: [
    OktaCallbackComponent,
    OktaLoginRedirectComponent
  ]
})
export class OktaAuthModule {}
