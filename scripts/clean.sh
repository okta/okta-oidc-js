#! /bin/bash -xe

# Remove node_modules
lerna clean --yes

# Remove yarn.lock files
npx lerna exec -- rm -f yarn.lock