/**
 * Shared configuration for all okta-oidc-js packages.
 *
 * @param {Object} overrides - (optional) Overrides specific values for the configuration object
 */

module.exports = (overrides = {}) => {
  const PORT = overrides.port || process.env.PORT || 3000;
  const BASE_URI = process.env.BASE_URI || `http://localhost:${PORT}`;

  const defaults = {
    ISSUER: process.env.ISSUER || 'https://{yourOktaDomain}/oauth2/defalt',
    USERNAME: process.env.USERNAME || '{username}',
    PASSWORD: process.env.PASSWORD || '{password}',
    BASE_URI,
    PORT
  };

  const spaConstants = {
    CLIENT_ID: process.env.SPA_CLIENT_ID || process.env.CLIENT_ID || '{clientId}',
    REDIRECT_URI: `${BASE_URI}/implicit/callback`,
    ...defaults
  };

  const webConstants = {
    CLIENT_ID: process.env.WEB_CLIENT_ID || process.env.CLIENT_ID || '{clientId}',
    CLIENT_SECRET: process.env.CLIENT_SECRET || '{clientSecret}',
    REDIRECT_URI: `${BASE_URI}/authorization-code/callback`,
    ...defaults
  };

  return { spaConstants, webConstants };
};
