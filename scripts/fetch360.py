#!/usr/bin/env python3
"""Resolve 360 search redirect URLs and fetch page text."""
import html
import re
import subprocess
import sys

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")


def resolve(url):
    out = subprocess.run(["curl", "-s", "-I", "-m", "15", "-A", UA, url],
                         capture_output=True).stdout.decode("utf-8", "ignore")
    m = re.search(r"(?im)^location:\s*(\S+)", out)
    return m.group(1) if m else url


def fetch(url, maxlen=8000):
    out = subprocess.run(["curl", "-s", "-m", "25", "-L", "-A", UA, url],
                         capture_output=True).stdout.decode("utf-8", "ignore")
    t = re.search(r"<title>(.*?)</title>", out, re.S)
    body = re.sub(r"<script.*?</script>|<style.*?</style>", "", out, flags=re.S)
    txt = re.sub("<[^>]+>", "\n", body)
    lines = [html.unescape(x.strip()) for x in txt.split("\n") if x.strip()]
    seen, out_lines = set(), []
    for line in lines:
        if line in seen:
            continue
        seen.add(line)
        out_lines.append(line)
    return (html.unescape(t.group(1)) if t else ""), "\n".join(out_lines)[:maxlen]


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        real = resolve(arg)
        print("REAL:", real)
        title, text = fetch(real)
        print("TITLE:", title)
        print(text)
        print("=" * 60)
