import { getContext } from '@ember/test-helpers';
import Service from '@ember/service';

let stubbedService = Service.extend({
  init() {
    this._super(...arguments);
  },

  async isAuthenticated() {
    return Promise.resolve(true);
  },

  async handleAuthentication() {
    return Promise.resolve(true);
  },

  loginRedirect() {
    return 'loginRedirect';
  },
});

export function initAuthService(service) {
  let { owner } = getContext();
  let stubbedAuthService = owner.register(
    'service:auth',
    service || stubbedService
  );
  return stubbedAuthService;
}
