declare module '@okta/okta-auth-js';

declare interface TokenHash {
  [key: string] : Token;
}
declare interface ParseFromUrlResponse {
  tokens: TokenHash;
  state: string;
}

declare interface TokenAPI {
  getUserInfo(accessToken?: AccessToken, idToken?: IDToken): Promise;
  getWithRedirect(params?: object): Promise;
  parseFromUrl(): ParseFromUrlResponse;
}

declare class OktaAuth {
  userAgent: string;
  tokenManager: TokenManager;
  token: TokenAPI;
  signOut(options: object): Promise;
}