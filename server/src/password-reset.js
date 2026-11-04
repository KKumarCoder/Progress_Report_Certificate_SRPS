import nodemailer from "nodemailer";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { User } from "./models.js";
import {
  validPassword,
  PASSWORD_MESSAGE,
} from "../../shared/password-policy.js";
const hash = (token) => createHash("sha256").update(token).digest("hex");
const response = {
  message:
    "If an active account uses this email, a password reset link will arrive shortly. Check your spam folder too.",
};
export const resetMail = {
  async send(to, url) {
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
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: "Reset your ANVAYROBO · SRPS password",
      text: `Reset your SRPS Report Studio password using this link:\n\n${url}\n\nThis link expires in 15 minutes and can be used once. If you did not request this, ignore this email. Your password has not changed.\n\nANVAYROBO · Shree Ram Public School`,
    });
  },
};
export function passwordResetRoutes(app, wrap) {
  const limiter = () =>
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      message: { error: "Too many attempts. Please try again in 15 minutes." },
    });
  app.post(
    "/api/auth/forgot-password",
    limiter(),
    wrap(async (req, res) => {
      res.set("Cache-Control", "no-store");
      const email =
        typeof req.body.email === "string"
          ? req.body.email.trim().toLowerCase()
          : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
        return res.status(400).json({ error: "Enter a valid email address." });
      if (
        ![
          "SMTP_HOST",
          "SMTP_USER",
          "SMTP_PASS",
          "MAIL_FROM",
          "APP_ORIGIN",
        ].every((k) => process.env[k])
      )
        return res
          .status(503)
          .json({
            error:
              "Password reset email is not configured yet. Please contact your school administrator.",
          });
      const origin = new URL(process.env.APP_ORIGIN);
      if (
        !["http:", "https:"].includes(origin.protocol) ||
        (process.env.NODE_ENV === "production" && origin.protocol !== "https:")
      )
        return res
          .status(503)
          .json({
            error:
              "Password reset email is unavailable. Please contact your school administrator.",
          });
      const token = randomBytes(32).toString("hex");
      const tokenHash = hash(token);
      // A per-account cooldown also limits mail sent from multiple IP addresses.
      const user = await User.findOneAndUpdate(
        {
          email,
          active: true,
          $or: [
            { resetRequestedAt: { $exists: false } },
            { resetRequestedAt: { $lt: new Date(Date.now() - 60000) } },
          ],
        },
        [
          {
            $set: {
              resetTokenHash: tokenHash,
              resetExpiresAt: new Date(Date.now() + 15 * 60000),
              resetRequestedAt: new Date(),
              resetVersion: "$sessionVersion",
            },
          },
        ],
        { new: true },
      );
      if (user) {
        const url = new URL("/", origin.origin);
        url.hash = `reset-password=${token}`;
        try {
          await resetMail.send(email, url.href);
        } catch {
          await User.updateOne(
            { _id: user._id, resetTokenHash: tokenHash },
            {
              $unset: {
                resetTokenHash: 1,
                resetExpiresAt: 1,
                resetRequestedAt: 1,
                resetVersion: 1,
              },
            },
          );
          console.error(
            "Password reset email delivery failed. Check SMTP configuration.",
          );
          // Keep the same public response so delivery errors cannot reveal accounts.
        }
      }
      res.json(response);
    }),
  );
  app.post(
    "/api/auth/reset-password",
    limiter(),
    wrap(async (req, res) => {
      res.set("Cache-Control", "no-store");
      const { token, password } = req.body;
      if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token))
        return res
          .status(400)
          .json({
            error: "This reset link is invalid or expired. Request a new link.",
          });
      if (!validPassword(password))
        return res.status(400).json({ error: PASSWORD_MESSAGE });
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.findOneAndUpdate(
        {
          resetTokenHash: hash(token),
          resetExpiresAt: { $gt: new Date() },
          active: true,
          $expr: { $eq: ["$resetVersion", "$sessionVersion"] },
        },
        {
          $set: { passwordHash },
          $inc: { sessionVersion: 1 },
          $unset: {
            resetTokenHash: 1,
            resetExpiresAt: 1,
            resetRequestedAt: 1,
            resetVersion: 1,
          },
        },
      );
      if (!user)
        return res
          .status(400)
          .json({
            error: "This reset link is invalid or expired. Request a new link.",
          });
      res
        .clearCookie("srps_session", { path: "/" })
        .json({ message: "Password updated. Sign in with your new password." });
    }),
  );
}
