import { passwordResetRoutes } from "./password-reset.js";
import {
  validPassword,
  PASSWORD_MESSAGE,
} from "../../shared/password-policy.js";
import express from "express";
import {
  templateMapping,
  renderReports,
  lockReportPdf,
} from "./report-renderer.js";
import { assertCompatible } from "../../shared/report-template.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import {
  randomBytes,
  randomInt,
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import multer from "multer";
import sharp from "sharp";
import { CLOUDINARY_MEDIA_FOLDER, CLOUDINARY_REPORT_FOLDER, destroyAuthenticated, isCloudMediaUrl, mediaPublicId, moveAuthenticatedToFolder, privateDownloadUrl, uploadAuthenticated } from "./cloud-storage.js";
import ExcelJS from "exceljs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { User, Student, Report, Setting, Session, Audit } from "./models.js";
import {
  DEFAULT_CONFIG,
  calculate,
  grade,
  validateMarks,
  validateStudent,
  canAccess,
  DEFAULT_CLASSES,
  DEFAULT_SECTIONS,
  DEFAULT_HOUSES,
  DEFAULT_DESIGNATIONS,
  ALL_ACTIVITIES,
  LEGACY_COMPONENTS,
  resolveConfigForClass,
} from "../../shared/engine.js";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const uploads = path.join(root, "server/uploads");
const reportDriveRoot = path.join(root, "server/report-drive");
export const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://apis.google.com",
          "https://www.googletagmanager.com",
          "https://*.googletagmanager.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://api.cloudinary.com",
          "https://res.cloudinary.com",
          "https://*.googleusercontent.com",
          "https://*.gstatic.com",
          "https://www.gstatic.com",
        ],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        connectSrc: [
          "'self'",
          "https://*.googleapis.com",
          "https://identitytoolkit.googleapis.com",
          "https://securetoken.googleapis.com",
          "https://*.firebaseio.com",
          "https://srpsreport-23798.firebaseapp.com",
          "https://*.firebase.com",
          "https://www.google-analytics.com",
          "https://*.google-analytics.com",
        ],
        frameSrc: [
          "'self'",
          "https://srpsreport-23798.firebaseapp.com",
          "https://accounts.google.com",
        ],
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
const MODULES = [
  "overview",
  "analytics",
  "students",
  "studio",
  "review",
  "bulk",
  "settings",
  "audit",
  "drive",
];
const ACTIONS = [
  "studentCreate",
  "studentEdit",
  "studentStatus",
  "studentDelete",
  "studentWhatsapp",
  "studentEmail",
];
const ROLE_MODULES = {
  teacher: ["overview", "students", "studio", "bulk", "settings"],
  principal: [
    "overview",
    "analytics",
    "students",
    "studio",
    "review",
    "bulk",
    "settings",
    "audit",
  ],
};
const ROLE_ACTIONS = {
  teacher: ["studentEdit", "studentStatus", "studentWhatsapp", "studentEmail"],
  principal: ["studentWhatsapp", "studentEmail"],
};
const effectiveModules = (user) => user.role === "admin"
  ? [...MODULES, "import", "users"]
  : Array.isArray(user.moduleAccess) && user.moduleAccess.length > 0 ? user.moduleAccess : ROLE_MODULES[user.role] || [];
const effectiveActions = (user) => user.role === "admin"
  ? [...ACTIONS]
  : Array.isArray(user.studentActions) && user.studentActions.length > 0 ? user.studentActions : ROLE_ACTIONS[user.role] || [];
const hasModule = (user, id) => effectiveModules(user).includes(id);
const hasAction = (user, id) => effectiveActions(user).includes(id);
const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  designation: user.designation || "",
  photo: user.photo || "",
  role: user.role,
  assignments: user.assignments,
  moduleAccess: effectiveModules(user),
  studentActions: effectiveActions(user),
  signature: user.signature,
  active: user.active,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
const requestOrigin = (req) => {
  const origin = req.get("Origin");
  if (origin) return origin;
  const referer = req.get("Referer");
  if (!referer) return "";
  try {
    return new URL(referer).origin;
  } catch {
    return "";
  }
};
app.use("/api", (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  if (req.path.startsWith("/public/") || req.path.startsWith("/webhooks/")) return next();
  if (!["GET", "HEAD"].includes(req.method) && req.get("X-SRPS-Request") !== "1")
    return next(fail(403, "Invalid request origin"));
  const origin = requestOrigin(req);
  if (origin && origin !== (process.env.APP_ORIGIN || "http://localhost:5173"))
    return next(fail(403, "Origin not allowed"));
  if (process.env.NODE_ENV !== "test" && !origin && req.cookies?.srps_session && !["GET", "HEAD"].includes(req.method))
    return next(fail(403, "Request origin could not be verified"));
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
const getMasters = async () => {
  const doc = await Setting.findOne({ key: "masters" });
  const val = doc?.value || {};
  return {
    classes:
      Array.isArray(val.classes) && val.classes.length > 0
        ? val.classes
        : DEFAULT_CLASSES.map((c, i) => ({
            id: c,
            name: c,
            active: true,
            order: i + 1,
          })),
    sections:
      Array.isArray(val.sections) && val.sections.length > 0
        ? val.sections
        : DEFAULT_SECTIONS.map((s) => ({ id: s, name: s, active: true })),
    houses:
      Array.isArray(val.houses) && val.houses.length > 0
        ? val.houses
        : DEFAULT_HOUSES.map((h) => ({ id: h, name: h, active: true })),
    designations:
      Array.isArray(val.designations) && val.designations.length > 0
        ? val.designations
        : DEFAULT_DESIGNATIONS.map((d) => ({ id: d, name: d, active: true })),
  };
};
const getActiveClasses = async () => {
  const m = await getMasters();
  return m.classes
    .filter((c) => c.active !== false)
    .map((c) => String(c.name || c.id));
};
const getActiveSections = async () => {
  const m = await getMasters();
  return m.sections
    .filter((s) => s.active !== false)
    .map((s) => String(s.name || s.id));
};
function forClass(cfg, student) {
  return resolveConfigForClass(cfg, student?.className);
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
const requireModule = (id) => (req, res, next) =>
  hasModule(req.user, id) ? next() : next(fail(403, "This module is not assigned to your account"));
const requireAction = (id) => (req, res, next) =>
  hasAction(req.user, id) ? next() : next(fail(403, "This action is not assigned to your account"));
const REPORT_DRIVE_EMAIL = "srpskanhra@gmail.com";
function reportPdfPassword(student) {
  const admissionNo = String(student?.admissionNo || "SRPS").trim();
  const dob = String(student?.dob || "").trim();
  if (dob && /^\d{4}-\d{2}-\d{2}$/.test(dob)) return `${admissionNo}@${dob}`;
  return `${admissionNo}@2014-01-01`;
}
function requireDriveOtp(req, res, next) {
  if (!req.session.driveVerifiedUntil || req.session.driveVerifiedUntil <= new Date())
    return next(fail(403, "Verify the Report Drive email OTP to continue"));
  next();
}
const driveOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many OTP attempts. Try again in 15 minutes." },
});
async function archivePublishedReport(report) {
  if (!report.templateSnapshot || !report.configSnapshot || !report.studentSnapshot)
    throw fail(409, "Legacy report has no versioned archive. Reopen and publish it again to archive.");
  if (report.drivePublicId && report.drivePasswordVersion === "admission-dob-v1") {
    await moveAuthenticatedToFolder({ publicId: report.drivePublicId, resourceType: "raw", assetFolder: CLOUDINARY_REPORT_FOLDER });
    return report.drivePublicId;
  }
  const segment = (value, fallback) => {
    const cleaned = String(value || "").normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
    return cleaned || fallback;
  };
  const snap = report.studentSnapshot;
  const bytes = await renderReports([{
    student: snap,
    report: report.toObject ? report.toObject() : report,
    config: report.configSnapshot,
    user: { role: "admin" },
  }]);
  const locked = await lockReportPdf(bytes, reportPdfPassword(snap));
  const publicId = `srps/reports/${report._id}.pdf`;
  await uploadAuthenticated({ bytes: Buffer.from(locked), resourceType: "raw", publicId, format: "pdf", assetFolder: CLOUDINARY_REPORT_FOLDER });
  const legacyDrivePath = report.drivePath;
  report.drivePublicId = publicId;
  report.drivePath = undefined;
  report.driveArchivedAt = new Date();
  report.drivePasswordVersion = "admission-dob-v1";
  await report.save();
  if (legacyDrivePath) {
    const oldPath = path.resolve(reportDriveRoot, legacyDrivePath);
    if (oldPath.startsWith(reportDriveRoot + path.sep)) await fs.unlink(oldPath).catch(() => {});
  }
  return publicId;
}
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
    if (role !== undefined && role !== user.role) {
      const properRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      throw fail(
        403,
        `This account is registered as ${properRole}. Please select the "${properRole}" tab above.`,
      );
    }
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
const FIREBASE_API_KEY =
  process.env.FIREBASE_API_KEY ||
  "AIzaSyC-gKVXAzAM6VojalLqdUz6pDEji2LOJLw";
app.post(
  "/api/auth/firebase-login",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 25 }),
  wrap(async (req, res) => {
    const { idToken, role } = req.body;
    if (!idToken || typeof idToken !== "string") {
      throw fail(400, "Authentication token is required.");
    }

    let verifiedEmail = null;

    if (process.env.NODE_ENV === "test" && idToken.startsWith("mock-firebase-token:")) {
      verifiedEmail = idToken.replace("mock-firebase-token:", "").trim().toLowerCase();
    } else {
      const lookupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`;
      const lookupRes = await fetch(lookupUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await lookupRes.json();
      if (!lookupRes.ok || !data.users || !data.users[0] || !data.users[0].email) {
        throw fail(401, "Google authentication session is invalid or expired.");
      }
      verifiedEmail = String(data.users[0].email).toLowerCase();
    }

    const user = await User.findOne({
      email: verifiedEmail,
      active: true,
    });

    if (!user) {
      throw fail(
        403,
        `No staff account registered with ${verifiedEmail}. Please contact the school administrator to add this email.`,
      );
    }

    if (role !== undefined && role !== user.role) {
      throw fail(
        403,
        `This account is registered as ${user.role}. Please select the ${user.role} role or switch accounts.`,
      );
    }

    const token = randomBytes(32).toString("hex");
    await Session.create({
      tokenHash: digest(token),
      user: user._id,
      version: user.sessionVersion,
      expiresAt: new Date(Date.now() + sessionOptions.maxAge),
    });
    res.cookie("srps_session", token, sessionOptions);
    await audit({ ...req, user }, "login", user._id, "firebase");
    res.json({
      ok: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
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
function reportLinkToken(studentId, session, revision) {
  const secret = process.env.WA_LINK_SECRET;
  if (!secret) throw fail(503, "WhatsApp report link is not configured");
  const payload = Buffer.from(
    JSON.stringify({
      studentId,
      session,
      revision,
      exp: Date.now() + 7 * 86400000,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}
export function verifySignature(studentId, session) {
  const secret = process.env.WA_LINK_SECRET || "srps_verification_secret_fallback";
  return createHmac("sha256", secret)
    .update(`${studentId}:${session}`)
    .digest("hex")
    .slice(0, 16);
}
app.get(
  "/api/public/verify/:studentId/:session/:signature",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 120 }),
  wrap(async (req, res) => {
    const { studentId, session, signature } = req.params;
    if (!/^[a-f0-9]{24}$/i.test(studentId) || !/^\d{4}-\d{2}$/.test(session))
      throw fail(400, "Invalid verification parameters");
    const expectedSig = verifySignature(studentId, session);
    if (signature !== expectedSig)
      throw fail(403, "Verification signature is invalid or tampered");

    const student = await Student.findById(studentId).lean();
    if (!student) throw fail(404, "Student record not found");

    const report = await Report.findOne({
      student: studentId,
      session,
      status: "published",
    }).lean();
    if (!report) throw fail(404, "Official published report not found");

    const cfg = report.configSnapshot || forClass(await config(), student);
    const summary = calculate(report.marks, cfg);
    const overallGrade =
      summary.percentage !== null ? grade(summary.percentage) : "—";

    res.json({
      ok: true,
      verified: true,
      school: {
        name: "Shree Ram Public School",
        location: "Kanhra",
        subtitle: "Official Student Assessment & Report Certification",
      },
      student: {
        id: String(student._id),
        name: student.name,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo || "—",
        className: student.className,
        section: student.section,
        house: student.house || "—",
        dob: student.dob,
        fatherName: student.fatherName || "—",
        motherName: student.motherName || "—",
        photo: student.photo || null,
      },
      session: report.session,
      publishedAt: report.publishedAt || report.updatedAt,
      summary: {
        total: summary.total,
        maximum: summary.maximum,
        percentage: summary.percentage,
        grade: overallGrade,
        result: summary.result,
      },
      terms: summary.terms,
    });
  }),
);
app.get(
  ["/r/:studentId/:signature", "/d/:studentId/:signature"],
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 120 }),
  wrap(async (req, res) => {
    const { studentId, signature } = req.params;
    if (
      !/^[a-f0-9]{24}$/i.test(studentId) ||
      !/^[a-f0-9]{16}$/i.test(signature)
    ) {
      throw fail(404, "Invalid report link");
    }

    const report = await Report.findOne({
      student: studentId,
      status: "published",
    })
      .select("+drivePath +drivePublicId +drivePasswordVersion")
      .sort({ updatedAt: -1 });

    if (!report) throw fail(404, "Report not found or not yet published");

    const expectedSig = verifySignature(studentId, report.session);
    if (signature.toLowerCase() !== expectedSig.toLowerCase()) {
      throw fail(404, "Invalid or expired report link");
    }

    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      report.drivePublicId
    ) {
      const cloudUrl = privateDownloadUrl({
        publicId: report.drivePublicId,
        resourceType: "raw",
        format: "pdf",
        ttlSeconds: 3600,
      });
      return res.redirect(302, cloudUrl);
    }

    const student = await Student.findById(studentId);
    const bytes = await renderReports([
      {
        student: report.studentSnapshot || student.toObject(),
        report,
        config: report.configSnapshot,
        user: { role: "parent" },
      },
    ]);
    const locked = await lockReportPdf(
      bytes,
      reportPdfPassword(report.studentSnapshot || student),
    );
    res
      .type("application/pdf")
      .set(
        "Content-Disposition",
        `attachment; filename="${(report.studentSnapshot?.name || "Report").replace(/[^a-zA-Z0-9_-]/g, "_")}-Report.pdf"`,
      )
      .send(Buffer.from(locked));
  }),
);
app.get(
  "/api/public/report-download/:token",
  wrap(async (req, res) => {
    if (!process.env.WA_LINK_SECRET)
      throw fail(404, "Report link is invalid or expired");
    const [payload, signature, extra] = String(req.params.token).split(".");
    if (!payload || !signature || extra)
      throw fail(404, "Report link is invalid or expired");
    const expected = createHmac(
      "sha256",
      process.env.WA_LINK_SECRET,
    )
      .update(payload)
      .digest();
    let supplied;
    try {
      supplied = Buffer.from(signature, "base64url");
    } catch {}
    if (
      !supplied ||
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    )
      throw fail(404, "Report link is invalid or expired");
    let data;
    try {
      data = JSON.parse(Buffer.from(payload, "base64url").toString());
    } catch {}
    if (
      !data ||
      !/^[a-f0-9]{24}$/i.test(data.studentId) ||
      !/^\d{4}-\d{2}$/.test(data.session) ||
      data.exp < Date.now()
    )
      throw fail(404, "Report link is invalid or expired");
    const student = await Student.findById(data.studentId);
    const report = await Report.findOne({
      student: data.studentId,
      session: data.session,
      status: "published",
    }).lean();
    if (
      !student ||
      !report ||
      !report.templateSnapshot ||
      report.revision !== data.revision
    )
      throw fail(404, "Published report is unavailable");
    try {
      const bytes = await renderReports([
        {
          student: report.studentSnapshot || student.toObject(),
          report,
          config: report.configSnapshot,
          user: { role: "parent" },
        },
      ]);
      const locked = await lockReportPdf(
        bytes,
        reportPdfPassword(report.studentSnapshot || student),
      );
      res
        .type("application/pdf")
        .set(
          "Content-Disposition",
          'attachment; filename="SRPS-Report-Locked.pdf"',
        )
        .set("Cache-Control", "no-store")
        .send(Buffer.from(locked));
    } catch (e) {
      throw fail(422, e.message);
    }
  }),
);
app.all(
  "/api/webhooks/apitxt",
  wrap(async (req, res) => {
    if (req.method === "GET") {
      const challenge = req.query["hub.challenge"] || req.query.challenge || "OK";
      return res.send(challenge);
    }
    const body = req.body || {};
    const changeVal = body.entry?.[0]?.changes?.[0]?.value;

    // 1. Process delivery / read status update
    const rawStatus = String(
      body.status ||
        body.event ||
        changeVal?.statuses?.[0]?.status ||
        changeVal?.status ||
        "",
    ).toLowerCase();

    const messageId = String(
      body.message_id ||
        body.wamid ||
        body.id ||
        changeVal?.statuses?.[0]?.id ||
        changeVal?.id ||
        changeVal?.message_id ||
        "",
    );
    const requestId = String(body.request_id || body.requestId || changeVal?.request_id || "");
    let rawMobile = String(
      body.mobile ||
        body.to ||
        body.recipient ||
        changeVal?.statuses?.[0]?.recipient_id ||
        changeVal?.recipient_id ||
        changeVal?.recipient ||
        "",
    ).replace(/\D/g, "");
    if (rawMobile.length === 10) rawMobile = `91${rawMobile}`;

    if (rawStatus && (messageId || requestId || rawMobile)) {
      let report = null;
      if (messageId) {
        report = await Report.findOne({ whatsappMessageId: messageId });
      }
      if (!report && requestId) {
        report = await Report.findOne({ whatsappRequestId: requestId });
      }
      if (!report && rawMobile) {
        report = await Report.findOne({
          whatsappRecipient: rawMobile,
          status: "published",
        }).sort({ whatsappSentAt: -1 });
        if (!report) {
          const raw10 = rawMobile.slice(-10);
          const st = await Student.findOne({ mobile: { $regex: raw10 } });
          if (st) {
            report = await Report.findOne({
              student: st._id,
              status: "published",
            }).sort({ updatedAt: -1 });
          }
        }
      }

      if (report) {
        if (rawStatus.includes("read") || rawStatus.includes("seen")) {
          report.whatsappDeliveryStatus = "read";
          report.whatsappReadAt = new Date();
        } else if (rawStatus.includes("deliver")) {
          if (report.whatsappDeliveryStatus !== "read") {
            report.whatsappDeliveryStatus = "delivered";
          }
          report.whatsappDeliveredAt = new Date();
        } else if (rawStatus.includes("fail") || rawStatus.includes("reject")) {
          report.whatsappDeliveryStatus = "failed";
          report.whatsappFailedAt = new Date();
          report.whatsappFailureReason = String(
            body.error ||
              body.remarks ||
              body.reason ||
              changeVal?.statuses?.[0]?.errors?.[0]?.message ||
              changeVal?.error ||
              "Delivery failed",
          ).slice(0, 200);
        } else if (rawStatus.includes("sent")) {
          if (!report.whatsappDeliveryStatus) {
            report.whatsappDeliveryStatus = "sent";
          }
        }
        await report.save();
      }
    }

    // 2. Process incoming parent message (Auto-Help Bot for Password Assistance)
    const incomingText = String(
      changeVal?.text?.body ||
        (typeof changeVal?.text === "string" ? changeVal.text : "") ||
        changeVal?.messages?.[0]?.text?.body ||
        (typeof changeVal?.messages?.[0]?.text === "string" ? changeVal.messages[0].text : "") ||
        body.text?.body ||
        (typeof body.text === "string" ? body.text : "") ||
        body.message ||
        body.body ||
        "",
    ).trim();

    let sender = String(
      changeVal?.from ||
        changeVal?.messages?.[0]?.from ||
        body.from ||
        body.mobile ||
        body.wa_id ||
        body.sender ||
        "",
    ).replace(/\D/g, "");

    if (incomingText && sender) {
      if (sender.length === 10) sender = `91${sender}`;
      const raw10 = sender.slice(-10);

      // Condition 1: Sirf tab reply kare jab parent ne 'help' ya 'password' pucha ho
      const textLower = incomingText.toLowerCase();
      const isHelpOrPasswordQuery =
        /\b(help|password|pass|passward|pasword|pwd|unlock|format|code|पासवर्ड|हेल्प)\b/i.test(
          textLower,
        );

      if (!isHelpOrPasswordQuery) {
        // 'thanks', 'ok', 'by', 'done' ya anya baaton par reply nahi bhejna
        return res.json({ ok: true });
      }

      // Condition 2: Sirf tab reply kare jab is student ko pehle report card bheja ja chuka ho
      const matched = await Student.find({
        active: true,
        mobile: { $regex: raw10 },
      }).lean();

      if (!matched || matched.length === 0) {
        return res.json({ ok: true });
      }

      const studentIds = matched.map((s) => s._id);
      const sentReports = await Report.find({
        student: { $in: studentIds },
        status: "published",
        whatsappSentAt: { $exists: true, $ne: null },
      }).lean();

      if (!sentReports || sentReports.length === 0) {
        // Agar is student ko abhi tak report card send/deliver hi nahi hua, to reply nahi bhejna
        return res.json({ ok: true });
      }

      // Filter matched students to only those whose reports were sent
      const activeRecipientStudents = matched.filter((s) =>
        sentReports.some((r) => String(r.student) === String(s._id)),
      );

      let replyText = "";
      if (activeRecipientStudents.length === 1) {
        const s = activeRecipientStudents[0];
        replyText = `Namaste Parent/Guardian 🙏\n\nTo view or open the Report Card PDF for *${s.name}* (Class ${s.className}-${s.section}):\n\n🔐 *Your PDF Password is:*\n👉 *${s.admissionNo}@${s.dob}*\n\n📌 *Format:* AdmissionNumber@DOB (e.g., ${s.admissionNo}@${s.dob})\n\nShree Ram Public School, Kanhra`;
      } else if (activeRecipientStudents.length > 1) {
        replyText =
          `Namaste Parent/Guardian 🙏\n\nYour registered student records at Shree Ram Public School:\n\n` +
          activeRecipientStudents
            .map(
              (s) =>
                `• *${s.name}* (Class ${s.className}-${s.section})\n  🔐 Password: *${s.admissionNo}@${s.dob}*`,
            )
            .join("\n\n") +
          `\n\n📌 *Format:* AdmissionNumber@DOB\n\nShree Ram Public School, Kanhra`;
      } else {
        return res.json({ ok: true });
      }

      if (process.env.APITXT_AUTHKEY && process.env.APITXT_PROJECT_REF_ID) {
        try {
          await fetch("https://apitxt.com/api/sendWAMessage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              authkey: process.env.APITXT_AUTHKEY,
              project_ref_id: process.env.APITXT_PROJECT_REF_ID,
              to: sender,
              type: "text",
              text: replyText,
            }),
            signal: AbortSignal.timeout(10000),
          });
        } catch (e) {
          console.error("Auto-reply bot error:", e.message);
        }
      }
    }

    res.json({ ok: true });
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
    res.set("Cache-Control", "no-store");
    next();
  }),
);
app.post("/api/report-drive/request-otp", driveOtpLimiter, wrap(async (req, res) => {
  if (req.user.role !== "admin" || !hasModule(req.user, "drive")) throw fail(403, "Admin only");
  if (!["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "MAIL_FROM"].every((k) => process.env[k]))
    throw fail(503, "Report Drive OTP email is not configured. Configure SMTP_HOST, SMTP_USER, SMTP_PASS, and MAIL_FROM.");
  const now = new Date();
  if (req.session.driveOtpSentAt && req.session.driveOtpSentAt > new Date(Date.now() - 60000))
    throw fail(429, "Wait one minute before requesting another OTP");
  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  req.session.driveOtpHash = await bcrypt.hash(code, 12);
  req.session.driveOtpExpiresAt = new Date(Date.now() + 5 * 60000);
  req.session.driveOtpAttempts = 0;
  req.session.driveOtpSentAt = now;
  req.session.driveVerifiedUntil = undefined;
  await req.session.save();
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: REPORT_DRIVE_EMAIL,
      subject: "Your SRPS Report Drive verification code",
      text: `Your Report Drive OTP is ${code}. It expires in 5 minutes. Do not share this code. If you did not request it, ignore this email.`,
    });
  } catch (error) {
    // Keep SMTP diagnostics useful without logging credentials or the OTP.
    console.error("Report Drive OTP delivery failed", {
      code: error?.code || "unknown",
      command: error?.command || "unknown",
      responseCode: error?.responseCode || null,
    });
    req.session.driveOtpHash = undefined;
    req.session.driveOtpExpiresAt = undefined;
    await req.session.save();
    throw fail(503, "Could not send the Report Drive OTP. Check the SMTP settings.");
  }
  await audit(req, "report-drive-otp-request", String(req.user._id));
  res.json({ sent: true, destination: REPORT_DRIVE_EMAIL, expiresInSeconds: 300 });
}));
app.post("/api/report-drive/verify-otp", driveOtpLimiter, wrap(async (req, res) => {
  if (req.user.role !== "admin" || !hasModule(req.user, "drive")) throw fail(403, "Admin only");
  const code = typeof req.body.code === "string" ? req.body.code.trim() : "";
  if (!/^\d{6}$/.test(code) || !req.session.driveOtpHash || !req.session.driveOtpExpiresAt || req.session.driveOtpExpiresAt <= new Date())
    throw fail(400, "OTP is invalid or expired. Request a new code.");
  if ((req.session.driveOtpAttempts || 0) >= 5) throw fail(429, "OTP attempts exceeded. Request a new code.");
  if (!(await bcrypt.compare(code, req.session.driveOtpHash))) {
    req.session.driveOtpAttempts = (req.session.driveOtpAttempts || 0) + 1;
    await req.session.save();
    throw fail(400, "Incorrect OTP");
  }
  req.session.driveOtpHash = undefined;
  req.session.driveOtpExpiresAt = undefined;
  req.session.driveOtpAttempts = 0;
  req.session.driveVerifiedUntil = new Date(Date.now() + 10 * 60000);
  await req.session.save();
  await audit(req, "report-drive-otp-verified", String(req.user._id));
  res.json({ verified: true, expiresInSeconds: 600 });
}));
app.post("/api/report-drive/lock", wrap(async (req, res) => {
  if (req.user.role !== "admin" || !hasModule(req.user, "drive")) throw fail(403, "Admin only");
  req.session.driveVerifiedUntil = undefined;
  req.session.driveOtpHash = undefined;
  await req.session.save();
  res.json({ locked: true });
}));
app.get("/api/report-drive/reports", roles("admin"), requireModule("drive"), requireDriveOtp, wrap(async (req, res) => {
  const reports = await Report.find({ status: "published" })
    .select("student session publishedAt templateSnapshot configSnapshot studentSnapshot")
    .populate("student", "name admissionNo className section")
    .sort({ session: -1, publishedAt: -1 }).lean();
  res.json(reports.map((r) => {
    const student = r.studentSnapshot || r.student;
    return {
      id: String(r._id), session: r.session,
      className: student?.className || "Unknown", section: student?.section || "Unassigned",
      studentName: student?.name || "Unknown student", admissionNo: student?.admissionNo || "",
      publishedAt: r.publishedAt, archiveReady: Boolean(r.templateSnapshot && r.configSnapshot && r.studentSnapshot),
    };
  }));
}));
app.post("/api/report-drive/archive-batch", roles("admin"), requireModule("drive"), requireDriveOtp, wrap(async (req, res) => {
  const after = req.body.after;
  if (after !== undefined && !/^[a-f0-9]{24}$/i.test(String(after)))
    throw fail(400, "Invalid archive cursor");
  const filter = { status: "published", ...(after ? { _id: { $gt: after } } : {}) };
  const batch = await Report.find(filter)
    .select("student session publishedAt templateSnapshot configSnapshot studentSnapshot +drivePath +drivePublicId +drivePasswordVersion")
    .sort({ _id: 1 }).limit(20);
  let archived = 0;
  let legacy = 0;
  let failed = 0;
  for (const report of batch) {
    if (!report.templateSnapshot || !report.configSnapshot || !report.studentSnapshot) {
      legacy++;
      continue;
    }
    try {
      await archivePublishedReport(report);
      archived++;
    } catch (error) {
      failed++;
      console.error("Report Drive backfill failed", String(report._id), error?.message || "archive error");
    }
  }
  res.json({
    archived,
    legacy,
    failed,
    nextCursor: batch.length === 20 ? String(batch[batch.length - 1]._id) : null,
    done: batch.length < 20,
  });
}));
app.get("/api/report-drive/reports/:id/download", roles("admin"), requireModule("drive"), requireDriveOtp, wrap(async (req, res) => {
  if (!/^[a-f0-9]{24}$/i.test(req.params.id)) throw fail(404, "Report not found");
  const report = await Report.findOne({ _id: req.params.id, status: "published" }).select("+drivePath +drivePublicId +drivePasswordVersion");
  if (!report) throw fail(404, "Published report not found");
  const publicId = await archivePublishedReport(report);
  const downloadUrl = privateDownloadUrl({ publicId, resourceType: "raw", format: "pdf", attachment: true, ttlSeconds: 60 });
  const cloudResponse = await fetch(downloadUrl, { signal: AbortSignal.timeout(30000) });
  if (!cloudResponse.ok || !cloudResponse.body) throw fail(502, "Cloudinary could not return the archived report");
  const filename = `${report.session}-Class-${report.studentSnapshot.className}-${report.studentSnapshot.name}.pdf`.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_");
  res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" });
  await pipeline(Readable.fromWeb(cloudResponse.body), res);
}));
app.get("/api/auth/me", (req, res) =>
  res.json(safeUser(req.user)),
);
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
  "/api/masters",
  wrap(async (req, res) => res.json(await getMasters())),
);
app.put(
  "/api/masters",
  roles("admin"),
  wrap(async (req, res) => {
    const { classes, sections, houses, designations } = req.body;
    if (
      !Array.isArray(classes) ||
      !Array.isArray(sections) ||
      !Array.isArray(houses) ||
      !Array.isArray(designations)
    ) {
      throw fail(
        400,
        "Invalid masters format: classes, sections, houses, and designations must be arrays",
      );
    }
    const cleanClasses = classes
      .filter((c) => c && (c.id || c.name))
      .map((c, i) => ({
        id: String(c.id || c.name).trim(),
        name: String(c.name || c.id).trim(),
        active: c.active !== false,
        order: typeof c.order === "number" ? c.order : i + 1,
      }));
    const cleanSections = sections
      .filter((s) => s && (s.id || s.name))
      .map((s) => ({
        id: String(s.id || s.name).trim(),
        name: String(s.name || s.id).trim(),
        active: s.active !== false,
      }));
    const cleanHouses = houses
      .filter((h) => h && (h.id || h.name))
      .map((h) => ({
        id: String(h.id || h.name).trim(),
        name: String(h.name || h.id).trim(),
        active: h.active !== false,
        color: h.color || "#0284c7",
      }));
    const cleanDesignations = designations
      .filter((d) => d && (d.id || d.name))
      .map((d) => ({
        id: String(d.id || d.name).trim(),
        name: String(d.name || d.id).trim(),
        active: d.active !== false,
      }));

    if (!cleanClasses.length) throw fail(400, "At least one class is required");
    if (!cleanSections.length)
      throw fail(400, "At least one section is required");

    const value = {
      classes: cleanClasses,
      sections: cleanSections,
      houses: cleanHouses,
      designations: cleanDesignations,
    };
    await Setting.findOneAndUpdate(
      { key: "masters" },
      { value },
      { upsert: true },
    );
    await audit(req, "update-masters", "masters");
    res.json(value);
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
      "handwritingFont",
    ])
      if (typeof req.body[k] === "string") value[k] = req.body[k].slice(0, 250);
    if (req.body.profiles !== undefined) {
      const profiles = req.body.profiles;
      if (!profiles || typeof profiles !== "object" || Array.isArray(profiles))
        throw fail(400, "Invalid class profiles");
      const activeClasses = await getActiveClasses();
      const normalizedProfiles = {};
      for (const [cls, subjects] of Object.entries(profiles)) {
        if (!activeClasses.includes(cls)) continue;
        if (
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
        normalizedProfiles[cls] = subjects;
      }
      value.profiles = normalizedProfiles;
    }
    if (req.body.activities !== undefined) {
      const acts = req.body.activities;
      if (
        !Array.isArray(acts) ||
        acts.length < 1 ||
        acts.length > 8 ||
        acts.some(
          (x) => typeof x !== "string" || !x.trim() || x.trim().length > 60,
        ) ||
        new Set(acts.map((x) => x.trim().toUpperCase())).size !== acts.length
      )
        throw fail(400, "Enter 1–8 uniquely named co-scholastic indicators");
      value.activities = acts.map((x) => x.trim().toUpperCase());
    }
    const normalizeTermComponents = (tc) => {
      const expected = {
        term1: ["fa1", "fa2", "sa1"],
        term2: ["fa3", "fa4", "sa2"],
      };
      if (!tc || typeof tc !== "object" || Array.isArray(tc)) {
        throw fail(400, "Invalid termComponents");
      }
      const normalized = {};
      for (const [termKey, ids] of Object.entries(expected)) {
        const list = tc[termKey];
        if (!Array.isArray(list) || list.length !== ids.length) {
          throw fail(400, `Invalid ${termKey} components`);
        }
        normalized[termKey] = ids.map((id) => {
          const item = list.find((c) => c && c.id === id);
          if (!item) throw fail(400, `Missing component ${id}`);
          const label = typeof item.label === "string" ? item.label.trim() : "";
          const max = Number(item.max);
          if (!label || label.length > 20) {
            throw fail(400, `Label for ${id} must be 1–20 characters`);
          }
          if (!Number.isFinite(max) || max < 1 || max > 500) {
            throw fail(400, `Max marks for ${label} must be 1–500`);
          }
          return { id, label, max: Math.round(max * 100) / 100 };
        });
      }
      return normalized;
    };
    if (req.body.termComponents !== undefined) {
      const normalized = normalizeTermComponents(req.body.termComponents);
      value.termComponents = normalized;
      value.components = [
        ...normalized.term1,
        ...normalized.term2,
        ...LEGACY_COMPONENTS,
      ];
    }
    if (req.body.termComponentRules !== undefined) {
      const rules = req.body.termComponentRules;
      if (!Array.isArray(rules) || rules.length > 20) {
        throw fail(400, "Invalid termComponentRules");
      }
      value.termComponentRules = rules.map((r, idx) => {
        if (!r || typeof r !== "object" || !Array.isArray(r.classes) || !r.classes.length) {
          throw fail(400, "Each class range rule must include at least one class");
        }
        return {
          id: typeof r.id === "string" && r.id.trim() ? r.id.trim().slice(0, 40) : `rule_${idx + 1}`,
          label: typeof r.label === "string" ? r.label.trim().slice(0, 80) : "",
          fromClass: typeof r.fromClass === "string" ? r.fromClass.trim().slice(0, 40) : "",
          toClass: typeof r.toClass === "string" ? r.toClass.trim().slice(0, 40) : "",
          classes: [...new Set(r.classes.map((c) => String(c).trim()).filter(Boolean))],
          termComponents: normalizeTermComponents(r.termComponents),
        };
      });
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
  requireModule("students"),
  wrap(async (req, res) => {
    const includeDisabled = req.query.status === "disabled";
    if (req.query.status && !["active", "disabled"].includes(req.query.status))
      throw fail(400, "Invalid student status filter");
    if (includeDisabled && !["admin", "teacher", "principal"].includes(req.user.role))
      throw fail(403, "Only administrators and teachers can view disabled students");
    const q = { active: !includeDisabled, ...scope(req.user) };
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
  "rollNo",
  "name",
  "className",
  "section",
  "house",
  "gender",
  "bloodGroup",
  "aadhaarNo",
  "penNo",
  "category",
  "motherName",
  "fatherName",
  "dob",
  "address",
  "mobile",
  "email",
  "emergencyContact",
  "admissionDate",
  "previousSchool",
  "photo",
];
const pickStudent = (b) =>
  Object.fromEntries(
    studentFields
      .filter((k) => b[k] !== undefined)
      .map((k) => [
        k,
        (k === "email" ? String(b[k]).toLowerCase() : String(b[k]))
          .trim()
          .slice(0, k === "address" ? 500 : 250),
      ]),
  );
const validateGuardianEmail = (email) =>
  !email || /^[^\s@]{1,100}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
app.post(
  "/api/students",
  requireModule("students"),
  requireAction("studentCreate"),
  wrap(async (req, res) => {
    const [activeCls, activeSec] = await Promise.all([
      getActiveClasses(),
      getActiveSections(),
    ]);
    const data = pickStudent(req.body),
      errors = validateStudent(data, activeCls, activeSec);
    if (!validateGuardianEmail(data.email)) errors.push("Enter a valid parent/guardian email address");
    if (errors.length) throw fail(400, errors.join("; "));
    if (!canAccess(req.user, data)) throw fail(403, "Student is outside your assigned class/section");
    const s = await Student.create(data);
    await audit(req, "create-student", s._id);
    res.status(201).json(s);
  }),
);
app.put(
  "/api/students/:id",
  roles("admin", "principal", "teacher"),
  requireModule("students"),
  requireAction("studentEdit"),
  wrap(async (req, res) => {
    const s = await Student.findById(req.params.id);
    if (!s) throw fail(404, "Student not found");
    if (!canAccess(req.user, s))
      throw fail(403, "This class/section is not assigned to you");
    const data = { ...s.toObject(), ...pickStudent(req.body) };
    const [activeCls, activeSec] = await Promise.all([
      getActiveClasses(),
      getActiveSections(),
    ]);
    const errors = validateStudent(data, activeCls, activeSec);
    if (!validateGuardianEmail(data.email)) errors.push("Enter a valid parent/guardian email address");
    if (errors.length) throw fail(400, errors.join("; "));
    if (!canAccess(req.user, data))
      throw fail(403, "You cannot move a student outside your assigned class/section");
    Object.assign(s, pickStudent(req.body));
    await s.save();
    await audit(req, "update-student", s._id);
    res.json(s);
  }),
);
app.delete(
  "/api/students/:id",
  roles("admin", "principal", "teacher"),
  requireModule("students"),
  requireAction("studentDelete"),
  wrap(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) throw fail(404, "Student not found");
    if (!canAccess(req.user, student))
      throw fail(403, "This class/section is not assigned to you");
    const photo = student.photo;
    const archivedReports = await Report.find({ student: student._id }).select("+drivePublicId").lean();
    const reports = await Report.deleteMany({ student: student._id });
    const deleted = await Student.deleteOne({ _id: student._id });
    if (deleted.deletedCount !== 1)
      throw fail(409, "Student changed during deletion. Refresh and try again.");
    await audit(
      req,
      "permanently-delete-student",
      student._id,
      JSON.stringify({ deletedReports: reports.deletedCount }),
    );
    if (isCloudMediaUrl(photo)) {
      destroyAuthenticated({ publicId: mediaPublicId(photo), resourceType: "image" }).catch((error) => console.error("Cloudinary photo cleanup failed", error?.message || "delete error"));
    } else if (typeof photo === "string" && /^\/api\/files\/[a-f0-9]{36}\.png$/.test(photo)) {
      await fs.unlink(path.join(uploads, path.basename(photo))).catch(() => {});
    }
    for (const report of archivedReports) {
      if (report.drivePublicId) destroyAuthenticated({ publicId: report.drivePublicId, resourceType: "raw" }).catch((error) => console.error("Cloudinary report cleanup failed", error?.message || "delete error"));
    }
    res.json({ ok: true, deletedReports: reports.deletedCount });
  }),
);
app.patch(
  "/api/students/:id/status",
  roles("admin", "principal", "teacher"),
  requireModule("students"),
  requireAction("studentStatus"),
  wrap(async (req, res) => {
    if (typeof req.body.active !== "boolean")
      throw fail(400, "Student active status must be true or false");
    const existing = await Student.findById(req.params.id);
    if (!existing) throw fail(404, "Student not found");
    if (!canAccess(req.user, existing))
      throw fail(403, "This class/section is not assigned to you");
    const s = await Student.findOneAndUpdate(
      { _id: existing._id, className: existing.className, section: existing.section },
      { $set: { active: req.body.active } },
      { new: true, runValidators: true },
    );
    if (!s) throw fail(404, "Student not found");
    await audit(req, req.body.active ? "enable-student" : "disable-student", s._id);
    res.json({ _id: s._id, active: s.active });
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
      !["photo", "signature", "logo", "principal", "staff-photo"].includes(kind) ||
      !req.file
    )
      throw fail(400, "Choose an image file");
    if (["logo", "principal", "staff-photo"].includes(kind) && req.user.role !== "admin")
      throw fail(403, "Admin only");
    if (kind === "photo") {
      if (!hasModule(req.user, "students")) throw fail(403, "Students module is not assigned to your account");
      const studentId = String(req.body?.studentId || "");
      if (studentId) {
        if (!/^[a-f0-9]{24}$/i.test(studentId)) throw fail(400, "Invalid student");
        if (!hasAction(req.user, "studentEdit")) throw fail(403, "Student edit is not assigned to your account");
        const student = await Student.findById(studentId);
        if (!student) throw fail(404, "Student not found");
        if (!canAccess(req.user, student)) throw fail(403, "This class/section is not assigned to you");
      } else if (req.user.role !== "admin" && !hasAction(req.user, "studentCreate")) {
        throw fail(403, "Student photo upload is not assigned to your account");
      }
    }
    const meta = await sharp(req.file.buffer, {
      limitInputPixels: 16000000,
    }).metadata();
    if (!["png", "jpeg", "webp"].includes(meta.format))
      throw fail(400, "PNG, JPG or WebP images only");
    const mediaId = randomBytes(18).toString("hex");
    const url = `/api/files/c_${mediaId}.png`;
    const normalizedImage = await sharp(req.file.buffer)
      .rotate()
      .resize({
        width: ["photo", "staff-photo"].includes(kind) ? 700 : 1200,
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();
    await uploadAuthenticated({ bytes: normalizedImage, resourceType: "image", publicId: `srps/media/${mediaId}`, format: "png", assetFolder: CLOUDINARY_MEDIA_FOLDER });
    if (kind === "signature") {
      await User.findByIdAndUpdate(req.user._id, {
        signature: url,
      });
    }
    await audit(req, "upload-" + kind, mediaId);
    res.json({ url });
  }),
);
app.post("/api/storage/migrate-legacy", roles("admin"), wrap(async (req, res) => {
  const oldUrlPattern = /^\/api\/files\/[a-f0-9]{36}\.png$/;
  const mediaUrlPattern = /^\/api\/files\/(?:c_)?[a-f0-9]{36}\.png$/;
  const [students, users, reports, setting] = await Promise.all([
    Student.find({ photo: { $regex: "^/api/files/" } }).select("photo").limit(5000).lean(),
    User.find({ signature: { $regex: "^/api/files/" } }).select("signature").limit(1000).lean(),
    Report.find({ $or: [
      { teacherSignature: { $regex: "^/api/files/" } },
      { "studentSnapshot.photo": { $regex: "^/api/files/" } },
      { "configSnapshot.logo": { $regex: "^/api/files/" } },
      { "configSnapshot.principalSignature": { $regex: "^/api/files/" } },
    ] }).select("teacherSignature studentSnapshot configSnapshot").limit(5000).lean(),
    Setting.findOne({ key: "config" }).lean(),
  ]);
  const configValue = setting?.value || {};
  const mediaUrls = [...new Set([
    ...students.map((s) => s.photo),
    ...users.map((u) => u.signature),
    ...reports.flatMap((r) => [r.teacherSignature, r.studentSnapshot?.photo, r.configSnapshot?.logo, r.configSnapshot?.principalSignature]),
    configValue.logo,
    configValue.principalSignature,
  ].filter((url) => mediaUrlPattern.test(url || "")))];
  const after = req.body.after;
  if (after !== undefined && !/^(?:c_)?[a-f0-9]{36}\.png$/.test(String(after))) throw fail(400, "Invalid migration cursor");
  const remaining = mediaUrls.filter((url) => !after || path.basename(url) > after).sort((a, b) => path.basename(a).localeCompare(path.basename(b))).slice(0, 100);
  let migrated = 0;
  let failed = 0;
  for (const url of remaining) {
    try {
      const mediaId = path.basename(url).replace(/^c_/, "").replace(/\.png$/, "");
      if (isCloudMediaUrl(url)) {
        await moveAuthenticatedToFolder({ publicId: mediaPublicId(url), resourceType: "image", assetFolder: CLOUDINARY_MEDIA_FOLDER });
      } else {
        if (!oldUrlPattern.test(url)) throw new Error("Invalid legacy media locator");
        const filename = path.join(uploads, path.basename(url));
        const bytes = await fs.readFile(filename);
        await uploadAuthenticated({ bytes, resourceType: "image", publicId: `srps/media/${mediaId}`, format: "png", assetFolder: CLOUDINARY_MEDIA_FOLDER });
        const newUrl = `/api/files/c_${mediaId}.png`;
        await Promise.all([
          Student.updateMany({ photo: url }, { $set: { photo: newUrl } }),
          User.updateMany({ signature: url }, { $set: { signature: newUrl } }),
          Report.updateMany({ teacherSignature: url }, { $set: { teacherSignature: newUrl } }),
          Report.updateMany({ "studentSnapshot.photo": url }, { $set: { "studentSnapshot.photo": newUrl } }),
          Report.updateMany({ "configSnapshot.logo": url }, { $set: { "configSnapshot.logo": newUrl } }),
          Report.updateMany({ "configSnapshot.principalSignature": url }, { $set: { "configSnapshot.principalSignature": newUrl } }),
        ]);
        if (configValue.logo === url || configValue.principalSignature === url) {
          const nextConfig = { ...configValue };
          if (nextConfig.logo === url) nextConfig.logo = newUrl;
          if (nextConfig.principalSignature === url) nextConfig.principalSignature = newUrl;
          await Setting.updateOne({ key: "config" }, { $set: { value: nextConfig } });
          Object.assign(configValue, nextConfig);
        }
        await fs.unlink(filename).catch(() => {});
      }
      migrated++;
    } catch (error) {
      failed++;
      console.error("Cloudinary media migration failed", path.basename(url), error?.message || "migration error");
    }
  }
  const nextCursor = remaining.length === 100 ? path.basename(remaining.at(-1)) : null;
  // Only retire the legacy local volume once every database locator is on Cloudinary.
  // Unreferenced old files can then be safely removed as well.
  let uploadsRetired = false;
  if (!nextCursor && failed === 0) {
    const legacyReferences = await Promise.all([
      Student.exists({ photo: { $regex: "^/api/files/[a-f0-9]{36}\\.png$" } }),
      User.exists({ signature: { $regex: "^/api/files/[a-f0-9]{36}\\.png$" } }),
      Report.exists({ $or: [
        { teacherSignature: { $regex: "^/api/files/[a-f0-9]{36}\\.png$" } },
        { "studentSnapshot.photo": { $regex: "^/api/files/[a-f0-9]{36}\\.png$" } },
        { "configSnapshot.logo": { $regex: "^/api/files/[a-f0-9]{36}\\.png$" } },
        { "configSnapshot.principalSignature": { $regex: "^/api/files/[a-f0-9]{36}\\.png$" } },
      ] }),
      Setting.exists({ key: "config", $or: [
        { "value.logo": { $regex: "^/api/files/[a-f0-9]{36}\\.png$" } },
        { "value.principalSignature": { $regex: "^/api/files/[a-f0-9]{36}\\.png$" } },
      ] }),
    ]);
    if (legacyReferences.every((reference) => !reference)) {
      await fs.rm(uploads, { recursive: true, force: true });
      uploadsRetired = true;
    }
  }
  await audit(req, "organize-cloudinary-media", "ReportCard", JSON.stringify({ migrated, failed }));
  res.json({ migrated, failed, nextCursor, done: !nextCursor, uploadsRetired });
}));
app.get(
  "/api/files/:name",
  wrap(async (req, res) => {
    if (/^c_[a-f0-9]{36}\.png$/.test(req.params.name)) {
      const url = `/api/files/${req.params.name}`;
      const student = await Student.findOne({ photo: url });
      if (student && !canAccess(req.user, student)) throw fail(403, "Not your class");
      const downloadUrl = privateDownloadUrl({ publicId: mediaPublicId(url), resourceType: "image", format: "png", ttlSeconds: 120 });
      return res.set({ "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" }).redirect(302, downloadUrl);
    }
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
  requireModule("studio"),
  wrap(async (req, res) => {
    const student = await accessible(req, req.params.studentId);
    const session = validSession(req.params.session);
    const report = await Report.findOne({
      student: student._id,
      session,
    }).lean();
    if (!report) throw fail(404, "Save the draft before exporting");
    if (
      report.status === "submitted" &&
      !["admin", "principal"].includes(req.user.role)
    )
      throw fail(403, "Only administrators can export reports before publication");
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
      const output =
        report.status === "published"
          ? await lockReportPdf(bytes, reportPdfPassword(report.studentSnapshot || student))
          : bytes;
      res
        .type("application/pdf")
        .set("Cache-Control", "no-store")
        .send(Buffer.from(output));
    } catch (e) {
      throw fail(422, e.message);
    }
  }),
);
app.post(
  "/api/report-pdf/bulk",
  requireModule("bulk"),
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
app.post(
  "/api/reports/:studentId/:session/whatsapp",
  roles("admin", "principal", "teacher"),
  requireModule("students"),
  requireAction("studentWhatsapp"),
  wrap(async (req, res) => {
    const student = await accessible(req, req.params.studentId);
    const session = validSession(req.params.session);
    const report = await Report.findOne({ student: student._id, session }).select(
      "+drivePath +drivePublicId +drivePasswordVersion",
    );
    if (!report || report.status !== "published")
      throw fail(409, "Only published reports can be sent");
    if (!report.templateSnapshot || !report.studentSnapshot)
      throw fail(
        409,
        "This legacy report has no locked report snapshot; publish a new version before sending it.",
      );
    reportPdfPassword(report.studentSnapshot);
    const required = [
      "APITXT_AUTHKEY",
      "APITXT_PROJECT_REF_ID",
      "APITXT_TEMPLATE_NAME",
      "WA_LINK_SECRET",
    ];
    if (required.some((key) => !process.env[key]))
      throw fail(
        503,
        "Configure APITXT credentials, WhatsApp template, and report-link secret on the server first",
      );
    let mobile = String(student.mobile || "").replace(/[^0-9]/g, "");
    if (!/^\d{10,15}$/.test(mobile))
      throw fail(
        400,
        "Add a valid parent/guardian WhatsApp number in the student record first",
      );
    if (mobile.length === 10) mobile = `91${mobile}`;
    const origin = (process.env.APP_ORIGIN || "http://localhost:5173").replace(
      /\/$/,
      "",
    );
    const token = reportLinkToken(
      String(student._id),
      session,
      report.revision,
    );
    const link = `${origin}/api/public/report-download/${token}`;
    let documentUrl = link;
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const publicId =
          report.drivePublicId || (await archivePublishedReport(report));
        documentUrl = privateDownloadUrl({
          publicId,
          resourceType: "raw",
          format: "pdf",
          ttlSeconds: 3600,
        });
      } catch (err) {
        console.error(
          "Could not obtain Cloudinary document URL for WhatsApp header, falling back to link:",
          err?.message,
        );
      }
    }
    const sig = verifySignature(String(student._id), session);
    const shortLink = `${origin}/r/${student._id}/${sig}`;
    const downloadLink =
      origin.includes("localhost") || origin.includes("127.0.0.1")
        ? (documentUrl || shortLink)
        : shortLink;
    let response;
    try {
      response = await fetch("https://apitxt.com/api/sendWA", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authkey: process.env.APITXT_AUTHKEY,
          template_name: process.env.APITXT_TEMPLATE_NAME,
          project_ref_id: process.env.APITXT_PROJECT_REF_ID,
          mobiles: mobile,
          body_params: [String(report.studentSnapshot.name), session, downloadLink],
          header_document_url: documentUrl,
          header_document_filename: `${String(report.studentSnapshot.name)
            .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
            .slice(0, 100)} - Report.pdf`,
        }),
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw fail(
        502,
        "Could not reach APITXT. Check server network and try again.",
      );
    }
    const result = await response.json().catch(() => ({}));
    if (
      !response.ok ||
      (result.status && Number(result.status) !== 200) ||
      (result.failed && Number(result.failed) > 0)
    ) {
      const detailError = result.details?.[0]?.error;
      const errorMessage = detailError
        ? `WhatsApp delivery failed: ${detailError}`
        : result.message || "APITXT rejected the WhatsApp message";
      throw fail(502, errorMessage);
    }
    report.whatsappSentAt = new Date();
    report.whatsappRecipient = mobile;
    report.whatsappRequestId = String(result.request_id || "").slice(0, 120);
    const detailMessageId = result.details?.[0]?.message_id;
    if (detailMessageId) {
      report.whatsappMessageId = String(detailMessageId).slice(0, 120);
    }
    report.whatsappDeliveryStatus = "sent";
    await report.save();
    await audit(req, "whatsapp-report", report._id);
    res.json({
      ok: true,
      sentAt: report.whatsappSentAt,
      requestId: report.whatsappRequestId,
      recipient: mobile,
      deliveryStatus: "sent",
    });
  }),
);
app.post(
  "/api/reports/:studentId/:session/email",
  roles("admin", "principal", "teacher"),
  requireModule("students"),
  requireAction("studentEmail"),
  wrap(async (req, res) => {
    const student = await accessible(req, req.params.studentId);
    const session = validSession(req.params.session);
    const report = await Report.findOne({ student: student._id, session }).select(
      "+drivePath +drivePublicId +drivePasswordVersion",
    );
    if (!report || report.status !== "published") throw fail(409, "Only published reports can be sent");
    if (!report.templateSnapshot || !report.studentSnapshot) throw fail(409, "This legacy report has no locked report snapshot; publish a new version before sending it.");
    const recipient = String(student.email || "").trim().toLowerCase();
    if (!/^[^\s@]{1,100}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(recipient))
      throw fail(400, "Add a valid parent/guardian email in the student record first");
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM)
      throw fail(503, "Email delivery is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and MAIL_FROM on the server.");
    const identity = report.studentSnapshot;
    let lockedPdf;
    try {
      const bytes = await renderReports([{ student: identity, report: report.toObject(), config: report.configSnapshot, user: { role: "parent" } }]);
      lockedPdf = await lockReportPdf(bytes, reportPdfPassword(identity));
    } catch (error) {
      throw fail(422, error.message);
    }
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    const safeName = String(identity.name || "Student").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").slice(0, 100);
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: recipient,
        subject: `${safeName} - Progress Report (${session})`,
        text: `Dear Parent/Guardian,\n\nPlease find the password-protected progress report for ${safeName} for academic session ${session} attached.\n\nPDF password: the student's admission number followed by @ and date of birth in YYYY-MM-DD format.\n\nRegards,\n${report.configSnapshot?.schoolName || "School Administration"}`,
        attachments: [{ filename: `${safeName} - Report.pdf`, content: Buffer.from(lockedPdf), contentType: "application/pdf" }],
      });
    } catch (error) {
      console.error("Report email delivery failed", { report: String(report._id), error: error?.message || "SMTP error" });
      throw fail(502, "Could not send the report email. Check SMTP settings and try again.");
    }
    report.emailSentAt = new Date();
    report.emailRecipient = recipient;
    await report.save();
    await audit(req, "email-report", report._id);
    res.json({ ok: true, sentAt: report.emailSentAt, recipient });
  }),
);
app.get(
  "/api/student-report-status",
  roles("admin", "principal", "teacher"),
  requireModule("students"),
  wrap(async (req, res) => {
    if (!hasAction(req.user, "studentWhatsapp") && !hasAction(req.user, "studentEmail")) throw fail(403, "Report delivery is not assigned to your account");
    const session = validSession(String(req.query.session || ""));
    const students = await Student.find({ ...scope(req.user), active: true })
      .select("_id")
      .lean();
    const reports = await Report.find({
      session,
      status: "published",
      student: { $in: students.map((student) => student._id) },
    })
      .select(
        "student whatsappSentAt whatsappDeliveryStatus whatsappDeliveredAt whatsappReadAt whatsappFailureReason emailSentAt",
      )
      .lean();
    res.json(
      Object.fromEntries(
        reports.map((report) => [
          String(report.student),
          {
            published: true,
            sentAt: report.whatsappSentAt || null,
            whatsappDeliveryStatus:
              report.whatsappDeliveryStatus ||
              (report.whatsappSentAt ? "sent" : null),
            whatsappDeliveredAt: report.whatsappDeliveredAt || null,
            whatsappReadAt: report.whatsappReadAt || null,
            whatsappFailureReason: report.whatsappFailureReason || null,
            emailSentAt: report.emailSentAt || null,
          },
        ]),
      ),
    );
  }),
);
app.get(
  "/api/review",
  roles("admin", "principal"),
  requireModule("review"),
  wrap(async (req, res) => {
    const session = validSession(String(req.query.session || ""));
    const reports = await Report.find({
      session,
      status: { $in: ["submitted", "published"] },
    })
      .populate("student")
      .sort({ submittedAt: -1, publishedAt: -1, updatedAt: -1 })
      .lean();
    res.json(
      reports
        .filter((r) => r.student)
        .map((r) => ({
          _id: r._id,
          revision: r.revision,
          session: r.session,
          status: r.status,
          submittedAt: r.submittedAt,
          publishedAt: r.publishedAt,
          whatsappSentAt: r.whatsappSentAt,
          whatsappDeliveryStatus:
            r.whatsappDeliveryStatus || (r.whatsappSentAt ? "sent" : null),
          whatsappDeliveredAt: r.whatsappDeliveredAt || null,
          whatsappReadAt: r.whatsappReadAt || null,
          whatsappFailureReason: r.whatsappFailureReason || null,
          emailSentAt: r.emailSentAt,
          student: {
            _id: r.student._id,
            name: r.studentSnapshot?.name || r.student.name,
            admissionNo:
              r.studentSnapshot?.admissionNo || r.student.admissionNo,
            className: r.studentSnapshot?.className || r.student.className,
            section: r.studentSnapshot?.section || r.student.section,
            mobile: r.studentSnapshot?.mobile || r.student.mobile,
            email: r.student.email,
          },
        })),
    );
  }),
);
app.get(
  "/api/analytics/class",
  roles("admin", "principal", "teacher"),
  requireModule("analytics"),
  wrap(async (req, res) => {
    const session = validSession(String(req.query.session || ""));
    const requestedClass = String(req.query.className || "").trim();
    const requestedSection = String(req.query.section || "").trim();

    const baseCfg = await config();

    // Filter students accessible by current user
    const studentQuery = { active: true };
    if (requestedClass && requestedClass !== "all") {
      studentQuery.className = requestedClass;
    }
    if (requestedSection && requestedSection !== "all") {
      studentQuery.section = requestedSection;
    }

    let allStudents = await Student.find(studentQuery)
      .sort({ className: 1, section: 1, rollNo: 1, name: 1 })
      .lean();
    allStudents = allStudents.filter((s) => canAccess(req.user, s));

    const studentIds = allStudents.map((s) => s._id);
    const reports = await Report.find({
      student: { $in: studentIds },
      session,
    }).lean();

    const reportByStudent = new Map();
    reports.forEach((r) => reportByStudent.set(String(r.student), r));

    // Calculate metrics for each student
    const evaluated = allStudents.map((student) => {
      const rep = reportByStudent.get(String(student._id));
      const cfg = rep?.status === "published" && rep?.configSnapshot
        ? rep.configSnapshot
        : forClass(baseCfg, student);
      const marks = rep?.marks || { term1: {}, term2: {} };
      const calc = calculate(marks, cfg);

      const subjectsPerformance = (cfg.subjects || []).map((sub, idx) => {
        const t1 = calc.terms?.term1?.[idx];
        const t2 = calc.terms?.term2?.[idx];
        const t1Total = typeof t1?.total === "number" ? t1.total : null;
        const t2Total = typeof t2?.total === "number" ? t2.total : null;
        const combinedTotal =
          t1Total !== null || t2Total !== null
            ? ((t1Total || 0) + (t2Total || 0)) /
              (t1Total !== null && t2Total !== null ? 2 : 1)
            : null;
        const maxScore =
          (cfg.components || []).reduce(
            (s, c) => s + (Number(c.max) || 0),
            0,
          ) || 100;
        const percentage =
          combinedTotal !== null ? (combinedTotal / maxScore) * 100 : null;
        const passed =
          percentage !== null ? Math.round(percentage) >= cfg.passMark : null;

        return {
          id: sub.id,
          name: sub.name,
          t1Total,
          t2Total,
          combinedTotal:
            combinedTotal !== null ? Math.round(combinedTotal * 10) / 10 : null,
          percentage:
            percentage !== null ? Math.round(percentage * 10) / 10 : null,
          grade: percentage !== null ? grade(percentage) : "—",
          passed,
        };
      });

      const failingSubjects = subjectsPerformance.filter(
        (sp) => sp.percentage !== null && sp.passed === false,
      );

      return {
        _id: student._id,
        name: student.name,
        admissionNo: student.admissionNo,
        className: student.className,
        section: student.section,
        mobile: student.mobile,
        status: rep?.status || "pending",
        hasMarks: (calc.total && calc.total > 0) || calc.complete,
        complete: calc.complete,
        total: calc.total,
        maximum: calc.maximum,
        percentage: calc.percentage,
        grade: calc.percentage !== null ? grade(calc.percentage) : "—",
        result: calc.result,
        failingSubjects,
        subjectsPerformance,
      };
    });

    const assessed = evaluated.filter(
      (e) => e.percentage !== null || (e.total && e.total > 0),
    );
    assessed.sort(
      (a, b) =>
        (b.percentage || 0) - (a.percentage || 0) ||
        (b.total || 0) - (a.total || 0),
    );

    const toppers = assessed.slice(0, 3).map((s, idx) => ({
      ...s,
      rank: idx + 1,
      badge: idx === 0 ? "🥇 1st Rank" : idx === 1 ? "🥈 2nd Rank" : "🥉 3rd Rank",
    }));

    const totalStudents = evaluated.length;
    const assessedCount = assessed.length;
    const passCount = assessed.filter((s) => s.result === "PASS").length;
    const avgPercentage =
      assessedCount > 0
        ? Number(
            (
              assessed.reduce((sum, s) => sum + (s.percentage || 0), 0) /
              assessedCount
            ).toFixed(2),
          )
        : 0;
    const highestPercentage =
      assessed.length > 0 ? assessed[0].percentage || 0 : 0;
    const lowestPercentage =
      assessed.length > 0
        ? assessed[assessed.length - 1].percentage || 0
        : 0;
    const overallPassRate =
      assessedCount > 0
        ? Number(((passCount / assessedCount) * 100).toFixed(1))
        : 0;

    const subjectsList = baseCfg.subjects || [];
    const subjectStats = subjectsList.map((sub) => {
      const scores = assessed
        .map((s) => s.subjectsPerformance.find((sp) => sp.id === sub.id))
        .filter((sp) => sp && sp.combinedTotal !== null);

      const subCount = scores.length;
      const subAvg =
        subCount > 0
          ? Number(
              (
                scores.reduce((sum, sp) => sum + sp.combinedTotal, 0) /
                subCount
              ).toFixed(1),
            )
          : 0;
      const subHighest =
        subCount > 0
          ? Math.max(...scores.map((sp) => sp.combinedTotal))
          : 0;
      const subPassed = scores.filter((sp) => sp.passed).length;
      const subPassRate =
        subCount > 0 ? Number(((subPassed / subCount) * 100).toFixed(1)) : 0;
      const subFailing = scores.filter((sp) => sp.passed === false).length;

      return {
        id: sub.id,
        name: sub.name,
        evaluatedCount: subCount,
        averageScore: subAvg,
        highestScore: subHighest,
        passCount: subPassed,
        passRate: subPassRate,
        failingCount: subFailing,
      };
    });

    const atRisk = assessed.filter(
      (s) =>
        (s.failingSubjects && s.failingSubjects.length > 0) ||
        (s.percentage !== null && s.percentage < baseCfg.passMark) ||
        s.result === "NEEDS IMPROVEMENT",
    );

    res.json({
      session,
      className: requestedClass || "all",
      section: requestedSection || "all",
      summary: {
        totalStudents,
        assessedCount,
        pendingCount: totalStudents - assessedCount,
        avgPercentage,
        highestPercentage,
        lowestPercentage,
        passCount,
        overallPassRate,
      },
      toppers,
      subjectStats,
      atRisk,
      students: assessed,
    });
  }),
);
app.get(
  "/api/reports/:studentId/:session",
  requireModule("studio"),
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
    const origin = (process.env.APP_ORIGIN || "http://localhost:5173").replace(
      /\/$/,
      "",
    );
    const sig = verifySignature(req.params.studentId, session);
    const verificationUrl = `${origin}/verify/${req.params.studentId}/${session}/${sig}`;
    const reportData = r
      ? { ...r.toObject(), verificationUrl }
      : {
          marks: { term1: {}, term2: {} },
          co: {},
          remarks: "",
          status: "draft",
          revision: 0,
          session,
          verificationUrl,
        };
    res.json({
      report: reportData,
      calculation: calculate(r?.marks, cfg),
      config: cfg,
      verificationUrl,
    });
  }),
);
app.put(
  "/api/reports/:studentId/:session",
  requireModule("studio"),
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
        !(cfg.activities.includes(k) || ALL_ACTIVITIES.includes(k)) ||
        !v ||
        typeof v !== "object" ||
        Object.values(v).some((x) => !["", "A+", "A", "B+", "B", "C", "C+", "D"].includes(x)) ||
        Object.keys(v).some((k) => !["term1", "term2"].includes(k))
      )
        throw fail(400, "Activity grades must be A+, A, B+, B, or C");
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
      if (!hasModule(req.user, "studio")) throw fail(403, "Report studio module is not assigned");
      if (r.status !== "draft") throw fail(409, "Only drafts can be submitted");
      if (
        !calculate(r.marks, cfg).complete ||
        !cfg.activities.every((a) =>
          ["term1", "term2"].every((t) =>
            ["A+", "A", "B+", "B", "C", "C+", "D"].includes(r.co?.[a]?.[t]),
          ),
        )
      )
        throw fail(400, "Complete both terms and all activity grades first");
    } else if (["publish", "reopen"].includes(action)) {
      if (!["admin", "principal"].includes(req.user.role))
        throw fail(403, "Principal or admin only");
      if (!hasModule(req.user, "review")) throw fail(403, "Report Review module is not assigned");
      if (action === "publish" && r.status !== "submitted")
        throw fail(409, "Submit report before publishing");
      if (action === "reopen" && r.status !== "published")
        throw fail(409, "Only published reports can be reopened");
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
      reportPdfPassword(student);
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
      {
        _id: r._id,
        revision: r.revision,
        status:
          action === "submit"
            ? "draft"
            : action === "publish"
              ? "submitted"
              : "published",
      },
      { $set: update, $inc: { revision: 1 } },
      { new: true },
    );
    if (!saved) throw fail(409, "Concurrent change, reload");
    await audit(req, action + "-report", r._id);
    if (action === "publish") {
      try {
        await archivePublishedReport(saved);
      } catch (error) {
        // Publication remains committed; a later admin download can retry archival.
        console.error("Report Drive archive failed", String(saved._id), error?.message || "archive error");
      }
    }
    res.json(saved);
  }),
);
app.delete(
  "/api/reports/:studentId/:session/:term",
  requireModule("studio"),
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
  wrap(async (req, res) =>
    res.json(
      (await User.find().sort({ name: 1 })).map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        designation: user.designation || "",
        photo: user.photo || "",
        role: user.role,
        assignments: user.assignments || [],
        moduleAccess: effectiveModules(user),
        studentActions: effectiveActions(user),
        signature: user.signature,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    ),
  ),
);
app.get(
  "/api/class-teachers",
  wrap(async (req, res) => {
    const teachers = await User.find({ role: "teacher", active: true })
      .select("name photo designation assignments")
      .lean();
    res.json(teachers);
  }),
);
app.post(
  "/api/users",
  roles("admin"),
  wrap(async (req, res) => {
    const {
      name,
      email,
      password,
      role,
      assignments = [],
      phone = "",
      designation = "",
      photo = "",
    } = req.body;
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
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) throw fail(409, "A user with this email already exists");
    const [activeCls, activeSec] = await Promise.all([
      getActiveClasses(),
      getActiveSections(),
    ]);
    validateAssignments(assignments, activeCls, activeSec);
    const moduleAccess = req.body.moduleAccess;
    const studentActions = req.body.studentActions;
    if (moduleAccess !== undefined || studentActions !== undefined)
      validatePermissions(role, moduleAccess, studentActions);
    const u = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: typeof phone === "string" ? phone.trim() : "",
      designation: typeof designation === "string" ? designation.trim() : "",
      photo: typeof photo === "string" ? photo.trim() : "",
      passwordHash: await bcrypt.hash(password, 12),
      role,
      assignments,
      ...(moduleAccess !== undefined ? { moduleAccess } : {}),
      ...(studentActions !== undefined ? { studentActions } : {}),
    });
    await audit(req, "create-user", u._id);
    res.status(201).json({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      designation: u.designation || "",
      photo: u.photo || "",
      role: u.role,
      assignments: u.assignments,
    });
  }),
);
function validateAssignments(a, validClasses, validSections) {
  if (
    !Array.isArray(a) ||
    a.length > 50 ||
    a.some(
      (x) =>
        !x ||
        !x.className ||
        !x.section ||
        (validClasses && !validClasses.includes(String(x.className))) ||
        (validSections && !validSections.includes(String(x.section))),
    )
  )
    throw fail(400, "Invalid class assignment");
}
function validatePermissions(role, moduleAccess, studentActions) {
  const allowedModules = role === "admin"
    ? [...MODULES, "import", "users"]
    : MODULES.filter((m) => m !== "drive");
  const allowedActions = role === "admin" ? ACTIONS : ACTIONS;
  for (const [value, allowed, label] of [
    [moduleAccess, allowedModules, "module access"],
    [studentActions, allowedActions, "student actions"],
  ]) {
    if (
      value !== undefined &&
      (!Array.isArray(value) || value.length > allowed.length ||
        new Set(value).size !== value.length || value.some((item) => !allowed.includes(item)))
    ) throw fail(400, `Invalid ${label} for ${role} role`);
  }
  const effectiveModuleSet = moduleAccess ?? ROLE_MODULES[role] ?? [...MODULES, "import", "users"];
  if (["overview", "analytics", "studio", "bulk"].some((id) => effectiveModuleSet.includes(id)) && !effectiveModuleSet.includes("students"))
    throw fail(400, "Overview, Class Analytics, Report studio, and Bulk print require Students module access");
  const effectiveActionSet = studentActions ?? ROLE_ACTIONS[role] ?? [...ACTIONS];
  if (effectiveActionSet.length && !effectiveModuleSet.includes("students"))
    throw fail(400, "Student actions require Students module access");
}
app.put(
  "/api/users/:id",
  roles("admin"),
  wrap(async (req, res) => {
    const u = await User.findById(req.params.id);
    if (!u) throw fail(404, "User not found");
    const changingRole = Boolean(req.body.role && req.body.role !== u.role);
    const disablingAccount = Boolean(req.body.active === false && u.active);
    if (String(u._id) === String(req.user._id) && (changingRole || disablingAccount))
      throw fail(400, "Use another administrator to change your role or disable your account");
    if (u.role === "admin" && (changingRole || disablingAccount)) {
      const activeAdmins = await User.countDocuments({
        role: "admin",
        active: true,
        _id: { $ne: u._id },
      });
      if (!activeAdmins)
        throw fail(
          409,
          "The only active administrator cannot be demoted or disabled",
        );
    }
    if (req.body.name !== undefined) {
      if (!req.body.name || typeof req.body.name !== "string" || !req.body.name.trim())
        throw fail(400, "Valid name is required");
      u.name = req.body.name.trim();
    }
    if (req.body.email !== undefined) {
      const email = String(req.body.email || "").trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) throw fail(400, "Valid email is required");
      const existing = await User.findOne({ email, _id: { $ne: u._id } });
      if (existing) throw fail(409, "A user with this email already exists");
      u.email = email;
    }
    if (req.body.phone !== undefined) {
      u.phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
    }
    if (req.body.designation !== undefined) {
      u.designation = typeof req.body.designation === "string" ? req.body.designation.trim() : "";
    }
    if (req.body.photo !== undefined) {
      u.photo = typeof req.body.photo === "string" ? req.body.photo.trim() : "";
    }
    if (req.body.assignments) {
      const [activeCls, activeSec] = await Promise.all([
        getActiveClasses(),
        getActiveSections(),
      ]);
      validateAssignments(req.body.assignments, activeCls, activeSec);
      u.assignments = req.body.assignments;
    }
    if (req.body.moduleAccess !== undefined || req.body.studentActions !== undefined || changingRole) {
      const nextRole = req.body.role || u.role;
      validatePermissions(nextRole, req.body.moduleAccess, req.body.studentActions);
      if (req.body.moduleAccess !== undefined) u.moduleAccess = req.body.moduleAccess;
      else if (changingRole) u.moduleAccess = undefined;
      if (req.body.studentActions !== undefined) u.studentActions = req.body.studentActions;
      else if (changingRole) u.studentActions = undefined;
    }
    if (typeof req.body.active === "boolean") u.active = req.body.active;
    if (changingRole) {
      if (!["admin", "principal", "teacher"].includes(req.body.role))
        throw fail(400, "Invalid role");
      u.role = req.body.role;
    }
    const passwordChanged = Boolean(req.body.password !== undefined && req.body.password !== "");
    if (passwordChanged) {
      if (!validPassword(req.body.password)) throw fail(400, PASSWORD_MESSAGE);
      u.passwordHash = await bcrypt.hash(req.body.password, 12);
    }
    const securityChanged = Boolean(
      passwordChanged ||
      changingRole ||
      (req.body.active !== undefined && req.body.active !== u.active) ||
      req.body.moduleAccess !== undefined ||
      req.body.studentActions !== undefined
    );
    if (securityChanged) {
      u.sessionVersion += 1;
    }
    await u.save();
    if (securityChanged && req.session && String(u._id) === String(req.user._id)) {
      req.session.version = u.sessionVersion;
      await req.session.save();
    }
    await audit(req, "update-user", u._id);
    res.json({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      designation: u.designation || "",
      photo: u.photo || "",
      role: u.role,
      assignments: u.assignments,
      moduleAccess: effectiveModules(u),
      studentActions: effectiveActions(u),
      signature: u.signature,
      active: u.active,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    });
  }),
);
app.delete(
  "/api/users/:id",
  roles("admin"),
  wrap(async (req, res) => {
    const u = await User.findById(req.params.id);
    if (!u) throw fail(404, "User not found");
    if (String(u._id) === String(req.user._id))
      throw fail(400, "You cannot delete your own administrator account");
    if (u.role === "admin") {
      const activeAdmins = await User.countDocuments({
        role: "admin",
        active: true,
        _id: { $ne: u._id },
      });
      if (!activeAdmins)
        throw fail(
          409,
          "The only active administrator cannot be deleted",
        );
    }
    await User.findByIdAndDelete(u._id);
    await audit(req, "delete-user", u._id);
    res.json({ ok: true, deleted: u._id });
  }),
);
app.get(
  "/api/audit",
  roles("admin", "principal"),
  requireModule("audit"),
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
  "email",
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
      "",
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
    if (!importColumns.filter((k) => k !== "email").every((k) => headers.includes(k)))
      throw fail(400, "Headers do not match. Download the template.");
    const [activeCls, activeSec] = await Promise.all([
      getActiveClasses(),
      getActiveSections(),
    ]);
    const rows = [],
      seen = new Set(),
      errors = [];
    s.eachRow((r, n) => {
      if (n === 1) return;
      const item = {};
      for (const k of importColumns) {
        const column = headers.indexOf(k);
        const val = column < 0 ? null : r.getCell(column + 1).value;
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
      let errs = validateStudent(item, activeCls, activeSec);
      if (!validateGuardianEmail(item.email)) errs.push("Enter a valid parent/guardian email address");
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
  requireModule("bulk"),
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

/* =========================================================================
   STUDENT 360 & PROMOTION ENDPOINTS
   ========================================================================= */

app.post(
  "/api/students/promote",
  roles("admin", "principal"),
  requireModule("students"),
  wrap(async (req, res) => {
    const { studentIds, toClass, toSection } = req.body;
    if (!Array.isArray(studentIds) || !studentIds.length) {
      throw fail(400, "Select at least one student to promote");
    }
    if (!toClass || !toSection) {
      throw fail(400, "Target Class and Section are required");
    }
    const [activeCls, activeSec] = await Promise.all([
      getActiveClasses(),
      getActiveSections(),
    ]);
    if (!activeCls.includes(String(toClass))) throw fail(400, "Target class is invalid or disabled");
    if (!activeSec.includes(String(toSection))) throw fail(400, "Target section is invalid or disabled");

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { className: String(toClass), section: String(toSection) } }
    );
    await audit(
      req,
      "promote-students",
      "batch",
      JSON.stringify({ count: result.modifiedCount, toClass, toSection })
    );
    res.json({ ok: true, promoted: result.modifiedCount });
  })
);

app.get(
  "/api/students/:id/id-card",
  requireModule("students"),
  wrap(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) throw fail(404, "Student not found");
    if (!canAccess(req.user, student)) throw fail(403, "Access denied to this student");
    const cfg = await config();
    const qrPayload = JSON.stringify({
      adm: student.admissionNo,
      name: student.name,
      cls: student.className,
      sec: student.section,
      dob: student.dob || "",
      sch: "SRPS",
    });
    res.json({
      student,
      schoolName: cfg.schoolName || "Shree Ram Public School",
      schoolLogo: cfg.schoolLogo || "",
      qrPayload,
    });
  })
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
