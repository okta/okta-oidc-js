#!/bin/bash

# Install yarn
curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --rc
# Link the installed yarn to be default
ln -sf ~/.yarn/bin/yarn /usr/bin/yarn

source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="build"

if [ "$BRANCH" == "master" ];
then
  echo "attempting npm publish"

  export REGISTRY="${ARTIFACTORY_URL}/api/npm/npm-okta"
  node $OKTA_HOME/$REPO/scripts/publish_registry.js
fi

exit $SUCCESS
