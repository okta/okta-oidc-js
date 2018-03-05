#!/bin/bash

npm install
npm run bootstrap

for package in `ls $PWD/packages`;
do
    cd $PWD/packages/$package
    npm test
    cd ../..
done
