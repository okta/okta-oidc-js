#!/bin/bash

TCK_VERSION=0.2.2
TCK_JAR="https://oss.sonatype.org/service/local/artifact/maven/redirect?r=snapshots&g=com.okta.oidc.tck&a=okta-oidc-tck&v=${TCK_VERSION}-SNAPSHOT&e=jar&c=shaded"
ls ./okta-oidc-tck-${TCK_VERSION}-SNAPSHOT-shaded.jar || curl $TCK_JAR -L -o okta-oidc-tck-0.2.2-SNAPSHOT-shaded.jar

export ISSUER=http://localhost:9090/oauth2/default
export CLIENT_ID=OOICU812
export CLIENT_SECRET=VERY_SECRET

mkdir -p target
java -cp ./test/integration-test/resources/:./okta-oidc-tck-${TCK_VERSION}-SNAPSHOT-shaded.jar org.testng.TestNG -d target/cli-test-output ./test/integration-test/resources/testng.xml
