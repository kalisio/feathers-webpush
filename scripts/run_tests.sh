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

install_cc_test_reporter ~
send_coverage_to_cc() {
    local CC_TEST_REPORTER_ID=$1
    ~/.local/bin/cc-test-reporter format-coverage -t lcov coverage/lcov.info
    ~/.local/bin/cc-test-reporter upload-coverage -r $CC_TEST_REPORTER_ID
}
send_coverage_to_cc 8e87a996279373f05f01ce8166aac1bc9dda990e9a2f936af25e5aa11326b127

## Notify on slack
##
get_git_commit_url() {
    local ROOT_DIR="$1"
    local REPO_NAME="$2"
    local COMMIT_SHA
    COMMIT_SHA=$(get_git_commit_sha "$ROOT_DIR")

    local GITHUB_REPO_URL="https://github.com/kalisio/$REPO_NAME"
    local COMMIT_URL="$GITHUB_REPO_URL/commit/$COMMIT_SHA"

    echo "$COMMIT_URL"
}

generate_slack_message() {
    local ROOT_DIR="$1"
    local APP="$2"
    local WORKSPACE_BRANCH="$3"
    local COMMIT_SHA
    local COMMIT_URL
    local AUTHOR
    COMMIT_SHA=$(get_git_commit_sha "$ROOT_DIR")
    COMMIT_URL=$(get_git_commit_url "$ROOT_DIR")
    AUTHOR=$(get_git_commit_author_name "$THIS_DIR")
    
    echo "Build ([$COMMIT_SHA]($COMMIT_URL)) of $APP@$WORKSPACE_BRANCH by $AUTHOR failed"
}

message=$(generate_slack_message "$ROOT_DIR" "$APP" "$WORKSPACE_BRANCH")

slack_color_log "$SLACK_WEBHOOK_LIBS" "$message" "#008000"