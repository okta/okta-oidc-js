# undo permissions change on scripts/publish_external.sh
git checkout -- scripts

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

# Replace yarn artifactory with Okta's
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" yarn.lock

if ! yarn install; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# Revert the origional change
sed -i "s#${OKTA_REGISTRY}#${YARN_REGISTRY}#" yarn.lock

export REGISTRY="https://registry.npmjs.org/"
node $OKTA_HOME/$REPO/scripts/publish_registry.js
