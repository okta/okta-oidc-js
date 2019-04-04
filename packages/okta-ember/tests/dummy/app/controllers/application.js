import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  auth: service(),

  init() {
    this._super(...arguments);
    const authService = this.auth;
    authService.set('onAuthRequired', authService => {
      authService.router.transitionTo('login');
    });
  },

  redirect: true,

  actions: {
    logout() {
      const authService = this.get('auth');
      authService.logout();
    },

    UpdateRedirect(event) {
      this.set('redirect', !event.target.value);

      const authService = this.auth;

      if (this.redirect) {
        authService.set('onAuthRequired', authService => {
          authService.router.transitionTo('login');
        });
      } else {
        authService.set('onAuthRequired', null);
      }
    },
  },
});
