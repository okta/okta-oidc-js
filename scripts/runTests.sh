#!/bin/bash

STATUS=0

for package in `ls $PWD/packages`;
do
    cd $PWD/packages/$package
    npm test
    if [ $? -ne 0 ]; then
        STATUS=1
        FAILED_PACKAGE=$package
    fi
    cd ../..
done

if [ ! -z $FAILED_PACKAGE ]; then
    echo "------- [ERROR] Test failures in $FAILED_PACKAGE -------"
fi

exit $STATUS
