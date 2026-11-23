#!/usr/bin/env python3
"""陕西联合数据站自动更新。

流程：抓取直播吧按日资讯 -> 筛选陕西联合相关 -> 校验 -> 写入 auto_data.json
-> git 提交 -> 重建 union-api -> 健康检查 -> 打版本标签（保留最近 3 个）。

用法：
  python3 scripts/update_news.py --days 3 --dry-run     # 只抓取和校验，看报告
  python3 scripts/update_news.py --days 3 --apply       # 校验通过后写入并部署
  python3 scripts/update_news.py --since 2026-11-13 --apply
  python3 scripts/update_news.py --no-deploy --apply    # 只写数据，不重建容器
"""

import argparse
import gzip
import json
import re
import subprocess
import sys
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
from difflib import SequenceMatcher
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
AUTO_PATH = ROOT / "backend/app/auto_data.json"
PROGRESS_MD = ROOT / "PROGRESS.md"
VERSIONS_PATH = DATA / "versions.json"
HISTORY_PATH = DATA / "update_history.jsonl"
RUNS_DIR = DATA / "update_runs"
BACKUPS_DIR = DATA / "backups"

SITE = "https://union.mountainscene.top"
CST = timezone(timedelta(hours=8))
UA = "Mozilla/5.0 (compatible; union-data-bot/1.0; +https://union.mountainscene.top)"

KEEP_VERSIONS = 3
UNION_NAMES = ("陕西联合", "陕西长安联合")
CONTROVERSY_KW = (
    "处罚", "禁赛", "罚款", "争议", "误判", "漏判", "仲裁", "欠薪", "禁令",
    "抗议", "空场", "冲突", "违规", "打砸", "投掷", "终身禁足", "判决", "道歉", "声明",
)
MATCH_KW = ("战报", "击败", "战胜", "不敌", "客场", "主场", "轮", "比赛", "半场", "绝杀", "扳平")
TRANSFER_KW = ("转会", "加盟", "租借", "离队", "签约", "官宣", "引援", "续约", "买断", "解约")
INJURY_KW = ("伤", "复出", "康复", "手术", "赛季报销")
HONOR_KW = ("最佳", "入选", "荣誉", "奖", "夺冠", "冠军", "榜首", "第一", "纪录", "升至")
FANS_KW = ("球迷", "会员", "看台", "助威", "套票", "活动")
SCORE_RE = re.compile(r"(\d+)\s*[:：\-比]\s*(\d+)")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
CJK_DIGITS = "零一二三四五六七八九"


def parse_date(value):
    return datetime.strptime(value, "%Y-%m-%d").date()


def now() -> datetime:
    return datetime.now(CST)


def log(msg: str) -> None:
    print(f"[{now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}", flush=True)


def norm(text: str) -> str:
    text = unicodedata.normalize("NFKC", text or "").lower()
    return re.sub(r"[\s\W_]+", "", text)


def similar(a: str, b: str) -> float:
    return SequenceMatcher(None, norm(a), norm(b)).ratio()


def http_get(url: str, timeout: int = 12, retries: int = 2):
    last = (-1, b"")
    for attempt in range(retries + 1):
        try:
            req = Request(url, headers={"User-Agent": UA, "Referer": "https://news.zhibo8.com/"})
            with urlopen(req, timeout=timeout) as resp:
                return resp.status, resp.read()
        except HTTPError as exc:
            last = (exc.code, b"")
        except (URLError, TimeoutError, OSError) as exc:
            last = (-1, str(exc).encode())
        if attempt < retries:
            time.sleep(1.2 * (attempt + 1))
    return last


def fetch_day(day: date):
    url = f"https://news.zhibo8.com/zuqiu/json/{day.isoformat()}.htm"
    status, body = http_get(url)
    if status != 200:
        raise RuntimeError(f"{day} 接口返回 {status}")
    payload = json.loads(body.decode("utf-8", "replace"))
    return payload.get("video_arr") or []


def is_union(item: dict) -> bool:
    lable = item.get("lable") or ""
    title = item.get("title") or ""
    tags = [t.strip() for t in re.split(r"[,，]", lable)]
    if any(name in tags for name in UNION_NAMES):
        return True
    if "陕西" in lable and "联合" in lable:
        return True
    return any(name in title for name in UNION_NAMES)


def classify(title: str):
    if any(k in title for k in CONTROVERSY_KW):
        return "controversy", True
    if SCORE_RE.search(title) or any(k in title for k in MATCH_KW):
        return "match", False
    if any(k in title for k in TRANSFER_KW):
        return "transfer", False
    if any(k in title for k in INJURY_KW):
        return "injury", False
    if any(k in title for k in HONOR_KW):
        return "honor", False
    if any(k in title for k in FANS_KW):
        return "fans", False
    if any(k in title for k in ("专访", "表示", "坦言", "谈")):
        return "player", False
    return "club", False


def strip_html(text: str) -> str:
    text = re.sub(r"<script.*?</script>", "", text, flags=re.S | re.I)
    text = re.sub(r"<style.*?</style>", "", text, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"\s+", " ", text).strip()


def extract_summary(url: str) -> str:
    status, body = http_get(url)
    if status != 200:
        return ""
    html = body.decode("utf-8", "replace")
    for match in re.finditer(r"<p[^>]*>(.*?)</p>", html, flags=re.S):
        text = strip_html(match.group(1))
        if len(text) >= 20 and "直播吧" not in text[:12]:
            text = re.sub(r"^直播吧\d+月\d+日讯\s*", "", text)
            return text[:180]
    for match in re.finditer(r"<p[^>]*>(.*?)</p>", html, flags=re.S):
        text = strip_html(match.group(1))
        text = re.sub(r"^直播吧\d+月\d+日讯\s*", "", text)
        if len(text) >= 12:
            return text[:180]
    return ""


def make_source_key(day: str, filename: str) -> str:
    token = re.sub(r"[^A-Za-z0-9]", "", filename)[:12] or "item"
    return f"zb-{day}-{token}"


def load_auto() -> dict:
    if AUTO_PATH.exists():
        with AUTO_PATH.open(encoding="utf-8") as fh:
            data = json.load(fh)
    else:
        data = {}
    for key in ("sources", "news", "updates"):
        data.setdefault(key, [])
    data.setdefault("version", 0)
    return data


def load_static_news():
    sys.path.insert(0, str(ROOT / "backend"))
    try:
        from app.news_data import NEWS  # noqa: WPS433
        return list(NEWS)
    finally:
        sys.path.pop(0)


def fetch_matches():
    status, body = http_get(f"{SITE}/api/matches", timeout=10, retries=1)
    if status != 200:
        return []
    return json.loads(body.decode("utf-8", "replace"))


def score_conflict(item_title: str, day: str, matches):
    """返回 (状态, 说明)。状态取 ok / conflict / none。"""
    found = SCORE_RE.search(item_title)
    if not found:
        return "none", ""
    goals = {int(found.group(1)), int(found.group(2))}
    same_day = [m for m in matches if m.get("date") == day]
    if not same_day:
        return "none", ""
    for match in same_day:
        gf, ga = match.get("goals_for"), match.get("goals_against")
        if gf is None or ga is None:
            continue
        if {gf, ga} == goals:
            return "ok", f"与站内 {day} {match.get('opponent')} 一役比分一致"
    detail = "；".join(
        f"{m.get('opponent')} {m.get('goals_for')}:{m.get('goals_against')}" for m in same_day
    )
    return "conflict", f"当日站内比赛比分为 {detail}，与标题比分不同"


def validate(candidate: dict, existing, matches) -> dict:
    checks = []
    title = candidate["title"]
    day = candidate["date"]

    def add(key: str, ok: bool, detail: str, critical: bool = True) -> None:
        checks.append({"key": key, "ok": ok, "detail": detail, "critical": critical})

    add("title", bool(title.strip()), f"标题 {len(title)} 字")
    add("date", bool(DATE_RE.match(day)), f"日期 {day}")
    add("future", day <= now().date().isoformat(), "日期不晚于今天")

    url = candidate["source_url"]
    url_ok = url.startswith("https://news.zhibo8.com/zuqiu/")
    add("url_format", url_ok, url)

    status, body = http_get(url)
    page_title = ""
    if status == 200:
        html = body.decode("utf-8", "replace")
        found = re.search(r"<title>(.*?)</title>", html, flags=re.S)
        page_title = strip_html(found.group(1)) if found else ""
        if "404" in page_title or not page_title:
            status = -2
    ratio = similar(title, page_title) if page_title else 0.0
    add("url_ok", status == 200, f"HTTP {status}")
    add("title_match", ratio >= 0.5, f"原文标题相似度 {ratio:.2f}：{page_title[:40]}")

    duplicate = False
    dup_detail = ""
    for item in existing:
        if item.get("date") != day:
            continue
        if norm(item.get("title", "")) == norm(title):
            duplicate = True
            dup_detail = "同日期同标题已存在"
            break
        if similar(item.get("title", ""), title) >= 0.88:
            duplicate = True
            dup_detail = f"与已有条目近似：{item.get('title')}"
            break
    if not duplicate:
        for item in existing:
            if norm(item.get("title", "")) == norm(title):
                duplicate = True
                dup_detail = f"标题已存在（{item.get('date')}）"
                break
    add("duplicate", not duplicate, dup_detail or "无重复")

    conflict, conflict_detail = score_conflict(title, day, matches)
    if conflict != "none":
        add("score_conflict", conflict != "conflict", conflict_detail, critical=False)
    if status == 200:
        candidate["summary"] = extract_summary(url) or f"直播吧 {day} 报道，详见原文。"
    candidate["checks"] = checks
    candidate["ok"] = all(c["ok"] for c in checks if c["critical"])
    return candidate


def collect(days=None, since=None, until=None):
    today = now().date()
    if since:
        start = parse_date(since)
    else:
        start = today - timedelta(days=(days or 3) - 1)
    end = parse_date(until) if until else today
    errors = []
    candidates = {}
    day = start
    while day <= end:
        try:
            items = fetch_day(day)
        except Exception as exc:  # noqa: BLE001
            errors.append(str(exc))
            day += timedelta(days=1)
            continue
        hits = [it for it in items if is_union(it)]
        log(f"{day} 抓取 {len(items)} 条，陕西联合相关 {len(hits)} 条")
        for it in hits:
            url = "https://news.zhibo8.com" + it.get("url", "")
            key = f"{day}|{it.get('filename')}"
            candidates[key] = {
                "date": day.isoformat(),
                "title": (it.get("title") or "").strip(),
                "summary": "",
                "category": "",
                "scope": "recent",
                "is_controversy": False,
                "source_key": make_source_key(day.isoformat(), it.get("filename", "")),
                "source_url": url,
            }
        day += timedelta(days=1)
    return list(candidates.values()), errors


def apply_updates(news, run_ts: str, note: str):
    auto = load_auto()
    existing_keys = {s.get("key") for s in auto["sources"]}
    added_sources = []
    for item in news:
        key = item["source_key"]
        base = key
        idx = 2
        while key in existing_keys:
            key = f"{base}-{idx}"
            idx += 1
        item["source_key"] = key
        existing_keys.add(key)
        added_sources.append(
            {
                "key": key,
                "title": item["title"],
                "publisher": "直播吧",
                "url": item["source_url"],
                "published_at": item["date"],
                "note": f"定时任务自动抓取（{run_ts}）",
            }
        )
        item.pop("checks", None)
        item.pop("ok", None)

    auto["sources"].extend(added_sources)
    auto["news"].extend(news)

    max_loop = max([u.get("loop_index", 0) for u in auto["updates"]] + [98])
    loop_index = max_loop + 1
    auto["updates"].append(
        {
            "loop_index": loop_index,
            "phase": f"阶段{cn_number(loop_index)}",
            "title": f"定时更新：新增 {len(news)} 条新闻",
            "status": "completed",
            "completed_at": now().date().isoformat(),
            "detail": note,
        }
    )
    auto["version"] = int(auto.get("version", 0)) + 1
    auto["updated_at"] = now().isoformat(timespec="seconds")
    AUTO_PATH.write_text(json.dumps(auto, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return auto, loop_index


def cn_number(value: int) -> str:
    if value < 0:
        return str(value)
    if value < 10:
        return CJK_DIGITS[value]
    if value < 20:
        return "十" + (CJK_DIGITS[value - 10] if value > 10 else "")
    if value < 100:
        tens, ones = divmod(value, 10)
        return CJK_DIGITS[tens] + "十" + (CJK_DIGITS[ones] if ones else "")
    return str(value)


def append_progress_md(news, run_ts: str, note: str) -> None:
    if not PROGRESS_MD.exists():
        return
    lines = [
        "",
        f"## 定时更新 · {now().date().isoformat()} {now().strftime('%H:%M')}",
        "",
        f"本轮由 `scripts/update_news.py` 自动执行（{run_ts}）。{note}",
        "",
    ]
    for item in news:
        lines.append(f"- {item['date']} · {item['title']}（{item['source_url']}）")
    lines.append("")
    with PROGRESS_MD.open("a", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")


def run(cmd, check: bool = True, timeout: int = 600):
    return subprocess.run(cmd, cwd=ROOT, check=check, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True, timeout=timeout)


def backup_database(run_ts: str):
    BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
    target = BACKUPS_DIR / f"db-{run_ts}.sql.gz"
    try:
        proc = subprocess.run(
            ["docker", "exec", "union-db", "pg_dump", "-U", "union", "union"],
            cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=120,
        )
        if proc.returncode != 0:
            raise RuntimeError(proc.stderr.decode("utf-8", "replace")[:200])
        target.write_bytes(gzip.compress(proc.stdout))
        return target
    except Exception as exc:  # noqa: BLE001
        log(f"数据库备份失败：{exc}")
        return None


def prune_backups() -> None:
    if not BACKUPS_DIR.exists():
        return
    backups = sorted(BACKUPS_DIR.glob("db-*.sql.gz"), key=lambda p: p.stat().st_mtime, reverse=True)
    for old in backups[KEEP_VERSIONS:]:
        try:
            old.unlink()
        except FileNotFoundError:
            pass


def wait_health(seconds: int = 90) -> bool:
    deadline = time.time() + seconds
    while time.time() < deadline:
        status, body = http_get(f"{SITE}/api/health", timeout=5, retries=0)
        if status == 200 and b"ok" in body:
            return True
        time.sleep(3)
    return False


def deploy() -> bool:
    log("重建 union-api ...")
    proc = subprocess.run(
        ["docker", "compose", "up", "-d", "--build", "union-api"],
        cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True, timeout=600,
    )
    if proc.returncode != 0:
        log("重建失败：" + (proc.stderr or proc.stdout)[-500:])
        return False
    return wait_health()


def verify_counts(expected_min: int) -> bool:
    status, body = http_get(f"{SITE}/api/news", timeout=10)
    if status != 200:
        log("新闻接口不可用")
        return False
    count = len(json.loads(body.decode("utf-8", "replace")))
    log(f"/api/news 返回 {count} 条（预期至少 {expected_min}）")
    status, body = http_get(f"{SITE}/api/audit", timeout=10)
    if status == 200:
        audit = json.loads(body.decode("utf-8", "replace"))
        failed = [c for c in audit.get("checks", []) if c.get("status") != "pass"]
        log("审计：" + ("全部通过" if not failed else json.dumps(failed, ensure_ascii=False)[:300]))
    return count >= expected_min


def git_commit(paths, message: str):
    existing = [p for p in paths if (ROOT / p).exists()]
    if not existing:
        return None
    run(["git", "add", *existing])
    diff = run(["git", "diff", "--cached", "--quiet"], check=False)
    if diff.returncode == 0:
        log("无变更可提交")
        return None
    full_message = message + "\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
    run(["git", "commit", "-m", full_message])
    commit = run(["git", "rev-parse", "HEAD"]).stdout.strip()
    run(["git", "push", "origin", "main"], check=False, timeout=120)
    return commit


def write_versions(tag: str, commit: str, backup):
    versions = {"versions": []}
    if VERSIONS_PATH.exists():
        try:
            versions = json.loads(VERSIONS_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            versions = {"versions": []}
    versions["versions"] = [v for v in versions.get("versions", []) if v.get("tag") != tag]
    versions["versions"].insert(
        0,
        {
            "tag": tag,
            "commit": commit,
            "db_backup": str(backup.relative_to(ROOT)) if backup else "",
            "created_at": now().isoformat(timespec="seconds"),
        },
    )
    versions["versions"] = versions["versions"][:KEEP_VERSIONS]
    VERSIONS_PATH.write_text(json.dumps(versions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return []


def prune_tags(keep: str):
    out = run(
        ["git", "for-each-ref", "--sort=-committerdate", "--format=%(refname:short)", "refs/tags/site-*"]
    ).stdout
    tags = out.split()
    pruned = []
    for old in tags[KEEP_VERSIONS:]:
        if old == keep:
            continue
        run(["git", "tag", "-d", old], check=False)
        run(["git", "push", "origin", ":refs/tags/" + old], check=False)
        pruned.append(old)
    return pruned


def write_history(record: dict) -> None:
    HISTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    with HISTORY_PATH.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")


def write_report(run_ts: str, report: dict) -> Path:
    run_dir = RUNS_DIR / run_ts
    run_dir.mkdir(parents=True, exist_ok=True)
    path = run_dir / "report.json"
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path


def summarize(candidates) -> str:
    ok = [c for c in candidates if c.get("ok")]
    bad = [c for c in candidates if not c.get("ok")]
    lines = [f"候选 {len(candidates)} 条：通过 {len(ok)}，未通过 {len(bad)}"]
    for item in ok:
        lines.append(f"  ✓ {item['date']} [{item['category']}] {item['title']}")
    for item in bad:
        failed = [c["key"] for c in item["checks"] if c["critical"] and not c["ok"]]
        lines.append(f"  ✗ {item['date']} {item['title']} → {failed}")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="陕西联合数据站自动更新")
    parser.add_argument("--days", type=int, default=3, help="抓取最近 N 天（默认 3）")
    parser.add_argument("--since", help="起始日期 YYYY-MM-DD，优先于 --days")
    parser.add_argument("--until", help="结束日期 YYYY-MM-DD，默认今天")
    parser.add_argument("--apply", action="store_true", help="写入数据并部署")
    parser.add_argument("--no-deploy", action="store_true", help="只写数据，不重建容器")
    parser.add_argument("--dry-run", action="store_true", help="只抓取校验，不写入")
    args = parser.parse_args()

    run_ts = now().strftime("%Y%m%d-%H%M%S")
    log(f"开始运行 {run_ts}，抓取范围 {'--since ' + args.since if args.since else f'最近 {args.days} 天'}")

    try:
        candidates, errors = collect(args.days, args.since, args.until)
    except Exception as exc:  # noqa: BLE001
        log(f"抓取失败：{exc}")
        write_history({"ts": run_ts, "status": "fetch_failed", "error": str(exc)})
        return 2

    auto = load_auto()
    existing = load_static_news() + auto["news"]
    matches = fetch_matches()
    if not matches:
        log("比赛接口不可用，跳过比分交叉校验")

    with ThreadPoolExecutor(max_workers=6) as pool:
        candidates = list(pool.map(lambda c: validate(c, existing, matches), candidates))

    for item in candidates:
        if item.get("ok"):
            category, controversy = classify(item["title"])
            item["category"] = category
            item["is_controversy"] = controversy
            item["scope"] = "recent"
        # 通过校验的候选若已被更早的候选判定重复，validate 用同一 existing 快照，
        # 因此这里再做一次批内去重。
    accepted = []
    for item in sorted([c for c in candidates if c.get("ok")], key=lambda c: c["date"]):
        if any(similar(a["title"], item["title"]) >= 0.88 and a["date"] == item["date"] for a in accepted):
            item["ok"] = False
            item["checks"].append({"key": "batch_dup", "ok": False, "detail": "批内重复", "critical": True})
            continue
        accepted.append(item)

    print(summarize(candidates))
    if errors:
        print("抓取告警：")
        for err in errors:
            print("  -", err)

    report = {
        "ts": run_ts,
        "range": {"since": args.since or (now().date() - timedelta(days=args.days - 1)).isoformat(),
                  "until": args.until or now().date().isoformat()},
        "candidates": len(candidates),
        "accepted": len(accepted),
        "errors": errors,
        "items": candidates,
        "applied": False,
    }

    if not args.apply or args.dry_run:
        path = write_report(run_ts, report)
        log(f"仅校验模式，报告：{path.relative_to(ROOT)}")
        write_history({"ts": run_ts, "status": "dry_run", "candidates": len(candidates), "accepted": len(accepted)})
        return 0

    if not accepted:
        report["status"] = "no_new_items"
        path = write_report(run_ts, report)
        log(f"没有通过校验的新条目，未做变更。报告：{path.relative_to(ROOT)}")
        write_history({"ts": run_ts, "status": "no_new_items", "candidates": len(candidates)})
        return 0

    prev_commit = run(["git", "rev-parse", "HEAD"]).stdout.strip()
    backup = backup_database(run_ts)
    note = (
        f"自动抓取 {report['range']['since']} 至 {report['range']['until']} 的直播吧足球资讯，"
        f"筛选陕西联合相关 {len(candidates)} 条，通过校验 {len(accepted)} 条并入库；"
        f"校验含日期格式、原文链接可达与标题相似度、同日期去重、与站内比赛比分交叉比对。"
        f"数据库备份：{backup.name if backup else '失败'}。"
    )
    auto, loop_index = apply_updates(accepted, run_ts, note)
    append_progress_md(accepted, run_ts, note)

    message = f"定时更新：新增 {len(accepted)} 条新闻（阶段{cn_number(loop_index)}）"
    commit = git_commit(
        [
            "backend/app/auto_data.json",
            "PROGRESS.md",
            "data/versions.json",
            "data/update_history.jsonl",
        ],
        message,
    )
    if not commit:
        log("提交失败，终止")
        return 3

    report["applied"] = True
    report["commit"] = commit
    report["loop_index"] = loop_index

    if args.no_deploy:
        report["status"] = "applied_no_deploy"
        write_report(run_ts, report)
        write_history({"ts": run_ts, "status": "applied_no_deploy", "accepted": len(accepted), "commit": commit})
        log("已写入数据（未部署）")
        return 0

    total_news = len(load_static_news()) + len(auto["news"])
    deployed = deploy()
    verified = deployed and verify_counts(total_news)
    if not verified:
        log("部署或校验失败，自动回滚到上一版本")
        run(["git", "reset", "--hard", prev_commit], check=False)
        subprocess.run(
            ["docker", "compose", "up", "-d", "--build", "union-api"],
            cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True, timeout=600,
        )
        wait_health()
        report["status"] = "rolled_back"
        write_report(run_ts, report)
        write_history({"ts": run_ts, "status": "rolled_back", "accepted": len(accepted), "commit": commit})
        return 4

    tag = f"site-{now().strftime('%Y%m%d-%H%M')}"
    write_versions(tag, commit, backup)
    version_commit = git_commit(["data/versions.json"], f"记录版本 {tag}") or commit
    run(["git", "tag", "-f", tag, version_commit])
    run(["git", "push", "origin", tag, "--force"], check=False, timeout=120)
    pruned = prune_tags(tag)
    if pruned:
        log("清理旧版本标签：" + "、".join(pruned))
    prune_backups()

    report["status"] = "success"
    report["tag"] = tag
    write_report(run_ts, report)
    write_history({"ts": run_ts, "status": "success", "accepted": len(accepted), "commit": version_commit, "tag": tag})
    git_commit(["data/update_history.jsonl"], f"记录更新历史 {run_ts}")
    log(f"更新完成：{len(accepted)} 条，版本 {tag}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
