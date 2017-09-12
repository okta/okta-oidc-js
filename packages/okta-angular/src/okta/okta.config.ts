import { InjectionToken } from '@angular/core';

export interface OktaConfig {
  issuer?: string;
  redirectUri?: string;
  clientId?: string;
  responseType?: string;
  scopes?: any[];
}

export const OKTA_CONFIG = new InjectionToken<OktaConfig>('okta.config.angular');
