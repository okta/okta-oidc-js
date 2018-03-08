#!/bin/bash

cd packages/okta-vue
npm i chromedriver --save
npm test

# for package in `ls $PWD/packages`;
# do
#     cd $PWD/packages/$package
#     npm test
#     cd ../..
# done
