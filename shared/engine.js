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
  "ARTS ACTIVITY",
  "SOCIAL SKILLS",
  "SCIENTIFIC SKILLS",
  "CULTURAL ACTIVITY",
];
export const LEGACY_ACTIVITIES = [
  "WORK EDUCATION",
  "ART EDUCATION",
  "HEALTH & PHYSICAL EDUCATION",
  "DISCIPLINE",
  "COMPUTER",
];
export const ALL_ACTIVITIES = [...ACTIVITIES, ...LEGACY_ACTIVITIES];
export const LEGACY_COMPONENTS = [
  { id: "periodic", label: "Periodic test", max: 10 },
  { id: "notebook", label: "Note books", max: 5 },
  { id: "enrichment", label: "Subject enrichment", max: 5 },
  { id: "exam", label: "Half yearly exam", max: 80 },
];
export const TERM1_COMPONENTS = [
  { id: "fa1", label: "FA-1", max: 25 },
  { id: "fa2", label: "FA-2", max: 25 },
  { id: "sa1", label: "SA-1", max: 100 },
];
export const TERM2_COMPONENTS = [
  { id: "fa3", label: "FA-3", max: 25 },
  { id: "fa4", label: "FA-4", max: 25 },
  { id: "sa2", label: "SA-2", max: 100 },
];
export const COMPONENTS = [
  ...TERM1_COMPONENTS,
  ...TERM2_COMPONENTS,
  ...LEGACY_COMPONENTS,
];
export function getTermComponents(term, config = DEFAULT_CONFIG) {
  if (config?.termComponents && config.termComponents[term]) {
    return config.termComponents[term];
  }
  if (term === "term1") return TERM1_COMPONENTS;
  if (term === "term2") return TERM2_COMPONENTS;
  return config?.components || COMPONENTS;
}
export const DEFAULT_CONFIG = {
  session: "2025-26",
  subjects: SUBJECTS,
  components: COMPONENTS,
  termComponents: {
    term1: TERM1_COMPONENTS,
    term2: TERM2_COMPONENTS,
  },
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
  handwritingFont: "kalam",
};
export const blankMarks = () => ({ term1: {}, term2: {} });
export function grade(p) {
  if (p === null || p === undefined) return "—";
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
  const activeComps = [
    ...getTermComponents("term1", config),
    ...getTermComponents("term2", config),
    ...LEGACY_COMPONENTS,
  ];
  const compLimits = Object.fromEntries(activeComps.map((c) => [c.id, c.max]));
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
      for (const compKey of Object.keys(row)) {
        if (compLimits[compKey] === undefined) {
          errors.push("Unknown component");
        }
      }
      for (const [compKey, v] of Object.entries(row)) {
        const max = compLimits[compKey];
        if (max === undefined) continue;
        if (v === "" || v === null || v === undefined || v === "AB") continue;
        if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > max)
          errors.push(`${term}: ${key} ${compKey} must be 0–${max}`);
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
  const subjectsMap = {};

  let isLegacy = false;
  for (const t of ["term1", "term2"]) {
    const rows = marks?.[t] ? Object.values(marks[t]) : [];
    for (const r of rows) {
      if (
        r &&
        (r.periodic !== undefined ||
          r.exam !== undefined ||
          r.notebook !== undefined ||
          r.enrichment !== undefined)
      ) {
        isLegacy = true;
        break;
      }
    }
    if (isLegacy) break;
  }

  const getCompsForTerm = (term) => {
    if (config?.termComponents?.[term]) return config.termComponents[term];
    if (isLegacy) return LEGACY_COMPONENTS;
    return term === "term1" ? TERM1_COMPONENTS : TERM2_COMPONENTS;
  };

  for (const term of ["term1", "term2"]) {
    const termComps = getCompsForTerm(term);
    const termMax = termComps.reduce((s, c) => s + c.max, 0);
    terms[term] = config.subjects.map((s) => {
      const row = marks?.[term]?.[s.id] || {};
      const done = termComps.every(
        (c) =>
          row[c.id] !== "" && row[c.id] !== null && row[c.id] !== undefined,
      );
      const obtained = termComps.reduce(
        (sum, c) => sum + (typeof row[c.id] === "number" ? row[c.id] : 0),
        0,
      );
      if (!done) complete = false;
      const percentage = termMax > 0 ? (obtained / termMax) * 100 : 0;
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

  const comps1 = getCompsForTerm("term1");
  const comps2 = getCompsForTerm("term2");
  const combinedMaxPerSubject = comps1.reduce((s, c) => s + c.max, 0) + comps2.reduce((s, c) => s + c.max, 0);

  for (const s of config.subjects) {
    const row1 = marks?.term1?.[s.id] || {};
    const row2 = marks?.term2?.[s.id] || {};
    const done1 = comps1.every((c) => row1[c.id] !== "" && row1[c.id] !== null && row1[c.id] !== undefined);
    const done2 = comps2.every((c) => row2[c.id] !== "" && row2[c.id] !== null && row2[c.id] !== undefined);
    const subDone = done1 && done2;
    const obt1 = comps1.reduce((sum, c) => sum + (typeof row1[c.id] === "number" ? row1[c.id] : 0), 0);
    const obt2 = comps2.reduce((sum, c) => sum + (typeof row2[c.id] === "number" ? row2[c.id] : 0), 0);
    const subTotal = Math.round((obt1 + obt2) * 100) / 100;
    const total100 = combinedMaxPerSubject > 0 ? Math.round((subTotal / combinedMaxPerSubject) * 100) : 0;
    if (subDone && total100 < config.passMark) passed = false;
    subjectsMap[s.id] = {
      complete: subDone,
      subTotal,
      total100,
      grade: subDone ? grade(total100) : "—",
    };
  }

  const maximum = combinedMaxPerSubject * config.subjects.length;
  return {
    terms,
    subjects: subjectsMap,
    total: Math.round(total * 100) / 100,
    maximum,
    complete,
    percentage: complete ? Number(((total / maximum) * 100).toFixed(2)) : null,
    result: !complete ? "INCOMPLETE" : passed ? "PASS" : "NEEDS IMPROVEMENT",
  };
}
export const DEFAULT_CLASSES = [
  "Balvatika-1",
  "Balvatika-2",
  "Balvatika-3",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];
export const DEFAULT_SECTIONS = [
  "Venus",
  "Mars",
  "Jupiter",
  "Science",
  "Arts",
  "Commerce",
];
export const DEFAULT_HOUSES = [
  "Himalaya",
  "Aravali",
  "Nilgiri",
  "Shivalik",
];
export const DEFAULT_DESIGNATIONS = [
  "Principal",
  "Vice Principal",
  "PGT",
  "TGT",
  "PRT",
  "Class Teacher",
  "Subject Teacher",
  "Computer Faculty",
  "Accountant",
  "Librarian",
  "Admin",
  "Lab Assistant",
  "Sports Coach",
];

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
export function validateStudent(
  s,
  permittedClasses = DEFAULT_CLASSES,
  permittedSections = DEFAULT_SECTIONS,
) {
  const errors = [];
  for (const k of ["admissionNo", "name", "className", "section"])
    if (!String(s[k] ?? "").trim()) errors.push(`${k} is required`);
  if (!permittedClasses.includes(String(s.className)))
    errors.push("Invalid class");
  if (!permittedSections.includes(String(s.section)))
    errors.push("Invalid section");
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
