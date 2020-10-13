#! /bin/bash

SCRIPT_PATH=$(dirname $(which $0))
SCRIPT_DIR="${SCRIPT_PATH%scripts}"
DIR_MARKER="../"
DEFAULT_STANDALONE_VER=latest
DEFAULT_CHROME_DRIVER_VER=2.46
NODE_MODULES="${PWD}/node_modules"
DEPTH=$1

function setCallDepth() {
    if [[ -z ${DEPTH} ]];
    then
        DEPTH=$(echo "${SCRIPT_DIR}" | awk -F"${DIR_MARKER}" '{print NF-1}')
    fi
}

function setTargetPath() {
    setCallDepth
    if [[ ${DEPTH} > 0 ]];
    then
        TARGET_PATH=$(for i in $(seq ${DEPTH}); do echo -n ${DIR_MARKER}; done)
    else
        TARGET_PATH=./
    fi
}

function getOs() {
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
}

function getChromeVersion() {
    getOs
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
}

function setChromeDriverVersion() {
    if [[ -z ${CHROME_DRIVER_VER} ]];
    then
        getChromeVersion

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
            76)
                CHROME_DRIVER_VER=76.0.3809.68
            ;;
            77)
                CHROME_DRIVER_VER=77.0.3865.40
            ;;
            78)
                CHROME_DRIVER_VER=78.0.3904.70
            ;;
            79)
                CHROME_DRIVER_VER=79.0.3945.36
            ;;	
            80)
                CHROME_DRIVER_VER=80.0.3987.16
            ;;
            81)
                CHROME_DRIVER_VER=81.0.4044.69
            ;;
            83)
                CHROME_DRIVER_VER=83.0.4103.39
            ;;
            84)
                CHROME_DRIVER_VER=84.0.4147.30
            ;;
            85)
                CHROME_DRIVER_VER=85.0.4183.83
            ;;
            86)
                CHROME_DRIVER_VER=86.0.4240.22
            ;;
            *)
                CHROME_DRIVER_VER=${DEFAULT_CHROME_DRIVER_VER}
            ;;
        esac
    fi
    echo "Chrome Driver Version: ${CHROME_DRIVER_VER}"
}

function setStandaloneVersion() {
    if [[ -z ${SE_STANDALONE_VER} ]];
    then
      SE_STANDALONE_VER=${DEFAULT_STANDALONE_VER}
    fi
    echo "Selenium Standalone Version: ${SE_STANDALONE_VER}"
}

function removeSymlinks() {
    # remove symlinks if found
    CHROME_DRIVER_LINK=${NODE_MODULES}/webdriver-manager/selenium/chromedriver
    if [[ -f ${CHROME_DRIVER_LINK} ]];
    then
      rm ${CHROME_DRIVER_LINK}
    fi
    SE_STANDALONE_LINK=${NODE_MODULES}/webdriver-manager/selenium/selenium-server-standalone.jar
    if [[ -f ${SE_STANDALONE_LINK} ]];
    then
      rm ${SE_STANDALONE_LINK}
    fi
}

function findLatestStandaloneVersion() {
  SE_STANDALONE_LATEST=$(ls -t1 ${NODE_MODULES}/webdriver-manager/selenium/selenium-server-standalone-*.jar | head -1)
  SE_STANDALONE_REAL_VER=$(echo ${SE_STANDALONE_LATEST} | sed -En 's/.*\/selenium-server-standalone-(.*).jar/\1/p')
  echo "Real Standalone Version: ${SE_STANDALONE_REAL_VER}"
}

function updateDrivers() {
    # update the chromedriver and standalone driver
    ${NODE_MODULES}/webdriver-manager/bin/webdriver-manager update --versions.chrome ${CHROME_DRIVER_VER} --gecko false --versions.standalone ${SE_STANDALONE_VER}
    CHROME_DRIVER_FILE_NAME=chromedriver_${CHROME_DRIVER_VER}
    if [[ ${SE_STANDALONE_VER} == 'latest' ]];
    then
      findLatestStandaloneVersion
    else
      SE_STANDLONE_REAL_VER=${SE_STANDALONE_VER}
    fi
    SE_STANDALONE_FILE_NAME=selenium-server-standalone-${SE_STANDALONE_REAL_VER}.jar
}

function createSymlinks() {
    # (re-)create the symlinks
    ln -s ${CHROME_DRIVER_FILE_NAME} ${CHROME_DRIVER_LINK}
    ln -s ${SE_STANDALONE_FILE_NAME} ${SE_STANDALONE_LINK}
}

setChromeDriverVersion
setStandaloneVersion
setTargetPath
removeSymlinks
updateDrivers
createSymlinks
