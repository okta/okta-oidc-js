import { Inject, Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';

import { OKTA_CONFIG } from './okta.config';

// Import the okta-auth-js library
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

      // Cache the auth config.
      this.config = auth;
    }

    getOktaAuth() {
      // Returns the OktaAuth object to handle flows outside of this lib.
      return this.oktaAuth;
    }

    isAuthenticated() {
      // Checks if there is a current accessToken in the TokenManager.
      return !!this.oktaAuth.tokenManager.get('accessToken');
    }

    getAccessToken() {
      // Returns the current accessToken in the tokenManager.
      return this.oktaAuth.tokenManager.get('accessToken');
    }

    getIdToken() {
      // Returns the current idToken in the tokenManager.
      return this.oktaAuth.tokenManager.get('idToken');
    }

    loginRedirect() {
      // Launches the login redirect.
      this.oktaAuth.token.getWithRedirect({
        responseType: this.config.responseType || ['id_token', 'token'],
        scopes: this.config.scopes || ['openid', 'email', 'profile']
      });
    }

    setFromUri(uri) {
      // Stores the intended path to redirect after successful login.
      localStorage.setItem('referrerPath', uri);
    }

    getFromUri() {
      // Returns the referrer path from localStorage or app root.
      const path = localStorage.getItem('referrerPath') || '/';
      localStorage.removeItem('referrerPath');
      return path;
    }

    async handleAuthentication() {
      // Parses the tokens from the callback URL.
      const tokens = await this.oktaAuth.token.parseFromUrl();
      tokens.forEach(token => {
        if (token.idToken) {
          this.oktaAuth.tokenManager.add('idToken', token);
        }
        if (token.accessToken) {
          this.oktaAuth.tokenManager.add('accessToken', token);
        }
      });

      // Navigate back to the initial view or root of application.
      this.router.navigate([this.getFromUri()]);
    }

    async logout() {
      // Clears the user session in Okta and removes
      // tokens stored in the tokenManager.
      this.oktaAuth.tokenManager.clear();
      await this.oktaAuth.signOut();
    }
}
