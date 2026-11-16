#!/usr/bin/env python3
"""Beginner Learning OS lab: inspect a public webpage and report candidate document links.

This deliberately does NOT publish to the catalogue, send notifications,
detect changes since previous runs, or invoke an AI model.
"""
import argparse
import datetime as dt
import html
import json
import os
import re
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

MAX_BYTES = 1_500_000
EXAMPLE_HTML = """<!DOCTYPE html><html><head><title>TRAINING DEMO — Public documents</title></head>
<body><h1>Demo page: not real publications</h1>
<a href="/example-2026-report.pdf">DEMO Georgia 2026 annual report (fictional)</a>
<a href="/another-document">DEMO Georgia human rights update (fictional)</a>
<a href="/contact">Contact details</a></body></html>"""
TERMS = ("georgia", "report", "publication", "document", "human rights", "pdf", "საქართველ")


class PageReader(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_title = False
        self.title = ""
        self.links = []
        self.active_link = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "a" and attrs.get("href"):
            self.active_link = {"href": attrs["href"], "text": ""}

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "a" and self.active_link:
            self.links.append(self.active_link)
            self.active_link = None

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.active_link is not None:
            self.active_link["text"] += data


def analyze_page(source_url, page_html, is_demo=False):
    parser = PageReader()
    parser.feed(page_html)
    candidates = []
    seen = set()
    for entry in parser.links:
        href = urljoin(source_url, html.unescape(entry["href"]))
        parsed = urlparse(href)
        if parsed.scheme not in ("https", "http"):
            continue
        label = re.sub(r"\s+", " ", entry["text"]).strip()[:160]
        combined = (label + " " + href).lower()
        if not any(term in combined for term in TERMS):
            continue
        if href in seen:
            continue
        seen.add(href)
        candidates.append({"title": label or "(no title)", "url": href})
    return {
        "source": source_url, "title": parser.title.strip()[:180],
        "demo": is_demo, "candidate_count": len(candidates),
        "candidates": candidates[:12],
        "note": "Possible matching links, NOT verified new documents.",
    }


def fetch_html(url):
    parsed = urlparse(url)
    if parsed.scheme != "https":
        raise ValueError("Use a public HTTPS URL.")
    if not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("Invalid public URL.")
    request = Request(url, headers={
        "User-Agent": "LearningOSSourceCheck/1.0 (+educational; public sources only)",
        "Accept": "text/html,application/xhtml+xml",
    })
    with urlopen(request, timeout=15) as response:
        content_type = response.headers.get("Content-Type", "")
        if "text/html" not in content_type:
            raise ValueError("Expected an HTML page, got " + content_type)
        payload = response.read(MAX_BYTES)
        charset = response.headers.get_content_charset() or "utf-8"
        return payload.decode(charset, errors="replace")


def as_markdown(records, mode):
    timestamp = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    out = [
        "# Learning OS · Source monitoring lab",
        "",
        f"**Mode:** {mode.upper()}  ",
        f"**Checked:** {timestamp}  ",
        "**Purpose:** Test whether a public webpage can be read and find candidate links. "
        "This does not yet compare results against previous runs.",
        "",
    ]
    if mode == "demo":
        out.append("**TEST DATA ONLY. The sample documents and links are fictional.**\n")
    for i, rec in enumerate(records, start=1):
        out.append(f"## {i}. {rec.get('title') or rec['source']}")
        out.append(f"- URL: {rec['source']}")
        if rec.get("error"):
            out.append(f"- **Status:** FAILED — {rec['error']}")
        else:
            out.append(f"- **Status:** OK — {rec['candidate_count']} candidate links")
            for link in rec["candidates"]:
                safe_title = link["title"].replace("|", " ")
                out.append(f"  - [{safe_title}]({link['url']})")
            if rec["candidate_count"] > len(rec["candidates"]):
                out.append(f"  - ... {rec['candidate_count'] - len(rec['candidates'])} more matches")
        out.append("")
    out.extend([
        "## Read this result correctly",
        "- An 'OK' status means the HTML was read. It does not mean a new report was published.",
        "- Candidate links are not a verified publication catalogue.",
        "- The next lesson will save a baseline and compare new results to earlier checks.",
        "- Do not upload confidential material or API keys to this public repository.",
    ])
    return "\n".join(out) + "\n"


def run(mode, url):
    if mode == "demo":
        return [analyze_page("https://example.invalid/demo", EXAMPLE_HTML, True)]
    urls = [u.strip() for u in url.split(",") if u.strip()]
    if not urls or len(urls) > 3:
        raise ValueError("Provide 1–3 HTTPS URLs separated by commas.")
    results = []
    for source in urls:
        try:
            parsed = urlparse(source)
            if parsed.hostname in ("localhost",) or (parsed.hostname or "").endswith((".local", ".internal")):
                raise ValueError("Private/local URLs are not allowed.")
            page = fetch_html(source)
            results.append(analyze_page(source, page))
        except (HTTPError, URLError, ValueError, TimeoutError, OSError) as err:
            results.append({"source": source, "error": str(err), "candidate_count": 0, "candidates": []})
    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("demo", "live"), default="demo")
    parser.add_argument("--url", default="https://www.osce.org/odihr")
    args = parser.parse_args()

    records = run(args.mode, args.url)
    report = as_markdown(records, args.mode)
    os.makedirs("learning/monitor/output", exist_ok=True)
    with open("learning/monitor/output/report.md", "w", encoding="utf-8") as f:
        f.write(report)
    with open("learning/monitor/output/report.json", "w", encoding="utf-8") as f:
        json.dump({"mode": args.mode, "results": records}, f, ensure_ascii=False, indent=2)
    print(report)
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write(report)


if __name__ == "__main__":
    main()
