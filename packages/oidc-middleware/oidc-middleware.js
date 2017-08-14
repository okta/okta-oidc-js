const EventEmitter = require('events').EventEmitter;
const uuid = require('uuid');
const { Router } = require('express');
const passport = require('passport');
const Strategy = require('openid-client').Strategy;
const Issuer = require('openid-client').Issuer;
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const Negotiator = require('negotiator');

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

    // create middleware that ensures the client exists
    function oidcClientGatingMiddleware(req, res, next) {
      if (client) return next();
      if (clientError) return next(clientError);
      createClientListener.on('completed', next);
    }

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

    // define login route
    const {
      login:loginRoute = {},
      callback:callbackRoute = {}
    } = routes;

    const {
      path:loginPath = '/login',
    } = loginRoute;

    const loginHandler = (req, res, next) => {
      if (loginRoute.handler) {
        const loginHandler = loginRoute.handler;
        switch (loginHandler.length) {
          case 2:
            try {
              loginHandler(req, res);
              next();
            } catch (e) {
              next(e);
            }
            break;

          case 3:
            try {
              loginHandler(req, res, next);
            } catch (e) {
              next(e);
            }
            break;

          default:
            next(new OIDCMiddlewareError('The login handler must have an arity of 2 or 3.'));
        }

      } else {
        passport.authenticate('oidc')(req, res, next);
      }
    };

    // define callback route

    // pass options if default. custom handlers get no options
    const {
      path:callbackPath = '/authorization-code/callback'
    } = callbackRoute;

    let callbackHandler;
    if (callbackRoute.handler) {
      const customHandler = callbackRoute.handler;
      const customHandlerArity = customHandler.length;
      callbackHandler = (req, res, next) => {
        const nextHandler = err => {
          if (err && customHandlerArity < 4) return next(err);
          switch(customHandlerArity) {
            case 4:
              customHandler(err, req, res, next);
              break;
            case 3:
              customHandler(req, res, next);
              break;
            default:
              throw new OIDCMiddlewareError('Your custom callback handler must request "next"');
          }
        };
        passport.authenticate('oidc')(req, res, nextHandler);
      }
    } else {
      callbackHandler = passport.authenticate('oidc', {
        successReturnToOrRedirect: '/'
      });
    }

    // constructor express router
    const oidcRouter = new Router();
    oidcRouter.use(oidcClientGatingMiddleware);
    oidcRouter.use(passport.initialize({ userProperty: 'userinfo' }));
    oidcRouter.use(passport.session());
    oidcRouter.use(loginPath, loginHandler);
    oidcRouter.use(callbackPath, callbackHandler);
    this.router = oidcRouter;

    this.ensureAuthenticated = (options = loginPath) => {
      return (req, res, next) => {
        if (req.isAuthenticated && req.isAuthenticated()) {
          return next();
        }
        const negotiator = new Negotiator(req);
        if (negotiator.mediaType() === 'text/html') {
          ensureLoggedIn(options)(req, res, next);
        } else {
          res.sendStatus(401);
          next();
        }
      };
    }
  }
};
