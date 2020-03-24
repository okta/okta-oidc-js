/* global __dirname, module, process */

const webpack = require('webpack');
const path = require('path');
const MODULE_DIR = path.resolve(__dirname, '../../../');
const MAIN_ENTRY = path.join(MODULE_DIR, 'dist/');
const NODE_MODULES = path.join(MODULE_DIR, 'node_modules');

require('../../../../../.oidc.config.js'); // will load environment vars from testenv

const env = {};
// List of environment variables made available to the app
[
  'ISSUER',
  'CLIENT_ID',
].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} must be set. See README.md`);
  }
  env[key] = JSON.stringify(process.env[key]);
});


module.exports = {
  /* eslint-disable no-param-reassign */
  webpack: (config) => {
    // Remove the 'ModuleScopePlugin' which keeps us from requiring outside the src/ dir
    config.resolve.plugins = [];

    // Define global vars from env vars (process.env has already been defined)
    config.plugins = [
      new webpack.DefinePlugin({
        'process.env': env,
      }),
    ].concat(config.plugins);

    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    Object.assign(config.resolve.alias, {
      '@okta/okta-react': MAIN_ENTRY,

      // We receive strange errors if there are more than one copy of react modules.
      // This happens because okta-react has devDependencies installed. Use copy from okta-react.
      'react': path.join(NODE_MODULES, 'react'),
      'react-dom': path.join(NODE_MODULES, 'react-dom'),
      'react-router': path.join(NODE_MODULES, 'react-router'),
      'react-router-dom': path.join(NODE_MODULES, 'react-router-dom')
    });

    config.devtool = 'source-map';
    config.module.rules.push(
        {
          test: /\.js$/,
          use: ["source-map-loader"],
          enforce: "pre"
        }
      );

    return config;
  },
};
