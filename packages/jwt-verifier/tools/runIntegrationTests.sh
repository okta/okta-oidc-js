#!/bin/bash
. "../../scripts/tck.sh"

runTest "./test/integration-test/resources/testRunner.yml" "target/cli-test-output" "./test/integration-test/resources/testng.xml"
