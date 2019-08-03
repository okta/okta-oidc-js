// Read environment variables from file in root of the repository
const Config = require('../../../../../.oidc.config.js');
const webpack = require('webpack');
const path = require('path');
const env = {};

// List of environment variables made available to the app
Object.keys(Config().spaConstants).forEach(function (key) {
  env[key] = JSON.stringify(Config[key]);
});

console.log('CUSTOM WEBPACK!!');

const MAIN_ENTRY = path.resolve(__dirname, '../../../dist/index.js');
const fs = require('fs');
const contents = fs.readFileSync(MAIN_ENTRY);
console.log('contents', contents);

// Added to angular's webpack config by @angular-builders/custom-webpack
module.exports = {
  resolve: {
    alias: {
      '@okta/okta-angular': MAIN_ENTRY
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env
    })
  ]
};
