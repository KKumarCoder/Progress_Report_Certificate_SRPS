import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { generateReportPdf } from "../../shared/report-pdf.js";
import { validateMapping } from "../../shared/report-template.js";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
export const templateMapping = JSON.parse(
  await fs.readFile(path.join(root, "shared/template-mapping.json"), "utf8"),
);
validateMapping(templateMapping, templateMapping);
export async function loadReportResource(url, expectedHash) {
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
    records.map((r) => ({
      ...r,
      mapping:
        r.report.status === "published"
          ? r.report.templateSnapshot
          : templateMapping,
    })),
    loadReportResource,
  );
}
