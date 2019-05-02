#! /bin/bash

if [[ -z ${SE_STANDALONE_VER} ]];
then
  SE_STANDALONE_VER=3.141.59
fi

if [[ -z ${CHROME_DRIVER_VER} ]];
then
    # MacOS or Linux?
    sw_vers 2>/dev/null
    RETVAL=$?
    if [[ ${RETVAL} == 0 ]];
    then
      OS=mac
    else
      OS=*nix
    fi
    echo "OS: ${OS}"

    # chrome version
    if [[ ${OS} == "mac" ]];
    then
      TEMP_CHROME_VER=$(/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version)
    else
      TEMP_CHROME_VER=$(google-chrome --product-version)
    fi

    echo "Chrome Version: ${TEMP_CHROME_VER}"
    CHROME_VER=$(echo ${TEMP_CHROME_VER} | sed -En 's/[^0-9]*([0-9]+)\..*/\1/p')
    echo "Chrome Version: ${CHROME_VER}"

    # Chrome Version to chromedriver mapping
    case $CHROME_VER in
        69)
            CHROME_DRIVER_VER=2.42
        ;;
        70)
            CHROME_DRIVER_VER=2.45
        ;;
        71)
            CHROME_DRIVER_VER=2.46
        ;;
        72)
            CHROME_DRIVER_VER=2.46
        ;;
        73)
            CHROME_DRIVER_VER=73.0.3683.68
        ;;
        74)
            CHROME_DRIVER_VER=74.0.3729.6
        ;;
        75)
            CHROME_DRIVER_VER=75.0.3770.8
        ;;
        *)
            CHROME_DRIVER_VER=2.46
        ;;
    esac
fi

CHROME_DRIVER_VER_PARAM="--versions.chrome ${CHROME_DRIVER_VER}"
echo "Chrome Driver Version: ${CHROME_DRIVER_VER}"
echo "Selenium Standalone Version: ${SE_STANDALONE_VER}"

./node_modules/.bin/webdriver-manager update --versions.chrome ${CHROME_DRIVER_VER} --gecko false --versions.standalone ${SE_STANDALONE_VER}
