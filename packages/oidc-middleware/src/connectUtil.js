/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const http = require('http');
const csrf = require('csurf');
const passport = require('passport');
const { Router } = require('express');
const querystring = require('querystring');
const uuid = require('uuid');
const bodyParser = require('body-parser');
const logout = require('./logout');

const connectUtil = module.exports;

// Create a router to easily add routes
connectUtil.createOIDCRouter = context => {
  const routes = context.options.routes;
  const oidcRouter = new Router();
  oidcRouter.use(passport.initialize({ userProperty: 'userContext' }));
  oidcRouter.use(passport.session());

  const loginPath = routes.login.path;
  const loginCallbackPath = routes.loginCallback.path;
  const logoutPath = routes.logout.path;
  const logoutCallbackPath = routes.logoutCallback.path;

  oidcRouter.use(loginPath, bodyParser.urlencoded({ extended: false}), connectUtil.createLoginHandler(context));
  oidcRouter.use(loginCallbackPath, connectUtil.createLoginCallbackHandler(context));
  oidcRouter.post(logoutPath, connectUtil.createLogoutHandler(context));
  oidcRouter.use(logoutCallbackPath, connectUtil.createLogoutCallbackHandler(context));

  oidcRouter.use((err, req, res, next) => {
    // Cast all errors from the passport strategy as 401 (rather than 500, which would happen if we just call through to next())
    res.status(401);
    next(err);
  });
  return oidcRouter;
};

connectUtil.createLoginHandler = context => {
  const passportHandler = passport.authenticate('oidc');
  const csrfProtection = csrf();

  return function(req, res, next) {
    const viewHandler = context.options.routes.login.viewHandler;
    if (req.method === 'GET' && viewHandler) {
      return csrfProtection(req, res, viewHandler.bind(null, req, res, next));
    }
    if (req.method === 'POST') {
      return csrfProtection(req, res, (err) => {
        if (err) {
          return next(err);
        }
        const nonce = uuid.v4();
        const state = uuid.v4();
        const params = {
          nonce,
          state,
          client_id: context.options.client_id,
          redirect_uri: context.options.loginRedirectUri,
          scope: context.options.scope,
          response_type: 'code',
          sessionToken: req.body.sessionToken
        };
        req.session[context.options.sessionKey] = {
          nonce,
          state
        };
        const url = `${context.options.issuer}/v1/authorize?${querystring.stringify(params)}`;
        return res.redirect(url);
      });
    }
    return passportHandler.apply(this, arguments);
  }
};

connectUtil.createLoginCallbackHandler = context => {
  const routes = context.options.routes;
  const customHandler = routes.loginCallback.handler;
  if (customHandler) {
    var customHandlerArity = customHandler.length;
    if (customHandlerArity < 3 || 4 < customHandlerArity) {
      throw new OIDCMiddlewareError('Your custom callback handler must request "next"');
    }
  } else {
    var successReturnToOrRedirect = routes.loginCallback.afterCallback;
    var failureRedirect = routes.loginCallback.failureRedirect;
  }
  return (req, res, next) => {
    const nextHandler = err => {
      if (customHandler && customHandlerArity === 4) {
        return customHandler(err, req, res, next);
      }
      next(err);
    }
    const redirect = url => {
      if (req.session && req.session.save && typeof req.session.save == 'function') {
        return req.session.save(function() {
          res.redirect(url);
        });
      }
      res.redirect(url);
    }
    passport.authenticate('oidc', (err, user, info, status) => {
      if (err) {
        return nextHandler(err);
      }
      if (user) {
        info = info || {};
        var msg;
        
        return req.logIn(user, function(err) {
          if (err) { return nextHandler(err); }
          
          function complete() {
            if (customHandler) {
              if (customHandlerArity === 4) {
                return customHandler(err, req, res, next);
              }
              return customHandler(req, res, next);
            }
            var url = successReturnToOrRedirect;
            if (req.session && req.session.returnTo) {
              url = req.session.returnTo;
              delete req.session.returnTo;
            }
            return redirect(url);
          }
          
          passport.transformAuthInfo(info, req, function(err, tinfo) {
            if (err) { return nextHandler(err); }
            req.authInfo = tinfo;
            complete();
          });
        });
      }
      var failure = failures[0] || {}
        , challenge = failure.challenge || {}
        , msg;
      if (!customHandler) {
        return redirect(failureRedirect);
      }
      // When failure handling is not delegated to the application, the default
      // is to respond with 401 Unauthorized.  Note that the WWW-Authenticate
      // header will be set according to the strategies in use (see
      // actions#fail).  If multiple strategies failed, each of their challenges
      // will be included in the response.
      var rchallenge = []
        , rstatus, status;
      
      for (var j = 0, len = failures.length; j < len; j++) {
        failure = failures[j];
        challenge = failure.challenge;
        status = failure.status;
          
        rstatus = rstatus || status;
        if (typeof challenge == 'string') {
          rchallenge.push(challenge);
        }
      }
      
      res.statusCode = rstatus || 401;
      if (res.statusCode == 401 && rchallenge.length) {
        res.setHeader('WWW-Authenticate', rchallenge);
      }
      res.end(http.STATUS_CODES[res.statusCode]);
    })(req, res, nextHandler);
  }
};

connectUtil.createLogoutHandler = context => logout.forceLogoutAndRevoke(context);

connectUtil.createLogoutCallbackHandler = context => {
  return (req, res) => {
    if ( req.session[context.options.sessionKey].state !== req.query.state ) {
      context.emitter.emit('error', { type: 'logoutError', message: `'state' parameter did not match value in session` });
    } else {
      req.logout();
      res.redirect(context.options.routes.logoutCallback.afterCallback);
    };
  };
};
