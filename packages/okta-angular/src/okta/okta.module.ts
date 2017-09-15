/*
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

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
    };
  }
}
