import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  this.route('authenticated');
  this.route('implicit-callback', { path: 'implicit/callback' });
  this.route('login');
});

export default Router;
