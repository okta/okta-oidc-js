#! /bin/bash -xe

# Creates symlinks between internal dependencies.
lerna bootstrap --force-local

# # Run yarn install on each package individually
# lerna exec --concurrency 1 -- 'pwd && yarn install'

# # Run prepare script on each package
# lerna run prepare
