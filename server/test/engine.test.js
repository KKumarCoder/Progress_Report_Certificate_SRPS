import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculate,
  grade,
  validateMarks,
  canAccess,
  validateStudent,
  DEFAULT_CONFIG,
} from "../../shared/engine.js";
const full = (n = 0) =>
  Object.fromEntries(
    ["term1", "term2"].map((t) => [
      t,
      Object.fromEntries(
        DEFAULT_CONFIG.subjects.map((s) => [
          s.id,
          Object.fromEntries(
            DEFAULT_CONFIG.components.map((c) => [c.id, n ? c.max : 0]),
          ),
        ]),
      ),
    ]),
  );
test("Empty is incomplete; zero is assessed and failed", () => {
  assert.equal(calculate({}).result, "INCOMPLETE");
  assert.equal(calculate(full()).result, "NEEDS IMPROVEMENT");
  assert.equal(calculate(full()).complete, true);
});
test("Two full terms yield 2100, 100% and pass", () => {
  const c = calculate(full(1));
  assert.equal(c.total, 2100);
  assert.equal(c.maximum, 2100);
  assert.equal(c.percentage, 100);
  assert.equal(c.result, "PASS");
});
test("Single-page two full terms yield 2100, 100% and pass", () => {
  const singleMarks = {
    term1: Object.fromEntries(
      DEFAULT_CONFIG.subjects.map((s) => [
        s.id,
        { fa1: 25, fa2: 25, sa1: 100 },
      ]),
    ),
    term2: Object.fromEntries(
      DEFAULT_CONFIG.subjects.map((s) => [
        s.id,
        { fa3: 25, fa4: 25, sa2: 100 },
      ]),
    ),
  };
  const c = calculate(singleMarks);
  assert.equal(c.total, 2100);
  assert.equal(c.maximum, 2100);
  assert.equal(c.percentage, 100);
  assert.equal(c.result, "PASS");
  assert.equal(c.subjects.english.subTotal, 300);
  assert.equal(c.subjects.english.grade, "A1");
});
test("Grade thresholds and decimal rounding are consistent", () => {
  for (const [m, g] of [
    [100, "A1"],
    [91, "A1"],
    [90, "A2"],
    [81, "A2"],
    [71, "B1"],
    [61, "B2"],
    [51, "C1"],
    [41, "C2"],
    [33, "D"],
    [32, "E (Failed)"],
    [32.5, "D"],
  ])
    assert.equal(grade(m), g);
});
test("AB excludes absent exam max marks from total; a failed subject prevents PASS", () => {
  const m = full(1);
  m.term1.english = {
    fa1: "AB",
    fa2: "AB",
    sa1: 50,
  };
  const c = calculate(m);
  assert.equal(c.complete, true);
  assert.equal(c.maximum, 2100 - 25 - 25);
  assert.equal(c.total, 2000);
  assert.equal(c.result, "PASS");

  m.term1.hindi = { fa1: 0, fa2: 0, sa1: 0 };
  const failed = calculate(m);
  assert.equal(failed.result, "NEEDS IMPROVEMENT");
});
test("Excessive, negative, string and unknown marks are rejected", () => {
  for (const v of [-1, 81, Infinity, "80"])
    assert.ok(validateMarks({ term1: { english: { exam: v } } }).length);
  assert.ok(validateMarks({ term1: { hacking: { exam: 5 } } }).length);
  assert.ok(validateMarks({ term1: { english: { mystery: 1 } } }).length);
});
test("Teacher assignments are exact class and section pairs", () => {
  const u = {
    role: "teacher",
    assignments: [{ className: "6", section: "Venus" }],
  };
  assert.ok(canAccess(u, { className: "6", section: "Venus" }));
  assert.equal(canAccess(u, { className: "6", section: "Mars" }), false);
  assert.equal(canAccess(u, { className: "7", section: "Venus" }), false);
  assert.ok(
    canAccess({ role: "principal" }, { className: "12", section: "Mars" }),
  );
});
test("Student fields and permitted classes validated", () => {
  assert.ok(validateStudent({}).length);
  assert.ok(
    validateStudent({
      admissionNo: "1",
      name: "X",
      className: "13",
      section: "Venus",
    }).length,
  );
  assert.deepEqual(
    validateStudent({
      admissionNo: "1",
      name: "X",
      className: "12",
      section: "Mars",
      dob: "2014-12-25",
      mobile: "9000000000",
    }),
    [],
  );
});
