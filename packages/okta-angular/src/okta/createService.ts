import { OktaConfig } from './models/okta.config';
import { Router } from '@angular/router';
import { OktaAuthService } from './services/okta.service';

export function createOktaService(config:OktaConfig, router:Router) {
  return new OktaAuthService(config, router);
}