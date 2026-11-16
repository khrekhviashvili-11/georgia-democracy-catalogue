#!/usr/bin/env python3
"""Research OS, Lesson 1: catalogue record -> source PDF -> page-linked passages.

Outputs only short *candidate* passages. Does not use AI, publish full PDF text,
produce a verified briefing, or change catalogue.json.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlsplit

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
LAB = Path(__file__).resolve().parent
OUTPUT = LAB / "output"
MAX_PDF_BYTES = 20_000_000
MAX_EXCERPT_CHARS = 220
MAX_MATCHES = 12


def load_catalogue_record(identifier: str) -> tuple[dict, dict]:
    records = json.loads((ROOT / "catalogue.json").read_text(encoding="utf-8"))
    mapping = json.loads((LAB / "documents-map.json").read_text(encoding="utf-8"))
    record = next((x for x in records if x.get("id") == identifier), None)
    spec = mapping["documents"].get(identifier)
    if not record or not spec:
        raise ValueError(f"{identifier} was not found in both catalogue.json and documents-map.json")
    return record, spec


def download_pdf(url: str) -> bytes:
    parsed = urlsplit(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("Only mapped public HTTPS PDF links are supported.")
    request = Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; ResearchOSLearningLab/1.0)",
        "Accept": "application/pdf,*/*;q=0.5",
    })
    with urlopen(request, timeout=30) as response:
        body = response.read(MAX_PDF_BYTES + 1)
    if len(body) > MAX_PDF_BYTES:
        raise ValueError("PDF is too large for this learning test (>20 MB).")
    if not body.lstrip().startswith(b"%PDF-"):
        raise ValueError("The URL returned something other than a PDF. It may be a landing page or an access-denied response.")
    return body


def extract_candidates(data: bytes, terms: list[str]) -> tuple[int, int, list[dict]]:
    matches = []
    total_chars = 0
    with pymupdf.open(stream=data, filetype="pdf") as pdf:
        page_count = len(pdf)
        for i, page in enumerate(pdf):
            text = re.sub(r"\s+", " ", page.get_text("text", sort=True)).strip()
            total_chars += len(text)
            if not text:
                continue
            for term in terms:
                hit = re.search(re.escape(term), text, flags=re.IGNORECASE)
                if hit is None:
                    continue
                # One candidate for each term per page, with enough context for manual checking.
                left = max(0, hit.start() - 85)
                right = min(len(text), hit.end() + 120)
                fragment = text[left:right].strip()
                if left:
                    fragment = "…" + fragment
                if right < len(text):
                    fragment += "…"
                matches.append({
                    "term": term,
                    "pdf_page": i + 1,  # PDF viewer count; printed page may differ
                    "excerpt": fragment[:MAX_EXCERPT_CHARS],
                })
                if len(matches) >= MAX_MATCHES:
                    break
            if len(matches) >= MAX_MATCHES:
                break
    return page_count, total_chars, matches


def create_report(record: dict, spec: dict, pdf_bytes: bytes, terms: list[str]) -> tuple[dict, str]:
    pages, total_chars, matches = extract_candidates(pdf_bytes, terms)
    url = spec["document_url"]
    for match in matches:
        match["source_page_url"] = url + "#page=" + str(match["pdf_page"])
    result = {
        "record_id": record["id"],
        "catalogue_title": record["title"],
        "institution": record["institution"],
        "catalogue_landing_url": record["url"],
        "document_url": url,
        "document_symbol": spec.get("document_symbol"),
        "format": "pdf",
        "source_sha256": hashlib.sha256(pdf_bytes).hexdigest(),
        "checked_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "pdf_page_count": pages,
        "extracted_characters": total_chars,
        "keywords": terms,
        "candidate_passages": matches,
        "status": "needs_human_review" if total_chars else "needs_ocr_or_different_pdf",
        "important": "These are keyword-selected passages, not independently verified findings or an AI summary.",
    }
    lines = [
        "# Research OS — document extraction lab",
        "",
        f"**Record ID:** {record['id']}  ",
        f"**Title:** {record['title']}  ",
        f"**Institution:** {record['institution']}  ",
        f"**Catalogue link:** {record['url']}  ",
        f"**Full PDF:** {url}  ",
        f"**Pages:** {pages}  ",
        f"**Text extracted:** {total_chars:,} characters  ",
        f"**Status:** {result['status']}  ",
        "",
        "## Candidate passages with source pages",
        "",
    ]
    if not matches:
        lines.append("No candidate passages found. Check the source and search terms. A scan may need OCR.")
    for index, match in enumerate(matches, 1):
        lines.extend([
            f"### {index}. Search term: {match['term']}",
            f"**PDF page:** [{match['pdf_page']}]({match['source_page_url']})  ",
            f"> {match['excerpt']}",
            "",
        ])
    lines.extend([
        "## What this does NOT prove",
        "- A candidate excerpt is not an approved key finding.",
        "- PDF page number is the file's page index, not necessarily its printed page number.",
        "- This test does not add content to the live catalogue, train an AI model, or archive the entire PDF.",
        "- A legal researcher must verify context, the exact passage, and proper attribution.",
    ])
    return result, "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Research OS hands-on PDF extraction lesson")
    parser.add_argument("--id", default="GEO-015", help="ID already mapped in documents-map.json")
    parser.add_argument("--keywords", default="", help="Optional semicolon-separated search terms")
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    try:
        record, spec = load_catalogue_record(args.id)
        if spec.get("kind") != "pdf":
            raise ValueError("Lesson 1 supports only PDF, not HTML landing pages.")
        terms = [s.strip() for s in args.keywords.split(";") if s.strip()] or spec.get("keywords", [])
        terms = terms[:8]
        if not terms:
            raise ValueError("At least one search term is required.")
        pdf_bytes = download_pdf(spec["document_url"])
        result, markdown = create_report(record, spec, pdf_bytes, terms)
        (OUTPUT / "extraction.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        (OUTPUT / "report.md").write_text(markdown, encoding="utf-8")
        print(markdown)
        if summary := __import__("os").environ.get("GITHUB_STEP_SUMMARY"):
            with open(summary, "a", encoding="utf-8") as stream:
                stream.write(markdown)
        return 0
    except Exception as error:
        msg = f"Extraction failed for {args.id}: {type(error).__name__}: {error}"
        note = (
            "# Research OS — test could not read the PDF\n\n"
            + msg + "\n\n"
            + "If the institution blocks automated downloads (e.g. HTTP 403), "
            + "replace the mapped PDF URL with another official download link or "
            + "test a different catalogue ID. Failure is not evidence that the document does not exist.\n"
        )
        (OUTPUT / "report.md").write_text(note, encoding="utf-8")
        print(note, file=sys.stderr)
        if summary := __import__("os").environ.get("GITHUB_STEP_SUMMARY"):
            with open(summary, "a", encoding="utf-8") as stream:
                stream.write(note)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
