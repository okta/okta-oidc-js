import { Component } from '@angular/core';

import { OktaAuthService } from '../okta.service';

@Component({template: `` })
export class OktaCallbackComponent {
  constructor(private okta: OktaAuthService) {
    // Handles the response from Okta and parses tokens
    okta.handleAuthentication();
  }
}
