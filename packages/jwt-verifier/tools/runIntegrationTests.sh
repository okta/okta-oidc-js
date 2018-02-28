#!/bin/bash

TCK_VERSION=0.2.2
TCK_JAR="https://oss.sonatype.org/service/local/artifact/maven/redirect?r=snapshots&g=com.okta.oidc.tck&a=okta-oidc-tck&v=${TCK_VERSION}-SNAPSHOT&e=jar&c=shaded"
ls ./okta-oidc-tck-${TCK_VERSION}-SNAPSHOT-shaded.jar || curl $TCK_JAR -L -o okta-oidc-tck-${TCK_VERSION}-SNAPSHOT-shaded.jar

mkdir -p target
java -Dconfig=./test/integration-test/resources/testRunner.yml -cp ./okta-oidc-tck-${TCK_VERSION}-SNAPSHOT-shaded.jar org.testng.TestNG -d target/cli-test-output ./test/integration-test/resources/testng.xml

# TestNG returns an exit code of 2 if tests are skipped. We don't want to consider it as test failure.
if [ $? == 2 ]
then
    exit 0
fi
