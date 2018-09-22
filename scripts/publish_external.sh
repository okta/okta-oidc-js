# undo permissions change on scripts/publish_external.sh
git checkout -- scripts

# Install required dependencies
yarn global add lerna

if ! lerna bootstrap; then
  echo "lerna bootstrap failed! Exiting..."
  exit ${FAILED_SETUP}
fi

export REGISTRY="https://registry.npmjs.org/"
node $OKTA_HOME/$REPO/scripts/publish_registry.js
