import fs from "node:fs/promises";
import sharp from "sharp";
import { DEFAULT_CONFIG } from "../shared/engine.js";
import { generateReportPdf } from "../shared/report-pdf.js";
import {
  templateMapping,
  loadReportResource,
} from "../server/src/report-renderer.js";
const out = "output/pdf";
await fs.mkdir(out, { recursive: true });
const student = {
  admissionNo: "N2621",
  name: "Jiten",
  className: "6",
  section: "Venus",
  house: "Himalya",
  motherName: "Mrs. Meena Devi",
  fatherName: "Mr. Jogender Singh",
  dob: "2014-12-25",
  address: "Rambas",
  mobile: "9050442341",
  photo: "sample:photo",
};
const report = {
  status: "draft",
  session: "2025-26",
  marks: {},
  co: Object.fromEntries(
    DEFAULT_CONFIG.activities.map((a) => [a, { term1: "A", term2: "A" }]),
  ),
  remarks: "Excellent - Well Done!",
  teacherSignature: "sample:teacher",
};
for (const [term, exams] of Object.entries({
  term1: [79, 79, 78, 80, 78, 80, 78],
  term2: [80, 79, 80, 79, 80, 80, 78],
}))
  report.marks[term] = Object.fromEntries(
    DEFAULT_CONFIG.subjects.map((s, i) => [
      s.id,
      { periodic: 10, notebook: 5, enrichment: 5, exam: exams[i] },
    ]),
  );
const config = { ...DEFAULT_CONFIG, principalSignature: "sample:principal" };
// Reference crops are QA fixtures only; they never become application defaults.
const assets = {
  "sample:photo": await sharp("client/public/reference-front.png")
    .extract({ left: 750, top: 666, width: 222, height: 283 })
    .png()
    .toBuffer(),
  "sample:teacher": await sharp("client/public/reference-back.png")
    .extract({ left: 210, top: 1364, width: 158, height: 47 })
    .png()
    .toBuffer(),
  "sample:principal": await sharp("client/public/reference-back.png")
    .extract({ left: 672, top: 1364, width: 142, height: 47 })
    .png()
    .toBuffer(),
};
for (const [key, bytes] of Object.entries(assets))
  await fs.writeFile(`${out}/${key.replace(":", "-")}.png`, bytes);
const record = { student, report, config, mapping: templateMapping };
const bytes = await generateReportPdf(
  [record],
  (url) => assets[url] || loadReportResource(url),
);
await fs.writeFile(`${out}/srps-sample.pdf`, bytes);
await fs.writeFile(
  `${out}/sample-data.json`,
  JSON.stringify({ student, report, config }, null, 2),
);
console.log(`Created ${out}/srps-sample.pdf`);
