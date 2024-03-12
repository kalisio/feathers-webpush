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
init_lib_infos 

APP=$(get_lib_name)
VERSION=$(get_lib_version)

echo "About to run tests for ${APP} v${VERSION} ..."

. "$WORKSPACE_DIR/development/workspaces/libs/libs.sh" feathers-webpush

## Run tests
##

use_node "$NODE_VER"
yarn && yarn test

## Publish code coverage
##

send_coverage_to_cc 8e87a996279373f05f01ce8166aac1bc9dda990e9a2f936af25e5aa11326b127

## Trap to handle errors
trap 'echo "Error occurred. Sending slack message..."; send_slack_message' ERR