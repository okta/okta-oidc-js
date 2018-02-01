#!/bin/bash

npm run install:packages

export CLIENT_ID=0oad5a19u0IVnKU1g0h7
export REDIRECT_URI=http://localhost:8080/implicit/callback

cd packages/jwt-verifier
npm test  > ./jwt-verifier-test.log

if (cat ./jwt-verifier-test.log | grep -e "FAILED:" -e "failed:" > /dev/null); then
    echo "[ERROR] jwt-verifier tests failed!"
    cat ./jwt-verifier-test.log
    exit -1
else
    echo "jwt-verifier tests successful."
fi

cd ../oidc-middleware
npm test > ./oidc-middleware-test.log

if (cat ./oidc-middleware-test.log | grep -e "FAILED:" -e "Failed:" > /dev/null); then
    echo "[ERROR] oidc-middleware tests failed!"
    cat ./oidc-middleware-test.log
    exit -1
else
    echo "oidc-middleware tests successful."
fi

export CLIENT_ID=0oadwuob65038lE6f0h7
export REDIRECT_URI=http://localhost:3000/implicit/callback
cd ../okta-angular
npm test  > ./okta-angular-test.log

if (cat ./okta-angular-test.log | grep -e "FAILED:" -e "Failed:" > /dev/null); then
    echo "[ERROR] okta-angular tests failed!"
    cat ./okta-angular-test.log
    exit -1
else
    echo "okta-angular tests successful."
fi

cd ../okta-react
npm test

# > ./okta-react-test.log

# if (cat ./okta-react-test.log | grep -e "FAILED:" -e "Failed:" > /dev/null); then
#     echo "[ERROR] okta-react tests failed!"
#     cat ./okta-react-test.log
#     exit -1
# else
#     echo "okta-react tests successful."
# fi

# Install test dependencies
# npm install --prefix packages/okta-vue/test/e2e/harness
# cd packages/okta-vue/test/e2e/harness
# npm install
# npm run test
