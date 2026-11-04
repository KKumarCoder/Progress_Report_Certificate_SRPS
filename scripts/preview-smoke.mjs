import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const page = await browser.newPage({
      viewport: { width: 1800, height: 1600 },
    }),
    errors = [];
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(15000);
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4175");
  await page.getByText("Explore sample workspace", { exact: false }).click();
  const fixture = JSON.parse(
    await fs.readFile("output/pdf/sample-data.json", "utf8"),
  );
  for (const [obj, key, name] of [
    [fixture.student, "photo", "photo"],
    [fixture.report, "teacherSignature", "teacher"],
    [fixture.config, "principalSignature", "principal"],
  ])
    obj[key] =
      "data:image/png;base64," +
      (await fs.readFile(`output/pdf/sample-${name}.png`)).toString("base64");
  await page.evaluate((f) => {
    const s = JSON.parse(localStorage.getItem("srps-report-demo-v1")) || {};
    s.students = [{ ...f.student, _id: "demo-student", active: true }];
    s.config = f.config;
    s.reports = {
      "demo-student/2025-26": { ...f.report, _id: "demo-report", revision: 0 },
    };
    s.users = [
      {
        _id: "demo-user",
        name: "QA Admin",
        role: "admin",
        email: "qa@example.invalid",
        assignments: [],
      },
    ];
    s.audit = [];
    localStorage.setItem("srps-report-demo-v1", JSON.stringify(s));
  }, fixture);
  await page.reload();
  await page.getByText("Explore sample workspace", { exact: false }).click();
  await page
    .getByRole("button", { name: "Open report studio", exact: true })
    .click();
  await page.locator('.preview-canvas [data-field="grandTotal"]').waitFor();
  const preview = page.locator(".preview-canvas");
  assert.equal(
    await preview.locator('[data-field="grandTotal"]').textContent(),
    "1388",
  );
  await page.getByLabel("term1 ENGLISH Periodic test", {exact:true}).fill("0");
  await page.getByLabel("term1 ENGLISH Periodic test", {exact:true}).blur();
  await page.waitForFunction(
    () =>
      document.querySelector(
        '.preview-canvas [data-field="term1.english.periodic"]',
      )?.textContent === "0",
  );
  await page.getByLabel("term1 ENGLISH Periodic test", {exact:true}).fill("10");
  await page.getByLabel("term1 ENGLISH Periodic test", {exact:true}).blur();
  await page.waitForFunction(
    () =>
      document.querySelector('.preview-canvas [data-field="grandTotal"]')
        ?.textContent === "1388",
  );
  await page
    .getByRole("button", { name: "Co-scholastic", exact: true })
    .click();
  await page.locator(".co-editor select").first().selectOption("B");
  assert.equal(
    await preview.locator('[data-field="co.0.term1"]').textContent(),
    "B",
  );
  await page.locator(".co-editor select").first().selectOption("A");
  await page.getByLabel("Preview zoom").selectOption("100");
  await page.addStyleTag({
    content:
      ".preview-canvas{overflow:visible!important}.preview-panel{overflow:visible!important}",
  });
  console.log("live-edit checks passed");
  for (const side of ["Front", "Back"]) {
    await page.getByRole("button", { name: side, exact: true }).click();
    await preview.locator("[data-template-version]").waitFor();
    await page.evaluate(() => document.fonts.ready);
    await preview
      .locator(".artwork-report")
      .screenshot({
        path: `output/pdf/preview-${side.toLowerCase()}.png`,
        animations: "disabled",
        timeout: 15000,
      });
  }
  console.log("preview screenshots saved");
  await page
    .getByRole("button", { name: "Calibrate template (admin)" })
    .click();
  await page
    .locator(".calibration-panel select")
    .first()
    .selectOption("term1.english.periodic");
  const before = await preview
    .locator('[data-field="term1.english.periodic"] text')
    .getAttribute("x");
  await page.getByRole("button", { name: "Move →", exact: true }).click();
  const after = await preview
    .locator('[data-field="term1.english.periodic"] text')
    .getAttribute("x");
  assert.equal(Number(after), Number(before) + 1);
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export mapping JSON" }).click();
  const download = await event;
  await download.saveAs("output/pdf/calibration-test.json");
  await page.getByRole("button", { name: "Reset preview" }).click();
  await page.getByRole("button", { name: "Close calibration" }).click();
  assert.deepEqual(errors, []);
  // A teacher sees no calibration controls, even in the explicitly separate demo.
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("srps-report-demo-v1"));
    s.users[0].role = "teacher";
    s.users[0].assignments = [{ className: "6", section: "Venus" }];
    localStorage.setItem("srps-report-demo-v1", JSON.stringify(s));
  });
  await page.reload();
  await page.getByText("Explore sample workspace", { exact: false }).click();
  await page
    .getByRole("button", { name: "Open report studio", exact: true })
    .click();
  await page.locator(".preview-canvas [data-template-version]").waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Calibrate template (admin)" })
      .count(),
    0,
  );
  console.log(
    "PASS: front/back SVG, live marks/co grades, zoom, calibration movement/export, teacher controls hidden, no browser errors.",
  );
} finally {
  await browser.close();
}
