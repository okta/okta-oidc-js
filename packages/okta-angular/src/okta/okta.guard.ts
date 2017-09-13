import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import { OktaAuthService } from './okta.service';

@Injectable()
export class OktaAuthGuard implements CanActivate {
  private oktaAuth: OktaAuthService;

  constructor(private okta: OktaAuthService) {
    this.oktaAuth = okta;
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Gateway for protected route. Returns true if there is a valid accessToken,
    // otherwise it will cache the route and start the login flow.
    if (this.oktaAuth.isAuthenticated()) {
      return true;
    }

    // Store the current path
    this.oktaAuth.setFromUri(state.url);

    // Redirect to login flow.
    this.oktaAuth.loginRedirect();
    return false;
  }
}
