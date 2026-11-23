#!/usr/bin/env bash
# 回退陕西联合数据站到指定版本（最近 3 个版本之一）。
#
# 用法：
#   scripts/rollback.sh --list            # 列出可回退版本
#   scripts/rollback.sh --to prev         # 回退到上一版本
#   scripts/rollback.sh --to prev2        # 回退到上上个版本
#   scripts/rollback.sh --to site-20261123-1700
#   scripts/rollback.sh --to prev --restore-db   # 同时恢复该版本对应的数据库快照
#
# 说明：站点的新闻与进度数据保存在 backend/app/auto_data.json，随 git 版本走，
# 因此 git 回退即可恢复网站数据；--restore-db 仅用于数据库被独立改动过的场景。

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

VERSIONS_FILE="data/versions.json"
HISTORY_FILE="data/update_history.jsonl"
SITE="https://union.mountainscene.top"

log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }

list_versions() {
  if [[ ! -f "$VERSIONS_FILE" ]]; then
    echo "没有版本记录（$VERSIONS_FILE 不存在）"
    return 0
  fi
  python3 - "$VERSIONS_FILE" <<'PY'
import json, sys
data = json.load(open(sys.argv[1], encoding="utf-8"))
for i, v in enumerate(data.get("versions", [])):
    print(f"{i}\t{v['tag']}\t{v['created_at']}\t{v.get('db_backup') or '无数据库快照'}")
PY
}

resolve_target() {
  local arg="$1"
  python3 - "$VERSIONS_FILE" "$arg" <<'PY'
import json, sys
path, arg = sys.argv[1], sys.argv[2]
data = json.load(open(path, encoding="utf-8"))
versions = data.get("versions", [])
if arg.startswith("site-"):
    print(arg)
    sys.exit(0)
index = {"latest": 0, "prev": 1, "prev2": 2, "0": 0, "1": 1, "2": 2}.get(arg)
if index is None or index >= len(versions):
    sys.exit(1)
print(versions[index]["tag"])
PY
}

restore_db() {
  local tag="$1"
  local backup
  backup="$(python3 - "$VERSIONS_FILE" "$tag" <<'PY'
import json, sys
data = json.load(open(sys.argv[1], encoding="utf-8"))
for v in data.get("versions", []):
    if v["tag"] == sys.argv[2]:
        print(v.get("db_backup") or "")
        break
PY
)"
  if [[ -z "$backup" || ! -f "$backup" ]]; then
    log "未找到 $tag 对应的数据库快照，跳过数据库恢复"
    return 0
  fi
  log "恢复数据库快照 $backup"
  docker compose stop union-api >/dev/null 2>&1 || true
  gunzip -c "$backup" | docker exec -i union-db psql -U union -d union -q
  log "数据库已恢复"
}

TARGET=""
RESTORE_DB=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --list) list_versions; exit 0 ;;
    --restore-db) RESTORE_DB=1; shift ;;
    --to) TARGET="${2:-}"; shift 2 ;;
    --to=*) TARGET="${1#*=}"; shift ;;
    -h|--help) sed -n '2,15p' "$0"; exit 0 ;;
    *) TARGET="$1"; shift ;;
  esac
done

if [[ -z "$TARGET" ]]; then
  echo "请指定目标版本：--to prev | --to prev2 | --to <tag>，或 --list 查看版本"
  exit 1
fi

TAG="$(resolve_target "$TARGET")" || {
  echo "无法解析目标版本：$TARGET（可用 --list 查看）"
  exit 1
}

if ! git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  echo "本地不存在标签 $TAG"
  exit 1
fi

CURRENT="$(git rev-parse HEAD)"
TARGET_COMMIT="$(git rev-parse "$TAG^{commit}")"
if [[ "$CURRENT" == "$TARGET_COMMIT" ]]; then
  log "当前已经是 $TAG"
  exit 0
fi

if [[ -n "$(git status --porcelain -- backend PROGRESS.md data scripts)" ]]; then
  log "检测到未提交的变更，请先提交或暂存后再回退"
  git status --short -- backend PROGRESS.md data scripts
  exit 1
fi

log "回退：${CURRENT:0:8} → $TAG（${TARGET_COMMIT:0:8}）"
git reset --hard "$TARGET_COMMIT"

if [[ "$RESTORE_DB" == "1" ]]; then
  restore_db "$TAG"
fi

log "重建 union-api ..."
docker compose up -d --build union-api

log "等待服务健康 ..."
for _ in $(seq 1 30); do
  if curl -fsS -m 5 "$SITE/api/health" | grep -q ok; then
    break
  fi
  sleep 3
done

if ! curl -fsS -m 5 "$SITE/api/health" | grep -q ok; then
  log "健康检查失败，请人工排查"
  exit 2
fi

mkdir -p data
printf '{"ts":"%s","status":"rollback","tag":"%s","from":"%s"}\n' \
  "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$TAG" "${CURRENT:0:8}" >> "$HISTORY_FILE"

log "回退完成，当前版本 $TAG"
curl -fsS -m 10 "$SITE/api/news" | python3 -c 'import sys,json;print("新闻条数：",len(json.load(sys.stdin)))' || true
