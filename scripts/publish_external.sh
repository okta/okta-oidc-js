# undo permissions change on scripts/publish_external.sh
git checkout -- scripts

# Use newer, faster npm
npm install -g npm@5.0.3

# Install required dependencies
npm install -g lerna

if ! lerna bootstrap; then
  echo "lerna bootstrap failed! Exiting..."
  exit ${FAILED_SETUP}
fi

export REGISTRY="https://registry.npmjs.org/"
node $OKTA_HOME/$REPO/scripts/publish_registry.js
