#!/bin/bash

for package in `ls $PWD/packages`;
do
    cd $PWD/packages/$package
    yarn test
    if [ $? -ne 0 ]; then
        echo "------- [ERROR] Test failures in $package -------"
        exit 1
    fi
    cd ../..
done
