#!/usr/bin/env bash
set -euo pipefail
# set -x

JOB_ID=$1

THIS_FILE=$(readlink -f "${BASH_SOURCE[0]}")
THIS_DIR=$(dirname "$THIS_FILE")
ROOT_DIR=$(dirname "$THIS_DIR")
. "$THIS_DIR/kash/kash.sh"
APP=$(get_app_name)

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
    local TEST_RESULT="$3"
    local COMMIT_SHA
    local COMMIT_URL
    local AUTHOR
    local BUILD_STATUS
    COMMIT_SHA=$(get_git_commit_sha "$ROOT_DIR")
    COMMIT_URL=$(get_git_commit_url "$ROOT_DIR")
    AUTHOR=$(get_git_commit_author_name "$THIS_DIR")
    if [ "$TEST_RESULT" = "failure" ]; then
        BUILD_STATUS="failed"
    else
        BUILD_STATUS="passed"
    fi
    echo "Build ([${COMMIT_SHA}](${COMMIT_URL})) of $APP by $AUTHOR $BUILD_STATUS"
}

get_slack_color() {
    local TEST_RESULT="$1"
    if [ "$TEST_RESULT" = "failure" ]; then
      echo "#a30200"
    else
        echo "#2eb886"
    fi
}

MESSAGE=$(generate_slack_message "$ROOT_DIR" "$APP" "$TEST_RESULT")
COLOR=$(get_slack_color "$TEST_RESULT")

slack_color_log "$SLACK_WEBHOOK_LIBS" "$MESSAGE" "$COLOR"