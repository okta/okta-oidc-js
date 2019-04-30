#! /bin/bash

if [[ -z ${CHROME_DRIVER_VER} ]];
then
  export CHROME_DRIVER_VER=2.46
fi

if [[ -z ${SE_STANDALONE_VER} ]];
then
  export SE_STANDALONE_VER=3.141.59
fi

./node_modules/.bin/webdriver-manager update --versions.chrome ${CHROME_DRIVER_VER} --gecko false --versions.standalone ${SE_STANDALONE_VER}

