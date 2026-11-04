import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument } from "pdf-lib";
import { DEFAULT_CONFIG } from "../../shared/engine.js";
import {
  reportValues,
  layoutText,
  validateMapping,
  pagePlacement,
  assertCompatible,
} from "../../shared/report-template.js";
import { generateReportPdf } from "../../shared/report-pdf.js";
import {
  templateMapping as mapping,
  loadReportResource,
} from "../src/report-renderer.js";
const metrics = fontkit.create(
  await loadReportResource(mapping.fonts["700"].file),
);
const student = { name: "Student", className: "6", section: "Venus" };
const report = {
  session: "2025-26",
  status: "draft",
  marks: {
    term1: {
      english: { periodic: 0, notebook: "AB", enrichment: "", exam: 80 },
    },
  },
};
test("mapping covers every dynamic value once, within page bounds", () => {
  validateMapping(mapping, mapping);
  const values = reportValues(student, report, DEFAULT_CONFIG);
  const mapped = new Set(
    Object.values(mapping.pages).flatMap((p) => p.fields.map((f) => f.id)),
  );
  assert.deepEqual([...mapped].sort(), Object.keys(values).sort());
  for (const side of ["front", "back"]) {
    const p = pagePlacement(mapping, side);
    assert.ok(p.x >= 11.99 && p.y >= 11.99);
    assert.ok(p.scale > 0);
  }
});
test("blank, zero, AB and missing signatures are distinct", () => {
  const v = reportValues(student, report, DEFAULT_CONFIG);
  assert.equal(v["term1.english.periodic"], 0);
  assert.equal(v["term1.english.notebook"], "AB");
  assert.equal(v["term1.english.enrichment"], "");
  assert.equal(v["term1.english.total"], "—");
  assert.equal(v.result, "INCOMPLETE");
  assert.equal(v.teacherSignature, "");
});
test("long names wrap/shrink without silently truncating", () => {
  const f = mapping.pages.front.fields.find((f) => f.id === "name");
  const text = "Aarav Vikram Singh Rathore";
  const lines = layoutText(f, text, metrics);
  assert.equal(lines.map((l) => l.text).join(" "), text);
  assert.ok(
    lines.every((l) => l.size >= f.overflow.minFontSize && l.width <= f.width),
  );
  assert.throws(
    () => layoutText(f, "ExtremelyLongUnbreakableName".repeat(30), metrics),
    /does not fit/,
  );
  assert.throws(() => layoutText(f, "विद्यार्थी", metrics), /lacks/);
});
test("calibration rejects missing fields, invalid numbers, bounds and changed artwork", () => {
  for (const mutate of [
    (m) => m.pages.front.fields.pop(),
    (m) => (m.pages.front.fields[0].x = -10),
    (m) => (m.pages.front.fields[0].width = NaN),
    (m) => (m.pages.front.artwork = "/reference-front.png"),
  ]) {
    const m = structuredClone(mapping);
    mutate(m);
    assert.throws(() => validateMapping(m, mapping));
  }
});
test("fixed printed profile cannot be silently mislabelled", () => {
  assertCompatible(DEFAULT_CONFIG);
  assert.throws(
    () =>
      assertCompatible({
        ...DEFAULT_CONFIG,
        subjects: [{ id: "physics", name: "PHYSICS" }],
      }),
    /does not match/,
  );
});
test("published values use frozen student/config and never current user signature", () => {
  const r = {
    ...report,
    status: "published",
    studentSnapshot: { ...student, name: "Frozen" },
    configSnapshot: { ...DEFAULT_CONFIG, principalSignature: "" },
  };
  const v = reportValues({ ...student, name: "Changed" }, r, DEFAULT_CONFIG, {
    role: "teacher",
    signature: "new.png",
  });
  assert.equal(v.name, "Frozen");
  assert.equal(v.teacherSignature, "");
});
test("PDF produces two A4 pages with embedded font resources and unmodified artwork", async () => {
  const bytes = await generateReportPdf(
    [{ student, report, config: DEFAULT_CONFIG, mapping }],
    loadReportResource,
  );
  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 2);
  assert.ok(Math.abs(doc.getPage(0).getWidth() - 595.27559) < 0.001);
  for (const side of ["front", "back"]) {
    const raw = await fs.readFile(`client/public/templates/blank-${side}.png`),
      versioned = await loadReportResource(
        mapping.pages[side].artwork,
        mapping.pages[side].sha256,
      );
    assert.deepEqual(new Uint8Array(raw), versioned);
  }
});

test("admin uploaded signature fills an empty teacher space without changing published snapshots", () => {
  const user = { role: "admin", signature: "admin-signature.png" };
  assert.equal(
    reportValues(student, report, DEFAULT_CONFIG, user).teacherSignature,
    user.signature,
  );
  assert.equal(
    reportValues(
      student,
      { ...report, teacherSignature: "saved-teacher.png" },
      DEFAULT_CONFIG,
      user,
    ).teacherSignature,
    "saved-teacher.png",
  );
  assert.equal(
    reportValues(
      student,
      { ...report, status: "published" },
      DEFAULT_CONFIG,
      user,
    ).teacherSignature,
    "",
  );
  assert.equal(
    reportValues(student, report, DEFAULT_CONFIG, {
      role: "principal",
      signature: "principal.png",
    }).teacherSignature,
    "",
  );
});
