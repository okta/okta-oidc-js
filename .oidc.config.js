/**
 * Shared configuration for all okta-oidc-js packages.
 *
 * @param {Object} overrides - (optional) Overrides specific values for the configuration object
 */

 // Support storing environment variables in a file named "testenv"
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Read environment variables from "testenv". Override environment vars if they are already set.
const TESTENV = path.resolve(__dirname, 'testenv');
if (fs.existsSync(TESTENV)) {
  const envConfig = dotenv.parse(fs.readFileSync(TESTENV));
  Object.keys(envConfig).forEach((k) => {
    process.env[k] = envConfig[k];
  });
}
process.env.CLIENT_ID = process.env.CLIENT_ID || process.env.SPA_CLIENT_ID;

module.exports = (overrides = {}) => {
  const PORT = overrides.port || process.env.PORT || 3000;
  const BASE_URI = process.env.BASE_URI || `http://localhost:${PORT}`;

  const defaults = {
    ISSUER: process.env.ISSUER || 'https://{yourOktaDomain}/oauth2/default',
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
