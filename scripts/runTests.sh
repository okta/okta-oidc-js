#!/bin/bash

STATUS=0

for package in `ls $PWD/packages`;
do
    cd $PWD/packages/$package
    npm test
    if [ $? -ne 0 ]; then
       STATUS=-1
    fi
    cd ../..
done

exit $STATUS
