# Research OS — Lesson 1: connect a catalogue entry to the actual document

**Real project:** [Georgia Democracy Catalogue](../index.html)  
**Scope:** first two public records, GEO-015 and GEO-003. The main catalogue is unchanged.

## The mental model

There are four distinct things:
1. `catalogue.json`: an **index** of documents, with stable `id`, title, institution, topical labels, and `url` (often a landing page).
2. `documents-map.json`: a **document locator**, keyed by the same `id`, which adds a direct `document_url`, document type, language, and symbol.
3. `extract_document.py`: a **reader/extractor**. It downloads a PDF, extracts page text, searches for keywords, and returns short candidate passages with PDF page indexes.
4. The GitHub Actions workflow: a **temporary computer** that runs this Python script on demand. GitHub Pages is static: it cannot execute the Python program itself.

The relationship is `catalogue ID → document locator → PDF → extracted page text → review candidates`.

## Start the practical test (no coding required)

1. Open [Research OS manual test](https://github.com/khrekhviashvili-11/georgia-democracy-catalogue/actions/workflows/research-os-extract-pdf.yml).
2. Select **Run workflow**, keep the branch `main`, choose `GEO-015`, and leave `keywords` empty.
3. Press **Run workflow**. Open the run and inspect its **Summary**.
4. Look for the original catalogue ID, direct PDF URL, extracted characters, and short candidate passages with PDF page references.
5. Open one linked PDF page and compare the excerpt to the original source.
6. Try `GEO-003` as a second example; it is linked through a UN landing page to a separate PDF. If the UN download responds with HTTP 403, read the failure explanation: this is an access issue, not proof the record is absent.

The workflow does **not** run daily. It does **not** change the catalogue or publish a briefing. Output files `report.md` and `extraction.json` are attached to the run for 7 days.

## How to read the results

- `status=needs_human_review`: extraction found readable text; still NOT a validated key finding.
- `pdf_page`: page number in the PDF viewer (may differ from the printed page).
- `source_page_url`: direct link to the PDF and selected page.
- `source_sha256`: document fingerprint to track whether the downloaded PDF bytes change.
- `candidate_passages`: literal search hits with context, not an AI-written summary.
- `needs_ocr_or_different_pdf`: the document may be image-only or not have useful text.

## Critical limitations

- Many entries link to **HTML landing pages** rather than PDF files. Their `document_url` must first be resolved, or the HTML must be processed with an HTML extractor. This pilot handles PDFs only.
- Some sites disallow automated PDF downloads. A failed download is a source access issue requiring a different official URL or an authorized manual file input.
- PDF text order can be imperfect, especially in tables or multiple columns. OCR for scanned PDFs is deliberately NOT included in this first lesson.
- This does not produce verified conclusions or automatically classify findings; content analysis and legal checks are a separate next lesson.
- The repo and GitHub Actions run summaries are **public**. Use official public documents only; do not upload client records, personal data, or API secrets.

## Future lessons

**Lesson 2:** Confirm document links for ten catalogue records, including HTML vs PDF, and record extraction status.

**Lesson 3:** Store normalized page or paragraph references, not just an unstructured full text blob.

**Lesson 4:** Use an AI model to generate draft key findings constrained to the extracted passages, with precise evidence references.

**Lesson 5:** Independent legal/analytical QA. Only after approval attach structured briefs to the main catalogue.

**Lesson 6:** Periodic updates and monitoring with a history of changes. No automation before one-off retrieval works reliably.
