# Approved artwork renderer verification

Verified on 31 October 2026.

## Assets and policy

- Inspected actual blank front (1054×1492) and back (1024×1536).
- Immutable background copies are byte-identical to those supplied files; SHA-256 checked in tests and server PDF resource loading.
- A4 proportional fit, 12 pt minimum margin; each page retains its own aspect ratio.
- Original fonts absent. Local OFL DM Sans Regular/Bold is an explicitly approximate substitute, embedded as TTF in PDF.
- Shared top-left coordinates, line fitting, baselines and photo mask for SVG/pdf-lib.

## Completed checks

- Production build passed. Vite still reports large bundle warnings; this is not a build failure.
- 24 Node tests passed, including existing authentication, permissions, revision conflicts, import/export, calculations and approval tests.
- New tests cover PDF authentication/class scope, published-only bulk batches, mapping snapshots, field coverage/bounds, incompatible printed profiles, empty/0/AB, long names, unsupported glyphs, missing signatures and A4 PDF generation.
- Existing clear-term assertion now accepts Mongoose's omission of an empty Mixed object as equivalent to `{}`. Production clear/save/calculation logic is unchanged.
- Tests ran on an isolated MongoMemoryServer with the existing MongoDB 7.0.14 binary, never on the user's configured database. The initial binary download failed because the disk was nearly full; only that failed download was removed, and the full suite then passed.
- Real Chrome smoke test in an isolated, explicitly labelled demo context: front/back preview, live marks/co-scholastic changes, zoom, calibration movement/JSON export, and hidden teacher calibration controls. No browser errors.
- Generated and visually inspected both sample PDF pages with PyMuPDF. Selectable text: 182 characters front, 296 back (the rest of the headings are intentionally raster artwork).
- Inspected portrait clipping inside the shield and proportionally fitted signature crops.
- Generated 50% translucent overlays and 3× contrast difference images against both filled references, with a local comparison HTML view.
- Compared actual browser SVG screenshots with rasterized PDF at the same A4 scale: mean absolute channel differences 1.621/255 front and 2.189/255 back. Residual edges are consistent with different rasterizers/rounding; this is not a claim of pixel equality.

## Remaining limits

- Original overlay typography cannot be verified without original font files. Current subsets are Latin; unsupported text explicitly blocks export rather than substituting glyphs.
- Reference and approved blanks already differ in static school text, table positions and decorations. Student values/signature samples also differ, and the engine fixes the reference's incorrect Social Science total. Those differences remain visible intentionally.
- The fixed seven-subject/five-activity artwork cannot represent arbitrary class profiles; a compatible template is required for other subjects or limits.
- Calibration persistence is a deployment-operator source replacement plus rebuild/restart, not an application write endpoint. Versioned assets must be retained.
- Previously published, unversioned reports retain their legacy renderer/print workflow.
- Physical duplex print registration and printer-specific scaling were not tested.
- Bulk export is capped at 50 records; a published one-record bulk batch was exercised by integration tests. A 50-student stress test was not run.

## Main changed files

- `client/src/Report.jsx`, `LegacyReport.jsx`, `Calibration.jsx`, `report-export.js`: artwork preview, legacy preservation, calibration, PDF/print controls.
- `client/src/main.jsx`, `api.js`, `style.css`: integration with existing studio/bulk/demo workflows and print rules.
- `shared/template-mapping.json`, `report-template.js`, `report-pdf.js`: mapping and shared renderer.
- `server/src/report-renderer.js`, `app.js`, `models.js`: authenticated Node export and publication snapshots.
- `client/public/templates/`: supplied artwork, immutable copies and licensed local fonts.
- `server/test/report-template.test.js`, `api.test.js`, `scripts/`: tests and reproducible sample/visual QA.
- Workspace package manifests/lockfile and README: dependencies and operational documentation.

Neither `server/.env` nor existing MongoDB records were edited as part of this rendering work.
