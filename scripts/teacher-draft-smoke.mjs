import { chromium } from "@playwright/test";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import assert from "node:assert/strict";
import { app } from "../server/src/app.js";
import { User, Student, Report } from "../server/src/models.js";
const origin = "http://127.0.0.1:4177";
process.env.APP_ORIGIN = origin;
let db, server, browser;
try {
  db = await MongoMemoryServer.create();
  await mongoose.connect(db.getUri());
  await User.create({
    name: "QA Teacher",
    email: "teacher@qa.local",
    role: "teacher",
    passwordHash: await bcrypt.hash("testpass123", 4),
    assignments: [{ className: "6", section: "Venus" }],
  });
  const student = await Student.create({
    name: "QA Student",
    admissionNo: "QA001",
    className: "6",
    section: "Venus",
  });
  await Report.create({
    student: student._id,
    session: "2025-26",
    marks: {},
    co: { "WORK EDUCATION": { term1: "A" } },
  });
  server = await new Promise((resolve) => {
    const s = app.listen(4177, "127.0.0.1", () => resolve(s));
  });
  browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });
  const context = await browser.newContext();
  const login = await context.request.post(origin + "/api/auth/login", {
    headers: { "X-SRPS-Request": "1" },
    data: { email: "teacher@qa.local", password: "testpass123" },
  });
  assert.equal(login.status(), 200);
  const page = await context.newPage(),
    errors = [];
  page.setDefaultTimeout(15000);
  page.on("pageerror", (e) => errors.push(e.message));
  let legacyResponse = true;
  await page.route("**/api/reports/*/*", async (route) => {
    if (route.request().method() === "GET" && legacyResponse) {
      legacyResponse = false;
      const response = await route.fetch();
      const body = await response.json();
      delete body.report.marks;
      await route.fulfill({ response, json: body });
    } else await route.continue();
  });
  await page.goto(origin);
  await page
    .getByRole("button", { name: "Report studio", exact: true })
    .click();
  await page.getByRole("button", { name: "Open studio", exact: true }).click();
  const stepped = page.getByLabel("term1 ENGLISH Periodic test", {
    exact: true,
  });
  await stepped.fill("1.5");
  for (const expected of ["2", "2.5", "3"]) {
    await stepped.press("ArrowUp");
    assert.equal(await stepped.inputValue(), expected);
  }
  await stepped.press("ArrowDown");
  assert.equal(await stepped.inputValue(), "2.5");
  await stepped.fill("10");
  await stepped.press("ArrowUp");
  assert.equal(await stepped.inputValue(), "10");
  await stepped.fill("0");
  await stepped.press("ArrowDown");
  assert.equal(await stepped.inputValue(), "0");
  await stepped.fill("AB");
  await stepped.press("ArrowUp");
  assert.equal(await stepped.inputValue(), "AB");
  console.log(
    "PASS: decimal 0.5 steps, keyboard, minimum/maximum bounds and AB preserved.",
  );
  for (const [label, maximum] of [
    ["Periodic test", 10],
    ["Note books", 5],
    ["Subject enrichment", 5],
    ["Half yearly exam", 80],
  ]) {
    const input = page.getByLabel("term1 ENGLISH " + label, { exact: true });
    await input.fill(String(maximum));
    assert.equal(await input.inputValue(), String(maximum));
    // fill exercises replacement/paste; typing exercises appending digits.
    await input.fill(String(maximum + 1));
    assert.equal(await input.inputValue(), String(maximum));
    await input.press("End");
    await input.pressSequentially("9");
    assert.equal(await input.inputValue(), String(maximum));
    for (const accepted of ["0", "AB", ""]) {
      await input.fill(accepted);
      assert.equal(await input.inputValue(), accepted);
    }
  }
  for (const [label, value, field] of [
    ["Periodic test", "8", "periodic"],
    ["Note books", "5", "notebook"],
    ["Subject enrichment", "2", "enrichment"],
    ["Half yearly exam", "77", "exam"],
  ]) {
    const input = page.getByLabel("term1 ENGLISH " + label, { exact: true });
    await input.fill(value);
    await page.waitForFunction(
      ({ field, value }) =>
        document.querySelector(
          `.preview-canvas [data-field="term1.english.${field}"]`,
        )?.textContent === value,
      { field, value },
    );
    assert.equal(
      await input.evaluate((el) => el === document.activeElement),
      true,
    );
  }
  assert.equal(
    await page
      .locator('.preview-canvas [data-field="term1.english.total"]')
      .textContent(),
    "92",
  );
  const saveResponse = page.waitForResponse(
    (r) => r.request().method() === "PUT" && r.url().includes("/api/reports/"),
  );
  await page
    .getByRole("button", { name: "Save draft", exact: true })
    .first()
    .click();
  assert.equal((await saveResponse).status(), 200);
  const saved = await Report.findOne({
    student: student._id,
    session: "2025-26",
  }).lean();
  assert.deepEqual(saved.marks.term1.english, {
    periodic: 8,
    notebook: 5,
    enrichment: 2,
    exam: 77,
  });
  assert.equal(saved.co["WORK EDUCATION"].term1, "A");
  await page.reload();
  await page
    .getByRole("button", { name: "Report studio", exact: true })
    .click();
  await page.getByRole("button", { name: "Open studio", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector(
        '.preview-canvas [data-field="term1.english.total"]',
      )?.textContent === "92",
  );
  assert.equal(
    await page
      .getByLabel("term1 ENGLISH Periodic test", { exact: true })
      .inputValue(),
    "8",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: maximum marks accepted, over-limit replacement/typing rejected, zero/AB/blank allowed; authenticated teacher, legacy missing marks, immediate preview while typing, total 92, save, reload and preserved co-scholastic data.",
  );
} finally {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await db?.stop();
}
