#!/usr/bin/env bash
set -euo pipefail
# set -x

THIS_FILE=$(readlink -f "${BASH_SOURCE[0]}")
THIS_DIR=$(dirname "$THIS_FILE")
ROOT_DIR=$(dirname "$THIS_DIR")

. "$THIS_DIR/kash/kash.sh"

## Parse options
##

NODE_VER=16
CI_STEP_NAME="Run tests"
CODE_COVERAGE=false
while getopts "n:r:c:" option; do
    case $option in
        n) # defines node version
            NODE_VER=$OPTARG
             ;;
        r) # report outcome to slack
            CI_STEP_NAME=$OPTARG
            trap 'slack_ci_report "$ROOT_DIR" "$CI_STEP_NAME" "$?" "$SLACK_WEBHOOK_LIBS"' EXIT
            ;;
        c) # publish code coverage
            CODE_COVERAGE=true
            ;;
        *)
            ;;
    esac
done

## Init workspace
##

WORKSPACE_DIR="$(dirname "$ROOT_DIR")"
init_lib_infos "$ROOT_DIR"

APP=$(get_lib_name)
VERSION=$(get_lib_version)

echo "About to run tests for ${APP} v${VERSION} ..."

. "$WORKSPACE_DIR/development/workspaces/libs/libs.sh" feathers-webpush
load_env_files "$WORKSPACE_DIR/development/common/SLACK_WEBHOOK_LIBS.enc.env"

## Run tests
##

use_node "$NODE_VER"
yarn && yarn test

## Publish code coverage
##

if [ "$CODE_COVERAGE" = true ]; then
    send_coverage_to_cc "$CC_TEST_REPORTER_ID"
fi