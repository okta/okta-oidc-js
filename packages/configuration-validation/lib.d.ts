export type ConfigurationValidationError = Error;

export interface TestingOptions {
  disableHttpsCheck?: boolean;
}

export interface TokenManager {
  autoRenew: boolean;
  storage: any;
}

export interface ClientConfigParams {
  autoRenew?: boolean;
  auto_renew?: boolean;
  clientId?: string;
  client_id?: string;
  issuer: string;
  redirectUri?: string;
  redirect_uri?: string;
  storage: any;
}

export interface ClientConfig {
  clientId: string;
  issuer: string;
  redirectUri: string;
  tokenManager: TokenManager;
}

export function buildConfigObject(config: ClientConfigParams): ClientConfig;

export function assertIssuer(issuer: string, testing?: TestingOptions): void;

export function assertClientId(clientId: string): void;

export function assertClientSecret(clientSecret: string): void;

export function assertRedirectUri(redirectUri: string): void;

export function assertAppBaseUrl(appBaseUrl: string): void;
