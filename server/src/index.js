import "dotenv/config";
import mongoose from "mongoose";
import { app } from "./app.js";
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is required. See server/.env.example");
  process.exit(1);
}
await mongoose.connect(process.env.MONGODB_URI);
app.listen(process.env.PORT || 4000, () =>
  console.log("SRPS Report Studio server ready"),
);
