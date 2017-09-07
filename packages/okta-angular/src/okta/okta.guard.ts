import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import { OktaAuthService } from './okta.service';

@Injectable()
export class OktaAuthGuard implements CanActivate {
  authenticated;
  oktaAuth;

  constructor(private okta: OktaAuthService, private router: Router) {
    this.oktaAuth = okta;
    this.authenticated = okta.isAuthenticated();
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authenticated) {
      return true;
    }

    // Store the current path
    this.oktaAuth.setFromUri(state.url);

    // Redirect to login flow.
    this.oktaAuth.login();
    return false;
  }
}
