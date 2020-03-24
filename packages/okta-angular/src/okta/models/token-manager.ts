import { UserClaims } from './user-claims';

export interface AccessToken {
  accessToken: string;
}

export interface IDToken {
  idToken: string;
  claims: UserClaims;
}

export type Token = AccessToken | IDToken;

export interface TokenManager {
  get(key: string): Token;
  add(key: string, token: Token): void;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
}
