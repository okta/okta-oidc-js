/*!
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const csrf = require('csurf');
const passport = require('passport');
const { Router } = require('express');
const querystring = require('querystring');
const uuid = require('uuid');
const bodyParser = require('body-parser');

const connectUtil = module.exports;

// Create a router to easily add routes
connectUtil.createOIDCRouter = context => {
  const oidcRouter = new Router();
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
  oidcRouter.use(loginPath, bodyParser.urlencoded({ extended: false}), connectUtil.createLoginHandler(context));
  oidcRouter.use(callbackPath, connectUtil.createCallbackHandler(context));
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
          redirect_uri: context.options.redirect_uri,
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

connectUtil.createCallbackHandler = context => {
  const customHandler = context.options.routes.callback.handler;
  if (!customHandler) {
    return passport.authenticate('oidc', {
      successReturnToOrRedirect: context.options.routes.callback.defaultRedirect,
      failureRedirect: context.options.routes.callback.failureRedirect
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
