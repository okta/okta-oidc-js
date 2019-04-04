import Component from '@ember/component';
import layout from '../templates/components/okta-callback';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,
  tagName: '',
  auth: service(),

  init() {
    this._super(...arguments);

    this.auth.loginRedirect();
  },
});
