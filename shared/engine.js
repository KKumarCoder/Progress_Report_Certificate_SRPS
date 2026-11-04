export const SUBJECTS = [
  { id: "english", name: "ENGLISH", icon: "BookOpen" },
  { id: "hindi", name: "HINDI", icon: "Languages" },
  { id: "sanskrit", name: "SANSKRIT", icon: "ScrollText" },
  { id: "mathematics", name: "MATHEMATICS", icon: "Triangle" },
  { id: "science", name: "SCIENCE", icon: "Microscope" },
  { id: "social", name: "SOCIAL SCIENCE", icon: "Globe" },
  { id: "reasoning", name: "REASONING + COM. + GK", icon: "Puzzle" },
];
export const ACTIVITIES = [
  "WORK EDUCATION",
  "ART EDUCATION",
  "HEALTH & PHYSICAL EDUCATION",
  "DISCIPLINE",
  "COMPUTER",
];
export const COMPONENTS = [
  { id: "periodic", label: "Periodic test", max: 10 },
  { id: "notebook", label: "Note books", max: 5 },
  { id: "enrichment", label: "Subject enrichment", max: 5 },
  { id: "exam", label: "Half yearly exam", max: 80 },
];
export const DEFAULT_CONFIG = {
  session: "2025-26",
  subjects: SUBJECTS,
  components: COMPONENTS,
  activities: ACTIVITIES,
  passMark: 33,
  schoolName: "SHREE RAM PUBLIC SCHOOL",
  address: "KANHRA-BADHRA (CHARKHI DADRI), HARYANA",
  affiliation: "531694",
  phone: "+91 9813715194",
  phone2: "+91 9671913949",
  website: "www.srpskanhra.com",
  email: "srpskanhra@gmail.com",
  principalSignature: "",
  logo: "",
};
export const blankMarks = () => ({ term1: {}, term2: {} });
export function grade(p) {
  if (p === null) return "—";
  const n = Math.round(p);
  return n >= 91
    ? "A1"
    : n >= 81
      ? "A2"
      : n >= 71
        ? "B1"
        : n >= 61
          ? "B2"
          : n >= 51
            ? "C1"
            : n >= 41
              ? "C2"
              : n >= 33
                ? "D"
                : "E (Failed)";
}
export function validateMarks(marks, config = DEFAULT_CONFIG) {
  const errors = [];
  for (const term of ["term1", "term2"]) {
    const rows = marks?.[term] || {};
    for (const key of Object.keys(rows)) {
      if (!config.subjects.some((s) => s.id === key)) {
        errors.push("Unknown subject");
        continue;
      }
      const row = rows[key];
      if (!row || typeof row !== "object" || Array.isArray(row)) {
        errors.push("Invalid marks row");
        continue;
      }
      for (const key of Object.keys(row))
        if (!config.components.some((c) => c.id === key))
          errors.push("Unknown component");
      for (const c of config.components) {
        const v = row[c.id];
        if (v === "" || v === null || v === undefined || v === "AB") continue;
        if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > c.max)
          errors.push(`${term}: ${key} ${c.label} must be 0–${c.max}`);
      }
    }
  }
  return errors;
}
export function calculate(marks, config = DEFAULT_CONFIG) {
  const terms = {};
  let total = 0,
    complete = true,
    passed = true;
  const max = config.components.reduce((s, c) => s + c.max, 0);
  for (const term of ["term1", "term2"]) {
    terms[term] = config.subjects.map((s) => {
      const row = marks?.[term]?.[s.id] || {};
      const done = config.components.every(
        (c) =>
          row[c.id] !== "" && row[c.id] !== null && row[c.id] !== undefined,
      );
      const obtained = config.components.reduce(
        (sum, c) => sum + (typeof row[c.id] === "number" ? row[c.id] : 0),
        0,
      );
      if (!done) complete = false;
      const percentage = (obtained / max) * 100;
      if (done && Math.round(percentage) < config.passMark) passed = false;
      total += obtained;
      return {
        ...s,
        complete: done,
        total: done ? Math.round(obtained * 100) / 100 : null,
        grade: done ? grade(percentage) : "—",
      };
    });
  }
  const maximum = max * config.subjects.length * 2;
  return {
    terms,
    total: Math.round(total * 100) / 100,
    maximum,
    complete,
    percentage: complete ? Number(((total / maximum) * 100).toFixed(2)) : null,
    result: !complete ? "INCOMPLETE" : passed ? "PASS" : "NEEDS IMPROVEMENT",
  };
}
export function canAccess(user, student) {
  return (
    ["admin", "principal"].includes(user.role) ||
    (user.assignments || []).some(
      (a) =>
        String(a.className) === String(student.className) &&
        a.section === student.section,
    )
  );
}
export function validateStudent(s) {
  const errors = [];
  for (const k of ["admissionNo", "name", "className", "section"])
    if (!String(s[k] ?? "").trim()) errors.push(`${k} is required`);
  if (
    !Array.from({ length: 12 }, (_, i) => String(i + 1)).includes(
      String(s.className),
    )
  )
    errors.push("Class must be 1–12");
  if (!["Venus", "Mars"].includes(s.section))
    errors.push("Section must be Venus or Mars");
  if (s.mobile && !/^\+?[0-9 -]{10,16}$/.test(s.mobile))
    errors.push("Invalid mobile");
  if (
    s.dob &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(s.dob) ||
      Number.isNaN(Date.parse(s.dob)) ||
      new Date(s.dob).toISOString().slice(0, 10) !== s.dob)
  )
    errors.push("DOB must be YYYY-MM-DD");
  return errors;
}
