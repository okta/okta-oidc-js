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

import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';

import { OktaAuthService } from './okta.service';

@Injectable()
export class OktaAuthGuard implements CanActivate {
  private oktaAuth: OktaAuthService;

  constructor(private okta: OktaAuthService, private router: Router) {
    this.oktaAuth = okta;
  }

  /**
   * Gateway for protected route. Returns true if there is a valid accessToken,
   * otherwise it will cache the route and start the login flow.
   * @param route 
   * @param state 
   */
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.oktaAuth.isAuthenticated()) {
      return true;
    }

    /**
     * Get the operation to perform on failed authentication from
     * either the global config or route data injection.
     */
    const onAuthRequired = route.data['onAuthRequired'] || this.oktaAuth.getOktaConfig().onAuthRequired;

    if (onAuthRequired){
      onAuthRequired(this.oktaAuth, this.router);
    }

    /** 
     * Store the current path
     */
    this.oktaAuth.setFromUri(state.url);

    /**
     * Redirect to the given path or
     * perform the default Okta full-page redirect.
     */
    if (!onAuthRequired) {
      this.oktaAuth.loginRedirect();
    }

    return false;
  }
}
