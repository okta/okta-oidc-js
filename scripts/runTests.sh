#!/bin/bash -xe

#
array=( "okta-angular" "jwt-verifier" )

# for package in `ls $PWD/packages`;
for package in "${array[@]}";
do
    cd $PWD/packages/$package
    yarn test
    if [ $? -ne 0 ]; then
        echo "------- [ERROR] Test failures in $package -------"
        exit 1
    fi
    cd ../..
done
# env
# yarn -v
# yarn --cwd packages/okta-angular test
# yarn --cwd packages/jwt-verifier test