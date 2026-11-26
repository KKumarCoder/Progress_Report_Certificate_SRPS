import { calculate, SUBJECTS, COMPONENTS, ACTIVITIES, getTermComponents } from "./engine.js";

export function assertCompatible(config) {
  const normalize = (s) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (
    !config.subjects ||
    config.subjects.length !== SUBJECTS.length ||
    config.subjects.some(
      (s, i) =>
        s.id !== SUBJECTS[i].id ||
        normalize(s.name) !== normalize(SUBJECTS[i].name),
    )
  ) {
    throw new Error(
      "This class profile does not match the fixed subjects printed on the approved artwork. A matching blank template is required.",
    );
  }
}
export function reportValues(student, report, config, user = {}) {
  config =
    report.status === "published" && report.configSnapshot
      ? report.configSnapshot
      : config;
  assertCompatible(config);
  const s =
    report.status === "published" && report.studentSnapshot
      ? report.studentSnapshot
      : student;
  const calc = calculate(report.marks, config);
  const dob = s.dob
    ? new Date(s.dob.slice(0, 10) + "T12:00:00Z")
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
        .replaceAll(" ", "-")
    : "";
  const values = {
    classSection: `${s.className} - ${s.section}`,
    admissionNo: s.admissionNo,
    name: s.name,
    house: s.house || "",
    motherName: s.motherName,
    fatherName: s.fatherName,
    dob,
    photo: s.photo || "",
    attendance: report.attendance ? String(report.attendance) : "—",
    remarks: report.remarks || "",
    promotedTo: report.promotedTo || (calc.result === "PASS" ? "Promoted to Higher Class" : "—"),
    teacherSignature:
      report.teacherSignature ||
      (report.status !== "published" && ["teacher", "admin"].includes(user.role)
        ? user.signature || ""
        : ""),
    principalSignature: config.principalSignature || "",
    percentage:
      calc.percentage === null ? "—" : `${calc.percentage.toFixed(2)}%`,
    grandTotal: calc.complete ? String(calc.total) : "—",
    maximum: String(calc.maximum),
  };
  for (const s of config.subjects) {
    // Term 1 (FA-1, FA-2, SA-1) with fallback to legacy keys
    values[`term1.${s.id}.fa1`] =
      report.marks?.term1?.[s.id]?.fa1 ??
      report.marks?.term1?.[s.id]?.periodic ??
      "";
    values[`term1.${s.id}.fa2`] =
      report.marks?.term1?.[s.id]?.fa2 ??
      report.marks?.term1?.[s.id]?.notebook ??
      "";
    values[`term1.${s.id}.sa1`] =
      report.marks?.term1?.[s.id]?.sa1 ??
      report.marks?.term1?.[s.id]?.exam ??
      "";

    // Term 2 (FA-3, FA-4, SA-2) with fallback to legacy keys
    values[`term2.${s.id}.fa3`] =
      report.marks?.term2?.[s.id]?.fa3 ??
      report.marks?.term2?.[s.id]?.periodic ??
      "";
    values[`term2.${s.id}.fa4`] =
      report.marks?.term2?.[s.id]?.fa4 ??
      report.marks?.term2?.[s.id]?.notebook ??
      "";
    values[`term2.${s.id}.sa2`] =
      report.marks?.term2?.[s.id]?.sa2 ??
      report.marks?.term2?.[s.id]?.exam ??
      "";

    const subCalc = calc.subjects?.[s.id];
    values[`total.${s.id}`] = subCalc?.complete ? String(subCalc.total100) : "—";
    values[`grade.${s.id}`] = subCalc?.complete ? subCalc.grade : "—";
  }

  const activities = config.activities || ACTIVITIES;
  activities.forEach((a, i) => {
    values[`co.${i}.term1`] = report.co?.[a]?.term1 || report.co?.[i]?.term1 || "";
    values[`co.${i}.term2`] = report.co?.[a]?.term2 || report.co?.[i]?.term2 || "";
  });
  return values;
}
export function pagePlacement(mapping, side) {
  const page = mapping.pages[side],
    p = mapping.policy;
  const scale = Math.min(
    (p.width - 2 * p.margin) / page.width,
    (p.height - 2 * p.margin) / page.height,
  );
  return {
    scale,
    x: (p.width - page.width * scale) / 2,
    y: (p.height - page.height * scale) / 2,
  };
}
export function clipPath(field) {
  return (field.clip || [])
    .map(
      ([op, ...points]) =>
        op +
        points
          .map(
            (v, i) =>
              v * (i % 2 ? field.height : field.width) +
              (i % 2 ? field.y : field.x),
          )
          .join(" "),
    )
    .join(" ");
}
export function fitImage(field, width, height) {
  const scale =
    field.fit === "cover"
      ? Math.max(field.width / width, field.height / height)
      : Math.min(field.width / width, field.height / height);
  return {
    x: field.x + (field.width - width * scale) / 2,
    y: field.y + (field.height - height * scale) / 2,
    width: width * scale,
    height: height * scale,
  };
}
// Both SVG and PDF use the same fontkit metrics, line breaks and alphabetic baselines.
export function layoutText(field, value, font) {
  const text = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return [];
  for (const char of text)
    if (!font.hasGlyphForCodePoint(char.codePointAt(0)))
      throw new Error(
        `${field.id}: selected font lacks “${char}”. Configure a font containing this character.`,
      );
  const measure = (s, size) =>
    (font.layout(s).glyphs.reduce((sum, g) => sum + g.advanceWidth, 0) * size) /
    font.unitsPerEm;
  for (
    let size = field.fontSize;
    size >= field.overflow.minFontSize - 0.001;
    size = Math.round((size - 0.5) * 100) / 100
  ) {
    const lines = [];
    if (field.overflow.mode === "wrap-shrink") {
      let line = "";
      for (const word of text.split(" ")) {
        const next = line ? line + " " + word : word;
        if (line && measure(next, size) > field.width) {
          lines.push(line);
          line = word;
        } else line = next;
      }
      if (line) lines.push(line);
    } else lines.push(text);
    const ascent = (font.ascent / font.unitsPerEm) * size,
      descent = (-font.descent / font.unitsPerEm) * size;
    const lineHeight = Math.max(size * 1.15, ascent + descent),
      height = ascent + descent + (lines.length - 1) * lineHeight;
    if (
      height > field.height ||
      lines.some((line) => measure(line, size) > field.width)
    )
      continue;
    return lines.map((line, i) => ({
      text: line,
      size,
      width: measure(line, size),
      x:
        field.x +
        (field.alignment === "center"
          ? (field.width - measure(line, size)) / 2
          : field.alignment === "right"
            ? field.width - measure(line, size)
            : 0),
      y: field.y + (field.height - height) / 2 + ascent + i * lineHeight,
    }));
  }
  throw new Error(
    `${field.id}: full value does not fit at the minimum font size. Adjust the field in calibration; export is blocked to avoid truncation.`,
  );
}
export function validateMapping(mapping, canonical) {
  if (
    !mapping ||
    typeof mapping.mappingVersion !== "string" ||
    !/^[\w.-]{1,64}$/.test(mapping.mappingVersion)
  )
    throw new Error("Invalid mapping version");
  if (
    mapping.templateVersion !== canonical.templateVersion ||
    JSON.stringify(mapping.policy) !== JSON.stringify(canonical.policy) ||
    JSON.stringify(mapping.fonts) !== JSON.stringify(canonical.fonts)
  )
    throw new Error(
      "Calibration cannot change artwork, fonts or page policy. Configure those in source.",
    );
  const pageKeys = Object.keys(mapping.pages).sort();
  const canonicalKeys = Object.keys(canonical.pages).sort();
  if (pageKeys.join() !== canonicalKeys.join())
    throw new Error(`Pages mismatch: expected ${canonicalKeys.join()}, got ${pageKeys.join()}`);
  for (const side of pageKeys) {
    const p = mapping.pages[side],
      base = canonical.pages[side];
    if (
      p.width !== base.width ||
      p.height !== base.height ||
      p.artwork !== base.artwork ||
      p.sha256 !== base.sha256
    )
      throw new Error("Artwork metadata is immutable");
    if (
      !Array.isArray(p.fields) ||
      p.fields.length !== base.fields.length ||
      new Set(p.fields.map((f) => f.id)).size !== base.fields.length
    )
      throw new Error("Every required field must be mapped once");
    for (const f of p.fields) {
      const original = base.fields.find((b) => b.id === f.id);
      if (
        !original ||
        f.type !== original.type ||
        JSON.stringify(f.clip) !== JSON.stringify(original.clip) ||
        f.fit !== original.fit
      )
        throw new Error("Invalid field or mask");
      if (f.type === "text") {
        if (
          ![
            f.x,
            f.y,
            f.width,
            f.height,
            f.fontSize,
            f.overflow?.minFontSize,
          ].every(Number.isFinite) ||
          f.x < 0 ||
          f.y < 0 ||
          f.width <= 0 ||
          f.height <= 0 ||
          f.x + f.width > p.width ||
          f.y + f.height > p.height ||
          f.fontSize < 6 ||
          f.fontSize > 96 ||
          f.overflow.minFontSize < 6 ||
          f.overflow.minFontSize > f.fontSize
        )
          throw new Error(`Invalid bounding box or font size: ${f.id}`);
        if (
          !mapping.fonts[f.font] ||
          !/^#[0-9a-f]{6}$/i.test(f.colour) ||
          !["left", "center", "right"].includes(f.alignment) ||
          !["shrink", "wrap-shrink"].includes(f.overflow.mode) ||
          f.overflow.onFailure !== "error"
        )
          throw new Error(`Invalid styling: ${f.id}`);
      } else {
        if (
          ![f.x, f.y, f.width, f.height].every(Number.isFinite) ||
          f.x < 0 ||
          f.y < 0 ||
          f.width <= 0 ||
          f.height <= 0 ||
          f.x + f.width > p.width ||
          f.y + f.height > p.height
        )
          throw new Error(`Invalid image bounding box: ${f.id}`);
      }
    }
  }
  return mapping;
}
