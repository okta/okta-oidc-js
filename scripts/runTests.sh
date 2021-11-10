#!/bin/bash -xe

PACKAGES=(
  "./packages/configuration-validation"
)

for PACKAGE in "${PACKAGES[@]}"
do
    pushd $PACKAGE
    yarn test
    if [ $? -ne 0 ]; then
        echo "------- [ERROR] Test failures in $PACKAGE -------"
        exit 1
    fi
    popd
done
