import fs from "node:fs/promises";
import { validateMapping, reportValues } from "../shared/report-template.js";
import { DEFAULT_CONFIG } from "../shared/engine.js";
const installed = JSON.parse(
  await fs.readFile("shared/template-mapping.json", "utf8"),
);
const candidate = JSON.parse(
  await fs.readFile(process.argv[2] || "shared/template-mapping.json", "utf8"),
);
validateMapping(candidate, installed);
const expected = Object.keys(
  reportValues(
    { className: "6", section: "Venus" },
    { marks: {}, status: "draft" },
    DEFAULT_CONFIG,
  ),
).sort();
const actual = [
  ...new Set(
    Object.values(candidate.pages).flatMap((p) => p.fields.map((f) => f.id)),
  ),
].sort();
if (JSON.stringify(expected) !== JSON.stringify(actual))
  throw new Error("Required fields are missing or unknown fields were added");
if (
  process.argv[2] &&
  JSON.stringify(candidate) !== JSON.stringify(installed) &&
  candidate.mappingVersion === installed.mappingVersion
)
  throw new Error(
    "Increment mappingVersion before installing changed coordinates",
  );
console.log(
  `Valid: ${candidate.templateVersion} / ${candidate.mappingVersion}`,
);
