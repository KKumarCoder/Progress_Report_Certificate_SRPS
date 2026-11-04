# Validation record

Completed in the build environment:
- React/Vite production build completed.
- Front/back React server-render checks passed for school name, house/admission/date fields, two subject tables, co-scholastic content, maximum and percentage. These check rendered content, not browser layout.
- Seven meaningful pure engine tests passed: incomplete vs zero; full totals; grade boundaries; absence; invalid component values; exact teacher class/section scope; student field validation.
- Node syntax checks passed for server and shared engine.
- Production dependency audit after updating jsPDF/Sharp: 0 high and 0 critical; 9 moderate transitive ExcelJS dependency advisories remain. Review upstream ExcelJS dependency updates before internet deployment.

Not completed:
- Express/MongoDB integration suite is included, but the local MongoDB test process exits with `open: Operation not permitted` in this environment before tests run. These integration tests are **not passed**.
- Browser visual/interaction QA was unavailable because the managed preview service resolved the workspace/dependency path incorrectly. No claim of pixel-perfect artwork, verified PDF pagination or browser acceptance is made.
- Real school staff sign-in, MongoDB persistence, uploaded signatures/photos, XLSX import/export, approval locking, concurrent saving and printed front/back alignment need acceptance checks on the configured Docker/Node deployment.

Recommended acceptance run:
1. Start the app and database using Docker or Node setup.
2. Create admin, principal and two teachers with different assignments.
3. Import 3 student rows; verify duplicate skip/update and row-error feedback.
4. Confirm a teacher cannot see/open/edit the other teacher's class, including copied API URLs.
5. Enter all marks in both terms; confirm real-time totals and grades match the engine.
6. Verify blank vs 0 vs AB and invalid ranges.
7. Save, reload, and confirm persistence; try concurrent tabs and verify 409 conflict handling.
8. Upload real teacher/principal signatures and a photo; inspect shield cropping.
9. Submit, publish, attempt forbidden edits, reopen as principal and save again.
10. Export front/back PDF and class bulk PDF; print one physical two-sided proof at 100% A4 before mass printing.
11. Run the integration tests on a machine permitted to start MongoDB.
