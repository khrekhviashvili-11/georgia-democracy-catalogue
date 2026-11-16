# Research library preview

This is an isolated, non-production research interface at `research.html`. The existing `index.html` and `catalogue.json` are unchanged.

## Collections
- `catalogue.json`: existing international documents.
- `data/georgian.json`: Georgian NGO, media and national institution records (currently empty).
- `data/government.json`: Georgian government communications (currently empty).

The international collection defaults to documents dated 2024 onward. The baseline view displays pre-2024 records only if such records are added. No historical documents are fabricated.

## Optional fields
Existing records are compatible. Optional additional fields are `findings: string[]`, `recommendations: string[]`, `period`, and `collection`. Export never invents missing analysis.

## Exports
Markdown, CSV, and browser print-to-PDF operate on the currently filtered collection. The print option uses the browser's print dialog. All processing happens client-side; no AI model, external API, or Google Drive connection is involved.

## Testing
Open `research.html` through a static web server or GitHub Pages branch preview, not directly from the local filesystem. Check all tabs, search, topic filters, time modes, export file content, empty collections, and mobile layout. Verify the existing `index.html` separately.

## Deployment
Do not merge until the owner reviews the preview. This branch does not alter the public home page. For future expansion, first validate data schema and document links, then add verified baseline documents and metadata. A future navigation link can be added to the existing site after approval.
