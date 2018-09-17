#!/bin/bash

TCK_VERSION=0.2.2-SNAPSHOT
TCK_JAR="https://oss.sonatype.org/service/local/artifact/maven/redirect?r=snapshots&g=com.okta.oidc.tck&a=okta-oidc-tck&v=${TCK_VERSION}&e=jar&c=shaded"
ls ./okta-oidc-tck-${TCK_VERSION}-shaded.jar || curl $TCK_JAR -L -o okta-oidc-tck-${TCK_VERSION}-shaded.jar

export ISSUER=http://localhost:9090/oauth2/default
export WEB_CLIENT_ID=OOICU812
export CLIENT_SECRET=VERY_SECRET

mkdir -p target
java -cp ./test/integration-test/resources/:./okta-oidc-tck-${TCK_VERSION}-shaded.jar org.testng.TestNG -d target/cli-test-output ./test/integration-test/resources/testng.xml

# TestNG returns an exit code of 2 if tests are skipped. We don't want to consider it as test failure.

if [ $? == 1 ]
then
    exit -1
fi
