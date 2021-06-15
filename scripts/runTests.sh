#!/bin/bash -xe

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

# Export env vars
export ISSUER=https://samples-javascript.okta.com/oauth2/default
export WEB_CLIENT_ID=0oapmx9r5dK1dDAd54x6
get_secret prod/okta-sdk-vars/client_secret CLIENT_SECRET
export SPA_CLIENT_ID=0oapmwm72082GXal14x6
export USERNAME=george@acme.com
get_secret prod/okta-sdk-vars/password PASSWORD


PACKAGES=(
  "./packages/configuration-validation"
  "./packages/jwt-verifier"
  "./packages/oidc-middleware"
)

for PACKAGE in "${PACKAGES[@]}"
do
    pushd $PACKAGE
    yarn test
    if [ $? -ne 0 ]; then
        echo "------- [ERROR] Test failures in $PACKAGE -------"
        exit 1
    fi
    popd
done
