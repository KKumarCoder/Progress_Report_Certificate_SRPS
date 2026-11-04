# API and data model

All API endpoints except health/login require a session cookie. Mutations require `X-SRPS-Request: 1` and reject a supplied Origin that differs from APP_ORIGIN. The header is an origin/CSRF check, **not an identity credential**. Identity comes exclusively from the opaque server-side session record.

| Area | Routes | Permission |
|---|---|---|
| Auth | POST `/api/auth/login`, `/logout`; GET `/me`; PUT `/password` | Session required except login |
| Directory | GET/POST `/api/students`; PUT/DELETE `/api/students/:id` | Read scoped; writes admin |
| Reports | GET/PUT `/api/reports/:studentId/:session` | Exact class/section scope |
| Workflow | POST `/api/reports/:studentId/:session/{submit,publish,reopen}` | Submit scoped; publish/reopen admin/principal |
| Clear term | DELETE `/api/reports/:studentId/:session/{term1,term2}` | Scoped, draft only, revision check |
| Upload | POST `/api/upload/{photo,signature,principal,logo}` | Personal signature: staff; others: admin |
| Media | GET `/api/files/:name` | Sign-in; attached student photo read scoped |
| Settings | GET/PUT `/api/config` | Read staff; write admin |
| Staff | GET/POST `/api/users`; PUT `/api/users/:id` | Admin |
| Import | GET `/api/import/template`; POST `/api/import?commit=true&update=true` | Admin |
| Results | GET `/api/export?session=2025-26` | Admin/principal |
| Activity | GET `/api/audit` | Admin/principal |

Collections: User, Student, Report, Session, Setting, Audit.

Unique indexes: staff email, student admission number, report `(student, session)`, session token hash, settings key. Student archive is soft deletion. Report update uses `revision` in the update query and increments it atomically. All drafts are saved explicitly; there is a dirty indicator and unload warning. Navigation away from a report can discard edits; save before changing workspace sections.

Staff passwords: bcrypt, cost 12. Session tokens: 32 random bytes, stored only as SHA-256 hashes in MongoDB; 8-hour expiry checked at request time and indexed for TTL cleanup. Cookies HttpOnly / SameSite Strict, Secure in production. Account access changes increment sessionVersion and invalidate existing sessions.

Uploaded images are decoded using Sharp with a 16-million-pixel limit and re-encoded as PNG. Excel is parsed as data, not executed. Input constraints are enforced on the server. Report grades and result use the same calculation engine in browser and server; client-supplied totals are never used for approval/export.

Class subject profiles are frozen once reports exist for that class. Within-class stream specialization and year-specific subject profile migrations require a future schema extension.
