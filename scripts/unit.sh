#!/bin/bash -xe

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

PACKAGES=(
  "./packages/configuration-validation"
  # is having issues "./packages/jwt-verifier"
  "./packages/oidc-middleware"
)

for PACKAGE in "${PACKAGES[@]}"
do
    pushd $PACKAGE
    yarn test:unit
    if [ $? -ne 0 ]; then
        echo "------- [ERROR] Unit Test failures in $PACKAGE -------"
        exit 1
    fi
    popd
done
