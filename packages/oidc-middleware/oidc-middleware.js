const { Router } = require('express');
const EventEmitter = require('events').EventEmitter;
const session = require('express-session');
const passport = require('passport');
const Strategy = require('openid-client').Strategy;
const Issuer = require('openid-client').Issuer;
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const uuid = require('uuid');

class OIDCMiddlewareError extends Error {}

function depromisify(fn) {
  if (fn.length === 1) {
    return (arg1, cb) => {
      return fn(arg1)
      .then(res => cb(null, res))
      .catch(cb);
    }
  } else if (fn.length === 2) {
    return (arg1, arg2, cb) => {
      return fn(arg1, arg2)
      .then(res => cb(null, res))
      .catch(cb);
    }
  }
}

module.exports.ExpressOIDC = class ExpressOIDC {
  constructor(options) {
    const {
      issuer,
      client_id,
      client_secret,
      redirect_uri,
      response_type = 'code',
      scope = 'openid',
      routes = {},
      serializeUser,
    } = options;

    const sessionKey = `oidc:${issuer.issuer}`;

    const missing = [];
    if (!issuer) missing.push('issuer');
    if (!client_id) missing.push('client_id');
    if (!client_secret) missing.push('client_secret');
    if (!redirect_uri) missing.push('redirect_uri');
    if (missing.length) {
      throw new OIDCMiddlewareError(`${missing.join(',')} must be defined`);
    }

    // bypass passport's serializers
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    let client;
    let clientError;
    const createClientListener = new EventEmitter();

    Issuer.discover(issuer)
    .then(issuer => {
      client = new issuer.Client({
        client_id,
        client_secret,
        redirect_uris: [
          redirect_uri
        ]
      });

      const defaultSerializeUser = (tokens, userinfo, done) => {
        done(null, userinfo);
      };

      const strategy = new Strategy({
        params: {
          scope: scope || 'openid'
        },
        sessionKey,
        client
      }, serializeUser && depromisify(serializeUser) || defaultSerializeUser);

      passport.use('oidc', strategy);

      createClientListener.emit('completed');
      createClientListener.removeAllListeners();
    })
    .catch(err => {
      client = undefined;
      clientError = err;
      createClientListener.emit('completed', err);
      createClientListener.removeAllListeners();
    });

    // create middleware that ensures the client exists
    function oidcClientGatingMiddleware(req, res, next) {
      if (client) return next();
      if (clientError) return next(clientError);
      createClientListener.on('completed', next);
    }

    // define routes
    const {
      login:loginRoute = {},
      callback:callbackRoute = {}
    } = routes;

    // always write state and nonce before login
    const state = uuid();
    const nonce = uuid();

    // add authorizeUrl to req and res.locals
    const defaultLoginHandler = passport.authenticate('oidc');
    const {
      path:loginPath = '/login',
      handler:loginHandler = defaultLoginHandler
    } = loginRoute;

    /*
    const loginHandler = (req, res, next) => {
      // create state and nonce
      // attach them to the sessionKey
      // if there's a custom handler
        // create an authorizeUrl and attach it to req and res.locals
      // otherwise, just call call the middleware

      const loginNext = (err, result) => {
        if (loginRoute.handler) {
          loginRoute
        }
      };

      passport.authenticate('oidc')(req, res, loginNext)
    };
    */

    // pass options if default, custom handlers get no options
    const defaultCallbackHandler = passport.authenticate('oidc', {
      successReturnToOrRedirect: '/',
      failureRedirect: loginPath
    });
    const {
      path:callbackPath = '/authorization-code/callback',
      handler:callbackHandler = defaultCallbackHandler
    } = callbackRoute;

    // constructor express router
    const oidcRouter = new Router();
    oidcRouter.use(oidcClientGatingMiddleware);
    oidcRouter.use(passport.initialize({ userProperty: 'userinfo' }));
    oidcRouter.use(passport.session());
    oidcRouter.use(loginPath, loginHandler);
    oidcRouter.use(callbackPath, callbackHandler);
    this.router = oidcRouter;

    this.ensureLoggedIn = (options = loginPath) => ensureLoggedIn(options);
  }
};
