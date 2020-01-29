#!/bin/bash

if [ -z "$1" ]
  then
    TCK_VERSION=0.5.4-SNAPSHOT
  else
    TCK_VERSION=$1
fi

TCK_JAR_URL="https://oss.sonatype.org/service/local/artifact/maven/redirect?r=public&g=com.okta.oidc.tck&a=okta-oidc-tck&v=${TCK_VERSION}&e=jar&c=shaded"
TCK_FILE="./okta-oidc-tck-${TCK_VERSION}-shaded.jar"
TCK_PEM="./tck-keystore.pem"

function runTest() {
    test_runner_yml=$1; #"./test/integration-test/resources/testRunner.yml"
    test_output_dir=$2; #"target/cli-test-output"
    testng_xml=$3; #"./test/integration-test/resources/testng.xml"

    echo "TCK_FILE:"

    ls "${TCK_FILE}" || curl "${TCK_JAR_URL}" -L -o "${TCK_FILE}"

    # extract TCK self signed cert
    unzip -p "${TCK_FILE}" BOOT-INF/classes/tck-keystore.pem > "${TCK_PEM}"

    mkdir -p target
    #JAVA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=8000"
    java ${JAVA_OPTS} -Dokta.testing.disableHttpsCheck=true -Dconfig="${test_runner_yml}" -jar "${TCK_FILE}" -d "${test_output_dir}" "${testng_xml}"

    return_status=$?

    # TestNG returns an exit code of 2 if tests are skipped. We don't want to consider it as test failure.
    if [ $return_status == 2 ]
    then
        exit 0
    fi

    exit $return_status
}

runTest "./test/integration-test/resources/testRunner.yml" "target/cli-test-output" "./test/integration-test/resources/testng.xml"
