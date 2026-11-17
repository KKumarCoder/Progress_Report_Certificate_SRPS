import templateMapping from "../../shared/template-mapping.json";
import {
  DEFAULT_CONFIG,
  calculate,
  validateStudent,
} from "../../shared/engine.js";
const KEY = "srps-report-demo-v1";
let demo = false;
let state;
const sample = {
  _id: "demo-student",
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
  photo: "",
  active: true,
};
const marks = {};
for (const [t, exams] of Object.entries({
  term1: [79, 79, 78, 80, 78, 80, 78],
  term2: [80, 79, 80, 79, 80, 80, 78],
}))
  marks[t] = Object.fromEntries(
    DEFAULT_CONFIG.subjects.map((s, i) => [
      s.id,
      { periodic: 10, notebook: 5, enrichment: 5, exam: exams[i] },
    ]),
  );
function init() {
  try {
    state = JSON.parse(localStorage.getItem(KEY));
  } catch {}
  if (!state)
    state = {
      students: [
        sample,
        {
          ...sample,
          _id: "demo-2",
          admissionNo: "SRPS002",
          name: "Aarav Sharma",
          house: "Aravali",
          fatherName: "Mr. Sharma",
          motherName: "Mrs. Sharma",
          mobile: "",
          photo: "",
        },
        {
          ...sample,
          _id: "demo-3",
          admissionNo: "SRPS003",
          name: "Ananya Singh",
          className: "7",
          section: "Mars",
          house: "Nilgiri",
          mobile: "",
          photo: "",
        },
      ],
      reports: {
        ["demo-student/" + DEFAULT_CONFIG.session]: {
          _id: "demo-report",
          revision: 0,
          status: "draft",
          session: DEFAULT_CONFIG.session,
          marks,
          co: Object.fromEntries(
            DEFAULT_CONFIG.activities.map((a) => [
              a,
              { term1: "A", term2: "A" },
            ]),
          ),
          remarks: "Excellent - Well Done!",
        },
      },
      users: [
        {
          _id: "demo-user",
          name: "School Administrator",
          email: "demo@srps.local",
          role: "admin",
          assignments: [],
          active: true,
        },
      ],
      config: DEFAULT_CONFIG,
      audit: [],
    };
}
const persist = () => localStorage.setItem(KEY, JSON.stringify(state));
export const isDemo = () => demo;
export function startDemo() {
  demo = true;
  init();
  return state.users[0];
}
export async function api(url, options = {}) {
  if (demo) return demoApi(url, options);
  const isForm = options.body instanceof FormData;
  const response = await fetch("/api" + url, {
    ...options,
    credentials: "same-origin",
    headers: {
      "X-SRPS-Request": "1",
      ...(!isForm && options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
    body: options.body && !isForm ? JSON.stringify(options.body) : options.body,
  }).catch(() => {
    throw new Error("Cannot reach the server. Check your connection and try again.");
  });
  if (!response.ok) {
    if (response.status === 401)
      window.dispatchEvent(new Event("srps:session-expired"));
    const data = await response.json().catch(() => null);
    throw new Error(
      (typeof data?.error === "string" && data.error) ||
        (response.status >= 500
          ? "The server is unavailable. Please try again shortly or contact your administrator."
          : `Request failed (${response.status}). Please try again.`),
    );
  }
  return response.json();
}
async function demoApi(url, { method = "GET", body = {} } = {}) {
  const parts = url.split("?")[0].split("/").filter(Boolean),
    [resource, id, session, action] = parts;
  const track = (a) => {
    state.audit.unshift({
      _id: crypto.randomUUID(),
      action: a,
      target: id || resource,
      actor: { name: "Demo Administrator" },
      createdAt: new Date().toISOString(),
    });
    persist();
  };
  if (resource === "auth") {
    if (id === "logout") {
      demo = false;
      return {};
    }
    return state.users[0];
  }
  if (resource === "config") {
    if (method === "PUT") {
      state.config = { ...state.config, ...body };
      track("settings");
    }
    return structuredClone(state.config);
  }
  if (resource === "students") {
    if (method === "GET")
      return structuredClone(state.students.filter((s) => s.active));
    if (method === "POST") {
      const errors = validateStudent(body);
      if (errors.length) throw new Error(errors.join("; "));
      if (state.students.some((s) => s.admissionNo === body.admissionNo))
        throw new Error("Admission number exists");
      const s = { ...body, _id: crypto.randomUUID(), active: true };
      state.students.push(s);
      track("create-student");
      return s;
    }
    const s = state.students.find((s) => s._id === id);
    if (method === "DELETE") s.active = false;
    else Object.assign(s, body);
    track("update-student");
    return s;
  }
  if (resource === "reports") {
    const key = id + "/" + session;
    let report = state.reports[key] || {
      marks: { term1: {}, term2: {} },
      co: {},
      remarks: "",
      status: "draft",
      revision: 0,
      session,
    };
    if (method === "GET")
      return {
        report: structuredClone(report),
        config:
          report.status === "published"
            ? report.configSnapshot
            : {
                ...state.config,
                subjects:
                  state.config.profiles?.[
                    state.students.find((s) => s._id === id)?.className
                  ] || state.config.subjects,
              },
        calculation: calculate(report.marks, state.config),
      };
    if (body.revision !== report.revision)
      throw new Error("Report changed. Reload.");
    if (method === "PUT")
      report = { ...report, ...body, revision: report.revision + 1 };
    if (method === "DELETE") {
      report.marks[action] = {};
      report.revision++;
    }
    if (method === "POST") {
      if (
        action === "submit" &&
        (!calculate(report.marks, state.config).complete ||
          !state.config.activities.every((a) =>
            ["term1", "term2"].every((t) => report.co[a]?.[t]),
          ))
      )
        throw new Error("Complete both terms and activity grades");
      report.status =
        action === "submit"
          ? "submitted"
          : action === "publish"
            ? "published"
            : "draft";
      if (action === "publish") {
        report.studentSnapshot = structuredClone(
          state.students.find((s) => s._id === id),
        );
        report.configSnapshot = structuredClone(state.config);
        report.templateSnapshot = structuredClone(templateMapping);
        report.teacherSignature =
          report.teacherSignature ||
          (["admin", "teacher"].includes(state.users[0].role)
            ? state.users[0].signature
            : "") ||
          "";
      }
      report.revision++;
    }
    state.reports[key] = report;
    track(method === "PUT" ? "save-report" : action);
    return structuredClone(report);
  }
  if (resource === "users") {
    if (method === "GET") return structuredClone(state.users);
    if (method === "POST") {
      state.users.push({ ...body, _id: crypto.randomUUID(), active: true });
    } else
      Object.assign(
        state.users.find((u) => u._id === id),
        body,
      );
    track("update-user");
    return {};
  }
  if (resource === "audit") return state.audit;
  if (resource === "upload") {
    const f = body.get("file");
    const url = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(f);
    });
    if (id === "signature") state.users[0].signature = url;
    persist();
    return { url };
  }
  if (resource === "import") {
    const f = body.get("file");
    const { default: ExcelJS } = await import("exceljs");
    const w = new ExcelJS.Workbook();
    await w.xlsx.load(await f.arrayBuffer());
    const s = w.worksheets[0],
      headers = s.getRow(1).values.slice(1),
      rows = [],
      errors = [];
    const seen = new Set();
    s.eachRow((r, n) => {
      if (n === 1) return;
      const item = Object.fromEntries(
        headers.map((h, i) => [h, String(r.getCell(i + 1).value ?? "")]),
      );
      const errs = validateStudent(item);
      if (seen.has(item.admissionNo)) errs.push("Duplicate admission number");
      seen.add(item.admissionNo);
      if (errs.length) errors.push({ row: n, error: errs.join("; ") });
      rows.push(item);
    });
    const duplicates = rows
      .filter((r) =>
        state.students.some((s) => s.admissionNo === r.admissionNo),
      )
      .map((r) => r.admissionNo);
    if (!url.includes("commit=true"))
      return { rows, count: rows.length, errors, duplicates };
    if (errors.length) throw new Error("Fix invalid rows");
    let created = 0,
      updated = 0,
      skipped = 0;
    for (const row of rows) {
      const found = state.students.find(
        (s) => s.admissionNo === row.admissionNo,
      );
      if (found) {
        if (url.includes("update=true")) {
          Object.assign(found, row);
          updated++;
        } else skipped++;
      } else {
        state.students.push({ ...row, _id: crypto.randomUUID(), active: true });
        created++;
      }
    }
    track("import-students");
    return { created, updated, skipped };
  }
  throw new Error("Feature not available in demo");
}
export async function download(url, filename) {
  const r = await fetch("/api" + url, { credentials: "same-origin" });
  if (!r.ok) {
    if (r.status === 401) window.dispatchEvent(new Event("srps:session-expired"));
    const data = await r.json().catch(() => null);
    throw new Error(data?.error || `Download failed (${r.status})`);
  }
  saveBlob(await r.blob(), filename);
}
export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
