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
    transportOpted: { type: Boolean, default: false },
    transportRouteId: { type: Schema.Types.ObjectId, ref: "TransportRoute" },
    transportStop: { type: String, default: "" },
    qrToken: { type: String, default: "" },
    photo: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
studentSchema.index({ className: 1, section: 1 });
studentSchema.index({ admissionNo: 1 });
export const Student = model("Student", studentSchema);

/* --- Attendance Models --- */
const studentAttendanceSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    admissionNo: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    status: {
      type: String,
      enum: ["present", "absent", "late", "half_day"],
      default: "present",
    },
    method: {
      type: String,
      enum: ["manual", "qr_scanner", "face_ai"],
      default: "manual",
    },
    timeIn: { type: String, default: "" }, // "HH:MM:SS"
    remarks: { type: String, default: "" },
    markedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
studentAttendanceSchema.index({ student: 1, date: 1 }, { unique: true });
studentAttendanceSchema.index({ className: 1, section: 1, date: 1 });
export const StudentAttendance = model("StudentAttendance", studentAttendanceSchema);

const staffAttendanceSchema = new Schema(
  {
    staff: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    status: {
      type: String,
      enum: ["present", "absent", "late", "half_day", "leave"],
      default: "present",
    },
    method: {
      type: String,
      enum: ["manual", "qr_scanner", "face_ai"],
      default: "manual",
    },
    timeIn: { type: String, default: "" },
    timeOut: { type: String, default: "" },
    shift: { type: String, default: "Regular" },
    leaveType: { type: String, default: "" }, // "CL", "ML", "EL"
    remarks: { type: String, default: "" },
    markedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
staffAttendanceSchema.index({ staff: 1, date: 1 }, { unique: true });
staffAttendanceSchema.index({ date: 1 });
export const StaffAttendance = model("StaffAttendance", staffAttendanceSchema);

/* --- Fee Management Models --- */
const feeStructureSchema = new Schema(
  {
    name: { type: String, required: true },
    session: { type: String, required: true },
    classes: [{ type: String }],
    frequency: {
      type: String,
      enum: ["monthly", "quarterly", "term", "annual"],
      default: "monthly",
    },
    heads: [
      {
        headName: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export const FeeStructure = model("FeeStructure", feeStructureSchema);

const feeTransactionSchema = new Schema(
  {
    receiptNo: { type: String, required: true, unique: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    admissionNo: { type: String, required: true },
    studentName: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, required: true },
    session: { type: String, required: true },
    period: { type: String, required: true }, // e.g. "April 2026"
    breakdown: [
      {
        head: String,
        amount: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discountReason: { type: String, default: "" },
    fine: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    balanceDue: { type: Number, default: 0 },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Cheque", "Bank Transfer", "Online"],
      default: "Cash",
    },
    referenceNo: { type: String, default: "" },
    status: {
      type: String,
      enum: ["paid", "partial", "reverted"],
      default: "paid",
    },
    revertReason: { type: String, default: "" },
    collectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
feeTransactionSchema.index({ admissionNo: 1, session: 1 });
feeTransactionSchema.index({ receiptNo: 1 });
export const FeeTransaction = model("FeeTransaction", feeTransactionSchema);

/* --- Transport Models --- */
const vehicleSchema = new Schema(
  {
    vehicleNo: { type: String, required: true, unique: true },
    model: { type: String, default: "" },
    capacity: { type: Number, default: 30 },
    driverName: { type: String, default: "" },
    driverPhone: { type: String, default: "" },
    conductorName: { type: String, default: "" },
    conductorPhone: { type: String, default: "" },
    insuranceExpiry: { type: String, default: "" },
    fitnessExpiry: { type: String, default: "" },
    pucExpiry: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export const Vehicle = model("Vehicle", vehicleSchema);

const transportRouteSchema = new Schema(
  {
    routeNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    stops: [
      {
        stopName: { type: String, required: true },
        pickupTime: { type: String, default: "" },
        dropTime: { type: String, default: "" },
        fare: { type: Number, default: 0 },
        order: { type: Number, default: 0 },
      },
    ],
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export const TransportRoute = model("TransportRoute", transportRouteSchema);
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
