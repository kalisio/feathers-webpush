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
MONGO_VER=4
while getopts "n:" option; do
    case $option in
        n) # defines node version
            NODE_VER=$OPTARG;;
        *)
            ;;
    esac
done

## Init workspace
##

WORKSPACE_DIR="$(dirname "$ROOT_DIR")"
init_app_infos "$ROOT_DIR" "$WORKSPACE_DIR/development/workspaces/libs"

APP=$(get_app_name)
VERSION=$(get_app_version)
FLAVOR=$(get_app_flavor)

echo "About to run tests for ${APP} v${VERSION}-($FLAVOR) ..."

. "$WORKSPACE_DIR/development/workspaces/libs/libs.sh" feathers-webpush

## Run tests
##

use_node "$NODE_VER"
yarn && yarn test

## Publish code coverage
##
install_cc_test_reporter
~/.local/bin/cc-test-reporter format-coverage -t lcov coverage/lcov.info
~/.local/bin/cc-test-reporter upload-coverage

## Notify on slack
##