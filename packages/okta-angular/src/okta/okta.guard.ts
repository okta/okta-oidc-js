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

import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';

import { OktaAuthService } from './services/okta.service';
import { AuthRequiredFunction } from './models/auth-required-function';

@Injectable()
export class OktaAuthGuard implements CanActivate {
  constructor(private oktaAuth: OktaAuthService, private router: Router) { }

  /**
   * Gateway for protected route. Returns true if there is a valid accessToken,
   * otherwise it will cache the route and start the login flow.
   * @param route
   * @param state
   */
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (await this.oktaAuth.isAuthenticated()) {
      return true;
    }

    /**
     * Get the operation to perform on failed authentication from
     * either the global config or route data injection.
     */
    const onAuthRequired: AuthRequiredFunction = route.data['onAuthRequired'] || this.oktaAuth.getOktaConfig().onAuthRequired;

    /**
     * Store the current path
     */
    const path = state.url.split(/[?#]/)[0];
    this.oktaAuth.setFromUri(path, route.queryParams);

    if (onAuthRequired) {
      onAuthRequired(this.oktaAuth, this.router);
    } else {
      this.oktaAuth.loginRedirect();
    }

    return false;
  }
}
