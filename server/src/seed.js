import { validPassword } from "../../shared/password-policy.js";
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models.js";
if (
  !process.env.MONGODB_URI ||
  !process.env.ADMIN_EMAIL ||
  !validPassword(process.env.ADMIN_PASSWORD)
)
  throw new Error(
    "Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD (6–20 characters)",
  );
await mongoose.connect(process.env.MONGODB_URI);
if (await User.exists({ role: "admin" })) {
  console.log("Administrator already exists. No changes made.");
} else {
  await User.create({
    name: "School Administrator",
    email: process.env.ADMIN_EMAIL,
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
    role: "admin",
  });
  console.log(
    "Administrator created. Sign in with your configured credentials.",
  );
}
await mongoose.disconnect();
