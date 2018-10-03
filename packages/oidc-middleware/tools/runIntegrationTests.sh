#!/bin/bash

TCK_VERSION=0.4.0-SNAPSHOT
TCK_JAR_URL="https://oss.sonatype.org/service/local/artifact/maven/redirect?r=public&g=com.okta.oidc.tck&a=okta-oidc-tck&v=${TCK_VERSION}&e=jar&c=shaded"
TCK_FILE="./okta-oidc-tck-${TCK_VERSION}-shaded.jar"
TCK_PEM="./tck-keystore.pem"

test_runner_yml="./test/integration-test/resources/testRunner.yml"
test_output_dir="target/cli-test-output"
testng_xml="./test/integration-test/resources/testng.xml"

echo "TCK_FILE:"
ls "${TCK_FILE}" || curl "${TCK_JAR_URL}" -L -o "${TCK_FILE}"

# extract TCK self signed cert
unzip -p "${TCK_FILE}" BOOT-INF/classes/tck-keystore.pem > "${TCK_PEM}"

mkdir -p target
#JAVA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=8000"
java ${JAVA_OPTS} -Dconfig="${test_runner_yml}" -jar "${TCK_FILE}" -d "${test_output_dir}" "${testng_xml}"


echo "----------------STATUS----------------";
echo $?
echo "----------------STATUS----------------";

# TestNG returns an exit code of 2 if tests are skipped. We don't want to consider it as test failure.
if [ $? == 2 ]
then
    exit 0
fi

for file in ./target/node*; do echo "$file";  cat "$file"; done
