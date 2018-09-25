# undo permissions change on scripts/publish_external.sh
git checkout -- scripts

if ! yarn install; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

export REGISTRY="https://registry.npmjs.org/"
node $OKTA_HOME/$REPO/scripts/publish_registry.js
