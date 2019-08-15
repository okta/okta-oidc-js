#! /bin/bash -xe

# Creates symlinks between internal dependencies.
npx lerna bootstrap --force-local --loglevel=silly -- --frozen-lockfile

# # Run yarn install on each package individually
# lerna exec --concurrency 1 -- 'pwd && yarn install'

# # Run prepare script on each package
# lerna run prepare
