#!/usr/bin/env bash
set -euo pipefail

# Skill: 更新本地代码
# Usage: ./scripts/update_local_code.sh
# Safe helper to:
# 1. Detect remote default branch (main/master)
# 2. Create a backup branch for current HEAD
# 3. Commit any uncommitted changes (optional)
# 4. Switch to the remote default branch and update from origin
# 5. Merge current branch into the default branch (if applicable)
# 6. Push the updated default branch
#
# This script is conservative: it creates backups before doing destructive actions.

TIMESTAMP=$(date +%Y%m%d%H%M%S)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD || echo "HEAD")

# find remote default (origin/main or origin/master)
if git show-ref --verify --quiet refs/remotes/origin/main; then
  REMOTE_REF="origin/main"
  REMOTE_BRANCH="main"
elif git show-ref --verify --quiet refs/remotes/origin/master; then
  REMOTE_REF="origin/master"
  REMOTE_BRANCH="master"
else
  # fallback to remote HEAD
  REMOTE_BRANCH=$(git remote show origin | awk -F': ' '/HEAD branch/ {print $2}' | tr -d '\r')
  REMOTE_REF="origin/${REMOTE_BRANCH}"
fi

echo "Current branch: ${CURRENT_BRANCH}
Remote default branch: ${REMOTE_BRANCH} (${REMOTE_REF})"

# create backup
BACKUP_BRANCH="backup/${CURRENT_BRANCH}-${TIMESTAMP}"
git branch "${BACKUP_BRANCH}"
echo "Created backup branch: ${BACKUP_BRANCH} -> $(git rev-parse --short HEAD)"

# commit uncommitted changes if any (conservative save)
if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted changes detected: creating a local save commit."
  git add -A
  git commit -m $'Auto: save local changes before updating repo\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>' || true
fi

# ensure local default branch exists and update it
if git rev-parse --verify --quiet "${REMOTE_BRANCH}" >/dev/null 2>&1; then
  git switch "${REMOTE_BRANCH}"
else
  git switch -c "${REMOTE_BRANCH}" "${REMOTE_REF}"
fi

echo "Fetching and rebasing ${REMOTE_BRANCH} from origin..."
git fetch origin --quiet
git pull --rebase origin "${REMOTE_BRANCH}"

# if coming from another branch, merge it
if [ "${CURRENT_BRANCH}" != "${REMOTE_BRANCH}" ]; then
  echo "Merging ${CURRENT_BRANCH} into ${REMOTE_BRANCH}"
  git merge --no-ff "${CURRENT_BRANCH}" -m $'Merge branch "'"${CURRENT_BRANCH}"'" into ${REMOTE_BRANCH}\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>' || {
    echo "Merge conflicted. Resolve conflicts manually. Backup saved at ${BACKUP_BRANCH}."
    exit 2
  }
else
  echo "Already on ${REMOTE_BRANCH}; no merge needed."
fi

# push the updated default branch
BRANCH_TO_PUSH=$(git rev-parse --abbrev-ref HEAD)
echo "Pushing ${BRANCH_TO_PUSH} to origin"
git push origin "${BRANCH_TO_PUSH}"

echo "Update complete. Backup: ${BACKUP_BRANCH}"