#!/bin/bash

# When packages change their dependency tree, we want to run snyk monitor. This
# sends the updated dependency tree to snyk for monitoring.  We want to do this
# when a commit has been made to master, not on PRs because the dependency tree
# is likely still in flux while review is happening.
#
# For simplicity, this script just runs snyk monitor against all packages on
# master commits, it doesn't try to figure out which packages were updated.

if [[ "$TRAVIS_BRANCH" == "master" && "$TRAVIS_PULL_REQUEST" == "false" ]]; then
  yarn global add snyk
  snyk auth $SNYK_API_TOKEN
  for package in `ls $PWD/packages`;
  do
    echo "snyk monitor --org=$SNYK_ORG_ID"
  done
fi
