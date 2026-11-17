import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt";
import { generateReportPdf } from "../../shared/report-pdf.js";
import { validateMapping } from "../../shared/report-template.js";
import { isCloudMediaUrl, mediaPublicId, privateDownloadUrl } from "./cloud-storage.js";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
export const templateMapping = JSON.parse(
  await fs.readFile(path.join(root, "shared/template-mapping.json"), "utf8"),
);
validateMapping(templateMapping, templateMapping);
export function getVerificationUrl(studentId, session) {
  const secret = process.env.WA_LINK_SECRET || "srps_verification_secret_fallback";
  const sig = createHmac("sha256", secret).update(`${studentId}:${session}`).digest("hex").slice(0, 16);
  const origin = (process.env.APP_ORIGIN || "http://localhost:5173").replace(/\/$/, "");
  return `${origin}/verify/${studentId}/${session}/${sig}`;
}
export async function loadReportResource(url, expectedHash) {
  if (isCloudMediaUrl(url)) {
    const response = await fetch(privateDownloadUrl({ publicId: mediaPublicId(url), resourceType: "image", format: "png", ttlSeconds: 60 }));
    if (!response.ok) throw new Error("Unable to retrieve private Cloudinary report artwork");
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (expectedHash && createHash("sha256").update(bytes).digest("hex") !== expectedHash)
      throw new Error("A versioned template asset was modified. Restore the original asset before export.");
    return bytes;
  }
  let filename;
  if (/^\/templates\/[a-zA-Z0-9_./-]+$/.test(url) && !url.includes("..")) {
    const publicDir = await fs
      .access(path.join(root, "client/public/templates"))
      .then(() => "client/public")
      .catch(() => "client/dist");
    filename = path.join(root, publicDir, url);
  } else if (/^\/api\/files\/[a-f0-9]{36}\.png$/.test(url))
    filename = path.join(root, "server/uploads", path.basename(url));
  else
    throw new Error(
      "Unsupported report resource. Use an uploaded photo or signature.",
    );
  const bytes = new Uint8Array(await fs.readFile(filename));
  if (
    expectedHash &&
    createHash("sha256").update(bytes).digest("hex") !== expectedHash
  )
    throw new Error(
      "A versioned template asset was modified. Restore the original asset before export.",
    );
  return bytes;
}
export function renderReports(records) {
  return generateReportPdf(
    records.map((r) => {
      const studentId = String(r.student?._id || r.student?.id || "");
      const session = String(r.report?.session || "");
      const verificationUrl =
        r.verificationUrl ||
        (studentId && session ? getVerificationUrl(studentId, session) : undefined);
      return {
        ...r,
        verificationUrl,
        mapping:
          r.report?.status === "published" && r.report?.templateSnapshot
            ? r.report.templateSnapshot
            : templateMapping,
      };
    }),
    loadReportResource,
  );
}

// PDF encryption is applied only at the final server delivery boundary.
export async function lockReportPdf(bytes, password) {
  if (!password || !String(password).trim())
    throw new Error("Report PDF password is required");
  return encryptPDF(new Uint8Array(bytes), String(password).trim(), {
    algorithm: "AES-256",
    ownerPassword: randomOwnerPassword(),
    allowPrinting: true,
    allowCopying: false,
    allowModifying: false,
    allowAnnotating: false,
  });
}

function randomOwnerPassword() {
  return randomBytes(32).toString("hex");
}
