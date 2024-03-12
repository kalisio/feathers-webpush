#!/usr/bin/env bash
set -euo pipefail
# set -x

## Function to send slack message
get_git_commit_url() {
    local ROOT_DIR="$1"
    local APP="$2"
    local REPO_NAME="${APP##*/}"
    local COMMIT_SHA
    COMMIT_SHA=$(get_git_commit_sha "$ROOT_DIR")
    local GITHUB_REPO_URL="https://github.com/kalisio/$REPO_NAME"
    local COMMIT_URL="$GITHUB_REPO_URL/commit/$COMMIT_SHA"
    echo "$COMMIT_URL"
}

get_commit_checks_url() {
    local ROOT_DIR="$1"
    local APP="$2"
    local REPO_NAME="${APP##*/}"
    local COMMIT_SHA
    COMMIT_SHA=$(get_git_commit_sha "$ROOT_DIR")
    echo "https://github.com/kalisio/$REPO_NAME/commit/$COMMIT_SHA/checks"
}

generate_slack_message() {
    local ROOT_DIR="$1"
    local APP="$2"
    local BUILD_STATUS="$3"
    local COMMIT_SHA
    local COMMIT_URL
    local COMMIT_CHECKS_URL
    local AUTHOR
    local BUILD_STATUS
    COMMIT_SHA=$(get_git_commit_sha "$ROOT_DIR")
    COMMIT_URL=$(get_git_commit_url "$ROOT_DIR" "$APP")
    COMMIT_CHECKS_URL=$(get_commit_checks_url "$ROOT_DIR" "$APP")
    AUTHOR=$(get_git_commit_author_name "$THIS_DIR")
    echo "<${COMMIT_CHECKS_URL}|Build> <${COMMIT_URL}|${COMMIT_SHA}> of $APP by $AUTHOR $BUILD_STATUS"
}

send_slack_message() {
    local ROOT_DIR="$1"
    local NODE_VER="$2"
    local APP="$3"
    local BUILD_STATUS="$4"
    local MESSAGE
    local COLOR
    MESSAGE=$(generate_slack_message "$ROOT_DIR" "$APP" "$BUILD_STATUS")
    if [ "$BUILD_STATUS" = "failed" ]; then
        COLOR="#a30200"
    else
        COLOR="#2eb886"
    fi
    if [ "$NODE_VER" -eq 16 ]; then
        slack_color_log "$SLACK_WEBHOOK_LIBS" "$MESSAGE" "$COLOR"
    fi
}


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
init_lib_infos "$ROOT_DIR"

APP=$(get_lib_name)
VERSION=$(get_lib_version)

echo "About to run tests for ${APP} v${VERSION} ..."

. "$WORKSPACE_DIR/development/workspaces/libs/libs.sh" feathers-webpush

## Notify Slack in case of failure
##

trap 'send_slack_message "$ROOT_DIR" "$APP" "failed"' ERR

## Run tests
##

use_node "$NODE_VER"
yarn && yarn test

## Publish code coverage
##
if [ "$NODE_VER" -eq 16 ]; then
    send_coverage_to_cc 8e87a996279373f05f01ce8166aac1bc9dda990e9a2f936af25e5aa11326b127
fi


## Notify on slack upon successful completion
##

send_slack_message "$ROOT_DIR" "$APP" "passed"
