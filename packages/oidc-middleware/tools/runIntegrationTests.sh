#!/bin/bash

source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../../scripts/tck.sh"
runTck "./test/integration-test/resources/testRunner.yml" "target/cli-test-output" "./test/integration-test/resources/testng.xml"