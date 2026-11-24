import mongoose from "mongoose";
const { Schema, model } = mongoose;
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: "" },
    designation: { type: String, default: "" },
    photo: { type: String, default: "" },
    passwordHash: { type: String, required: true, select: false },
    resetTokenHash: { type: String, select: false, index: true },
    resetExpiresAt: { type: Date, select: false },
    resetRequestedAt: { type: Date, select: false },
    resetVersion: { type: Number, select: false },
    role: {
      type: String,
      enum: ["admin", "principal", "teacher"],
      required: true,
    },
    assignments: [{ className: String, section: String }],
    moduleAccess: { type: [String], default: undefined },
    studentActions: { type: [String], default: undefined },
    signature: String,
    active: { type: Boolean, default: true },
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export const User = model("User", userSchema);
const studentSchema = new Schema(
  {
    admissionNo: { type: String, required: true, unique: true },
    rollNo: { type: String, default: "" },
    name: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, required: true },
    house: String,
    gender: { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
    bloodGroup: { type: String, default: "" },
    aadhaarNo: { type: String, default: "" },
    penNo: { type: String, default: "" },
    category: { type: String, default: "General" },
    motherName: String,
    fatherName: String,
    dob: String,
    address: String,
    mobile: String,
    email: { type: String, trim: true, lowercase: true },
    emergencyContact: { type: String, default: "" },
    admissionDate: { type: String, default: "" },
    previousSchool: { type: String, default: "" },
    photo: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
studentSchema.index({ className: 1, section: 1 });
export const Student = model("Student", studentSchema);

const reportSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    session: { type: String, required: true },
    marks: {
      type: Schema.Types.Mixed,
      default: () => ({ term1: {}, term2: {} }),
    },
    co: { type: Schema.Types.Mixed, default: () => ({}) },
    remarks: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "submitted", "published"],
      default: "draft",
    },
    revision: { type: Number, default: 0 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    teacherSignature: String,
    studentSnapshot: Schema.Types.Mixed,
    configSnapshot: Schema.Types.Mixed,
    templateSnapshot: Schema.Types.Mixed,
    submittedAt: Date,
    publishedAt: Date,
    whatsappSentAt: Date,
    whatsappRequestId: String,
    whatsappRecipient: String,
    whatsappDeliveryStatus: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: undefined,
    },
    whatsappDeliveredAt: Date,
    whatsappReadAt: Date,
    whatsappFailedAt: Date,
    whatsappFailureReason: String,
    whatsappMessageId: String,
    emailSentAt: Date,
    emailRecipient: String,
    drivePath: { type: String, select: false },
    drivePublicId: { type: String, select: false },
    driveArchivedAt: { type: Date, select: false },
    drivePasswordVersion: { type: String, select: false },
  },
  { timestamps: true, minimize: false },
);
reportSchema.index({ student: 1, session: 1 }, { unique: true });
export const Report = model("Report", reportSchema);
export const Setting = model(
  "Setting",
  new Schema({
    key: { type: String, unique: true },
    value: Schema.Types.Mixed,
  }),
);
export const Session = model(
  "Session",
  new Schema({
    tokenHash: { type: String, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    version: Number,
    expiresAt: { type: Date, index: { expires: 0 } },
    driveOtpHash: String,
    driveOtpExpiresAt: Date,
    driveOtpAttempts: Number,
    driveOtpSentAt: Date,
    driveVerifiedUntil: Date,
  }),
);
export const Audit = model(
  "Audit",
  new Schema(
    {
      actor: { type: Schema.Types.ObjectId, ref: "User" },
      action: String,
      target: String,
      details: String,
    },
    { timestamps: true },
  ),
);
