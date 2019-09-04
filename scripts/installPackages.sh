#! /bin/bash -xe

# Detect if we are running on Travis or Bacon
if [ $CI ] || [ $TASK_DEFINITION ]
then
  echo "Running in a CI environment"
  YARN_INSTALL_ARGS="--frozen-lockfile"
else
  echo "Running in a local dev environment"
  YARN_INSTALL_ARGS=""
fi

# Install dependencies and run the 'prepare' script
# Running yarn in each package directory to create a unique yarn.lock file
npx lerna exec --concurrency=1 -- yarn install $YARN_INSTALL_ARGS
npx lerna run prepare

# Calling 'yarn install' within a package directory may install a hard copy from npm repository
# Overwrite a hard copy with a symlink. This ensures we are always running and testing against the local version
npx lerna link --force-local

