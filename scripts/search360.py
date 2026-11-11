#!/usr/bin/env python3
"""Search 360 and print title/summary/real-url; or fetch page text."""
import html
import re
import subprocess
import sys
import urllib.parse

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")


def curl(url, head=False):
    args = ["curl", "-s", "-m", "25", "-A", UA]
    args += ["-I"] if head else ["-L"]
    args.append(url)
    return subprocess.run(args, stdout=subprocess.PIPE).stdout.decode("utf-8", "ignore")


def search(q, page=1):
    out = curl("https://www.so.com/s?q=" + urllib.parse.quote(q) + "&pn=%d" % page)
    blocks = re.findall(r'<li class="res-list.*?</li>', out, re.S)
    for b in blocks:
        t = re.search(r"<h3[^>]*>(.*?)</h3>", b, re.S)
        d = re.search(r'<p class="res-desc"[^>]*>(.*?)</p>', b, re.S)
        if not d:
            d = re.search(r'<span class="res-list-summary"[^>]*>(.*?)</span>', b, re.S)
        u = re.search(r'data-mdurl="([^"]+)"', b)
        if t:
            print("T:", html.unescape(re.sub("<[^>]+>", "", t.group(1)))[:130])
        if d:
            print("D:", html.unescape(re.sub("<[^>]+>", "", d.group(1)))[:350])
        if u:
            print("U:", u.group(1)[:220])
        print("---")


def text(url, maxlen=9000):
    out = curl(url)
    t = re.search(r"<title>(.*?)</title>", out, re.S)
    body = re.sub(r"<script.*?</script>|<style.*?</style>", "", out, flags=re.S)
    txt = re.sub("<[^>]+>", "\n", body)
    lines = [html.unescape(x.strip()) for x in txt.split("\n") if x.strip()]
    seen, keep = set(), []
    for line in lines:
        if line in seen:
            continue
        seen.add(line)
        keep.append(line)
    return (html.unescape(t.group(1)) if t else ""), "\n".join(keep)[:maxlen]


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "search":
        search(" ".join(sys.argv[2:]))
    elif mode == "open":
        for url in sys.argv[2:]:
            title, body = text(url)
            print("URL:", url)
            print("TITLE:", title)
            print(body)
            print("=" * 60)
