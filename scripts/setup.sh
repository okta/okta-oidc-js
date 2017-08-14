#!/bin/bash

cd ${OKTA_HOME}/${REPO}

# Use newer, faster npm
npm install -g npm@5.0.3

# Install required dependencies
npm install -g lerna

if ! lerna bootstrap; then
  echo "lerna bootstrap failed! Exiting..."
  exit ${FAILED_SETUP}
fi
