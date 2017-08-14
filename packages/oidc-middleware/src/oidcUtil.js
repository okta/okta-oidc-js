const passport = require('passport');
const OpenIdClientStrategy = require('openid-client').Strategy;
const Issuer = require('openid-client').Issuer;
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const Negotiator = require('negotiator');

const oidcUtil = module.exports;

oidcUtil.createClient = context => {
  const {
    issuer,
    client_id,
    client_secret,
    redirect_uri
  } = context.options;

  return Issuer.discover(issuer)
  .then(iss => {
    return new iss.Client({
      client_id,
      client_secret,
      redirect_uris: [
        redirect_uri
      ]
    });
  });
}

oidcUtil.bootstrapPassportStrategy = context => {
  const strategy = new OpenIdClientStrategy({
    params: {
      scope: context.options.scope
    },
    sessionKey: `oidc:${context.options.issuer}`,
    client: context.client
  }, (tokens, userinfo, done) => {
    done(null, userinfo);
  });

  // bypass passport's serializers
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
  passport.use('oidc', strategy);
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
      next();
    }
  };
}
