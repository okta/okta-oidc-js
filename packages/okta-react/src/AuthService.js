/*
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import {
  assertIssuer,
  assertClientId,
  assertRedirectUri,
  buildConfigObject
} from '@okta/configuration-validation';
import OktaAuth from '@okta/okta-auth-js';

import packageInfo from './packageInfo';

class AuthService {
  constructor(config) {
    const testing = {
      // If the config is undefined, cast it to false
      disableHttpsCheck: !!config.disableHttpsCheck
    };

    // normalize authJS config. In this SDK, we allow underscore on certain properties, but AuthJS consistently uses camel case.
    const authConfig = buildConfigObject(config);
    assertIssuer(authConfig.issuer, testing);
    assertClientId(authConfig.clientId);
    assertRedirectUri(authConfig.redirectUri);

    // Automatically enter login flow if session has expired or was ended outside the application
    // The default behavior can be overriden by passing your own function via config: `config.onSessionExpired`
    if (!authConfig.onSessionExpired) {
      authConfig.onSessionExpired = this.login.bind(this);
    }

    this._oktaAuth = new OktaAuth(authConfig);
    this._oktaAuth.userAgent = `${packageInfo.name}/${packageInfo.version} ${this._oktaAuth.userAgent}`;
    this._config = authConfig; // use normalized config
    this._listeners = {};
    this._pending = {}; // manage overlapping async calls 

    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.updateAuthState = this.updateAuthState.bind(this);
    this.clearAuthState = this.clearAuthState.bind(this);
    this.emitAuthState = this.emitAuthState.bind(this);
    this.getAuthState = this.getAuthState.bind(this);
    this.getUser = this.getUser.bind(this);
    this.getIdToken = this.getIdToken.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this._convertLogoutPathToOptions = this._convertLogoutPathToOptions.bind(this);
    this.redirect = this.redirect.bind(this);
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);

    this._subscriberCount = 0;

    this.clearAuthState();
  }

  getTokenManager() {
    return this._oktaAuth.tokenManager;
  }

  async handleAuthentication() {
    if(this._pending.handleAuthentication) { 
      // Don't trigger second round
      return null;
    }
    try { 
      this._pending.handleAuthentication = true;
      const {tokens} = await this._oktaAuth.token.parseFromUrl();

      if (tokens.idToken) {
        this._oktaAuth.tokenManager.add('idToken', tokens.idToken);
      }
      if (tokens.accessToken) {
        this._oktaAuth.tokenManager.add('accessToken', tokens.accessToken);
      }

      await this.updateAuthState();
      const authState = this.getAuthState();
      if(authState.isAuthenticated) { 
        const location = this.getFromUri();
        window.location.assign(location);
      }
      this._pending.handleAuthentication = null;
    } catch(error) { 
      this._pending.handleAuthentication = null;
      this.emitAuthState({ 
        isAuthenticated: false,
        error,
        idToken: null,
        accessToken: null,
      });
    } 
    return;
  }

  clearAuthState(state={}) { 
    this.emitAuthState({ ...AuthService.DEFAULT_STATE, ...state });
    return;
  }

  emitAuthState(state) { 
    this._authState = state;
    this.emit('authStateChange', this.getAuthState());
    return;
  }

  getAuthState() { 
    return this._authState;
  }

  async updateAuthState() {
    // avoid concurrent updates
    if( this._pending.authStateUpdate ) { 
      return this._pending.authStateUpdate.promise;
    }

    // create a promise to return in case of multiple parallel requests
    this._pending.authStateUpdate = {};
    this._pending.authStateUpdate.promise  = new Promise( (resolve) => {
      // Promise can only resolve, any error is in the resolve value
      // and uncaught exceptions make Front SDKs angry
      this._pending.authStateUpdate.resolve = resolve;
    });
    // copy to return after emitAuthState has cleared the pending object
    const authStateUpdate = this._pending.authStateUpdate;

    try { 
      const accessToken = await this.getAccessToken();
      const idToken = await this.getIdToken();

      // Use external check, or default to isAuthenticated if either the access or id token exist
      const isAuthenticated = this._config.isAuthenticated ? await this._config.isAuthenticated() : !! ( accessToken || idToken );

      this._pending.authStateUpdate = null;
      this.emitAuthState({ 
        isAuthenticated,
        idToken,
        accessToken,
      });
    } catch (error) { 
      this._pending.authStateUpdate = null;
      this.emitAuthState({ 
        isAuthenticated: false,
        error,
        idToken: null,
        accessToken: null,
      });
    } 
    authStateUpdate.resolve();
    return authStateUpdate.promise;
  }

  async getUser() {
    const accessToken = await this._oktaAuth.tokenManager.get('accessToken');
    const idToken = await this._oktaAuth.tokenManager.get('idToken');
    if (!accessToken || !idToken) { 
      return idToken ? idToken.claims : undefined;
    }

    return this._oktaAuth.token.getUserInfo();
  }

  async getIdToken() {
    try {
      const idToken = await this._oktaAuth.tokenManager.get('idToken');
      return idToken.idToken;
    } catch (err) {
      // The user no longer has an existing SSO session in the browser.
      // (OIDC error `login_required`)
      // Ask the user to authenticate again.
      return undefined;
    }
  }

  async getAccessToken() {
    try {
      const accessToken = await this._oktaAuth.tokenManager.get('accessToken');
      return accessToken.accessToken;
    } catch (err) {
      // The user no longer has an existing SSO session in the browser.
      // (OIDC error `login_required`)
      // Ask the user to authenticate again.
      return undefined;
    }
  }

  async login(fromUri, additionalParams) {
    // Save the current url before redirect
    this.setFromUri(fromUri); // will save current location if fromUri is undefined
    if (this._config.onAuthRequired) {
      return this._config.onAuthRequired(this);
    }
    return this.redirect(additionalParams);
  }

  _convertLogoutPathToOptions(redirectUri) { 
    if (typeof redirectUri !== 'string') {
      return redirectUri;
    }
    // If a relative path was passed, convert to absolute URI
    if (redirectUri.charAt(0) === '/') {
      redirectUri = window.location.origin + redirectUri;
    }
    return {
      postLogoutRedirectUri: redirectUri,
    };
  }

  async logout(options={}) {
    options = this._convertLogoutPathToOptions(options);
    await this._oktaAuth.signOut(options);
    this.clearAuthState();
  }

  async redirect(additionalParams = {}) {
    // normalize config object
    let params = buildConfigObject(additionalParams);

    // set defaults
    params.responseType = params.responseType
      || this._config.responseType
      || ['id_token', 'token'];

    params.scopes = params.scopes
      || this._config.scopes
      || ['openid', 'email', 'profile'];

    return this._oktaAuth.token.getWithRedirect(params);
  }

  setFromUri(fromUri) {
    // Use current location if fromUri was not passed
    fromUri = fromUri || window.location.href;
    // If a relative path was passed, convert to absolute URI
    if (fromUri.charAt(0) === '/') {
      fromUri = window.location.origin + fromUri;
    }
    localStorage.setItem( 'secureRouterReferrerPath', fromUri );
  }

  getFromUri() {
    const referrerKey = 'secureRouterReferrerPath';
    const location = localStorage.getItem(referrerKey) || window.location.origin;
    localStorage.removeItem(referrerKey);
    return location;
  }

  on( event, callback ) {
    const subscriberId = this._subscriberCount++;
    this._listeners[event] = this._listeners[event] || {};
    this._listeners[event][subscriberId] = callback;
    return () => { 
      delete this._listeners[event][subscriberId];
    }
  }

  emit(event, message ) { 
    this._listeners[event] = this._listeners[event] || {};
    Object.values(this._listeners[event]).forEach( listener => listener(message) );
  }
  
}

AuthService.DEFAULT_STATE = { 
  isPending: true,
  isAuthenticated: null,
  idToken: null,
  accessToken: null,
};

export default AuthService;
