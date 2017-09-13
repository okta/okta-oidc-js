import { Component } from '@angular/core';

import { OktaAuthService } from '../okta.service';

@Component({ template: `` })
export class OktaLoginRedirectComponent {
  constructor(private okta: OktaAuthService) {
    okta.loginRedirect();
  }
}
