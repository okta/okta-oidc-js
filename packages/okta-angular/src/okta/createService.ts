import { Injector } from '@angular/core';
import { OktaConfig } from './models/okta.config';
import { OktaAuthService } from './services/okta.service';

export function createOktaService(config: OktaConfig, injector: Injector) {
  return new OktaAuthService(config, injector);
}
