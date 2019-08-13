/* global __dirname, module */

const path = require('path');
const MAIN_ENTRY = path.resolve(__dirname, '../../../dist/index.js');

module.exports = {
  /* eslint-disable no-param-reassign */
  webpack: (config) => {
    // Remove the 'ModuleScopePlugin' which keeps us from requiring outside the src/ dir
    config.resolve.plugins = [];

    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    Object.assign(config.resolve.alias, {
      '@okta/okta-react': MAIN_ENTRY
    });

    return config;
  },
};
