#!/bin/bash

for package in `ls $PWD/packages`;
do
    cd $PWD/packages/$package
    npm test
    cd ../..
done
