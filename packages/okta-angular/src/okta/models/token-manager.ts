import { UserClaims } from './user-claims';

export interface AccessToken {
  accessToken: string;
}

export interface IDToken {
  idToken: string;
  claims: UserClaims;
}

export interface TokenManager {
  get(key: string): AccessToken | IDToken;
  add(key: string, token: AccessToken | IDToken): void;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
}
