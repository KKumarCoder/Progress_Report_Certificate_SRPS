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
      english: { fa1: 0, fa2: "AB", sa1: 80 },
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
  for (const side of Object.keys(mapping.pages)) {
    const p = pagePlacement(mapping, side);
    assert.ok(p.x >= 11.99 && p.y >= 11.99);
    assert.ok(p.scale > 0);
  }
});
test("blank, zero, AB and missing signatures are distinct", () => {
  const v = reportValues(student, report, DEFAULT_CONFIG);
  assert.equal(v["term1.english.fa1"], 0);
  assert.equal(v["term1.english.fa2"], "AB");
  assert.equal(v["term1.english.sa1"], 80);
  assert.equal(v["total.english"], "—");
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
test("subjects validation allows 1 to 7 subjects and rejects invalid", () => {
  assertCompatible(DEFAULT_CONFIG);
  assertCompatible({
    ...DEFAULT_CONFIG,
    subjects: [
      { id: "english", name: "ENGLISH" },
      { id: "hindi", name: "HINDI" },
    ],
  });
  assert.throws(
    () =>
      assertCompatible({
        ...DEFAULT_CONFIG,
        subjects: [],
      }),
    /1 to 7 subjects/,
  );
  assert.throws(
    () =>
      assertCompatible({
        ...DEFAULT_CONFIG,
        subjects: Array(8).fill({ id: "sub", name: "SUB" }),
      }),
    /1 to 7 subjects/,
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
test("PDF produces single A4 page with embedded font resources and unmodified artwork", async () => {
  const bytes = await generateReportPdf(
    [{ student, report, config: DEFAULT_CONFIG, mapping }],
    loadReportResource,
  );
  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 1);
  assert.ok(Math.abs(doc.getPage(0).getWidth() - 595.27559) < 0.001);
  for (const side of Object.keys(mapping.pages)) {
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
