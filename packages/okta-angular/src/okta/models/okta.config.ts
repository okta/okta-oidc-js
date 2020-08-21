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

import { InjectionToken, Injector } from '@angular/core';
import { OktaAuthService } from '../services/okta.service';

export type AuthRequiredFunction = (oktaAuth: OktaAuthService, injector: Injector) => void;
export type IsAuthenticatedFunction = (oktaAuth: OktaAuthService) => Promise<boolean>;
export type OnSessionExpiredFunction = () => void;

export interface TestingObject {
  disableHttpsCheck: boolean;
}

export interface TokenManagerConfig {
  autoRenew?: boolean;
  secure?: boolean;
  storage?: string;
}

export interface OktaConfig {
  issuer?: string;
  redirectUri?: string;
  clientId?: string;
  scope?: string;
  scopes?: string[];
  responseType?: any; // can be string or array
  pkce?: boolean;
  onAuthRequired?: AuthRequiredFunction;
  testing?: TestingObject;
  tokenManager?: TokenManagerConfig;
  postLogoutRedirectUri?: string;
  isAuthenticated?: IsAuthenticatedFunction;
  onSessionExpired?: OnSessionExpiredFunction;
}

export const OKTA_CONFIG = new InjectionToken<OktaConfig>('okta.config.angular');
