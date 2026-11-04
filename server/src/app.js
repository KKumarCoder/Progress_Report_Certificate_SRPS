import { passwordResetRoutes } from "./password-reset.js";
import {
  validPassword,
  PASSWORD_MESSAGE,
} from "../../shared/password-policy.js";
import express from "express";
import { templateMapping, renderReports } from "./report-renderer.js";
import { assertCompatible } from "../../shared/report-template.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";
import multer from "multer";
import sharp from "sharp";
import ExcelJS from "exceljs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { User, Student, Report, Setting, Session, Audit } from "./models.js";
import {
  DEFAULT_CONFIG,
  calculate,
  validateMarks,
  validateStudent,
  canAccess,
} from "../../shared/engine.js";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const uploads = path.join(root, "server/uploads");
await fs.mkdir(uploads, { recursive: true });
export const app = express();
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
  }),
);
app.use(express.json({ limit: "3mb" }));
app.use(cookieParser());
app.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    limit: 400,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const fail = (status, message) => Object.assign(new Error(message), { status });
const digest = (t) => createHash("sha256").update(t).digest("hex");
app.use("/api", (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (req.get("X-SRPS-Request") !== "1")
    return next(fail(403, "Invalid request origin"));
  const origin = req.get("Origin");
  if (origin && origin !== (process.env.APP_ORIGIN || "http://localhost:5173"))
    return next(fail(403, "Origin not allowed"));
  next();
});
const sessionOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  maxAge: 8 * 60 * 60 * 1000,
  path: "/",
};
const audit = async (req, action, target, details = "") =>
  Audit.create({
    actor: req.user?._id,
    action,
    target: String(target),
    details,
  });
const config = async () => ({
  ...DEFAULT_CONFIG,
  ...(await Setting.findOne({ key: "config" }))?.value,
});
function forClass(cfg, student) {
  return {
    ...cfg,
    subjects: cfg.profiles?.[student.className]?.length
      ? cfg.profiles[student.className]
      : cfg.subjects,
  };
}

function scope(user) {
  return ["admin", "principal"].includes(user.role)
    ? {}
    : {
        $or: user.assignments.length
          ? user.assignments.map((a) => ({
              className: a.className,
              section: a.section,
            }))
          : [{ _id: null }],
      };
}
async function accessible(req, id) {
  const student = await Student.findById(id);
  if (!student || !student.active) throw fail(404, "Student not found");
  if (!canAccess(req.user, student))
    throw fail(403, "This class/section is not assigned to you");
  return student;
}
const roles =
  (...allowed) =>
  (req, res, next) =>
    allowed.includes(req.user.role)
      ? next()
      : next(fail(403, "You do not have permission"));
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.post(
  "/api/auth/login",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 25 }),
  wrap(async (req, res) => {
    const { email, password, role } = req.body;
    const user = await User.findOne({
      email: String(email || "").toLowerCase(),
      active: true,
    }).select("+passwordHash");
    if (
      !user ||
      !(await bcrypt.compare(String(password || ""), user.passwordHash))
    )
      throw fail(401, "Email or password is incorrect");
    if (role !== undefined && role !== user.role)
      throw fail(
        403,
        "This account does not match the selected role. Choose your assigned role.",
      );
    const token = randomBytes(32).toString("hex");
    await Session.create({
      tokenHash: digest(token),
      user: user._id,
      version: user.sessionVersion,
      expiresAt: new Date(Date.now() + sessionOptions.maxAge),
    });
    res.cookie("srps_session", token, sessionOptions);
    await audit({ ...req, user }, "login", user._id);
    res.json({ ok: true });
  }),
);
passwordResetRoutes(app, wrap);
app.post(
  "/api/public/results",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 15 }),
  wrap(async (req, res) => {
    res.set("Cache-Control", "no-store");
    const { admissionNo, dob, session } = req.body;
    if (
      typeof admissionNo !== "string" ||
      !admissionNo.trim() ||
      admissionNo.length > 60 ||
      typeof dob !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dob) ||
      typeof session !== "string" ||
      !/^\d{4}-\d{2}$/.test(session)
    )
      throw fail(
        400,
        "Enter your admission number, date of birth and session (for example 2026-27).",
      );
    const unavailable = () =>
      fail(
        404,
        "No published result found for these details. Check your details or contact the school.",
      );
    const student = await Student.findOne({
      admissionNo: admissionNo.trim(),
      dob,
      active: true,
    });
    if (!student) throw unavailable();
    const report = await Report.findOne({
      student: student._id,
      session,
      status: "published",
    });
    if (!report) throw unavailable();
    const cfg = report.configSnapshot || forClass(await config(), student);
    const identity = report.studentSnapshot || student;
    const summary = calculate(report.marks, cfg);
    res.json({
      student: {
        name: identity.name,
        className: identity.className,
        section: identity.section,
      },
      session: report.session,
      summary,
    });
  }),
);
app.use(
  "/api",
  wrap(async (req, res, next) => {
    const token = req.cookies.srps_session;
    if (!token) throw fail(401, "Please sign in");
    const session = await Session.findOne({
      tokenHash: digest(token),
      expiresAt: { $gt: new Date() },
    }).populate("user");
    if (
      !session?.user?.active ||
      session.version !== session.user.sessionVersion
    )
      throw fail(401, "Session expired");
    req.user = session.user;
    req.session = session;
    next();
  }),
);
app.get("/api/auth/me", (req, res) => res.json(req.user));
app.post(
  "/api/auth/logout",
  wrap(async (req, res) => {
    await Session.deleteOne({ _id: req.session._id });
    res.clearCookie("srps_session", { path: "/" }).json({ ok: true });
  }),
);
app.put(
  "/api/auth/password",
  wrap(async (req, res) => {
    if (!validPassword(req.body.password)) throw fail(400, PASSWORD_MESSAGE);
    const u = await User.findById(req.user._id).select("+passwordHash");
    if (!(await bcrypt.compare(String(req.body.current || ""), u.passwordHash)))
      throw fail(400, "Current password is incorrect");
    u.passwordHash = await bcrypt.hash(req.body.password, 12);
    u.sessionVersion += 1;
    await u.save();
    await audit(req, "change-password", u._id);
    res.clearCookie("srps_session", { path: "/" }).json({ ok: true });
  }),
);
app.get(
  "/api/config",
  wrap(async (req, res) => res.json(await config())),
);
app.put(
  "/api/config",
  roles("admin"),
  wrap(async (req, res) => {
    const old = await config();
    const value = { ...old };
    for (const k of [
      "session",
      "schoolName",
      "address",
      "affiliation",
      "phone",
      "phone2",
      "website",
      "email",
      "principalSignature",
      "logo",
    ])
      if (typeof req.body[k] === "string") value[k] = req.body[k].slice(0, 250);
    if (req.body.profiles !== undefined) {
      const profiles = req.body.profiles;
      if (!profiles || typeof profiles !== "object" || Array.isArray(profiles))
        throw fail(400, "Invalid class profiles");
      for (const [cls, subjects] of Object.entries(profiles)) {
        if (
          !Array.from({ length: 12 }, (_, i) => String(i + 1)).includes(cls) ||
          !Array.isArray(subjects) ||
          subjects.length < 1 ||
          subjects.length > 12 ||
          subjects.some(
            (x) =>
              !x ||
              !/^[-a-z0-9_]{1,40}$/.test(x.id) ||
              !x.name ||
              x.name.length > 60,
          ) ||
          new Set(subjects.map((x) => x.id)).size !== subjects.length
        )
          throw fail(400, "Use 1–12 uniquely named subjects per class");
        if (
          JSON.stringify(old.profiles?.[cls] || old.subjects) !==
          JSON.stringify(subjects)
        ) {
          const students = await Student.find({ className: cls }).select("_id");
          if (
            await Report.exists({
              student: { $in: students.map((s) => s._id) },
            })
          )
            throw fail(
              409,
              "Class " +
                cls +
                " already has assessment records. Preserve its subject profile.",
            );
        }
      }
      value.profiles = profiles;
    }
    if (!/^\d{4}-\d{2}$/.test(value.session))
      throw fail(400, "Session must be YYYY-YY");
    await Setting.findOneAndUpdate(
      { key: "config" },
      { value },
      { upsert: true },
    );
    await audit(req, "settings", "config");
    res.json(value);
  }),
);
app.get(
  "/api/students",
  wrap(async (req, res) => {
    const q = { active: true, ...scope(req.user) };
    if (req.query.className) q.className = String(req.query.className);
    if (req.query.section) q.section = String(req.query.section); // Scope enforced again below if filters override.
    const all = await Student.find(q)
      .sort({ className: 1, section: 1, name: 1 })
      .limit(5000);
    res.json(all.filter((s) => canAccess(req.user, s)));
  }),
);
const studentFields = [
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
  "photo",
];
const pickStudent = (b) =>
  Object.fromEntries(
    studentFields
      .filter((k) => b[k] !== undefined)
      .map((k) => [
        k,
        String(b[k])
          .trim()
          .slice(0, k === "address" ? 500 : 250),
      ]),
  );
app.post(
  "/api/students",
  roles("admin"),
  wrap(async (req, res) => {
    const data = pickStudent(req.body),
      errors = validateStudent(data);
    if (errors.length) throw fail(400, errors.join("; "));
    const s = await Student.create(data);
    await audit(req, "create-student", s._id);
    res.status(201).json(s);
  }),
);
app.put(
  "/api/students/:id",
  roles("admin"),
  wrap(async (req, res) => {
    const s = await Student.findById(req.params.id);
    if (!s) throw fail(404, "Student not found");
    const data = { ...s.toObject(), ...pickStudent(req.body) };
    const errors = validateStudent(data);
    if (errors.length) throw fail(400, errors.join("; "));
    Object.assign(s, pickStudent(req.body));
    await s.save();
    await audit(req, "update-student", s._id);
    res.json(s);
  }),
);
app.delete(
  "/api/students/:id",
  roles("admin"),
  wrap(async (req, res) => {
    await Student.findByIdAndUpdate(req.params.id, { active: false });
    await audit(req, "archive-student", req.params.id);
    res.json({ ok: true });
  }),
);
const memory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
app.post(
  "/api/upload/:kind",
  memory.single("file"),
  wrap(async (req, res) => {
    const kind = req.params.kind;
    if (
      !["photo", "signature", "logo", "principal"].includes(kind) ||
      !req.file
    )
      throw fail(400, "Choose an image file");
    if (["logo", "principal"].includes(kind) && req.user.role !== "admin")
      throw fail(403, "Admin only");
    if (kind === "photo") {
      if (req.user.role !== "admin") throw fail(403, "Admin only");
    }
    const meta = await sharp(req.file.buffer, {
      limitInputPixels: 16000000,
    }).metadata();
    if (!["png", "jpeg", "webp"].includes(meta.format))
      throw fail(400, "PNG, JPG or WebP images only");
    const name = `${randomBytes(18).toString("hex")}.png`;
    await sharp(req.file.buffer)
      .rotate()
      .resize({
        width: kind === "photo" ? 700 : 1200,
        withoutEnlargement: true,
      })
      .png()
      .toFile(path.join(uploads, name));
    if (kind === "signature") {
      await User.findByIdAndUpdate(req.user._id, {
        signature: "/api/files/" + name,
      });
    }
    await audit(req, "upload-" + kind, name);
    res.json({ url: "/api/files/" + name });
  }),
);
app.get(
  "/api/files/:name",
  wrap(async (req, res) => {
    if (!/^[a-f0-9]{36}\.png$/.test(req.params.name))
      throw fail(404, "Not found"); // Uploaded media requires sign-in; student data remains scope-controlled.
    const url = "/api/files/" + req.params.name;
    const student = await Student.findOne({ photo: url });
    if (student && !canAccess(req.user, student))
      throw fail(403, "Not your class");
    res.set("Cache-Control", "private, max-age=300");
    res.sendFile(path.join(uploads, req.params.name));
  }),
);
function validSession(s) {
  if (!/^\d{4}-\d{2}$/.test(s)) throw fail(400, "Invalid academic session");
  return s;
}
// Existing session authentication, origin checks and class/section access apply.
app.get(
  "/api/report-pdf/:studentId/:session",
  wrap(async (req, res) => {
    const student = await accessible(req, req.params.studentId);
    const session = validSession(req.params.session);
    const report = await Report.findOne({
      student: student._id,
      session,
    }).lean();
    if (!report) throw fail(404, "Save the draft before exporting");
    if (report.status === "published" && !report.templateSnapshot)
      throw fail(
        409,
        "This is a legacy published report. Use its existing Print / Save PDF workflow.",
      );
    const cfg =
      report.status === "published"
        ? report.configSnapshot
        : forClass(await config(), student);
    try {
      const bytes = await renderReports([
        { student: student.toObject(), report, config: cfg, user: req.user },
      ]);
      res
        .type("application/pdf")
        .set("Cache-Control", "no-store")
        .send(Buffer.from(bytes));
    } catch (e) {
      throw fail(422, e.message);
    }
  }),
);
app.post(
  "/api/report-pdf/bulk",
  wrap(async (req, res) => {
    const { studentIds, session } = req.body;
    validSession(session);
    if (
      !Array.isArray(studentIds) ||
      !studentIds.length ||
      studentIds.length > 50 ||
      studentIds.some(
        (id) => typeof id !== "string" || !/^[a-f0-9]{24}$/i.test(id),
      ) ||
      new Set(studentIds).size !== studentIds.length
    )
      throw fail(400, "Select 1–50 distinct students");
    const records = [];
    for (const id of studentIds) {
      const student = await accessible(req, id);
      const report = await Report.findOne({
        student: id,
        session,
        status: "published",
      }).lean();
      if (!report)
        throw fail(409, "Only published reports can be exported in bulk");
      if (!report.templateSnapshot)
        throw fail(
          409,
          "This batch includes legacy reports. Use Print / Save PDF to preserve their original renderer.",
        );
      records.push({
        student: student.toObject(),
        report,
        config: report.configSnapshot,
        user: req.user,
      });
    }
    try {
      res
        .type("application/pdf")
        .set("Cache-Control", "no-store")
        .send(Buffer.from(await renderReports(records)));
    } catch (e) {
      throw fail(422, e.message);
    }
  }),
);
app.get(
  "/api/reports/:studentId/:session",
  wrap(async (req, res) => {
    await accessible(req, req.params.studentId);
    const session = validSession(req.params.session);
    const r = await Report.findOne({ student: req.params.studentId, session });
    const cfg =
      r?.status === "published"
        ? r.configSnapshot
        : forClass(
            await config(),
            await Student.findById(req.params.studentId),
          );
    res.json({
      report: r || {
        marks: { term1: {}, term2: {} },
        co: {},
        remarks: "",
        status: "draft",
        revision: 0,
        session,
      },
      calculation: calculate(r?.marks, cfg),
      config: cfg,
    });
  }),
);
app.put(
  "/api/reports/:studentId/:session",
  wrap(async (req, res) => {
    await accessible(req, req.params.studentId);
    const session = validSession(req.params.session);
    const cfg = forClass(
      await config(),
      await Student.findById(req.params.studentId),
    );
    const { marks, co = {}, remarks = "", revision } = req.body;
    const errors = validateMarks(marks, cfg);
    if (errors.length) throw fail(400, errors.join("; "));
    if (
      !marks ||
      typeof marks !== "object" ||
      Array.isArray(marks) ||
      Object.keys(marks).some((k) => !["term1", "term2"].includes(k))
    )
      throw fail(400, "Invalid term data");
    if (typeof co !== "object" || Array.isArray(co) || co === null)
      throw fail(400, "Invalid activities");
    for (const [k, v] of Object.entries(co)) {
      if (
        !cfg.activities.includes(k) ||
        !v ||
        typeof v !== "object" ||
        Object.values(v).some((x) => !["", "A", "B", "C"].includes(x)) ||
        Object.keys(v).some((k) => !["term1", "term2"].includes(k))
      )
        throw fail(400, "Activity grades must be A, B or C");
    }
    if (!Number.isInteger(revision)) throw fail(400, "Revision is required");
    let r = await Report.findOne({ student: req.params.studentId, session });
    if (!r) {
      if (revision !== 0)
        throw fail(409, "Report changed. Reload before saving.");
      try {
        r = await Report.create({ student: req.params.studentId, session });
      } catch (e) {
        if (e.code === 11000)
          throw fail(409, "Report was created in another tab. Reload.");
        throw e;
      }
    }
    if (r.status !== "draft")
      throw fail(409, "Reopen this report before changing marks");
    const saved = await Report.findOneAndUpdate(
      { _id: r._id, revision, status: "draft" },
      {
        $set: {
          marks,
          co,
          remarks: String(remarks).slice(0, 1000),
          updatedBy: req.user._id,
          teacherSignature:
            req.user.role === "teacher"
              ? req.user.signature
              : r.teacherSignature ||
                (req.user.role === "admin" ? req.user.signature : ""),
        },
        $inc: { revision: 1 },
      },
      { new: true },
    );
    if (!saved)
      throw fail(
        409,
        "Another user updated this report. Reload to avoid losing their work.",
      );
    await audit(req, "save-report", saved._id, `Revision ${saved.revision}`);
    res.json(saved);
  }),
);
app.post(
  "/api/reports/:studentId/:session/:action",
  wrap(async (req, res) => {
    const student = await accessible(req, req.params.studentId);
    validSession(req.params.session);
    const r = await Report.findOne({
      student: student._id,
      session: req.params.session,
    });
    if (!r) throw fail(404, "Save report first");
    if (req.body.revision !== r.revision)
      throw fail(409, "Report changed. Reload.");
    const action = req.params.action;
    const cfg = forClass(await config(), student);
    if (action === "submit") {
      if (r.status !== "draft") throw fail(409, "Only drafts can be submitted");
      if (
        !calculate(r.marks, cfg).complete ||
        !cfg.activities.every((a) =>
          ["term1", "term2"].every((t) =>
            ["A", "B", "C"].includes(r.co?.[a]?.[t]),
          ),
        )
      )
        throw fail(400, "Complete both terms and all activity grades first");
    } else if (["publish", "reopen"].includes(action)) {
      if (!["admin", "principal"].includes(req.user.role))
        throw fail(403, "Principal or admin only");
      if (action === "publish" && r.status !== "submitted")
        throw fail(409, "Submit report before publishing");
    } else throw fail(400, "Unknown action");
    const update = {
      status:
        action === "submit"
          ? "submitted"
          : action === "publish"
            ? "published"
            : "draft",
    };
    if (action === "submit") update.submittedAt = new Date();
    if (action === "publish") {
      update.publishedAt = new Date();
      update.studentSnapshot = student.toObject();
      update.configSnapshot = cfg;
      // Preserve all coordinates, font identities and immutable artwork versions.
      assertCompatible(cfg);
      update.templateSnapshot = structuredClone(templateMapping);
      const teacher = await User.findOne({
        role: "teacher",
        active: true,
        assignments: {
          $elemMatch: {
            className: student.className,
            section: student.section,
          },
        },
      });
      update.teacherSignature =
        r.teacherSignature ||
        teacher?.signature ||
        (req.user.role === "admin" ? req.user.signature : "") ||
        "";
    }
    const saved = await Report.findOneAndUpdate(
      { _id: r._id, revision: r.revision },
      { $set: update, $inc: { revision: 1 } },
      { new: true },
    );
    if (!saved) throw fail(409, "Concurrent change, reload");
    await audit(req, action + "-report", r._id);
    res.json(saved);
  }),
);
app.delete(
  "/api/reports/:studentId/:session/:term",
  wrap(async (req, res) => {
    await accessible(req, req.params.studentId);
    if (!["term1", "term2"].includes(req.params.term))
      throw fail(400, "Invalid term");
    const r = await Report.findOne({
      student: req.params.studentId,
      session: validSession(req.params.session),
    });
    if (!r || r.status !== "draft")
      throw fail(409, "Only saved draft terms can be cleared");
    if (req.body.revision !== r.revision) throw fail(409, "Report changed");
    const saved = await Report.findOneAndUpdate(
      { _id: r._id, revision: r.revision, status: "draft" },
      { $set: { ["marks." + req.params.term]: {} }, $inc: { revision: 1 } },
      { new: true },
    );
    if (!saved) throw fail(409, "Concurrent change");
    await audit(req, "clear-" + req.params.term, r._id);
    res.json(saved);
  }),
);
app.get(
  "/api/users",
  roles("admin"),
  wrap(async (req, res) => res.json(await User.find().sort({ name: 1 }))),
);
app.post(
  "/api/users",
  roles("admin"),
  wrap(async (req, res) => {
    const { name, email, password, role, assignments = [] } = req.body;
    if (
      !name ||
      !/^\S+@\S+\.\S+$/.test(email || "") ||
      !validPassword(password) ||
      !["admin", "principal", "teacher"].includes(role)
    )
      throw fail(
        400,
        "Valid name, email, role and 6–20 character password required",
      );
    validateAssignments(assignments);
    const u = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      assignments,
    });
    await audit(req, "create-user", u._id);
    res
      .status(201)
      .json({ name: u.name, email: u.email, _id: u._id, role: u.role });
  }),
);
function validateAssignments(a) {
  if (
    !Array.isArray(a) ||
    a.length > 24 ||
    a.some(
      (x) =>
        !Array.from({ length: 12 }, (_, i) => String(i + 1)).includes(
          String(x.className),
        ) || !["Venus", "Mars"].includes(x.section),
    )
  )
    throw fail(400, "Invalid class assignment");
}
app.put(
  "/api/users/:id",
  roles("admin"),
  wrap(async (req, res) => {
    const u = await User.findById(req.params.id);
    if (!u) throw fail(404, "User not found");
    if (String(u._id) === String(req.user._id))
      throw fail(400, "Use another administrator to change your access");
    if (req.body.assignments) {
      validateAssignments(req.body.assignments);
      u.assignments = req.body.assignments;
    }
    if (typeof req.body.active === "boolean") u.active = req.body.active;
    if (req.body.role) {
      if (!["admin", "principal", "teacher"].includes(req.body.role))
        throw fail(400, "Invalid role");
      u.role = req.body.role;
    }
    if (req.body.password !== undefined) {
      if (!validPassword(req.body.password)) throw fail(400, PASSWORD_MESSAGE);
      u.passwordHash = await bcrypt.hash(req.body.password, 12);
    }
    u.sessionVersion += 1;
    await u.save();
    await audit(req, "update-user", u._id);
    res.json(u);
  }),
);
app.get(
  "/api/audit",
  roles("admin", "principal"),
  wrap(async (req, res) =>
    res.json(
      await Audit.find()
        .populate("actor", "name")
        .sort({ createdAt: -1 })
        .limit(200),
    ),
  ),
);
const importColumns = [
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
];
app.get(
  "/api/import/template",
  roles("admin"),
  wrap(async (req, res) => {
    const w = new ExcelJS.Workbook(),
      s = w.addWorksheet("Students");
    s.addRow(importColumns);
    s.addRow([
      "SAMPLE-001",
      "Sample Student",
      "6",
      "Venus",
      "Himalya",
      "Mother Name",
      "Father Name",
      "2014-12-25",
      "Village, District",
      "9000000000",
    ]);
    s.getRow(1).font = { bold: true };
    s.columns.forEach((c) => (c.width = 22));
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="SRPS_Student_Import_Template.xlsx"',
    );
    res.send(Buffer.from(await w.xlsx.writeBuffer()));
  }),
);
app.post(
  "/api/import",
  roles("admin"),
  memory.single("file"),
  wrap(async (req, res) => {
    if (!req.file || !req.file.originalname.toLowerCase().endsWith(".xlsx"))
      throw fail(400, "Choose the supplied XLSX template");
    const w = new ExcelJS.Workbook();
    await w.xlsx.load(req.file.buffer);
    const s = w.worksheets[0];
    if (!s || s.rowCount > 2001)
      throw fail(400, "Maximum 2000 students per workbook");
    const headers = s
      .getRow(1)
      .values.slice(1)
      .map((v) => String(v ?? "").trim());
    if (!importColumns.every((k) => headers.includes(k)))
      throw fail(400, "Headers do not match. Download the template.");
    const rows = [],
      seen = new Set(),
      errors = [];
    s.eachRow((r, n) => {
      if (n === 1) return;
      const item = {};
      for (const k of importColumns) {
        const val = r.getCell(headers.indexOf(k) + 1).value;
        if (val && typeof val === "object" && !(val instanceof Date)) {
          errors.push({
            row: n,
            error: "Formula / rich text cells are not supported",
          });
          return;
        }
        item[k] =
          val instanceof Date
            ? val.toISOString().slice(0, 10)
            : String(val ?? "").trim();
      }
      if (!item.admissionNo && !item.name) return;
      let errs = validateStudent(item);
      if (seen.has(item.admissionNo))
        errs.push("Duplicate admission number in workbook");
      seen.add(item.admissionNo);
      if (errs.length) errors.push({ row: n, error: errs.join("; ") });
      rows.push(item);
    });
    if (!rows.length) throw fail(400, "No student rows found");
    const existing = await Student.find({
      admissionNo: { $in: rows.map((r) => r.admissionNo) },
    }).select("admissionNo");
    const duplicates = existing.map((s) => s.admissionNo);
    if (req.query.commit !== "true")
      return res.json({
        rows: rows.slice(0, 30),
        count: rows.length,
        errors,
        duplicates,
      });
    if (errors.length)
      throw fail(400, "Fix validation errors before importing");
    const update = req.query.update === "true";
    let created = 0,
      updated = 0,
      skipped = 0;
    for (const row of rows) {
      if (duplicates.includes(row.admissionNo)) {
        if (!update) {
          skipped++;
          continue;
        }
        await Student.updateOne(
          { admissionNo: row.admissionNo },
          { $set: row },
        );
        updated++;
      } else {
        try {
          await Student.create(row);
          created++;
        } catch (e) {
          if (e.code === 11000) {
            skipped++;
            continue;
          }
          throw e;
        }
      }
    }
    await audit(
      req,
      "import-students",
      "batch",
      JSON.stringify({ created, updated, skipped }),
    );
    res.json({ created, updated, skipped });
  }),
);
app.get(
  "/api/export",
  roles("admin", "principal"),
  wrap(async (req, res) => {
    const session = validSession(
      String(req.query.session || DEFAULT_CONFIG.session),
    );
    const reports = await Report.find({ session }).populate("student");
    const cfg = await config();
    const w = new ExcelJS.Workbook(),
      s = w.addWorksheet("Results");
    s.addRow([
      "Admission No",
      "Student",
      "Class",
      "Section",
      "House",
      "Session",
      "Total",
      "Maximum",
      "Percentage",
      "Result",
      "Status",
    ]);
    for (const r of reports) {
      if (!r.student) continue;
      const c = calculate(
        r.marks,
        r.status === "published" ? r.configSnapshot : forClass(cfg, r.student),
      );
      s.addRow([
        r.student.admissionNo,
        r.student.name,
        r.student.className,
        r.student.section,
        r.student.house,
        session,
        c.total,
        c.maximum,
        c.percentage,
        c.result,
        r.status,
      ]);
    }
    s.columns.forEach((c) => (c.width = 20));
    s.getRow(1).font = { bold: true };
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="SRPS_Results.xlsx"',
    );
    res.send(Buffer.from(await w.xlsx.writeBuffer()));
  }),
);
app.use(express.static(path.join(root, "client/dist")));
app.get("/{*splat}", (req, res) => {
  if (req.path.startsWith("/api"))
    return res.status(404).json({ error: "Not found" });
  res.sendFile(path.join(root, "client/dist/index.html"));
});
app.use((err, req, res, next) => {
  const status =
    err.status ||
    (err.code === 11000
      ? 409
      : err.name === "CastError" ||
          err.name === "ValidationError" ||
          err instanceof multer.MulterError
        ? 400
        : 500);
  if (status === 500) console.error(err.message);
  res.status(status).json({
    error:
      status === 500
        ? "Server error. Please try again."
        : err.code === 11000
          ? "This admission number or email already exists."
          : err.message,
  });
});
