#!/bin/bash

npm install
npm run bootstrap

# npm test
cd packages/jwt-verifier
npm test

cd ../oidc-middleware
npm test

cd ../okta-angular
npm test

cd ../okta-react
npm test

cd ../okta-vue
npm test
