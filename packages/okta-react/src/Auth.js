/*
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import OktaAuth from '@okta/okta-auth-js';

import packageInfo from './packageInfo';

const containsAuthTokens = /id_token|access_token|code/;

export default class Auth {
  constructor(config) {
    this._oktaAuth = new OktaAuth({
      url: config.issuer.split('/oauth2/')[0],
      clientId: config.client_id,
      issuer: config.issuer,
      redirectUri: config.redirect_uri
    });
    this._oktaAuth.userAgent = `${packageInfo.name}/${packageInfo.version} ${this._oktaAuth.userAgent}`;
    this._config = config;
    this._history = config.history;

    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getUser = this.getUser.bind(this);
    this.getIdToken = this.getIdToken.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.redirect = this.redirect.bind(this);
  }

  async handleAuthentication() {
    let tokens = await this._oktaAuth.token.parseFromUrl();
    tokens = Array.isArray(tokens) ? tokens : [tokens];
    for (let token of tokens) {
      if (token.idToken) {
        this._oktaAuth.tokenManager.add('idToken', token);
      } else if (token.accessToken) {
        this._oktaAuth.tokenManager.add('accessToken', token);
      }
    }
  }

  async isAuthenticated() {
    // If there could be tokens in the url
    if (location && location.hash && containsAuthTokens.test(location.hash)) return null;
    return !!(await this.getAccessToken()) || !!(await this.getIdToken());
  }

  async getUser() {
    const accessToken = this._oktaAuth.tokenManager.get('accessToken');
    const idToken = this._oktaAuth.tokenManager.get('idToken');
    if (accessToken && idToken) {
      const userinfo = await this._oktaAuth.token.getUserInfo(accessToken);
      if (userinfo.sub === idToken.claims.sub) {
        // Only return the userinfo response if subjects match to
        // mitigate token substitution attacks
        return userinfo
      }
    }
    return idToken ? idToken.claims : undefined;
  }

  async getIdToken() {
    const idToken = this._oktaAuth.tokenManager.get('idToken');
    return idToken ? idToken.idToken : undefined;
  }

  async getAccessToken() {
    const accessToken = this._oktaAuth.tokenManager.get('accessToken');
    return accessToken ? accessToken.accessToken : undefined;
  }

  async login(fromUri) {
    localStorage.setItem('secureRouterReferrerPath', JSON.stringify(fromUri ? { pathname: fromUri } : this._history.location));
    if (this._config.onAuthRequired) {
      const auth = this;
      const history = this._history;
      return this._config.onAuthRequired({ auth, history });
    }
    await this.redirect();
  }

  async logout(path) {
    this._oktaAuth.tokenManager.clear();
    await this._oktaAuth.signOut();
    this._history.push(path || '/');
  }

  async redirect({sessionToken} = {}) {
    this._oktaAuth.token.getWithRedirect({
      responseType: this._config.response_type || ['id_token', 'token'],
      scopes: this._config.scope || ['openid', 'email', 'profile'],
      sessionToken
    });

    // return a promise that doesn't terminate so nothing
    // happens after setting window.location
    return new Promise((resolve, reject) => {});
  }
};
