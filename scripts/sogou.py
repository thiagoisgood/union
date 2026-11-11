#!/usr/bin/env python3
"""Search Sogou, resolve real result URLs, and optionally fetch page text."""
import html
import re
import subprocess
import sys
import urllib.parse

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")
BASE = "https://www.sogou.com"


def get(url, head=False, maxlen=200000):
    args = ["curl", "-s", "-m", "25", "-A", UA]
    args += ["-I"] if head else ["-L"]
    args.append(url)
    return subprocess.run(args, stdout=subprocess.PIPE).stdout.decode("utf-8", "ignore")[:maxlen]


def search(q):
    out = get(BASE + "/web?query=" + urllib.parse.quote(q))
    items = re.findall(
        r'<h3[^>]*>(.*?)</h3>(.*?)(?=<h3|$)', out, re.S)
    for title_html, rest in items:
        title = html.unescape(re.sub("<[^>]+>", "", title_html)).strip()
        title = re.sub(r"\s+", " ", title)
        link = re.search(r'href="(/link\?url=[^"]+)"', rest)
        cite = re.search(r'<cite[^>]*>(.*?)</cite>', rest, re.S)
        if not title:
            continue
        print("T:", title[:130])
        if cite:
            print("C:", html.unescape(re.sub("<[^>]+>", "", cite.group(1)))[:180])
        if link:
            print("L:", BASE + html.unescape(link.group(1))[:400])
        print("---")


def resolve(link):
    out = get(link, head=True)
    m = re.search(r"(?im)^location:\s*(\S+)", out)
    return m.group(1) if m else ""


def text(url, maxlen=9000):
    out = get(url)
    t = re.search(r"<title>(.*?)</title>", out, re.S)
    body = re.sub(r"<script.*?</script>|<style.*?</style>", "", out, flags=re.S)
    txt = re.sub("<[^>]+>", "\n", body)
    lines = [html.unescape(x.strip()) for x in txt.split("\n") if x.strip()]
    return (html.unescape(t.group(1)) if t else ""), "\n".join(lines)[:maxlen]


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "search":
        search(" ".join(sys.argv[2:]))
    elif mode == "open":
        for link in sys.argv[2:]:
            real = resolve(link) if "sogou.com/link" in link else link
            print("REAL:", real)
            title, body = text(real)
            print("TITLE:", title)
            print(body)
            print("=" * 60)
