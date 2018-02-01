'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  ISSUER: '"https://samples-test.oktapreview.com/oauth2/default"',
  CLIENT_ID: '"0oad5a19u0IVnKU1g0h7"',
  REDIRECT_URI: '"http://localhost:8080/implicit/callback"'
})
