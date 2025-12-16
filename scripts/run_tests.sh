#!/usr/bin/env bash
set -euo pipefail
# set -x

THIS_FILE=$(readlink -f "${BASH_SOURCE[0]}")
THIS_DIR=$(dirname "$THIS_FILE")
ROOT_DIR=$(dirname "$THIS_DIR")
WORKSPACE_DIR="$(dirname "$ROOT_DIR")"

. "$THIS_DIR/kash/kash.sh"

## Parse options
##

NODE_VER=20
MONGO_VER=""
CI_STEP_NAME="Run tests"
CODE_COVERAGE=false
while getopts "n:r:" option; do
    case $option in
        n) # defines node version
            NODE_VER=$OPTARG
             ;;
        r) # report outcome to slack
            CI_STEP_NAME=$OPTARG        
            load_env_files "$WORKSPACE_DIR/development/common/SLACK_WEBHOOK_LIBS.enc.env"
            trap 'slack_ci_report "$ROOT_DIR" "$CI_STEP_NAME" "$?" "$SLACK_WEBHOOK_LIBS"' EXIT
            ;;
        *)
            ;;
    esac
done

## Init workspace
##

. "$WORKSPACE_DIR/development/workspaces/libs/libs.sh" feathers-webpush

## Run tests
##

run_lib_tests "$ROOT_DIR" "$CODE_COVERAGE" "$NODE_VER" "$MONGO_VER"

## Run SonarQube analysis
##

if [ "$CI_STEP_NAME" = "Run tests" ]; then
    cd "$ROOT_DIR" && sonar-scanner
fi