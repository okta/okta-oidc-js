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

import { Inject, Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { OKTA_CONFIG, OktaConfig } from '../models/okta.config';

import packageInfo from '../packageInfo';

/**
 * Import the okta-auth-js library
 */
import * as OktaAuth from '@okta/okta-auth-js';

@Injectable()
export class OktaAuthService {
    private oktaAuth: OktaAuth;
    private config: OktaConfig;

    constructor(@Inject(OKTA_CONFIG) private auth: OktaConfig, private router: Router) {
      const missing: string[] = [];

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

      this.oktaAuth.userAgent = `${packageInfo.name}/${packageInfo.version} ${this.oktaAuth.userAgent}`;

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
    getOktaAuth(): OktaAuth {
      return this.oktaAuth;
    }

    /**
     * Checks if there is a current accessToken in the TokenManager.
     */
    isAuthenticated(): boolean {
      return !!this.oktaAuth.tokenManager.get('accessToken');
    }

    /**
     * Returns the current accessToken in the tokenManager.
     */
    async getAccessToken(): Promise<string | undefined>  {
      const accessToken = this.oktaAuth.tokenManager.get('accessToken');
      return accessToken ? accessToken.accessToken : undefined;
    }

    /**
     * Returns the current idToken in the tokenManager.
     */
    async getIdToken(): Promise<string | undefined> {
      const idToken = this.oktaAuth.tokenManager.get('idToken');
      return idToken ? idToken.idToken : undefined;
    }

    /**
     * Returns user claims from the /userinfo endpoint if an
     * accessToken is provided or parses the available idToken.
     */
    async getUser(): Promise<object> {
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
    getOktaConfig(): OktaConfig {
      return this.config;
    }

    /**
     * Launches the login redirect.
     */
    loginRedirect(additionalParams?: object) {
      this.oktaAuth.token.getWithRedirect({
        responseType: (this.config.responseType || 'id_token token').split(' '),
        // Convert scopes to list of strings
        scopes: this.config.scope.split(' '),
        ...additionalParams
      });
    }

    /**
     * Stores the intended path to redirect after successful login.
     * @param uri
     * @param queryParams
     */
    setFromUri(uri, queryParams) {
      const json = JSON.stringify({
        uri: uri,
        params: queryParams
      });
      localStorage.setItem('referrerPath', json);
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
    async handleAuthentication(): Promise<void> {
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
      const path = JSON.parse(this.getFromUri());
      const navigationExtras: NavigationExtras = {
        queryParams: path.params
      };
      this.router.navigate([path.uri], navigationExtras);
    }

    /**
     * Clears the user session in Okta and removes
     * tokens stored in the tokenManager.
     */
    async logout(): Promise<void> {
      this.oktaAuth.tokenManager.clear();
      await this.oktaAuth.signOut();
    }

    /**
     * Scrub scopes to ensure 'openid' is included
     * @param scopes
     */
    scrubScopes(scopes: string): string {
      if (!scopes) {
        return 'openid email';
      }
      if (scopes.indexOf('openid') === -1) {
        return scopes + ' openid';
      }
      return scopes;
    }
}
