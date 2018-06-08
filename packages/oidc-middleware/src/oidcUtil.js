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

const passport = require('passport');
const OpenIdClientStrategy = require('openid-client').Strategy;
const Issuer = require('openid-client').Issuer;
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const Negotiator = require('negotiator');
const os = require('os');

const pkg = require('../package.json');

/**
 * Parse out the default user agent for the openid-client library, which currently looks like:
 *
 * openid-client/1.15.0 (https://github.com/panva/node-openid-client)
 *
 * We strip off the github link because it's not necessary.
 */
let clientUserAgent = Issuer.defaultHttpOptions.headers['User-Agent'];
if (typeof clientUserAgent === 'string' && clientUserAgent) {
  clientUserAgent = ' ' + clientUserAgent.split(' ')[0]
} else {
  clientUserAgent = '';
}

const userAgent = `${pkg.name}/${pkg.version}${clientUserAgent} node/${process.versions.node} ${os.platform()}/${os.release()}`;

Issuer.defaultHttpOptions.headers['User-Agent'] = userAgent;

const oidcUtil = module.exports;

oidcUtil.createClient = context => {
  const {
    issuer,
    client_id,
    client_secret,
    redirect_uri,
    maxClockSkew,
    timeout
  } = context.options;

  Issuer.defaultHttpOptions.timeout = timeout || 10000;

  return Issuer.discover(issuer)
  .then(iss => {
    const client = new iss.Client({
      client_id,
      client_secret,
      redirect_uris: [
        redirect_uri
      ]
    });

    client.CLOCK_TOLERANCE = maxClockSkew;

    return client;
  });
}

oidcUtil.bootstrapPassportStrategy = context => {
  const oidcStrategy = new OpenIdClientStrategy({
    params: {
      scope: context.options.scope
    },
    sessionKey: context.options.sessionKey,
    client: context.client
  }, (tokens, userinfo, done) => {
    done(null, userinfo);
  });

  // bypass passport's serializers
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
  passport.use('oidc', oidcStrategy);
}

oidcUtil.ensureAuthenticated = (context, options) => {
  options = options || context.options.routes.login.path;
  return (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    const negotiator = new Negotiator(req);
    if (negotiator.mediaType() === 'text/html') {
      ensureLoggedIn(options)(req, res, next);
    } else {
      res.sendStatus(401);
    }
  };
}
