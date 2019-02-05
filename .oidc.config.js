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
    OKTA_TESTING_DISABLEHTTPSCHECK: process.env.OKTA_TESTING_DISABLEHTTPSCHECK || false,
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
    APP_BASE_URL: BASE_URI,
    ...defaults
  };

  return { spaConstants, webConstants };
};
