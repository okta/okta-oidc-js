'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  ISSUER: '"https://{yourOktaDomain}.com/oauth2/default"',
  CLIENT_ID: '"{CLIENT_ID}"',
  REDIRECT_URI: '"http://localhost:8080/implicit/callback"'
})
