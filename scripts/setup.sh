#!/bin/bash

# Add yarn to the $PATH so npm cli commands do not fail
export PATH="${PATH}:$(yarn global bin)"

cd ${OKTA_HOME}/${REPO}

# undo permissions change on scripts/publish.sh
git checkout -- scripts

# ensure we're in a branch on the correct sha
git checkout $BRANCH
git reset --hard $SHA

git config --global user.email "oktauploader@okta.com"
git config --global user.name "oktauploader-okta"

# Install required dependencies
npm install -g lerna

# We are skipping react-native until we have a solution for the problem described here: https://github.com/expo/expo/issues/1767
# If expo will not resolve then we will have to find another workaround

if ! lerna bootstrap --ignore "@okta/okta-react-native"; then
  echo "lerna bootstrap failed! Exiting..."
  exit ${FAILED_SETUP}
fi
