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

import { Inject, Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import {
  assertIssuer,
  assertClientId,
  assertRedirectUri,
  buildConfigObject
} from '@okta/configuration-validation';

import { OKTA_CONFIG, OktaConfig } from '../models/okta.config';
import { UserClaims } from '../models/user-claims';

import packageInfo from '../packageInfo';

/**
 * Import the okta-auth-js library
 */
import * as OktaAuth from '@okta/okta-auth-js';
import { Observable, Observer } from 'rxjs';

@Injectable()
export class OktaAuthService {
    private oktaAuth: OktaAuth;
    private config: OktaConfig;
    private observers: Observer<boolean>[];
    $authenticationState: Observable<boolean>;

    constructor(@Inject(OKTA_CONFIG) private auth: OktaConfig, private router: Router) {
      // Assert Configuration
      assertIssuer(auth.issuer, auth.testing);
      assertClientId(auth.clientId);
      assertRedirectUri(auth.redirectUri)

      this.observers = [];

      this.oktaAuth = new OktaAuth(buildConfigObject(auth));

      this.oktaAuth.userAgent = `${packageInfo.name}/${packageInfo.version} ${this.oktaAuth.userAgent}`;

      /**
       * Scrub scopes to ensure 'openid' is included
       */
      auth.scope = this.scrubScopes(auth.scope);

      /**
       * Cache the auth config.
       */
      this.config = auth;

      this.$authenticationState = new Observable((observer: Observer<boolean>) => {this.observers.push(observer)})
    }

    /**
     * Checks if there is an access token and id token
     */
    async isAuthenticated(): Promise<boolean> {
      const accessToken = await this.getAccessToken()
      const idToken = await this.getIdToken()
      return !!(accessToken || idToken);
    }

    private async emitAuthenticationState(state: boolean) {
      this.observers.forEach(observer => observer.next(state));
    }

    /**
     * Returns the current accessToken in the tokenManager.
     */
    async getAccessToken(): Promise<string | undefined>  {
      try {
        const accessToken = await this.oktaAuth.tokenManager.get('accessToken');
        return accessToken.accessToken;
      } catch (err) {
        // The user no longer has an existing SSO session in the browser.
        // (OIDC error `login_required`)
        // Ask the user to authenticate again.
        return undefined;
      }
    }

    /**
     * Returns the current idToken in the tokenManager.
     */
    async getIdToken(): Promise<string | undefined> {
      try {
        const idToken = await this.oktaAuth.tokenManager.get('idToken');
        return idToken.idToken;
      } catch (err) {
        // The user no longer has an existing SSO session in the browser.
        // (OIDC error `login_required`)
        // Ask the user to authenticate again.
        return undefined;
      }
    }

    /**
     * Returns user claims from the /userinfo endpoint if an
     * accessToken is provided or parses the available idToken.
     */
    async getUser(): Promise<UserClaims|undefined> {
      const accessToken = await this.oktaAuth.tokenManager.get('accessToken');
      const idToken = await this.oktaAuth.tokenManager.get('idToken');
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
     * @param fromUri
     * @param additionalParams
     */
    loginRedirect(fromUri?: string, additionalParams?: object) {
      if (fromUri) {
        this.setFromUri(fromUri);
      }

      const responseType = (this.config.responseType || 'id_token token').split(' ');
      let grantType = this.config.grantType;
      if (!grantType) {
          if (responseType.includes('code')) {
              grantType = 'authorization_code';
          } else {
              grantType = 'implicit';
          }
      }

      this.oktaAuth.token.getWithRedirect({
        responseType,
        grantType,
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
    setFromUri(uri: string, queryParams?: object) {
      const json = JSON.stringify({
        uri: uri,
        params: queryParams
      });
      localStorage.setItem('referrerPath', json);
    }

    /**
     * Returns the referrer path from localStorage or app root.
     */
    getFromUri(): { uri: string, extras: NavigationExtras } {
      const referrerPath = localStorage.getItem('referrerPath');
      localStorage.removeItem('referrerPath');

      const path = JSON.parse(referrerPath) || { uri: '/', params: {} };
      const navigationExtras: NavigationExtras = {
        queryParams: path.params
      };

      return {
        uri: path.uri,
        extras: navigationExtras
      }
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
      if(await this.isAuthenticated()) {
        this.emitAuthenticationState(true)
      }
      /**
       * Navigate back to the initial view or root of application.
       */
      const fromUri = this.getFromUri();
      this.router.navigate([fromUri.uri], fromUri.extras);
    }

    /**
     * Clears the user session in Okta and removes
     * tokens stored in the tokenManager.
     * @param uri
     */
    async logout(uri?: string): Promise<void> {
      this.oktaAuth.tokenManager.clear();
      await this.oktaAuth.signOut();
      this.emitAuthenticationState(false)
      this.router.navigate([uri || '/']);
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
