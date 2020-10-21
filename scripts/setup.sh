#!/bin/bash -xe

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

#!/bin/bash
YARN_REGISTRY=https://registry.yarnpkg.com
OKTA_REGISTRY=${ARTIFACTORY_URL}/api/npm/npm-okta-master

# Yarn does not utilize the npmrc/yarnrc registry configuration
# if a lockfile is present. This results in `yarn install` problems
# for private registries. Until yarn@2.0.0 is released, this is our current
# workaround.
#
# Related issues:
#  - https://github.com/yarnpkg/yarn/issues/5892
#  - https://github.com/yarnpkg/yarn/issues/3330

# Replace yarn registry with Okta's
echo "Replacing $YARN_REGISTRY with $OKTA_REGISTRY within yarn.lock files..."
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" yarn.lock
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" packages/okta-angular/test/e2e/harness/yarn.lock
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" packages/okta-react/test/e2e/harness/yarn.lock
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" packages/configuration-validation/yarn.lock
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" packages/jwt-verifier/yarn.lock
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" packages/oidc-middleware/yarn.lock
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" packages/okta-angular/yarn.lock
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" packages/okta-react/yarn.lock
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" packages/okta-react-native/yarn.lock

if ! yarn install ; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# Revert the original change(s)
echo "Replacing $OKTA_REGISTRY with $YARN_REGISTRY within yarn.lock files..."
sed -i "s#${OKTA_REGISTRY}#${YARN_REGISTRY}#" yarn.lock
sed -i "s#${OKTA_REGISTRY}#${YARN_REGISTRY}#" packages/okta-angular/test/e2e/harness/yarn.lock
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" packages/okta-react/test/e2e/harness/yarn.lock
sed -i "s#${OKTA_REGISTRY}#${YARN_REGISTRY}#" packages/configuration-validation/yarn.lock
sed -i "s#${OKTA_REGISTRY}#${YARN_REGISTRY}#" packages/jwt-verifier/yarn.lock
sed -i "s#${OKTA_REGISTRY}#${YARN_REGISTRY}#" packages/oidc-middleware/yarn.lock
sed -i "s#${OKTA_REGISTRY}#${YARN_REGISTRY}#" packages/okta-angular/yarn.lock
sed -i "s#${OKTA_REGISTRY}#${YARN_REGISTRY}#" packages/okta-react/yarn.lock
sed -i "s#${OKTA_REGISTRY}#${YARN_REGISTRY}#" packages/okta-react-native/yarn.lock
