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
export REGISTRY="${ARTIFACTORY_URL}/api/npm/npm-okta"

# Install required dependencies
export PATH="${PATH}:$(yarn global bin)"
yarn global add @okta/ci-update-package
yarn global add @okta/ci-pkginfo

if [ -n "${action_branch}" ];
then
  echo "Publishing from bacon task using branch ${action_branch}"
  TARGET_BRANCH=${action_branch}
else
  echo "Publishing from bacon testSuite using branch ${BRANCH}"
  TARGET_BRANCH=${BRANCH}
fi

PACKAGES=(
  "./packages/configuration-validation"
  "./packages/jwt-verifier"
  "./packages/oidc-middleware"
  "./packages/okta-angular/dist"
  "./packages/okta-react"
  "./packages/okta-react-native"
)

for PACKAGE in "${PACKAGES[@]}"
do
  pushd $PACKAGE

  if ! ci-update-package --branch ${TARGET_BRANCH}; then
    echo "ci-update-package failed for $PACKAGE! Exiting..."
    exit ${FAILED_SETUP}
  fi

  ### looks like ci-update-package is not compatible with `yarn publish`
  ### which expects new-version is passed via command line parameter.
  ### keep using npm for now
  if ! npm publish --registry ${REGISTRY}; then
    echo "npm publish failed for $PACKAGE! Exiting..."
    exit ${PUBLISH_ARTIFACTORY_FAILURE}
  fi


  DATALOAD=$(ci-pkginfo -t dataload)
  if ! artifactory_curl -X PUT -u ${ARTIFACTORY_CREDS} ${DATALOAD} -v -f; then
    echo "artifactory_curl failed for $PACKAGE! Exiting..."
    exit ${PUBLISH_ARTIFACTORY_FAILURE}
  fi

  popd

done

exit $SUCCESS
