const EventEmitter = require('events').EventEmitter;
const uuid = require('uuid');
const oidcUtil = require('./oidcUtil');
const connectUtil = require('./connectUtil');

class OIDCMiddlewareError extends Error {}

module.exports = class ExpressOIDC {
  constructor(options = {}) {
    const {
      issuer,
      client_id,
      client_secret,
      redirect_uri
    } = options;

    const missing = [];
    if (!issuer) missing.push('issuer');
    if (!client_id) missing.push('client_id');
    if (!client_secret) missing.push('client_secret');
    if (!redirect_uri) missing.push('redirect_uri');
    if (missing.length) {
      throw new OIDCMiddlewareError(`${missing.join(', ')} must be defined`);
    }

    // Add defaults to the options
    options = Object.assign({
      response_type: 'code',
      scope: 'openid',
      routes: {}
    }, options);

    options.routes = Object.assign({
      login: {},
      callback: {}
    }, options.routes);

    options.routes.login = Object.assign({
      path: '/login'
    }, options.routes.login);

    options.routes.callback = Object.assign({
      path: '/authorization-code/callback',
      defaultRedirect: '/'
    }, options.routes.callback);

    const context = {
      options,
      sessionKey: `oidc:${issuer}`,
      pubsub: new EventEmitter()
    };

    // construct our express router
    this.router = connectUtil.createOIDCRouter(context);

    // attach ensureAuthenticated
    this.ensureAuthenticated = oidcUtil.ensureAuthenticated.bind(null, context);

    // create client
    oidcUtil.createClient(context)
    .then(client => {
      context.client = client;
      oidcUtil.bootstrapPassportStrategy(context);
      context.pubsub.emit('client_created');
      context.pubsub.removeAllListeners();
    })
    .catch(err => {
      context.clientError = err;
      context.pubsub.emit('error', err);
      context.pubsub.removeAllListeners();
    });
  }
};
