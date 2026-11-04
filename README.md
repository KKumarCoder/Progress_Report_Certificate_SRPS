# SRPS Report Studio · MERN ERP

A React + Express + MongoDB + Node.js school report-card generator for **Shree Ram Public School, Kanhra–Badhra**.

## What is implemented

- Password-based staff login with bcrypt hashing, HTTP-only session cookies, session revocation and request-origin checks.
- Administrator, principal and teacher roles. Teacher access is enforced by the API against assigned **class + section pairs**, including direct URL access. Classes 1–12, sections Venus/Mars, and house fields.
- Student directory: add, edit, archive, photo upload, search and class/section filters. Archived students' reports remain stored.
- `.xlsx` bulk student import: template download, row validation, preview, duplicate detection, optional update of matching admission numbers; otherwise skip. Up to 2,000 rows and 5 MB per upload. Formula/rich-text input cells rejected.
- Split workspace: editable marks on the left; live, dynamic front/back report preview on the right, with page switching and zoom.
- Term I/II marks saved separately inside an academic-session report. Save/update draft; clear a saved draft term with confirmation. Empty = incomplete; AB = absent (assessed zero).
- Co-scholastic grades A/B/C for both terms, remarks and automatic student-detail fetching.
- Dynamic component totals, subject grades, grand total, maximum and percentage. Seven default subjects, four components (10+5+5+80) and five co-scholastic areas match the reference structure.
- Class-specific subject profiles, configured before marks entry; profile changes are blocked once that class has report records to prevent data loss.
- Draft → submitted → published; principal/admin can reopen. Published reports hold snapshots of school configuration and student information. Concurrent edit revisions prevent silent overwrites.
- Upload your teacher signature, principal signature, student photos and school logo. PNG/JPG/WebP are decoded and re-encoded on the server; 5 MB upload limit.
- Individual two-page PDF download, print/save-to-PDF, and bulk printing of published reports (up to 50 students / 100 pages per class–section batch).
- Consolidated result Excel export and activity audit log.
- Browser-only **sample demo** for evaluating the UI without setting up MongoDB. Clearly labelled and separate from production staff authentication.

## Quick start — Docker (recommended)

Install Docker Desktop / Docker Compose. In this folder:

1. Copy `.env.docker.example` to `.env`.
2. Replace `MONGO_PASSWORD`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` with your own values. Use an alphanumeric Mongo password and an admin password of 6–20 characters.
3. Run:

```bash
docker compose up --build -d
```

4. Open **http://localhost:4000** and sign in using your configured administrator email/password.

The application seeds the first administrator only if no administrator exists. MongoDB and uploaded files persist in Docker volumes. Restarting containers does not erase them. Do not run `docker compose down -v` unless intentionally deleting the database and uploads.

Local Docker uses `NODE_ENV=development` so its cookie works on HTTP. For an internet deployment, serve HTTPS, set `NODE_ENV=production` and set `APP_ORIGIN` to the exact HTTPS origin. MongoDB is intentionally not exposed on a host port.

## Quick start — Node + MongoDB

Requirements: Node 24 LTS (recommended), npm, MongoDB 7+ locally or an Atlas connection.

```bash
npm ci
cp server/.env.example server/.env
```

Edit `server/.env`:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/srps_reports
ADMIN_EMAIL=admin@your-school.example
ADMIN_PASSWORD=your-6-to-20-chars
APP_ORIGIN=http://localhost:5173
NODE_ENV=development
PORT=4000
```

```bash
npm run seed
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api` requests to the Express server at port 4000. Sign in with the account you configured. No hardcoded production passwords are included.

For a local single-server production build:

```bash
npm run build
npm start
```

Open **http://localhost:4000** and set `APP_ORIGIN=http://localhost:4000` in `server/.env`. Keep development cookie mode for local HTTP; use production cookie mode only behind HTTPS.

## Explore the sample UI without MongoDB

```bash
npm ci
npm run dev -w client
```

Open http://localhost:5173 and click **Explore sample workspace**. This demo uses browser local storage, not a database or real class permissions. Its sample student data is derived from the supplied report references. Do not enter real school data in this demo. Staff login, access control and server persistence use the actual Express/MongoDB backend.

## First school setup

1. Settings → School profile: academic session, address, affiliation/contact details and logo.
2. Configure class subject profiles **before entering assessments**. Defaults are the supplied Class VI-style reference subjects, not a claim that all classes follow the same curriculum. Different streams within a single class are not supported in v1; create the agreed subject profile before entry.
3. Upload the principal's transparent signature PNG under School profile and click Save school settings.
4. Users & access → Add staff account. Assign each teacher the exact class and section. Manage access supports multiple pairs.
5. Give each teacher their own account credentials through your normal secure process. Teachers should change their password and upload their signature in Settings.
6. Excel import → Download template. Replace the illustrative row; preserve header names. Keep mobile/admission number cells as text. Use `YYYY-MM-DD` dates and sections exactly `Venus` or `Mars`.
7. Validate & preview → resolve errors → Confirm import. The import is sequential, not all-or-nothing; after a server interruption, re-upload and skip existing admissions to resume safely.
8. Edit student photos in Students. Choose student → Open studio → enter both terms and activities → Save draft → Submit for review.
9. Principal/admin reviews, publishes, then exports PDFs or uses Bulk print.

## Reference fidelity and deliberate differences

The filled reference images remain available for visual comparison. New drafts and newly published reports use the approved blank-artwork renderer described below. Reports published before template versioning retain their original renderer. Exact original overlay fonts were not supplied; the bundled local fonts are explicitly an approximation.

The reference's Term I Social Science components (10+5+5+80) total **100**, although one reference cell shows **98**. The engine calculates **100**. The default sample totals are **1388 / 1400 = 99.14%**. Term II's displayed exam label remains “Half yearly exam” as supplied. A displayed class/section is generated from actual directory data, not hardcoded “VI - TARGET (1)”.

## Calculation policy

- Both terms contribute equally by raw component sum; default maximum: 7 subjects × 100 marks × 2 = 1400.
- Do not submit with blanks. `0` is assessed; `AB` is assessed zero. Any missing component makes the overall result `INCOMPLETE`.
- Percentages display to 2 decimals. For grading/pass classification, subject percentage rounds to the nearest integer before applying the eight-point ranges: 91/81/71/61/51/41/33, with E below 33. For example, 32.5 rounds to 33. This explicit rounding policy should be approved by school management before real use.
- Every subject in both terms must reach the 33 threshold for PASS. Otherwise `NEEDS IMPROVEMENT`; no automatic grace, compartment, weighted promotion or CBSE compliance claim.
- Co-scholastic grades do not contribute to numeric totals. They must be complete for submission.
- Published records freeze student details/configuration. Media URLs reference uploaded files; replacing the current principal signature creates a new file, leaving old published reports' references intact.

## Tests and verification

```bash
node --test server/test/engine.test.js   # Pure calculation/validation/access tests
npm test                               # Includes real Express + temporary MongoDB integration tests
npm run build
```

Integration tests use a throwaway MongoDB instance, real staff passwords and cookie login—not spoofed identity headers. The memory-server dependency may download a MongoDB test binary on first use; local policy/network access must permit it. See `docs/VALIDATION.md` for checks actually completed in the build environment. Production dependency audit currently has no high/critical findings, but 9 moderate transitive ExcelJS advisories remain; review updates before deployment.

## Folder structure

```text
client/
  src/main.jsx          Staff UI, workspace, import, users, settings, PDF/bulk print
  src/Report.jsx        Shared printable front/back report renderer
  src/api.js            Real API adapter and explicitly labelled sample-demo adapter
  src/style.css         Application and report styling, A4 print rules
  public/               Supplied references and logo
server/
  src/app.js            Express routes, permissions, uploads, XLSX import/export
  src/models.js         MongoDB/Mongoose schemas and unique indexes
  src/index.js          Server/database startup
  src/seed.js           First administrator bootstrap
  test/                 Engine and API integration tests
shared/engine.js        Shared totals, grades, defaults, field validation
compose.yaml            MongoDB + Node application with durable volumes
Dockerfile              Build and runtime images
```

## Operational notes

Back up **both MongoDB and uploads**. Configure HTTPS, monitoring, controlled administrator access, backup retention and restore rehearsal on your production host. There is no public self-registration, parent portal, messaging, fee module, stream-specific subject selection, or password-reset email in this focused report-card ERP. Admin account management is included; automated email delivery is not. No data is sent to Canva or any third-party school service by this project.

New report PDF downloads use Node.js pdf-lib with embedded fonts and selectable overlay text. Only legacy published reports retain their earlier screenshot PDF fallback. Signature/photo uploads are separate files, not Excel-embedded images. Existing sessions are revoked when a staff account is disabled or its permissions/password change. Audit entries record action metadata, not full previous mark values.

## Approved-artwork report renderer (v1)

The current report renderer uses **unchanged approved blank artwork**, with editable data in a separate SVG layer. No borders, logos, labels, watermark, ribbons or table lines are recreated. The left-hand ERP entry screens and calculation engine are retained.

- Front: `client/public/templates/blank-front.png`, **1054 × 1492**.
- Back: `client/public/templates/blank-back.png`, **1024 × 1536**.
- Immutable, byte-identical copies: `client/public/templates/v1/` (content-hashed filenames).
- Single coordinate/styling source: `shared/template-mapping.json`.
- Shared data, font metrics, wrapping, photo geometry: `shared/report-template.js`.
- SVG preview: `client/src/Report.jsx`; Node PDF adapter: `server/src/report-renderer.js`; shared pdf-lib drawing: `shared/report-pdf.js`.

**Page policy:** both pages fit proportionally within A4 portrait, with a minimum 12 pt (4.23 mm) margin. Each artwork retains its own aspect ratio and is centred; no stretching or cropping. The SVG artwork viewBox uses its original pixel dimensions. PDF points are derived from exactly the same mapping, including top-left to bottom-left baseline conversion. Browser Print should use A4, 100% scale, no added margins or browser headers/footers; Download PDF is the authoritative export.

**Typography:** original font files were not supplied. The overlay uses local DM Sans Regular/Bold, converted losslessly from the already installed Fontsource WOFF files to TTF and embedded in PDF. Their OFL licence is in `client/public/templates/fonts/OFL.txt`. This is an approximation, not an exact typography match. Font files and their SHA-256 identities are configured in the mapping. These shipped subsets support Latin text; unsupported characters cause an explicit error. To support other scripts, supply suitable local fonts and verify shaping in both outputs before enabling them. Never replace an existing versioned font file: add a new filename and version instead.

Long values wrap and/or shrink only to the mapped minimum font size. If the full value cannot fit, preview displays an error and PDF export fails with that field's name. Nothing is silently truncated. Blank, zero and `AB` remain distinct. Missing photos/signatures remain blank. The photo uses a manually traced SVG shield mask inside the visible border, shared with the PDF clipping path; photos cover that box, signatures fit proportionally.

The immutable back artwork has exactly seven fixed subject rows, component limits 10/5/5/80 and five activities. A different class profile needs matching artwork and mapping; the renderer explicitly rejects mismatches instead of placing unrelated marks beneath printed labels. The fixed school contact/affiliation text comes from the approved artwork, even if Settings differs. The approved front and back currently have different affiliation wording; this is preserved.

### Calibration (administrator only)

1. Sign in as administrator, open a draft/submitted report, choose Front or Back, then **Calibrate template (admin)**.
2. Select a field by its outlined box or the field selector. Adjust artwork `x`, `y`, width, height, font size and alignment; arrow buttons move it by one original artwork pixel.
3. **Export mapping JSON**. Calibration is an in-memory preview; normal Print/PDF never contains guides and continues using the installed mapping.
4. A deployment operator with source access validates and installs it:

```bash
node scripts/validate-template.mjs /path/to/exported/template-mapping.json
# Keep the previous version in source control, then replace shared/template-mapping.json.
npm run build
npm start
```

Stop the previous server before `npm start`. Changed mappings must have a new `mappingVersion`. The exported calibration version gains `-calibrated`; use a unique release version for each deployment. This documented source-file replacement is the import mechanism; there is **no writable mapping API**. Teachers cannot see calibration controls or persist changes through the application. Fonts, artwork and page policy require a deliberate source release, not calibration controls.

### Export and published history

**PDF** saves pending draft edits through the existing revision-checked API, then downloads the saved report from authenticated `GET /api/report-pdf/:studentId/:session`. Bulk print retains its existing Prepare/Print flow and adds **Download bulk PDF**, using authenticated `POST /api/report-pdf/bulk` for up to 50 published reports. Existing class/section access and request-origin checks apply. The explicitly labelled browser demo uses the same pdf-lib drawing module locally and never calls staff export routes.

New publication snapshots contain the full template mapping, `templateVersion`, `mappingVersion`, immutable artwork paths/hashes and font identities, alongside existing student/config snapshots. Future calibration does not change them. Keep all previously referenced artwork, fonts and uploaded media. Hash mismatches block PDF export. Reports published before this feature have no template snapshot and retain `LegacyReport.jsx` and their previous Print/PDF workflow; they are not silently migrated. Bulk pdf-lib export rejects mixed legacy batches with instructions to use the existing Print workflow.

### Verification and sample artifacts

```bash
npm ci
npm run build
npm start                           # reads your existing server/.env
npm test                            # isolated temporary MongoDB, not the configured database
node scripts/validate-template.mjs
node scripts/sample-report.mjs       # synthetic/sample data only, no MongoDB
python3 scripts/compare-report.py    # requires pymupdf and pillow
```

On systems with an existing MongoDB executable, avoid test-binary downloads with `MONGOMS_SYSTEM_BINARY=/path/to/mongod MONGOMS_VERSION=<matching-version> npm test`.

- Sample: `output/pdf/srps-sample.pdf` (two A4 pages, selectable overlay text).
- Visual comparison: `output/pdf/comparison.html`, with opacity slider and difference views.
- `generated-front/back.png`, `overlay-front/back.png`, `difference-front/back.png` are generated from the actual sample PDF.
- Sample photo/signature crops come only from the supplied filled references for QA, and are never installed as live defaults.
- Browser smoke check: start `npm exec -w client vite -- preview --host 127.0.0.1 --port 4175 --strictPort`, then `node scripts/preview-smoke.mjs`. It uses a fresh, explicitly labelled demo context; set `CHROME_PATH` if Chrome is elsewhere.

A visual difference is not automatically a defect: the old reference has different school contact/affiliation content, table positions, class/section and signatures. The engine correctly calculates Term I Social Science as 100, whereas the old sample shows 98. The sample total remains 1388/1400 = 99.14%. No 100% pixel-match claim is made. Review a physical duplex print before issuing reports.

### Password reset email (Nodemailer)

Staff can select **Forgot password?** on the sign-in page. Configure these in
`server/.env` for local development, or the root `.env` for Docker Compose:

```dotenv
SMTP_HOST=smtp.your-provider.example
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
MAIL_FROM="ANVAYROBO <no-reply@your-school.example>"
APP_ORIGIN=https://your-school.example
```

Use the sender address authorized by your email provider. Port 465 uses TLS;
port 587 requires STARTTLS. Follow your provider's SMTP credential instructions.
Set `APP_ORIGIN` to the actual frontend URL (locally `http://localhost:5173`,
or `http://localhost:4000` for local Docker). Restart the server after editing
its environment; for Docker run `docker compose up -d --build`.

Reset links expire after 15 minutes, work once, and invalidate existing sessions.
Only hashed tokens are stored. Links use a URL fragment so the token is not sent
in page requests. Responses do not disclose whether an account exists. Requests
are rate-limited, with a one-minute per-account mail cooldown. SMTP failures are
logged without credentials or reset links; the UI reports missing configuration.
Tests mock delivery and never send real email. Verify delivery using an account
you control after configuring SMTP.
