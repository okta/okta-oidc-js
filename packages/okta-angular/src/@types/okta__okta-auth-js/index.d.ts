declare module '@okta/okta-auth-js';

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