# ANVAYROBO Report Card ERP — Complete Project Audit & Feature Inventory

**Audit Date:** 2026-11-28  
**Branch:** `feat/anvayrobo-ui-transformation` (Checkpoint: `333ec32`)  
**Baseline Test Suite:** `npm test` — **40 / 40 passing** (`server/test/*.test.js`)

---

## 1. Project Structure
- **Root (`package.json`):** NPM workspaces (`client`, `server`), Node ESM (`"type": "module"`).
- **Frontend (`client/`):** React 19 (`19.1.1`), Vite 7 (`7.1.7`), `lucide-react`, `react-toastify`, `exceljs`, `pdf-lib`, `@pdf-lib/fontkit`, `qrcode`, `html5-qrcode`, `html2canvas`, `jspdf`, `firebase`.
  - Entry: `client/index.html` → `client/src/main.jsx` (App shell + 12 workspace modules + modals)
  - Modules: `Dashboard.jsx`, `ClassAnalytics.jsx`, `GrowthChart.jsx`, `SmartRemarks.jsx`, `Report.jsx`, `LegacyReport.jsx`, `Calibration.jsx`, `BulkWhatsappModal.jsx`, `Login.jsx`, `PasswordReset.jsx`, `VerifyReport.jsx`, `Loader.jsx`, `api.js`, `report-export.js`, `firebase.js`.
  - Styles: `client/src/style.css`, `client/src/login.css`.
  - Protected Print Assets: `client/public/templates/v1/single-7b83fef2237f.png`, `shared/template-mapping.json`, `client/public/templates/fonts/*`.
- **Backend (`server/`):** Express 5 (`5.1.0`), Mongoose 8 (`8.19.1`), Multer 2, Sharp, ExcelJS, PDF-lib, Nodemailer, AWS S3 SDK (Cloudflare/S3/Cloudinary compatible), `@pdfsmaller/pdf-encrypt`.
  - Files: `server/src/index.js`, `server/src/app.js`, `server/src/models.js`, `server/src/report-renderer.js`, `server/src/password-reset.js`, `server/src/cloud-storage.js`, `server/src/seed.js`.
- **Shared (`shared/`):** `engine.js`, `report-template.js`, `report-pdf.js`, `remarks.js`, `password-policy.js`, `template-mapping.json`.

---

## 2. Database Inventory (`server/src/models.js`)
1. **`users` (`User`):** `name`, `email` (unique), `phone`, `designation`, `photo`, `passwordHash` (`select: false`), `resetTokenHash`/`resetExpiresAt`/`resetRequestedAt`/`resetVersion`, `role` (`admin | principal | teacher`), `assignments` (`[{ className, section }]`), `moduleAccess`, `studentActions`, `signature`, `active`, `sessionVersion`, timestamps.
2. **`students` (`Student`):** `admissionNo` (unique), `rollNo`, `name`, `className`, `section`, `house`, `gender`, `bloodGroup`, `aadhaarNo`, `penNo`, `category`, `motherName`, `fatherName`, `dob`, `address`, `mobile`, `email`, `emergencyContact`, `admissionDate`, `previousSchool`, `photo`, `active`, timestamps. Index: `{ className: 1, section: 1 }`.
3. **`reports` (`Report`):** `student` (ref `Student`), `session`, `marks` (`{ term1, term2 }`), `co`, `remarks`, `status` (`draft | submitted | published`), `revision`, `updatedBy`, `teacherSignature`, `studentSnapshot`, `configSnapshot`, `templateSnapshot`, `submittedAt`, `publishedAt`, WhatsApp/Email delivery tracking fields, `drivePath`/`drivePublicId`/`driveArchivedAt`/`drivePasswordVersion` (`select: false`). Unique index: `{ student: 1, session: 1 }`.
4. **`settings` (`Setting`):** `key` (unique: `"config"`, `"masters"`, `"templateMapping"`), `value` (`Mixed`).
5. **`sessions` (`Session`):** `tokenHash` (unique), `user`, `version`, `expiresAt` (TTL), Report Drive OTP fields.
6. **`audits` (`Audit`):** `actor`, `action`, `target`, `details`, timestamps.

---

## 3. API Inventory (`server/src/app.js` & `password-reset.js`)
- **Auth & Public:** `GET /api/health`, `POST /api/auth/login`, `POST /api/auth/firebase-login`, `GET /api/auth/me`, `POST /api/auth/logout`, `PUT /api/auth/password`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/public/results`, `GET /api/public/verify/:studentId/:session/:signature`, `GET /api/public/report-download/:token`.
- **Config & Masters:** `GET /api/masters`, `PUT /api/masters`, `GET /api/config`, `PUT /api/config`.
- **Students & Import/Export:** `GET /api/students`, `POST /api/students`, `PUT /api/students/:id`, `DELETE /api/students/:id`, `PATCH /api/students/:id/status`, `POST /api/students/promote`, `GET /api/students/:id/id-card`, `GET /api/import/template`, `POST /api/import`, `GET /api/export`.
- **Reports, Review, Analytics & PDF:** `GET /api/student-report-status`, `GET /api/review`, `GET /api/analytics/class`, `GET /api/reports/:studentId/:session`, `PUT /api/reports/:studentId/:session`, `POST /api/reports/:studentId/:session/:action` (`submit | publish | reopen`), `DELETE /api/reports/:studentId/:session/:term`, `GET /api/report-pdf/:studentId/:session`, `POST /api/report-pdf/bulk`, `POST /api/reports/:studentId/:session/whatsapp`, `POST /api/reports/:studentId/:session/email`.
- **Users, Uploads, Audit & Report Drive:** `GET /api/users`, `GET /api/class-teachers`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`, `GET /api/audit`, `POST /api/upload/:kind`, `POST /api/storage/migrate-legacy`, `GET /api/files/:name`, `POST /api/report-drive/request-otp`, `POST /api/report-drive/verify-otp`, `POST /api/report-drive/lock`, `GET /api/report-drive/reports`, `POST /api/report-drive/archive-batch`, `GET /api/report-drive/reports/:id/download`.

---

## 4. Role Permission Matrix
- **Admin:** Full access to all 12 modules, Settings, Academic Masters, Users & Access, Excel Import, Report Drive, Bulk Print, Review/Publish/Reopen, Analytics, Audit.
- **Principal:** Overview, Class Analytics, Students (view/scoped), Report Studio, Report Review (publish/reopen), Bulk Print, Activity Log, Settings (profile/password/signature).
- **Teacher (PRT/TGT/PGT):** Scoped strictly on backend (`scope(user)`) to assigned `(className, section)` pairs; module access controlled by `moduleAccess` & `studentActions`. Cannot export submitted/unpublished reports or modify unauthorized classes.

---

## 5. Report Card Logic (`shared/engine.js` & `shared/report-template.js`)
- Class-specific config via `resolveConfigForClass(cfg, className)`: resolves class subject profile + `termComponentRules` (e.g., Balvatika-1..5 SA=50, 6..11 SA=100).
- `AB` (Absent) excludes that exam's max marks from subject `subMax` and overall `maximum`.
- Incomplete marks (`""` / `null` / `undefined`) keep `complete: false` and `result: "INCOMPLETE"`.
- **Protected Print Template:** `shared/template-mapping.json`, `single-7b83fef2237f.png`, `Report.jsx`, and `report-pdf.js` remain dimensionally and visually locked.

---

## 6. Feature Traceability Inventory
| ID | Module | Feature | Status |
| :--- | :--- | :--- | :--- |
| AUTH-001 | Auth | Password login, Firebase Google login, Password Reset | VERIFIED (Baseline) |
| DASH-001 | Overview | Live KPIs, Term 1/2 Progress, Quick Actions, Recent Activity | VERIFIED (Baseline) |
| ANL-001 | Class Analytics | Class/Section performance charts & subject breakdown | VERIFIED (Baseline) |
| STU-001 | Students | Directory, Search, Class/Section/Status/House filters, Grid/List | VERIFIED (Baseline) |
| STU-002 | Students | Add, Edit, Delete, Toggle Active, Promotion, ID Card, Photo | VERIFIED (Baseline) |
| MST-001 | Academic Masters | Classes, Sections, Houses, Designations CRUD + real-time sync | VERIFIED (Baseline) |
| IMP-001 | Excel Import | Template download, drag/drop upload, duplicate validation, commit | VERIFIED (Baseline) |
| MRK-001 | Report Studio | Term 1/2 marks entry, `A`→`AB` auto-complete, `AB` max exclusion | VERIFIED (Baseline) |
| MRK-002 | Report Studio | Co-scholastic (`A+..C`), Growth charts, Smart Remarks, Details | VERIFIED (Baseline) |
| RPT-001 | Report Preview/PDF | Single-page A4 SVG preview, dynamic FA/SA headers, PDF export | VERIFIED (Baseline) |
| REV-001 | Report Review | Submit, Publish, Reopen/Lock, Bulk Approve | VERIFIED (Baseline) |
| BLK-001 | Bulk Print | Class/Section batch PDF export, Print, WhatsApp/Email delivery | VERIFIED (Baseline) |
| USR-001 | Users & Access | Staff CRUD, class/section assignments, module & action grants | VERIFIED (Baseline) |
| AUD-001 | Activity Log | Audit trail filtering & pagination | VERIFIED (Baseline) |
| DRV-001 | Report Drive | OTP-locked archive vault, batch archive, secure download | VERIFIED (Baseline) |
| SET-001 | Settings | Branding, Class Subject Profiles, Indicators, FA/SA Rules, Export | VERIFIED (Baseline) |
