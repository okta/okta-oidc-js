
#!/bin/bash
. "../../scripts/tck.sh"

runTest "./test/integration-test/resources/testRunner.yml" "target/cli-test-output" "./test/integration-test/resources/testng.xml"

# TestNG returns an exit code of 2 if tests are skipped. We don't want to consider it as test failure.
if [ $? = 2 ]
then
    exit 0
fi
