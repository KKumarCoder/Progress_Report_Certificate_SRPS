import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import { app } from "../src/app.js";
import { User, Student, Report } from "../src/models.js";
import { templateMapping } from "../src/report-renderer.js";
import { PDFDocument } from "pdf-lib";
import { DEFAULT_CONFIG } from "../../shared/engine.js";
let mongod, admin, teacher, other, student, outside;
const header = { "X-SRPS-Request": "1" };
before(
  async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    await Promise.all([User.init(), Student.init(), Report.init()]);
    const passwordHash = await bcrypt.hash("Testing-School-Password!", 4);
    await User.create([
      { name: "Admin", email: "admin@test.local", passwordHash, role: "admin" },
      {
        name: "Teacher",
        email: "teacher@test.local",
        passwordHash,
        role: "teacher",
        assignments: [{ className: "6", section: "Venus" }],
      },
      {
        name: "Other",
        email: "other@test.local",
        passwordHash,
        role: "teacher",
        assignments: [{ className: "7", section: "Mars" }],
      },
    ]);
    student = await Student.create({
      admissionNo: "T001",
      name: "Test One",
      className: "6",
      section: "Venus",
    });
    outside = await Student.create({
      admissionNo: "T002",
      name: "Test Two",
      className: "7",
      section: "Mars",
    });
    admin = request.agent(app);
    teacher = request.agent(app);
    other = request.agent(app);
    for (const [agent, email] of [
      [admin, "admin@test.local"],
      [teacher, "teacher@test.local"],
      [other, "other@test.local"],
    ]) {
      const r = await agent
        .post("/api/auth/login")
        .set(header)
        .send({ email, password: "Testing-School-Password!" });
      assert.equal(r.status, 200);
    }
  },
  { timeout: 180000 },
);
after(async () => {
  await mongoose.disconnect();
  await mongod?.stop();
});
test("Unauthenticated requests denied", async () => {
  assert.equal((await request(app).get("/api/students")).status, 401);
});
test("Staff API responses omit password reset and session internals", async () => {
  const me = await teacher.get("/api/auth/me");
  assert.equal(me.status, 200);
  for (const key of [
    "passwordHash",
    "resetTokenHash",
    "resetExpiresAt",
    "resetRequestedAt",
    "resetVersion",
    "sessionVersion",
  ])
    assert.equal(me.body[key], undefined);
  const users = await admin.get("/api/users");
  assert.equal(users.status, 200);
  for (const user of users.body)
    for (const key of [
      "passwordHash",
      "resetTokenHash",
      "resetExpiresAt",
      "resetRequestedAt",
      "resetVersion",
      "sessionVersion",
    ])
      assert.equal(user[key], undefined);
});
test("Mutation origin header required", async () => {
  assert.equal((await admin.post("/api/students").send({})).status, 403);
});
test("Teacher sees only assigned class including filter tampering", async () => {
  let r = await teacher.get("/api/students");
  assert.equal(r.body.length, 1);
  assert.equal(r.body[0]._id, String(student._id));
  r = await teacher.get("/api/students?className=7&section=Mars");
  assert.equal(r.body.length, 0);
});
test("Teacher cannot read or change another class report", async () => {
  assert.equal(
    (await teacher.get(`/api/reports/${outside._id}/2025-26`)).status,
    403,
  );
  assert.equal(
    (
      await teacher
        .put(`/api/reports/${outside._id}/2025-26`)
        .set(header)
        .send({ marks: {}, revision: 0 })
    ).status,
    403,
  );
});
test("Teacher cannot administer users, imports or students", async () => {
  assert.equal((await teacher.get("/api/users")).status, 403);
  assert.equal(
    (await teacher.post("/api/students").set(header).send({})).status,
    403,
  );
  assert.equal((await teacher.get("/api/import/template")).status, 403);
});
test("Save, revision conflict, invalid range, submit and publish", async () => {
  const url = `/api/reports/${student._id}/2025-26`;
  let r = await teacher
    .put(url)
    .set(header)
    .send({ marks: { term1: { english: { exam: 81 } } }, co: {}, revision: 0 });
  assert.equal(r.status, 400);
  const marks = Object.fromEntries(
    ["term1", "term2"].map((t) => [
      t,
      Object.fromEntries(
        DEFAULT_CONFIG.subjects.map((s) => [
          s.id,
          { periodic: 10, notebook: 5, enrichment: 5, exam: 80 },
        ]),
      ),
    ]),
  );
  const co = Object.fromEntries(
    DEFAULT_CONFIG.activities.map((a) => [a, { term1: "A", term2: "A" }]),
  );
  r = await teacher
    .put(url)
    .set(header)
    .send({ marks, co, revision: 0, remarks: "Excellent" });
  assert.equal(r.status, 200);
  assert.equal(r.body.revision, 1);
  assert.equal(
    (await teacher.put(url).set(header).send({ marks, co, revision: 0 }))
      .status,
    409,
  );
  assert.equal(
    (
      await teacher
        .post(url + "/publish")
        .set(header)
        .send({ revision: 1 })
    ).status,
    403,
  );
  r = await teacher
    .post(url + "/submit")
    .set(header)
    .send({ revision: 1 });
  assert.equal(r.status, 200);
  assert.equal(r.body.status, "submitted");
  assert.equal(
    (await teacher.put(url).set(header).send({ marks, co, revision: 2 }))
      .status,
    409,
  );
  r = await admin
    .post(url + "/publish")
    .set(header)
    .send({ revision: 2 });
  assert.equal(r.status, 200);
  assert.equal(r.body.status, "published");
  assert.equal(r.body.studentSnapshot.admissionNo, "T001");
  assert.equal(r.body.configSnapshot.session, "2025-26");
  assert.equal(
    r.body.templateSnapshot.templateVersion,
    templateMapping.templateVersion,
  );
  const frozenX = r.body.templateSnapshot.pages.front.fields[0].x;
  templateMapping.pages.front.fields[0].x += 1;
  try {
    const frozen = await admin.get(url);
    assert.equal(
      frozen.body.report.templateSnapshot.pages.front.fields[0].x,
      frozenX,
    );
    const pdf = await teacher.get(`/api/report-pdf/${student._id}/2025-26`);
    assert.equal(pdf.status, 200, pdf.text);
    await assert.rejects(PDFDocument.load(pdf.body), /encrypted/i);
    const review = await admin.get("/api/review?session=2025-26");
    assert.equal(review.status, 200);
    assert.ok(
      review.body.some(
        (entry) =>
          entry.student._id === String(student._id) &&
          entry.status === "published",
      ),
    );
    assert.equal(
      (await teacher.get("/api/review?session=2025-26")).status,
      403,
    );
    const batch = await teacher
      .post("/api/report-pdf/bulk")
      .set(header)
      .send({ studentIds: [String(student._id)], session: "2025-26" });
    assert.equal(batch.status, 200, batch.text);
    assert.equal((await PDFDocument.load(batch.body)).getPageCount(), 2);
  } finally {
    templateMapping.pages.front.fields[0].x = frozenX;
  }

  r = await admin.get(url);
  assert.equal(r.body.calculation.total, 1400);
  r = await admin
    .post(url + "/reopen")
    .set(header)
    .send({ revision: 3 });
  assert.equal(r.body.status, "draft");
  r = await teacher
    .delete(url + "/term1")
    .set(header)
    .send({ revision: 4 });
  assert.equal(r.status, 200);
  // Mongoose may omit empty Mixed objects when serializing; either means no marks.
  assert.deepEqual(r.body.marks.term1 ?? {}, {});
  assert.equal(
    (
      await teacher
        .post(url + "/submit")
        .set(header)
        .send({ revision: 5 })
    ).status,
    400,
  );
});
test("Import validates duplicates; commit inserts; repeated commit skips", async () => {
  const w = new ExcelJS.Workbook(),
    s = w.addWorksheet("Students");
  s.addRow([
    "admissionNo",
    "name",
    "className",
    "section",
    "house",
    "motherName",
    "fatherName",
    "dob",
    "address",
    "mobile",
  ]);
  s.addRow([
    "EX001",
    "Excel Student",
    "8",
    "Mars",
    "Nilgiri",
    "",
    "",
    "2014-01-02",
    "",
    "9000000000",
  ]);
  const buffer = Buffer.from(await w.xlsx.writeBuffer());
  let r = await admin
    .post("/api/import")
    .set(header)
    .attach("file", buffer, "students.xlsx");
  assert.equal(r.status, 200);
  assert.equal(r.body.count, 1);
  assert.equal(r.body.errors.length, 0);
  r = await admin
    .post("/api/import?commit=true")
    .set(header)
    .attach("file", buffer, "students.xlsx");
  assert.equal(r.body.created, 1);
  r = await admin
    .post("/api/import?commit=true")
    .set(header)
    .attach("file", buffer, "students.xlsx");
  assert.equal(r.body.skipped, 1);
  assert.equal(await Student.countDocuments({ admissionNo: "EX001" }), 1);
});
test("XLSX export and audit are available to administrator", async () => {
  const r = await admin.get("/api/export?session=2025-26");
  assert.equal(r.status, 200);
  assert.ok(r.headers["content-disposition"].includes(".xlsx"));
  const a = await admin.get("/api/audit");
  assert.ok(a.body.some((e) => e.action === "publish-report"));
});
test("PDF routes enforce authentication, scope and published-only batches", async () => {
  assert.equal(
    (await request(app).get(`/api/report-pdf/${student._id}/2025-26`)).status,
    401,
  );
  assert.equal(
    (await other.get(`/api/report-pdf/${student._id}/2025-26`)).status,
    403,
  );
  assert.equal(
    (
      await other
        .post("/api/report-pdf/bulk")
        .set(header)
        .send({ studentIds: [String(student._id)], session: "2025-26" })
    ).status,
    403,
  );
  assert.equal(
    (
      await admin
        .post("/api/report-pdf/bulk")
        .set(header)
        .send({ studentIds: [String(student._id)], session: "2025-26" })
    ).status,
    409,
  );
  assert.equal(
    (
      await admin
        .post("/api/report-pdf/bulk")
        .set(header)
        .send({ studentIds: [], session: "2025-26" })
    ).status,
    400,
  );
  assert.equal(
    (await teacher.post("/api/template-mapping").set(header).send({})).status,
    404,
  );
});
test("Teachers cannot export submitted reports before admin review", async () => {
  await Report.create({
    student: student._id,
    session: "2028-29",
    status: "submitted",
  });
  assert.equal(
    (await teacher.get(`/api/report-pdf/${student._id}/2028-29`)).status,
    403,
  );
  assert.equal(
    (await admin.get(`/api/report-pdf/${student._id}/2028-29`)).status,
    200,
  );
});
test("password bounds apply to staff creation, reset and self-service changes", async () => {
  for (const length of [5, 21]) {
    const r = await admin
      .post("/api/users")
      .set(header)
      .send({
        name: "Password Test",
        email: `bounds${length}@test.local`,
        role: "teacher",
        password: "x".repeat(length),
      });
    assert.equal(r.status, 400);
  }
  const created = await admin
    .post("/api/users")
    .set(header)
    .send({
      name: "Password Test",
      email: "bounds@test.local",
      role: "teacher",
      password: "x".repeat(6),
    });
  assert.equal(created.status, 201);
  for (const length of [5, 21])
    assert.equal(
      (
        await admin
          .put(`/api/users/${created.body._id}`)
          .set(header)
          .send({ password: "x".repeat(length) })
      ).status,
      400,
    );
  const actor = request.agent(app);
  assert.equal(
    (
      await actor
        .post("/api/auth/login")
        .set(header)
        .send({ email: "bounds@test.local", password: "x".repeat(6) })
    ).status,
    200,
  );
  for (const length of [5, 21])
    assert.equal(
      (
        await actor
          .put("/api/auth/password")
          .set(header)
          .send({ current: "x".repeat(6), password: "x".repeat(length) })
      ).status,
      400,
    );
  assert.equal(
    (
      await actor
        .put("/api/auth/password")
        .set(header)
        .send({ current: "x".repeat(6), password: "x".repeat(20) })
    ).status,
    200,
  );
  assert.equal(
    (
      await actor
        .post("/api/auth/login")
        .set(header)
        .send({ email: "bounds@test.local", password: "x".repeat(20) })
    ).status,
    200,
  );
});
test("Inactive account sessions are immediately rejected", async () => {
  await User.updateOne({ email: "other@test.local" }, { active: false });
  assert.equal((await other.get("/api/auth/me")).status, 401);
});

test("admin signature is saved and frozen as class teacher signature, without overwriting an existing teacher", async () => {
  const account = await User.findOne({ email: "admin@test.local" });
  const original = account.signature;
  try {
    await User.updateOne(
      { _id: account._id },
      { $set: { signature: "/api/files/admin-test.png" } },
    );
    const url = `/api/reports/${student._id}/2026-27`;
    const marks = Object.fromEntries(
      ["term1", "term2"].map((t) => [
        t,
        Object.fromEntries(
          DEFAULT_CONFIG.subjects.map((s) => [
            s.id,
            Object.fromEntries(
              DEFAULT_CONFIG.components.map((c) => [c.id, c.max]),
            ),
          ]),
        ),
      ]),
    );
    const co = Object.fromEntries(
      DEFAULT_CONFIG.activities.map((a) => [a, { term1: "A", term2: "A" }]),
    );
    const saved = await admin
      .put(url)
      .set(header)
      .send({ marks, co, revision: 0 });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.teacherSignature, "/api/files/admin-test.png");
    await User.updateOne(
      { _id: account._id },
      { $set: { signature: "/api/files/new-admin-test.png" } },
    );
    const again = await admin
      .put(url)
      .set(header)
      .send({ marks, co, revision: 1 });
    assert.equal(again.body.teacherSignature, "/api/files/admin-test.png");
    assert.equal(
      (
        await admin
          .post(url + "/submit")
          .set(header)
          .send({ revision: 2 })
      ).status,
      200,
    );
    const published = await admin
      .post(url + "/publish")
      .set(header)
      .send({ revision: 3 });
    assert.equal(published.status, 200);
    assert.equal(published.body.teacherSignature, "/api/files/admin-test.png");
  } finally {
    await User.updateOne(
      { _id: account._id },
      original
        ? { $set: { signature: original } }
        : { $unset: { signature: 1 } },
    );
  }
});

test("teacher can reload an empty saved draft then enter and save both terms", async () => {
  const url = `/api/reports/${student._id}/2027-28`;
  const first = await teacher
    .put(url)
    .set(header)
    .send({
      marks: { term1: {}, term2: {} },
      co: { "WORK EDUCATION": { term1: "A" } },
      revision: 0,
    });
  assert.equal(first.status, 200);
  assert.deepEqual(first.body.marks, { term1: {}, term2: {} });
  const loaded = await teacher.get(url);
  assert.deepEqual(loaded.body.report.marks, { term1: {}, term2: {} });
  const marks = {
    ...loaded.body.report.marks,
    term1: { english: { periodic: 8, notebook: 5, enrichment: 2, exam: 77 } },
    term2: { english: { periodic: 0, notebook: "AB" } },
  };
  const saved = await teacher
    .put(url)
    .set(header)
    .send({ ...loaded.body.report, marks });
  assert.equal(saved.status, 200);
  const reread = await teacher.get(url);
  assert.deepEqual(reread.body.report.marks, marks);
  assert.equal(reread.body.calculation.terms.term1[0].total, 92);
  assert.equal(reread.body.report.co["WORK EDUCATION"].term1, "A");
  // Older records may have been persisted as an empty object.
  await Report.updateOne(
    { student: student._id, session: "2027-28" },
    { $set: { marks: {} } },
  );
  const legacy = await teacher.get(url);
  assert.deepEqual(legacy.body.report.marks, {});
});

test("login role selection cannot change account privileges", async () => {
  const response = await request(app).post("/api/auth/login").set(header).send({
    email: "teacher@test.local",
    password: "Testing-School-Password!",
    role: "admin",
  });
  assert.equal(response.status, 403);
  assert.equal(response.headers["set-cookie"], undefined);
});

test("public results require matching identity and only return published academic data", async () => {
  const pupil = await Student.create({
    admissionNo: "PUBLIC-TEST",
    name: "Result Test",
    className: "6",
    section: "Venus",
    dob: "2014-12-25",
    mobile: "private",
    address: "private",
  });
  const report = await Report.create({
    student: pupil._id,
    session: "2026-27",
    status: "draft",
    configSnapshot: DEFAULT_CONFIG,
  });
  const lookup = (overrides = {}) =>
    request(app)
      .post("/api/public/results")
      .set(header)
      .send({
        admissionNo: "PUBLIC-TEST",
        dob: "2014-12-25",
        session: "2026-27",
        ...overrides,
      });
  assert.equal((await lookup()).status, 404);
  report.status = "published";
  await report.save();
  assert.equal((await lookup({ dob: "2014-12-24" })).status, 404);
  assert.equal((await lookup({ admissionNo: { $ne: null } })).status, 400);
  const response = await lookup();
  assert.equal(response.status, 200);
  assert.equal(response.headers["cache-control"], "no-store");
  assert.deepEqual(Object.keys(response.body.student).sort(), [
    "className",
    "name",
    "section",
  ]);
  assert.equal(response.body.student.name, "Result Test");
  pupil.active = false;
  await pupil.save();
  assert.equal((await lookup()).status, 404);
});

test("email password reset is private, expiring, single-use and revokes sessions", async (t) => {
  const { resetMail } = await import("../src/password-reset.js");
  const keys = [
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
    "MAIL_FROM",
    "APP_ORIGIN",
  ];
  const old = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  Object.assign(process.env, {
    SMTP_HOST: "smtp.test.local",
    SMTP_USER: "test",
    SMTP_PASS: "test",
    MAIL_FROM: "test@test.local",
    APP_ORIGIN: "https://school.test",
  });
  t.after(() => {
    for (const k of keys) {
      if (old[k] === undefined) delete process.env[k];
      else process.env[k] = old[k];
    }
  });
  const mails = [];
  t.mock.method(resetMail, "send", async (to, url) => {
    mails.push({ to, url });
  });
  const u = await User.create({
    name: "Reset Teacher",
    email: "reset@test.local",
    role: "teacher",
    passwordHash: await bcrypt.hash("Old-password!", 4),
  });
  const agent = request.agent(app);
  await agent
    .post("/api/auth/login")
    .set(header)
    .send({ email: u.email, password: "Old-password!" })
    .expect(200);
  const forgot = (email) =>
    request(app).post("/api/auth/forgot-password").set(header).send({ email });
  const reset = (token, password = "New-password!") =>
    request(app)
      .post("/api/auth/reset-password")
      .set(header)
      .send({ token, password });
  const known = await forgot(u.email);
  const unknown = await forgot("unknown@test.local");
  assert.equal(known.status, 200);
  assert.deepEqual(known.body, unknown.body);
  assert.equal(mails.length, 1);
  const token = new URLSearchParams(new URL(mails[0].url).hash.slice(1)).get(
    "reset-password",
  );
  assert.equal(new URL(mails[0].url).origin, "https://school.test");
  const stored = await User.findById(u._id).select("+resetTokenHash");
  assert.notEqual(stored.resetTokenHash, token);
  assert.equal(
    (await agent.get("/api/auth/me")).body.resetTokenHash,
    undefined,
  );
  await forgot(u.email);
  assert.equal(mails.length, 1, "per-account cooldown");
  assert.equal((await reset(token, "a")).status, 400);
  assert.equal((await reset(token)).status, 200);
  assert.equal((await reset(token)).status, 400);
  assert.equal((await agent.get("/api/auth/me")).status, 401);
  await agent
    .post("/api/auth/login")
    .set(header)
    .send({ email: u.email, password: "New-password!" })
    .expect(200);
  await forgot(u.email);
  const expiredToken = new URLSearchParams(
    new URL(mails[1].url).hash.slice(1),
  ).get("reset-password");
  await User.updateOne(
    { _id: u._id },
    { $set: { resetExpiresAt: new Date(0) } },
  );
  assert.equal((await reset(expiredToken)).status, 400);
  await User.updateOne({ _id: u._id }, { $unset: { resetRequestedAt: 1 } });
  await forgot(u.email);
  const staleToken = new URLSearchParams(
    new URL(mails[2].url).hash.slice(1),
  ).get("reset-password");
  await User.updateOne({ _id: u._id }, { $inc: { sessionVersion: 1 } });
  assert.equal((await reset(staleToken)).status, 400);
  delete process.env.SMTP_HOST;
  assert.equal((await forgot(u.email)).status, 503);
});
