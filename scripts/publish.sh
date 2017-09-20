#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

REGISTRY="${ARTIFACTORY_URL}/api/npm/npm-okta"

export TEST_SUITE_TYPE="build"

if [ "$BRANCH" == "master" ];
then
  echo "attempting npm publish"
  if ! lerna publish --registry ${REGISTRY} --cd-version patch --yes; then
    echo "npm publish failed! Exiting..."
    exit $PUBLISH_ARTIFACTORY_FAILURE
  fi
fi

exit $SUCCESS
