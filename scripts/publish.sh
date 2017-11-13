#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="build"

if [ "$BRANCH" == "master" ];
then
  echo "attempting npm publish"

  REGISTRY="${ARTIFACTORY_URL}/api/npm/npm-okta"
  node $OKTA_HOME/$REPO/scripts/publish_registry.js
fi

exit $SUCCESS
