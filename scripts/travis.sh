#!/bin/bash

npm install
npm run bootstrap

export CLIENT_ID=$SPA_CLIENT_ID
export REDIRECT_URI=http://localhost:8080/implicit/callback

cd packages/jwt-verifier
npm test || echo "[ERROR] jwt-verifier tests failed!"

export CLIENT_ID=$WEB_CLIENT_ID
export REDIRECT_URI=http://localhost:8080/authorization-code/callback

cd ../oidc-middleware
npm test || echo "[ERROR] oidc-middleware tests failed!"

export CLIENT_ID=$SPA_CLIENT_ID
export REDIRECT_URI=http://localhost:3000/implicit/callback

cd ../okta-angular
npm test  || echo "[ERROR] okta-angular tests failed!"

cd ../okta-react
npm test || echo "[ERROR] okta-react tests failed!"

# Disregard this for review
# export CLIENT_ID=0oadwuob65038lE6f0h7
# export REDIRECT_URI=http://localhost:3000/implicit/callback

# cd packages/okta-vue/test/e2e/harness
# npm install
# npm install chromedriver@2.33.0 --chromedriver-cdnurl=http://chromedriver.storage.googleapis.com
# curl https://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.0.jar > selenium-server-standalone.jar
# npm test
