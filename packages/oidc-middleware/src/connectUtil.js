const passport = require('passport');
const { Router } = require('express');

const connectUtil = module.exports;

// Ensures that a request won't complete until we've attempted to connect to the issuer
connectUtil.waitForClient = (context, req, res, next) => {
  if (context.client) return next();
  if (context.clientError) return next(context.clientError);
  context.pubsub.on('client_created', next);
  context.pubsub.on('error', next);
};

// Create a router to easily add routes
connectUtil.createOIDCRouter = context => {
  const oidcRouter = new Router();
  oidcRouter.use(connectUtil.waitForClient.bind(null, context));
  oidcRouter.use(passport.initialize({ userProperty: 'userinfo' }));
  oidcRouter.use(passport.session());

  const {
    login: {
      path:loginPath
    },
    callback: {
      path:callbackPath
    }
  } = context.options.routes;
  oidcRouter.use(loginPath, connectUtil.createLoginHandler(context));
  oidcRouter.use(callbackPath, connectUtil.createCallbackHandler(context));
  return oidcRouter;
};

connectUtil.createLoginHandler = context => {
  const loginHandler = context.options.routes.login.handler;
  if (!loginHandler) {
    return passport.authenticate('oidc');
  }
  return (req, res, next) => {
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
  };
};

connectUtil.createCallbackHandler = context => {
  const customHandler = context.options.routes.callback.handler;
  if (!customHandler) {
    return passport.authenticate('oidc', {
      successReturnToOrRedirect: context.options.routes.callback.defaultRedirect
    });
  }
  const customHandlerArity = customHandler.length;
  return (req, res, next) => {
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
}
