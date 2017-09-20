#!/bin/bash

cd ${OKTA_HOME}/${REPO}

# undo permissions change on scripts/publish.sh
git checkout -- scripts

# ensure we're in a branch on the correct sha
git checkout $BRANCH
git reset --hard $SHA

git config --global user.email "oktauploader@okta.com"
git config --global user.name "oktauploader-okta"

# Use newer, faster npm
npm install -g npm@5.0.3

# Install required dependencies
npm install -g lerna

if ! lerna bootstrap; then
  echo "lerna bootstrap failed! Exiting..."
  exit ${FAILED_SETUP}
fi
