#!/bin/bash -xe

#for package in `ls $PWD/packages`;
array=( "okta-angular" "jwt-verifier" )

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
