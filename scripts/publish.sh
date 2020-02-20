#!/bin/bash -xe

export NVM_DIR="/root/.nvm"

# Install required node version
setup_service node v12.13.0

# Install yarn
curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 1.17.3
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
