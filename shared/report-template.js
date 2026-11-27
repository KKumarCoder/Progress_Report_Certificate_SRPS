import { calculate, SUBJECTS, COMPONENTS, ACTIVITIES, getTermComponents, DEFAULT_CONFIG } from "./engine.js";

export function assertCompatible(config) {
  if (
    !config?.subjects ||
    !Array.isArray(config.subjects) ||
    config.subjects.length === 0 ||
    config.subjects.length > 7
  ) {
    throw new Error(
      "This template supports 1 to 7 subjects. Please configure between 1 and 7 subjects for this class.",
    );
  }
}
export function getNextClass(className) {
  if (!className) return "";
  const raw = String(className).trim();

  const ROMAN = {
    "1": "II",
    "2": "III",
    "3": "IV",
    "4": "V",
    "5": "VI",
    "6": "VII",
    "7": "VIII",
    "8": "IX",
    "9": "X",
    "10": "XI",
    "11": "XII",
    "12": "Graduated",
  };

  const ROMAN_NUMERALS = {
    "I": "II",
    "II": "III",
    "III": "IV",
    "IV": "V",
    "V": "VI",
    "VI": "VII",
    "VII": "VIII",
    "VIII": "IX",
    "IX": "X",
    "X": "XI",
    "XI": "XII",
  };

  if (/balvatika[-_\s]*1/i.test(raw)) return "Balvatika-2";
  if (/balvatika[-_\s]*2/i.test(raw)) return "Balvatika-3";
  if (/balvatika[-_\s]*3/i.test(raw)) return "I";
  if (/nursery/i.test(raw)) return "LKG";
  if (/lkg/i.test(raw)) return "UKG";
  if (/ukg/i.test(raw)) return "I";

  const numMatch = raw.match(/\b(\d{1,2})\b/);
  if (numMatch && ROMAN[numMatch[1]]) {
    return ROMAN[numMatch[1]];
  }

  const upper = raw.toUpperCase();
  for (const [r, nextR] of Object.entries(ROMAN_NUMERALS)) {
    const regex = new RegExp(`\\b${r}\\b`, "i");
    if (regex.test(upper)) {
      return nextR;
    }
  }

  return "Higher Class";
}

export function reportValues(student, report, config, user = {}) {
  config =
    report.status === "published" && report.configSnapshot
      ? report.configSnapshot
      : config || DEFAULT_CONFIG;
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

  // Parse attendance into present (attended) days and total working days
  const attStr = String(report.attendance || "").trim();
  let attPresent = "", attTotal = "";
  if (attStr.includes("/")) {
    const parts = attStr.split("/");
    attPresent = parts[0].replace(/[^0-9]/g, "").trim() || parts[0].trim();
    attTotal = parts[1].replace(/[^0-9]/g, "").trim() || parts[1].trim();
  } else if (attStr) {
    attPresent = attStr;
  }

  const autoPromoted = getNextClass(s.className);
  const promotedTo =
    report.promotedTo && String(report.promotedTo).trim()
      ? String(report.promotedTo).trim()
      : autoPromoted;

  const values = {
    classSection: `${s.className} - ${s.section}`,
    admissionNo: s.admissionNo,
    name: s.name,
    house: s.house || "",
    motherName: s.motherName,
    fatherName: s.fatherName,
    dob,
    photo: s.photo || "",
    "attendance.present": attPresent,
    "attendance.total": attTotal,
    remarks: report.remarks || "",
    promotedTo,
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
  const cleanMark = (v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v);
  const SUBJECT_ROW_KEYS = [
    "english",
    "hindi",
    "sanskrit",
    "mathematics",
    "science",
    "social",
    "reasoning",
  ];

  for (let i = 0; i < 7; i++) {
    const rowKey = SUBJECT_ROW_KEYS[i];
    const s = config.subjects[i];
    if (s) {
      values[`subject.${i}.name`] = s.name;

      // Term 1 (FA-1, FA-2, SA-1)
      values[`term1.${rowKey}.fa1`] = cleanMark(
        report.marks?.term1?.[s.id]?.fa1 ?? ""
      );
      values[`term1.${rowKey}.fa2`] = cleanMark(
        report.marks?.term1?.[s.id]?.fa2 ?? ""
      );
      values[`term1.${rowKey}.sa1`] = cleanMark(
        report.marks?.term1?.[s.id]?.sa1 ?? ""
      );

      // Term 2 (FA-3, FA-4, SA-2)
      values[`term2.${rowKey}.fa3`] = cleanMark(
        report.marks?.term2?.[s.id]?.fa3 ?? ""
      );
      values[`term2.${rowKey}.fa4`] = cleanMark(
        report.marks?.term2?.[s.id]?.fa4 ?? ""
      );
      values[`term2.${rowKey}.sa2`] = cleanMark(
        report.marks?.term2?.[s.id]?.sa2 ?? ""
      );

      const subCalc = calc.subjects?.[s.id];
      values[`total.${rowKey}`] =
        subCalc?.complete && subCalc.subTotal !== undefined && subCalc.subTotal !== null
          ? String(Math.round(subCalc.subTotal * 100) / 100)
          : "—";
      values[`grade.${rowKey}`] = subCalc?.complete ? subCalc.grade : "—";
    } else {
      values[`subject.${i}.name`] = "";
      values[`term1.${rowKey}.fa1`] = "";
      values[`term1.${rowKey}.fa2`] = "";
      values[`term1.${rowKey}.sa1`] = "";
      values[`term2.${rowKey}.fa3`] = "";
      values[`term2.${rowKey}.fa4`] = "";
      values[`term2.${rowKey}.sa2`] = "";
      values[`total.${rowKey}`] = "";
      values[`grade.${rowKey}`] = "";
    }
  }

  const activities = config.activities || ACTIVITIES;
  activities.forEach((a, i) => {
    values[`co.${i}.name`] = a;
    values[`co.${i}.term1`] = report.co?.[a]?.term1 || report.co?.[i]?.term1 || "";
    values[`co.${i}.term2`] = report.co?.[a]?.term2 || report.co?.[i]?.term2 || "";
  });
  for (let i = 0; i < 4; i++) {
    if (values[`co.${i}.name`] === undefined) values[`co.${i}.name`] = "";
    if (values[`co.${i}.term1`] === undefined) values[`co.${i}.term1`] = "";
    if (values[`co.${i}.term2`] === undefined) values[`co.${i}.term2`] = "";
  }
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
