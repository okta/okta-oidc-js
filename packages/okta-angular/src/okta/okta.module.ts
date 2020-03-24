/*
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

import { NgModule, Injector } from '@angular/core';
import { OktaCallbackComponent } from './components/callback.component';
import { OktaLoginRedirectComponent } from './components/login-redirect.component';
import { OktaAuthService } from './services/okta.service';
import { OktaAuthGuard } from './okta.guard';
import { OKTA_CONFIG } from './models/okta.config';
import { createOktaService } from './createService';

@NgModule({
  declarations: [
    OktaCallbackComponent,
    OktaLoginRedirectComponent,
  ],
  exports: [
    OktaCallbackComponent,
    OktaLoginRedirectComponent,
  ],
  providers: [
    OktaAuthGuard,
    {
      provide: OktaAuthService,
      useFactory: createOktaService,
      deps: [
        OKTA_CONFIG,
        Injector
      ]
    }
  ]
})
export class OktaAuthModule {

}
