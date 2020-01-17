declare module '@okta/okta-auth-js';

declare interface TokenClaims {
  sub: string;
}

declare interface Token {
  accessToken?: string;
  idToken?: string;
  claims: TokenClaims;
}

declare class TokenManager {
  get(key: string):Token;
  add(key: string, token: Token): void;
}

declare interface TokenAPI {
  getUserInfo(accessToken: Token): Promise;
  getWithRedirect(params: object): Promise;
  parseFromUrl(): Token[]
}

declare class OktaAuth {
  userAgent: string;
  tokenManager: TokenManager;
  token: TokenAPI;
  signOut(options: object): Promise;
}