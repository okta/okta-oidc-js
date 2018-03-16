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

import { Inject, Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';

import { OKTA_CONFIG } from './okta.config';

/**
 * Import the okta-auth-js library
 */
import * as OktaAuth from '@okta/okta-auth-js';

@Injectable()
export class OktaAuthService {
    private oktaAuth;
    private config;

    constructor(@Inject(OKTA_CONFIG) private auth, private router: Router) {
      const missing: any[] = [];

      if (!auth.issuer) {
        missing.push('issuer');
      }
      if (!auth.clientId) {
        missing.push('clientId');
      }
      if (!auth.redirectUri) {
        missing.push('redirectUri');
      }

      if (missing.length) {
        throw new Error(`${missing.join(', ')} must be defined`);
      }

      this.oktaAuth = new OktaAuth({
        url: auth.issuer.split('/oauth2/')[0],
        clientId: auth.clientId,
        issuer: auth.issuer,
        redirectUri: auth.redirectUri
      });

      /**
       * Scrub scopes to ensure 'openid' is included
       */
      auth.scope = this.scrubScopes(auth.scope);

      /**
       * Cache the auth config.
       */
      this.config = auth;
    }

    /**
     * Returns the OktaAuth object to handle flows outside of this lib.
     */
    getOktaAuth() {
      return this.oktaAuth;
    }

    /**
     * Checks if there is a current accessToken in the TokenManager.
     */
    isAuthenticated() {
      return !!this.oktaAuth.tokenManager.get('accessToken');
    }

    /**
     * Returns the current accessToken in the tokenManager.
     */
    getAccessToken() {
      return this.oktaAuth.tokenManager.get('accessToken');
    }

    /**
     * Returns the current idToken in the tokenManager.
     */
    getIdToken() {
      return this.oktaAuth.tokenManager.get('idToken');
    }

    /**
     * Returns user claims from the /userinfo endpoint if an
     * accessToken is provided or parses the available idToken.
     */
    async getUser() {
      const accessToken = this.oktaAuth.tokenManager.get('accessToken');
      const idToken = this.oktaAuth.tokenManager.get('idToken');
      if (accessToken && idToken) {
        const userinfo = await this.oktaAuth.token.getUserInfo(accessToken);
        if (userinfo.sub === idToken.claims.sub) {
          // Only return the userinfo response if subjects match to
          // mitigate token substitution attacks
          return userinfo;
        }
      }
      return idToken ? idToken.claims : undefined;
    }

    /**
     * Returns the configuration object used.
     */
    getOktaConfig(){
      return this.config;
    }

    /**
     * Launches the login redirect.
     */
    loginRedirect(additionalParams?: object) {
      this.oktaAuth.token.getWithRedirect({
        responseType: ['id_token', 'token'],
        // Convert scopes to list of strings
        scopes: this.config.scope.split(' '),
        ...additionalParams
      });
    }

    /**
     * Stores the intended path to redirect after successful login.
     * @param uri 
     */
    setFromUri(uri) {
      localStorage.setItem('referrerPath', uri);
    }

    /**
     * Returns the referrer path from localStorage or app root.
     */
    getFromUri() {
      const path = localStorage.getItem('referrerPath') || '/';
      localStorage.removeItem('referrerPath');
      return path;
    }

    /**
     * Parses the tokens from the callback URL.
     */
    async handleAuthentication() {
      const tokens = await this.oktaAuth.token.parseFromUrl();
      tokens.forEach(token => {
        if (token.idToken) {
          this.oktaAuth.tokenManager.add('idToken', token);
        }
        if (token.accessToken) {
          this.oktaAuth.tokenManager.add('accessToken', token);
        }
      });

      /**
       * Navigate back to the initial view or root of application.
       */
      this.router.navigate([this.getFromUri()]);
    }

    /**
     * Clears the user session in Okta and removes
     * tokens stored in the tokenManager.
     */
    async logout() {
      this.oktaAuth.tokenManager.clear();
      await this.oktaAuth.signOut();
    }

    /**
     * Scrub scopes to ensure 'openid' is included
     */
    scrubScopes(scopes) {
      if (!scopes) {
        return 'openid email';
      } else {
        // Make sure object is a string
        scopes = Array.isArray(scopes) ? scopes.join(' ') : scopes
      }
      if (scopes.indexOf('openid') === -1) {
        return scopes + ' openid';
      }
      return scopes;
    }
}
