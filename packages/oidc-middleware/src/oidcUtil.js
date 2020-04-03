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

const passport = require('passport');
const OpenIdClient = require('openid-client');
const Negotiator = require('negotiator');
const os = require('os');

const pkg = require('../package.json');

const OpenIdClientStrategy = OpenIdClient.Strategy;
const Issuer = OpenIdClient.Issuer;
const custom = OpenIdClient.custom;

const oidcUtil = module.exports;

function customizeUserAgent(options) {
  /**
   * Parse out the default user agent for the openid-client library, which currently looks like:
   *
   * openid-client/1.15.0 (https://github.com/panva/node-openid-client)
   *
   * We strip off the github link because it's not necessary.
   */
  options = options || {};
  const headers = options.headers || {};
  let clientUserAgent = headers['User-Agent'];
  if (typeof clientUserAgent === 'string') {
    clientUserAgent = ' ' + clientUserAgent.split(' ')[0]
  } else {
    clientUserAgent = '';
  }

  const userAgent = `${pkg.name}/${pkg.version}${clientUserAgent} node/${process.versions.node} ${os.platform()}/${os.release()}`;
  headers['User-Agent'] = userAgent;

  options.headers = headers;
  return options;
}

oidcUtil.createClient = context => {
  const {
    issuer,
    client_id,
    client_secret,
    loginRedirectUri: redirect_uri,
    maxClockSkew,
    timeout
  } = context.options;

  Issuer[custom.http_options] = function(options) {
    options = customizeUserAgent(options);
    options.timeout = timeout || 10000;
    return options;
  };

  return Issuer.discover(issuer +  '/.well-known/openid-configuration')
  .then(iss => {
    const client = new iss.Client({
      client_id,
      client_secret,
      redirect_uris: [
        redirect_uri
      ]
    });
    client[custom.http_options] = customizeUserAgent;
    client[custom.clock_tolerance] = maxClockSkew;

    return client;
  });
};

oidcUtil.bootstrapPassportStrategy = context => {
  const oidcStrategy = new OpenIdClientStrategy({
    params: {
      scope: context.options.scope
    },
    sessionKey: context.options.sessionKey,
    client: context.client
  }, (tokenSet, userinfo, done) => {
    return tokenSet && userinfo
      ? done(null, {
        userinfo: userinfo,
        tokens: tokenSet
      })
      : done(null);
  });

  // bypass passport's serializers
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
  passport.use('oidc', oidcStrategy);
};

oidcUtil.ensureAuthenticated = (context, options = {}) => {
  return (req, res, next) => {
    const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
    if (isAuthenticated) {
      return next();
    }
    const negotiator = new Negotiator(req);
    if (negotiator.mediaType() === 'text/html') {
      if (!isAuthenticated) {
        if (req.session) {
          req.session.returnTo = req.originalUrl || req.url;
        }

        const url = options.redirectTo || context.options.routes.login.path;
        return res.redirect(url);
      }

      next();
    } else {
      res.sendStatus(401);
    }
  };
};
