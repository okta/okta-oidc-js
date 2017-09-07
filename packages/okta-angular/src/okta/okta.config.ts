import { InjectionToken } from '@angular/core';

export class OktaConfig {
  issuer: string;
  redirectUri: string;
  clientId: string;
}

export const OKTA_CONFIG = new InjectionToken<OktaConfig>('okta.config.angular');
