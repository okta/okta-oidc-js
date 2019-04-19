import Service from '@ember/service';
import { getOwner } from '@ember/application';
import {
  assertIssuer,
  assertClientId,
  assertRedirectUri,
  buildConfigObject,
} from '@okta/configuration-validation';
import * as OktaAuth from '@okta/okta-auth-js';
import Ember from 'ember';
import { inject as service } from '@ember/service';

export default Service.extend({
  router: service(),

  init() {
    this._super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');

    const testing = { disableHttpsCheck: Ember.testing ? true : false };

    // Assert Configuration
    assertIssuer(config.okta.issuer, testing);
    assertClientId(config.okta.clientId);
    assertRedirectUri(config.okta.redirectUri);

    let oktaAuth = new OktaAuth(buildConfigObject(config.okta));

    // how do we get name and version of consuming app? Using Brocfile API?
    //oktaAuth.userAgent = `${name}/${version} ${this.oktaAuth.userAgent}`;

    this.set('oktaAuth', oktaAuth);

    const oktaConfig = Object.assign({}, config.okta);

    const scope = this.checkScope(oktaConfig.scope);

    oktaConfig.scope = scope;
    this.set('oktaConfig', oktaConfig);

    this.isAuthenticated().then(authenticated => {
      this.set('authenticated', authenticated);
    });
  },

  authenticated: false,

  async isAuthenticated() {
    const accessToken = await this.getAccessToken();
    const idToken = await this.getIdToken();
    return !!(accessToken || idToken);
  },

  async getAccessToken() {
    try {
      const accessToken = await this.oktaAuth.tokenManager.get('accessToken');
      return accessToken.accessToken;
    } catch (err) {
      // The user no longer has an existing SSO session in the browser.
      // (OIDC error `login_required`)
      // Ask the user to authenticate again.
      return undefined;
    }
  },

  async getIdToken() {
    try {
      const idToken = await this.oktaAuth.tokenManager.get('idToken');
      return idToken.idToken;
    } catch (err) {
      // The user no longer has an existing SSO session in the browser.
      // (OIDC error `login_required`)
      // Ask the user to authenticate again.
      return undefined;
    }
  },

  async getUser() {
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
  },

  getOktaConfig() {
    return this.oktaConfig;
  },

  loginRedirect(fromRoute, additionalParams) {
    if (fromRoute) {
      this.setFromRoute(fromRoute);
    }

    this.oktaAuth.token.getWithRedirect({
      responseType: (this.oktaConfig.responseType || 'id_token token').split(
        ' '
      ),
      // Convert scopes to list of strings
      scope: this.oktaConfig.scope.split(' '),
      ...additionalParams,
    });
  },

  setFromRoute(route, queryParams) {
    const json = JSON.stringify({
      route: route,
      params: queryParams,
    });

    localStorage.setItem('referrerPath', json);
  },

  getFromRoute() {
    const referrerPath = localStorage.getItem('referrerPath');
    localStorage.removeItem('referrerPath');

    const path = JSON.parse(referrerPath) || { route: '/', params: {} };
    const navigationExtras = {
      queryParams: path.params,
    };

    return {
      route: path.route,
      extras: navigationExtras,
    };
  },

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

    if (await this.isAuthenticated()) {
      this.set('authenticated', true);
    }

    /**
     * Navigate back to the initial view or root of application.
     */
    const fromRoute = this.getFromRoute();

    this.router.transitionTo(fromRoute.route || '/', fromRoute.extras);
  },

  async logout(route) {
    this.oktaAuth.tokenManager.clear();
    await this.oktaAuth.signOut();
    this.set('authenticated', false);
    this.router.transitionTo(route || '/');
  },

  checkScope: scope => {
    if (!scope) {
      return 'openid email';
    } else if (scope.indexOf('openid') === -1) {
      return `${scope} openid`;
    }
    return scope;
  },
});
