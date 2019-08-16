#! /bin/bash -xe

if [ $CI ]
then
  echo "Running in a CI environment"
  YARN_ARGS="--frozen-lockfile"
else
  echo "Running in a local dev environment"
  YARN_ARGS=""
fi

# Creates symlinks between internal dependencies. Also runs the 'prepare' script
npx lerna bootstrap --force-local -- $YARN_ARGS

# Calling 'yarn install' within a package directory may overwrite a symlink with a hard copy.
npx lerna link --force-local

