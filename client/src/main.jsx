import { PASSWORD_MIN, PASSWORD_MAX } from "../../shared/password-policy.js";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Upload,
  Settings,
  ShieldCheck,
  History,
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  Download,
  Printer,
  Save,
  Check,
  ArrowLeft,
  ArrowRight,
  PanelLeft,
  LogOut,
  FileText,
  RefreshCw,
  Trash2,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Menu,
  PenLine,
  Loader2,
  School,
  LockKeyhole,
  ExternalLink,
} from "lucide-react";
import {
  DEFAULT_CONFIG,
  calculate,
  validateMarks,
} from "../../shared/engine.js";
import { api, startDemo, isDemo, download, saveBlob } from "./api";
import ReportPage from "./Report";
import Calibration from "./Calibration";
import Login from "./Login";
import templateMapping from "../../shared/template-mapping.json";
import { exportReportPdf, printReports } from "./report-export";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/600-italic.css";
import "@fontsource/great-vibes/400.css";
import "./style.css";
const classes = Array.from({ length: 12 }, (_, i) => String(i + 1)),
  sections = ["Venus", "Mars"];
const sessionOptions = ["2025-26", "2026-27", "2027-28", "2028-29"];
const teacherRemarks = [
  "Excellent performance. Keep up the wonderful work!",
  "Shows a positive attitude and a keen interest in learning.",
  "Works hard and makes steady progress. Well done!",
  "Participates actively and shares thoughtful ideas in class.",
  "Completes assignments with care and responsibility.",
  "Shows creativity and confidence in classroom activities.",
  "Is respectful, cooperative and helpful to classmates.",
  "Demonstrates good understanding and applies concepts well.",
  "Has made pleasing progress through consistent effort.",
  "Regular revision will help build stronger understanding.",
  "With greater focus in class, further progress is within reach.",
  "Daily practice will improve accuracy and confidence.",
  "Is encouraged to ask questions and participate more often.",
  "With consistent effort, can achieve even better results.",
];
const Empty = ({ text }) => (
  <div className="empty-state">
    <FileText size={36} />
    <h3>{text}</h3>
    <p>Your records will appear here.</p>
  </div>
);
const Field = ({ label, children }) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
);
function App() {
  const [user, setUser] = useState(null),
    [checking, setChecking] = useState(true),
    [page, setPage] = useState("dashboard"),
    [students, setStudents] = useState([]),
    [config, setConfig] = useState(DEFAULT_CONFIG),
    [selected, setSelected] = useState(null),
    [notice, setNotice] = useState(null),
    [sidebar, setSidebar] = useState(false),
    [reportDirty, setReportDirty] = useState(false);
  const navigate = (id) => {
    if (reportDirty && !confirm("Discard unsaved report changes?")) return;
    setReportDirty(false);
    setPage(id);
  };
  const toast = (message, error = false) => setNotice({ message, error });
  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);
  async function load() {
    const [s, c] = await Promise.all([api("/students"), api("/config")]);
    setStudents(s);
    setConfig(c);
  }
  useEffect(() => {
    if (user) load().catch((e) => toast(e.message, true));
  }, [user]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(null), 6000);
      return () => clearTimeout(t);
    }
  }, [notice]);
  const open = (s) => {
    setSelected(s);
    setPage("studio");
  };
  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
    setSelected(null);
  }
  if (checking)
    return (
      <div className="loading-screen">
        <Loader2 className="spin" /> Opening Report Studio…
      </div>
    );
  if (location.hash.startsWith("#reset-password=") || !user)
    return <Login onLogin={setUser} toast={toast} notice={notice} />;
  const nav = [
    ["dashboard", "Overview", LayoutDashboard],
    ["students", "Students", Users],
    ["studio", "Report studio", BookOpen],
    ["bulk", "Bulk print", Printer],
    ...(user.role === "admin"
      ? [
          ["import", "Excel import", Upload],
          ["users", "Users & access", ShieldCheck],
        ]
      : []),
    ...(["admin", "principal"].includes(user.role)
      ? [["audit", "Activity log", History]]
      : []),
    ["settings", "Settings", Settings],
  ];
  return (
    <div className="app-shell">
      <aside className={"sidebar " + (sidebar ? "shown" : "")}>
        <a className="brand" onClick={() => navigate("dashboard")}>
          <img
            className="primary-company-logo"
            src="/anvayrobo-logo.jpeg"
            alt="ANVAYROBO"
            width="72"
            height="72"
          />
          <span className="primary-company-name">
            ANVAYROBO<span className="brand-sub">SRPS · REPORT STUDIO</span>
          </span>
        </a>
        <div className="school-label">SHREE RAM PUBLIC SCHOOL</div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => {
                navigate(id);
                setSidebar(false);
              }}
            >
              <Icon size={19} />
              {label}
              {page === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="tiny-icon">
            <ShieldCheck size={18} />
          </span>
          <b>Every mark matters.</b>
          <p>Thoughtfully designed for your school’s progress.</p>
          <span className="gold-rule" />
        </div>
        <CompanyBrand />
        <button className="user-card" onClick={logout}>
          <div className="avatar">{user.name?.slice(0, 1)}</div>
          <div>
            <b>{user.name}</b>
            <small>{user.role} account</small>
          </div>
          <LogOut size={17} />
        </button>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div>
            <button
              className="icon-button mobile-menu"
              onClick={() => setSidebar(!sidebar)}
              aria-label="Open navigation"
            >
              <Menu />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <b>{nav.find((x) => x[0] === page)?.[1]}</b>
          </div>
          <div className="topbar-right">
            <span className="session-chip">
              <span className="live-dot" />
              {config.session}
            </span>
            <span className="top-avatar">{user.name?.slice(0, 1)}</span>
          </div>
        </header>
        {isDemo() && (
          <div className="demo-banner">
            <Eye size={15} />
            <b>Demo workspace</b>
            <span>
              Sample records · saved in this browser only. Production uses staff
              login and MongoDB.
            </span>
          </div>
        )}
        <div
          className={"page-content " + (page === "studio" ? "studio-page" : "")}
        >
          {page === "dashboard" && (
            <Dashboard
              students={students}
              config={config}
              open={open}
              go={setPage}
              user={user}
              toast={toast}
            />
          )}
          {page === "students" && (
            <Students
              students={students}
              open={open}
              reload={load}
              toast={toast}
              user={user}
            />
          )}
          {page === "studio" &&
            (selected ? (
              <Studio
                key={selected._id}
                student={
                  students.find((s) => s._id === selected._id) || selected
                }
                students={students}
                changeStudent={open}
                config={config}
                user={user}
                toast={toast}
                onDirty={setReportDirty}
              />
            ) : (
              <>
                <PageTitle
                  eyebrow="ASSESSMENT WORKSPACE"
                  title="Let’s start with a student."
                  subtitle="Choose a student to enter marks and see their report come to life."
                />
                <Students
                  students={students}
                  open={open}
                  reload={load}
                  toast={toast}
                  user={user}
                  compact
                />
              </>
            ))}
          {page === "bulk" && (
            <BulkReports
              students={students}
              config={config}
              user={user}
              toast={toast}
            />
          )}{" "}
          {page === "import" && <ImportStudents reload={load} toast={toast} />}{" "}
          {page === "users" && <UserAccess toast={toast} />}{" "}
          {page === "audit" && <AuditLog />}
          {page === "settings" && (
            <SchoolSettings
              config={config}
              setConfig={setConfig}
              user={user}
              setUser={setUser}
              toast={toast}
            />
          )}
        </div>
      </main>
      {notice && (
        <div className={"toast " + (notice.error ? "error" : "")} role="status">
          {notice.error ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}{" "}
          {notice.message}
          <button onClick={() => setNotice(null)} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
function CompanyBrand() {
  return (
    <div className="company-brand">
      <img
        src="/anvayrobo-logo.jpeg"
        alt="ANVAYROBO company logo"
        width="64"
        height="64"
      />
      <div>
        <span>Powered by</span>
        <strong>ANVAYROBO</strong>
        <small>AI · Robotics · STEM · Automation</small>
      </div>
    </div>
  );
}
function PageTitle({ eyebrow, title, subtitle, children }) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="title-actions">{children}</div>
    </div>
  );
}
function Dashboard({ students, config, open, go, user, toast }) {
  const groups = new Set(students.map((s) => s.className + "/" + s.section));
  return (
    <>
      <PageTitle
        eyebrow="YOUR SCHOOL, AT A GLANCE"
        title="Good to see you, educator."
        subtitle="A little less paperwork. A lot more progress."
      >
        <button className="btn primary" onClick={() => go("studio")}>
          <Plus size={17} /> Create report
        </button>
      </PageTitle>
      <div className="overview-stats">
        {[
          [Users, "Students", students.length, "In your accessible classes"],
          [School, "Class sections", groups.size, "Venus & Mars"],
          [
            BookOpen,
            "Academic session",
            config.session,
            "Two terms. One complete picture.",
          ],
        ].map(([Icon, label, value, detail]) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">
              {label}
              <span>
                <Icon size={19} />
              </span>
            </div>
            <strong>{value}</strong>
            <small>{detail}</small>
          </div>
        ))}
      </div>
      <section className="welcome-panel">
        <div>
          <span className="pill gold">MADE FOR YOUR SCHOOL</span>
          <h2>From marks to milestones.</h2>
          <p>
            Enter assessments on the left. Watch your school’s
            <br />
            signature report take shape on the right.
          </p>
          <button
            className="btn primary"
            onClick={() => (students[0] ? open(students[0]) : go("students"))}
          >
            Open report studio <ArrowRight size={16} />
          </button>
        </div>
        <div className="mini-report">
          <div className="mini-crest">
            <GraduationCap />
          </div>
          <b>SHREE RAM PUBLIC SCHOOL</b>
          <em>Progress Report</em>
          <div className="mini-lines" />
          <div className="mini-table" />
          <span>
            <CheckCircle2 size={15} /> A brighter way to report.
          </span>
        </div>
        <div className="welcome-circle" />
      </section>
      <div className="dashboard-grid">
        <section className="card">
          <div className="card-heading">
            <div>
              <h3>Student workspace</h3>
              <p>Pick up with a student.</p>
            </div>
            <button className="text-button" onClick={() => go("students")}>
              View all <ArrowRight size={15} />
            </button>
          </div>
          {students.length ? (
            students.slice(0, 5).map((s) => (
              <button
                className="student-quick"
                key={s._id}
                onClick={() => open(s)}
              >
                <div className="student-avatar">{s.name[0]}</div>
                <div>
                  <b>{s.name}</b>
                  <small>
                    {s.admissionNo} · Class {s.className}, {s.section}
                  </small>
                </div>
                <ChevronRight size={17} />
              </button>
            ))
          ) : (
            <Empty text="Add your first students" />
          )}
        </section>
        <section className="card steps-card">
          <div className="card-heading">
            <div>
              <h3>Your report workflow</h3>
              <p>Clear steps. Reliable records.</p>
            </div>
            <ShieldCheck size={22} />
          </div>
          {[
            ["01", "Bring students in", "Import your Excel sheet once."],
            [
              "02",
              "Assess with confidence",
              "Enter Term I & II with live totals.",
            ],
            [
              "03",
              "Review, publish, celebrate",
              "Approve reports and export to PDF.",
            ],
          ].map(([n, t, d]) => (
            <div className="workflow-step" key={n}>
              <span>{n}</span>
              <div>
                <b>{t}</b>
                <p>{d}</p>
              </div>
            </div>
          ))}
          <div className="privacy-note">
            <LockKeyhole size={17} /> Teachers see only their assigned classes.
          </div>
        </section>
      </div>
    </>
  );
}
function Students({ students, open, reload, toast, user, compact = false }) {
  const [q, setQ] = useState(""),
    [cls, setCls] = useState(""),
    [sec, setSec] = useState(""),
    [editing, setEditing] = useState(null);
  const filtered = students.filter(
    (s) =>
      (!cls || s.className === cls) &&
      (!sec || s.section === sec) &&
      `${s.name} ${s.admissionNo} ${s.house}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  async function archive(s) {
    if (!confirm(`Archive ${s.name}? Their existing reports remain stored.`))
      return;
    try {
      await api("/students/" + s._id, { method: "DELETE" });
      await reload();
      toast("Student archived");
    } catch (e) {
      toast(e.message, true);
    }
  }
  return (
    <>
      {!compact && (
        <PageTitle
          eyebrow="STUDENT DIRECTORY"
          title="Every student. One place."
          subtitle="Your student records, ready for assessment."
        >
          {user.role === "admin" && (
            <button className="btn primary" onClick={() => setEditing({})}>
              <Plus size={17} /> Add student
            </button>
          )}
        </PageTitle>
      )}
      <section className="card directory">
        <div className="filter-bar">
          <label className="search-box">
            <Search size={18} />
            <input
              placeholder="Search name, admission no. or house…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter class"
            value={cls}
            onChange={(e) => setCls(e.target.value)}
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter section"
            value={sec}
            onChange={(e) => setSec(e.target.value)}
          >
            <option value="">All sections</option>
            {sections.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>ADMISSION NO.</th>
                <th>CLASS & SECTION</th>
                <th>HOUSE</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className="student-cell">
                      <span className="student-avatar">{s.name[0]}</span>
                      <b>{s.name}</b>
                    </div>
                  </td>
                  <td>{s.admissionNo}</td>
                  <td>
                    Class {s.className}
                    <span className="muted"> · {s.section}</span>
                  </td>
                  <td>
                    <span
                      className={"house-pill " + (s.house || "").toLowerCase()}
                    >
                      {s.house || "Unassigned"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="text-button" onClick={() => open(s)}>
                        Open studio <ArrowRight size={15} />
                      </button>
                      {user.role === "admin" && (
                        <>
                          <button
                            className="icon-button"
                            title="Edit student"
                            onClick={() => setEditing(s)}
                          >
                            <PenLine size={16} />
                          </button>
                          <button
                            className="icon-button"
                            title="Archive student"
                            onClick={() => archive(s)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <Empty text="No students found" />}
        <div className="table-footer">
          {filtered.length} student{filtered.length !== 1 ? "s" : ""} · Records
          scoped to your access
        </div>
      </section>
      {editing && (
        <StudentModal
          student={editing}
          close={() => setEditing(null)}
          reload={reload}
          toast={toast}
        />
      )}
    </>
  );
}
function StudentModal({ student, close, reload, toast }) {
  const [data, setData] = useState({
      admissionNo: "",
      name: "",
      className: "6",
      section: "Venus",
      house: "Himalya",
      motherName: "",
      fatherName: "",
      dob: "",
      address: "",
      mobile: "",
      ...student,
    }),
    [busy, setBusy] = useState(false);
  const set = (k, v) => setData({ ...data, [k]: v });
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/students" + (student._id ? "/" + student._id : ""), {
        method: student._id ? "PUT" : "POST",
        body: data,
      });
      await reload();
      close();
      toast("Student saved");
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusy(false);
    }
  }
  async function photo(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const f = new FormData();
      f.append("file", file);
      set(
        "photo",
        (await api("/upload/photo", { method: "POST", body: f })).url,
      );
    } catch (e) {
      toast(e.message, true);
    }
  }
  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={save}>
        <div className="modal-head">
          <h2>{student._id ? "Edit student" : "Add a student"}</h2>
          <button type="button" className="icon-button" onClick={close}>
            <X />
          </button>
        </div>
        <div className="form-grid">
          {[
            ["admissionNo", "Admission number"],
            ["name", "Student name"],
            ["motherName", "Mother’s name"],
            ["fatherName", "Father’s name"],
            ["dob", "Date of birth"],
            ["mobile", "Mobile number"],
            ["address", "Address"],
          ].map(([k, label]) => (
            <Field key={k} label={label}>
              <input
                type={k === "dob" ? "date" : "text"}
                required={["admissionNo", "name"].includes(k)}
                value={data[k]}
                onChange={(e) => set(k, e.target.value)}
              />
            </Field>
          ))}
          <Field label="Class">
            <select
              value={data.className}
              onChange={(e) => set("className", e.target.value)}
            >
              {classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Section">
            <select
              value={data.section}
              onChange={(e) => set("section", e.target.value)}
            >
              {sections.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="House">
            <select
              value={data.house}
              onChange={(e) => set("house", e.target.value)}
            >
              {["Himalya", "Aravali", "Nilgiri", "Shivalik"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Student photo · PNG / JPG">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={photo}
            />
          </Field>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn" onClick={close}>
            Cancel
          </button>
          <button className="btn primary" disabled={busy}>
            {busy ? "Saving…" : "Save student"}
          </button>
        </div>
      </form>
    </div>
  );
}
function Studio({
  student,
  students,
  changeStudent,
  config: baseConfig,
  user,
  toast,
  onDirty,
}) {
  const [otherRemark, setOtherRemark] = useState(false);
  const [report, setReport] = useState(null),
    [config, setConfig] = useState(baseConfig),
    [session, setSession] = useState(baseConfig.session),
    [term, setTerm] = useState("term1"),
    [side, setSide] = useState("back"),
    [tab, setTab] = useState("marks"),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [pdfBusy, setPdfBusy] = useState(false),
    [zoom, setZoom] = useState(67),
    [loaded, setLoaded] = useState(false),
    [calibration, setCalibration] = useState(false),
    [calibrationMapping, setCalibrationMapping] = useState(templateMapping),
    [selectedField, setSelectedField] = useState("session");
  const load = async () => {
    setLoaded(false);
    try {
      const r = await api(`/reports/${student._id}/${session}`);
      setReport({
        ...r.report,
        marks: { term1: {}, term2: {}, ...r.report.marks },
      });
      setOtherRemark(false);
      setConfig(r.config || baseConfig);
      setDirty(false);
    } catch (e) {
      toast(e.message, true);
    } finally {
      setLoaded(true);
    }
  };
  useEffect(() => {
    load();
  }, [student._id, session]);
  useEffect(() => {
    const h = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  useEffect(() => {
    onDirty?.(dirty);
  }, [dirty]);
  const update = (r) => {
    setReport(r);
    setDirty(true);
  };
  async function save() {
    const errors = validateMarks(report.marks, config);
    if (errors.length) {
      toast(errors[0], true);
      return null;
    }
    setBusy(true);
    try {
      const r = await api(`/reports/${student._id}/${session}`, {
        method: "PUT",
        body: report,
      });
      setReport(r);
      setDirty(false);
      toast("Draft saved successfully");
      return r;
    } catch (e) {
      toast(e.message, true);
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function action(a) {
    let r = report;
    if (dirty) {
      r = await save();
      if (!r) return;
    }
    setBusy(true);
    try {
      const saved = await api(`/reports/${student._id}/${session}/${a}`, {
        method: "POST",
        body: { revision: r.revision },
      });
      setReport(saved);
      setDirty(false);
      if (a === "publish" && saved.configSnapshot) {
        setConfig(saved.configSnapshot);
      }
      toast(
        `Report ${a === "reopen" ? "reopened" : a === "submit" ? "submitted for review" : "published"}`,
      );
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusy(false);
    }
  }
  async function clearTerm() {
    if (
      !confirm(
        `Clear all ${term === "term1" ? "Term I" : "Term II"} marks? Save or cancel any other unsaved edits first.`,
      )
    )
      return;
    if (dirty) {
      toast("Save current changes before clearing a term", true);
      return;
    }
    if (!report._id) {
      update({ ...report, marks: { ...report.marks, [term]: {} } });
      return;
    }
    try {
      setReport(
        await api(`/reports/${student._id}/${session}/${term}`, {
          method: "DELETE",
          body: { revision: report.revision },
        }),
      );
      toast("Term cleared");
    } catch (e) {
      toast(e.message, true);
    }
  }
  async function pdf() {
    if (report.status === "published" && !report.templateSnapshot)
      return legacyPdf();
    setPdfBusy(true);
    try {
      let current = report;
      if (dirty || !report._id) {
        current = await save();
        if (!current) return;
      }
      await exportReportPdf(
        [{ student, report: current, config, user }],
        `SRPS_${student.admissionNo}_${session}.pdf`,
      );
      toast("Two-page PDF downloaded");
    } catch (e) {
      toast(e.message, true);
    } finally {
      setPdfBusy(false);
    }
  }
  async function legacyPdf() {
    setPdfBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      await document.fonts.ready;
      const nodes = [
        ...document.querySelectorAll("#print-area [data-report-page]"),
      ];
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      for (let i = 0; i < nodes.length; i++) {
        if (i) doc.addPage();
        const canvas = await html2canvas(nodes[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fff",
        });
        doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297);
      }
      doc.save(`SRPS_${student.admissionNo}_${session}.pdf`);
      toast("Two-page PDF downloaded");
    } catch (e) {
      toast("PDF export failed. Use Print / Save PDF instead.", true);
    } finally {
      setPdfBusy(false);
    }
  }
  if (!report || !loaded)
    return (
      <div className="loading-screen">
        <Loader2 className="spin" />
        Loading report…
      </div>
    );
  const calc = calculate(report.marks, config),
    locked = report.status !== "draft";
  return (
    <>
      <div className="studio-heading">
        <div>
          <div className="eyebrow">LIVE REPORT WORKSPACE</div>
          <h1>
            Report studio{" "}
            <span className={"status-badge " + report.status}>
              {report.status}
            </span>
          </h1>
          <p>
            <select
              className="student-switch"
              aria-label="Choose student"
              value={student._id}
              onChange={(e) => {
                if (dirty && !confirm("Discard unsaved changes?")) return;
                changeStudent(students.find((s) => s._id === e.target.value));
              }}
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} · {s.admissionNo}
                </option>
              ))}
            </select>
            <span>
              Class {student.className} · {student.section}
            </span>
          </p>
        </div>
        <div className="studio-actions">
          <select
            aria-label="Academic session"
            value={session}
            onChange={(e) => {
              if (!dirty || confirm("Discard unsaved changes?"))
                setSession(e.target.value);
            }}
          >
            {[...new Set([baseConfig.session, ...sessionOptions])].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            className="btn"
            onClick={() => printReports().catch((e) => toast(e.message, true))}
          >
            <Printer size={16} /> Print
          </button>
          <button className="btn" onClick={pdf} disabled={pdfBusy}>
            {pdfBusy ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <Download size={16} />
            )}{" "}
            PDF
          </button>
          {!locked && (
            <button className="btn primary" disabled={busy} onClick={save}>
              <Save size={16} />
              {busy ? "Saving…" : "Save draft"}
            </button>
          )}
        </div>
      </div>
      <div className="studio-split">
        <section className="editor-panel">
          <div className="editor-top">
            <div className="editor-label">
              <PenLine size={17} /> Assessment entry
            </div>
            <span className={"save-state " + (dirty ? "unsaved" : "")}>
              <span />
              {dirty ? "Unsaved changes" : "Up to date"}
            </span>
          </div>
          <div className="editor-tabs">
            {[
              ["marks", "Scholastic"],
              ["co", "Co-scholastic"],
              ["details", "Details"],
            ].map(([id, label]) => (
              <button
                key={id}
                className={tab === id ? "active" : ""}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
          {locked && (
            <div className="locked-note">
              <LockKeyhole size={16} />{" "}
              {report.status === "published"
                ? "Published report is locked."
                : "Submitted for principal review."}
            </div>
          )}
          {tab === "marks" && (
            <>
              <div className="term-switch">
                <button
                  onClick={() => setTerm("term1")}
                  className={term === "term1" ? "active" : ""}
                >
                  Term I
                </button>
                <button
                  onClick={() => setTerm("term2")}
                  className={term === "term2" ? "active" : ""}
                >
                  Term II
                </button>
              </div>
              <div className="entry-helper">
                Enter marks below. Totals and grades calculate instantly.
                <br />
                <b>AB</b> = absent · blank = not assessed
              </div>
              <div className="marks-entry">
                <table>
                  <thead>
                    <tr>
                      <th>SUBJECT</th>
                      {config.components.map((c) => (
                        <th key={c.id} title={c.label}>
                          {c.id === "periodic"
                            ? "PT"
                            : c.id === "notebook"
                              ? "NB"
                              : c.id === "enrichment"
                                ? "SE"
                                : "EXAM"}
                          <small>/{c.max}</small>
                        </th>
                      ))}
                      <th>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.subjects.map((s, i) => (
                      <tr key={s.id}>
                        <td>
                          <b>{s.name}</b>
                          <small>{calc.terms[term][i].grade}</small>
                        </td>
                        {config.components.map((c) => {
                          const v = report.marks?.[term]?.[s.id]?.[c.id] ?? "",
                            invalid =
                              v !== "AB" &&
                              v !== "" &&
                              (Number(v) < 0 || Number(v) > c.max);
                          return (
                            <td key={c.id}>
                              <MarkInput
                                label={`${term} ${s.name} ${c.label}`}
                                max={c.max}
                                disabled={locked}
                                value={v}
                                onChange={(value) =>
                                  update({
                                    ...report,
                                    marks: {
                                      ...report.marks,
                                      [term]: {
                                        ...report.marks?.[term],
                                        [s.id]: {
                                          ...report.marks?.[term]?.[s.id],
                                          [c.id]: value,
                                        },
                                      },
                                    },
                                  })
                                }
                              />
                            </td>
                          );
                        })}
                        <td>
                          <b className="row-total">
                            {calc.terms[term][i].total ?? "—"}
                          </b>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="entry-legend">
                <span>PT: Periodic test</span>
                <span>NB: Note books</span>
                <span>SE: Subject enrichment</span>
              </div>
              {!locked && (
                <button
                  className="text-button danger clear-term"
                  onClick={clearTerm}
                >
                  <Trash2 size={14} /> Clear{" "}
                  {term === "term1" ? "Term I" : "Term II"}
                </button>
              )}
            </>
          )}
          {tab === "co" && (
            <div className="co-editor">
              <h3>Learning beyond academics</h3>
              <p>A · B · C grading scale</p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ACTIVITY</th>
                    <th>TERM I</th>
                    <th>TERM II</th>
                  </tr>
                </thead>
                <tbody>
                  {config.activities.map((a) => (
                    <tr key={a}>
                      <td>{a}</td>
                      {["term1", "term2"].map((t) => (
                        <td key={t}>
                          <select
                            disabled={locked}
                            value={report.co?.[a]?.[t] || ""}
                            onChange={(e) =>
                              update({
                                ...report,
                                co: {
                                  ...report.co,
                                  [a]: {
                                    ...report.co?.[a],
                                    [t]: e.target.value,
                                  },
                                },
                              })
                            }
                          >
                            <option value="">—</option>
                            {["A", "B", "C"].map((g) => (
                              <option key={g}>{g}</option>
                            ))}
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === "details" && (
            <div className="details-editor">
              <h3>Student details</h3>
              <p>Automatically fetched from the student directory.</p>
              <dl>
                {[
                  ["Admission no.", student.admissionNo],
                  ["Name", student.name],
                  [
                    "Class / Section",
                    `${student.className} / ${student.section}`,
                  ],
                  ["House", student.house],
                  ["Mother", student.motherName],
                  ["Father", student.fatherName],
                  ["DOB", student.dob],
                  ["Mobile", student.mobile],
                ].map(([a, b]) => (
                  <div key={a}>
                    <dt>{a}</dt>
                    <dd>{b || "—"}</dd>
                  </div>
                ))}
              </dl>
              <Field label="Teacher’s remarks">
                <select
                  disabled={locked}
                  value={
                    otherRemark ||
                    (report.remarks && !teacherRemarks.includes(report.remarks))
                      ? "other"
                      : teacherRemarks.includes(report.remarks)
                        ? report.remarks
                        : ""
                  }
                  onChange={(e) => {
                    const other = e.target.value === "other";
                    setOtherRemark(other);
                    update({
                      ...report,
                      remarks: other
                        ? teacherRemarks.includes(report.remarks)
                          ? ""
                          : report.remarks || ""
                        : e.target.value,
                    });
                  }}
                >
                  <option value="" disabled>
                    Select a remark…
                  </option>
                  {teacherRemarks.map((remark) => (
                    <option key={remark} value={remark}>
                      {remark}
                    </option>
                  ))}
                  <option value="other">Other — write your own</option>
                </select>
              </Field>
              {(otherRemark ||
                (report.remarks &&
                  !teacherRemarks.includes(report.remarks))) && (
                <Field label="Write your own remark">
                  <textarea
                    autoFocus
                    disabled={locked}
                    placeholder="Write your remarks here…"
                    maxLength={1000}
                    value={report.remarks}
                    onChange={(e) =>
                      update({ ...report, remarks: e.target.value })
                    }
                    rows={4}
                  />
                </Field>
              )}
              <p className="hint">
                Upload signatures in Settings. Student photos are managed in the
                directory.
              </p>
            </div>
          )}
          <div className="editor-bottom">
            <div className="entry-summary">
              <div>
                <small>GRAND TOTAL</small>
                <strong>
                  {calc.total}
                  <span> / {calc.maximum}</span>
                </strong>
              </div>
              <div>
                <small>PERCENTAGE</small>
                <strong>
                  {calc.percentage === null ? "—" : calc.percentage + "%"}
                </strong>
              </div>
              <div>
                <small>RESULT</small>
                <b
                  className={
                    "result-chip " + (calc.result === "PASS" ? "pass" : "")
                  }
                >
                  {calc.result === "INCOMPLETE" ? "In progress" : calc.result}
                </b>
              </div>
            </div>
            {report.status === "draft" ? (
              <button
                className="btn full"
                onClick={() => action("submit")}
                disabled={busy}
              >
                <Send size={16} /> Submit for review
              </button>
            ) : ["admin", "principal"].includes(user.role) ? (
              <div className="review-actions">
                <button
                  className="btn"
                  disabled={busy}
                  onClick={() => action("reopen")}
                >
                  <RefreshCw size={16} /> Reopen
                </button>
                {report.status === "submitted" && (
                  <button
                    className="btn primary"
                    disabled={busy}
                    onClick={() => action("publish")}
                  >
                    <CheckCircle2 size={16} /> Publish report
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </section>
        <section className="preview-panel">
          <div className="preview-toolbar">
            <div>
              <span className="live-dot" />
              <b>Live preview</b>
              <small>Changes appear as you type</small>
            </div>
            <div className="preview-controls">
              <div className="side-toggle">
                <button
                  className={side === "front" ? "active" : ""}
                  onClick={() => setSide("front")}
                >
                  Front
                </button>
                <button
                  className={side === "back" ? "active" : ""}
                  onClick={() => setSide("back")}
                >
                  Back
                </button>
              </div>
              <select
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Preview zoom"
              >
                {[50, 60, 67, 75, 85, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}%
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Calibration
            user={user}
            report={report}
            side={side}
            mapping={calibrationMapping}
            setMapping={setCalibrationMapping}
            enabled={calibration}
            setEnabled={setCalibration}
            selected={selectedField}
            setSelected={setSelectedField}
            toast={toast}
          />
          <div className="preview-canvas">
            <div
              className="paper-wrapper"
              style={{ width: (794 * zoom) / 100, height: (1123 * zoom) / 100 }}
            >
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top left",
                }}
              >
                <ReportPage
                  side={side}
                  mapping={calibrationMapping}
                  calibration={calibration}
                  selected={selectedField}
                  onSelect={setSelectedField}
                  student={student}
                  report={report}
                  config={config}
                  user={user}
                />
              </div>
            </div>
          </div>
          <div className="preview-footer">
            <FileText size={14} /> A4 portrait · 2 pages{" "}
            <span>Approved artwork · proportional fit with margins</span>
          </div>
        </section>
      </div>
      <div id="print-area" aria-hidden="true">
        <ReportPage
          side="front"
          student={student}
          report={report}
          config={config}
          user={user}
        />
        <ReportPage
          side="back"
          student={student}
          report={report}
          config={config}
          user={user}
        />
      </div>
    </>
  );
}
function ImportStudents({ reload, toast }) {
  const [file, setFile] = useState(null),
    [preview, setPreview] = useState(null),
    [update, setUpdate] = useState(false),
    [busy, setBusy] = useState(false);
  async function template() {
    try {
      if (!isDemo())
        return await download(
          "/import/template",
          "SRPS_Student_Import_Template.xlsx",
        );
      const { default: ExcelJS } = await import("exceljs");
      const w = new ExcelJS.Workbook(),
        s = w.addWorksheet("Students");
      s.addRow([
        "admissionNo",
        "name",
        "className",
        "section",
        "house",
        "motherName",
        "fatherName",
        "dob",
        "address",
        "mobile",
      ]);
      s.addRow([
        "SAMPLE-001",
        "Sample Student",
        "6",
        "Venus",
        "Himalya",
        "Mother Name",
        "Father Name",
        "2014-12-25",
        "Village, District",
        "9000000000",
      ]);
      s.columns.forEach((c) => (c.width = 22));
      saveBlob(
        new Blob([await w.xlsx.writeBuffer()]),
        "SRPS_Student_Import_Template.xlsx",
      );
    } catch (e) {
      toast(e.message, true);
    }
  }
  async function process(commit = false) {
    if (!file) return;
    setBusy(true);
    try {
      const f = new FormData();
      f.append("file", file);
      const result = await api(`/import?commit=${commit}&update=${update}`, {
        method: "POST",
        body: f,
      });
      if (commit) {
        toast(
          `${result.created} added · ${result.updated} updated · ${result.skipped} skipped`,
        );
        setPreview(null);
        setFile(null);
        await reload();
      } else setPreview(result);
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="EXCEL → STUDENT DIRECTORY"
        title="Bring your students in, together."
        subtitle="Upload once. Validate first. Start reporting."
      >
        <button className="btn" onClick={template}>
          <Download size={17} /> Download Excel template
        </button>
      </PageTitle>
      <section className="card import-card">
        <div className="upload-target">
          <span>
            <Upload size={30} />
          </span>
          <h2>One sheet. All your students.</h2>
          <p>
            Select the completed .xlsx template. Maximum 2,000 rows and 5 MB.
          </p>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setPreview(null);
            }}
          />
          <small>
            Classes 1–12 · Sections Venus / Mars · Dates as YYYY-MM-DD
          </small>
        </div>
        <div className="import-rules">
          <h3>A clean start, every time.</h3>
          <p>
            <CheckCircle2 /> Required fields and class sections validated
          </p>
          <p>
            <CheckCircle2 /> Duplicate admission numbers identified
          </p>
          <p>
            <CheckCircle2 /> Preview before anything is saved
          </p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={update}
              onChange={(e) => setUpdate(e.target.checked)}
            />{" "}
            Update matching admission numbers (otherwise skip)
          </label>
          <button
            className="btn primary"
            disabled={!file || busy}
            onClick={() => process(false)}
          >
            {busy ? <Loader2 className="spin" size={17} /> : <Eye size={17} />}{" "}
            Validate & preview
          </button>
        </div>
      </section>
      {preview && (
        <section className="card">
          <div className="card-heading">
            <div>
              <h3>{preview.count} students found</h3>
              <p>
                {preview.errors.length} validation errors ·{" "}
                {preview.duplicates.length} existing admission numbers
              </p>
            </div>
            <button
              className="btn primary"
              disabled={busy || preview.errors.length > 0}
              onClick={() => process(true)}
            >
              <Check size={17} /> Confirm import
            </button>
          </div>
          {preview.errors.map((e, i) => (
            <p className="inline-error" key={i}>
              Row {e.row}: {e.error}
            </p>
          ))}
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {[
                    "Admission No.",
                    "Student",
                    "Class",
                    "Section",
                    "House",
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 30).map((s, i) => (
                  <tr key={i}>
                    <td>{s.admissionNo}</td>
                    <td>{s.name}</td>
                    <td>{s.className}</td>
                    <td>{s.section}</td>
                    <td>{s.house}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint">Preview shows the first 30 rows.</p>
        </section>
      )}
    </>
  );
}
function UserAccess({ toast }) {
  const [users, setUsers] = useState([]),
    [add, setAdd] = useState(false),
    [form, setForm] = useState({
      name: "",
      email: "",
      password: "",
      role: "teacher",
      className: "6",
      section: "Venus",
    }),
    [editing, setEditing] = useState(null),
    [assignments, setAssignments] = useState([]),
    [ac, setAc] = useState("6"),
    [as, setAs] = useState("Venus");
  const load = () =>
    api("/users")
      .then(setUsers)
      .catch((e) => toast(e.message, true));
  useEffect(() => {
    load();
  }, []);
  async function create(e) {
    e.preventDefault();
    try {
      await api("/users", {
        method: "POST",
        body: {
          ...form,
          assignments:
            form.role === "teacher"
              ? [{ className: form.className, section: form.section }]
              : [],
        },
      });
      setAdd(false);
      load();
      toast("Staff account created");
    } catch (e) {
      toast(e.message, true);
    }
  }
  async function saveAccess() {
    try {
      await api("/users/" + editing._id, {
        method: "PUT",
        body: { assignments },
      });
      setEditing(null);
      load();
      toast("Access updated");
    } catch (e) {
      toast(e.message, true);
    }
  }
  async function toggle(u) {
    if (!confirm(`${u.active ? "Disable" : "Enable"} ${u.name}'s account?`))
      return;
    try {
      await api("/users/" + u._id, {
        method: "PUT",
        body: { active: !u.active },
      });
      load();
    } catch (e) {
      toast(e.message, true);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="THE RIGHT ACCESS, FOR EVERY EDUCATOR"
        title="Your team. Clear permissions."
        subtitle="Administrators manage. Principals approve. Teachers assess assigned classes."
      >
        <button className="btn primary" onClick={() => setAdd(true)}>
          <Plus size={17} /> Add staff account
        </button>
      </PageTitle>
      <div className="role-cards">
        {[
          ["Administrator", "Students, imports, users and all reports"],
          ["Principal", "Review, publish and reopen all reports"],
          ["Class teacher", "Marks for assigned class–sections only"],
        ].map(([t, d]) => (
          <section className="card" key={t}>
            <ShieldCheck />
            <h3>{t}</h3>
            <p>{d}</p>
          </section>
        ))}
      </div>
      <section className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>STAFF MEMBER</th>
              <th>ROLE</th>
              <th>ASSIGNED CLASSES</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <b>{u.name}</b>
                  <small className="block muted">{u.email}</small>
                </td>
                <td className="capitalize">{u.role}</td>
                <td>
                  {u.assignments
                    ?.map((a) => `${a.className} · ${a.section}`)
                    .join(", ") || "All classes"}
                </td>
                <td>
                  <span className={"pill " + (u.active ? "green" : "")}>
                    {u.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td>
                  <button
                    className="text-button"
                    onClick={() => {
                      setEditing(u);
                      setAssignments(u.assignments || []);
                    }}
                  >
                    Manage access
                  </button>
                  <button
                    className="icon-button"
                    title="Enable / disable account"
                    onClick={() => toggle(u)}
                  >
                    <LockKeyhole size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {add && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={create}>
            <div className="modal-head">
              <h2>Add staff account</h2>
              <button
                type="button"
                className="icon-button"
                onClick={() => setAdd(false)}
              >
                <X />
              </button>
            </div>
            <div className="form-grid">
              {[
                ["name", "Full name"],
                ["email", "Staff email"],
                ["password", "Temporary password (6–20 characters)"],
              ].map(([k, label]) => (
                <Field key={k} label={label}>
                  <input
                    required
                    minLength={k === "password" ? PASSWORD_MIN : undefined}
                    maxLength={k === "password" ? PASSWORD_MAX : undefined}
                    type={
                      k === "password"
                        ? "password"
                        : k === "email"
                          ? "email"
                          : "text"
                    }
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
                </Field>
              ))}
              <Field label="Role">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {["teacher", "principal", "admin"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              {form.role === "teacher" && (
                <>
                  <Field label="Class">
                    <select
                      value={form.className}
                      onChange={(e) =>
                        setForm({ ...form, className: e.target.value })
                      }
                    >
                      {classes.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Section">
                    <select
                      value={form.section}
                      onChange={(e) =>
                        setForm({ ...form, section: e.target.value })
                      }
                    >
                      {sections.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn primary">Create account</button>
            </div>
          </form>
        </div>
      )}
      {editing && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head">
              <h2>{editing.name} · Access</h2>
              <button className="icon-button" onClick={() => setEditing(null)}>
                <X />
              </button>
            </div>
            <div className="access-editor">
              {editing.role !== "teacher" ? (
                <p>Administrators and principals have access to all classes.</p>
              ) : (
                <>
                  <p>Assign one or more class–section pairs.</p>
                  {assignments.map((a, i) => (
                    <div className="assignment" key={i}>
                      Class {a.className} · {a.section}
                      <button
                        className="icon-button"
                        onClick={() =>
                          setAssignments(assignments.filter((_, j) => j !== i))
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="row-actions">
                    <select value={ac} onChange={(e) => setAc(e.target.value)}>
                      {classes.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <select value={as} onChange={(e) => setAs(e.target.value)}>
                      {sections.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      className="btn"
                      onClick={() => {
                        if (
                          !assignments.some(
                            (a) => a.className === ac && a.section === as,
                          )
                        )
                          setAssignments([
                            ...assignments,
                            { className: ac, section: as },
                          ]);
                      }}
                    >
                      <Plus size={16} /> Assign
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn primary" onClick={saveAccess}>
                Save access
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function AuditLog() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api("/audit").then(setRows);
  }, []);
  return (
    <>
      <PageTitle
        eyebrow="ACCOUNTABILITY, BUILT IN"
        title="A clear record of every change."
        subtitle="The latest 200 account, student and report actions."
      />
      <section className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>WHEN</th>
              <th>STAFF MEMBER</th>
              <th>ACTION</th>
              <th>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r._id || i}>
                <td>{new Date(r.createdAt).toLocaleString("en-IN")}</td>
                <td>{r.actor?.name || "System"}</td>
                <td>{r.action}</td>
                <td>{r.details || r.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty text="No activity yet" />}
      </section>
    </>
  );
}
function SchoolSettings({ config, setConfig, user, setUser, toast }) {
  const [data, setData] = useState(config),
    [current, setCurrent] = useState(""),
    [password, setPassword] = useState(""),
    [profileClass, setProfileClass] = useState("6"),
    [profileText, setProfileText] = useState(
      (config.profiles?.["6"] || config.subjects).map((s) => s.name).join("\n"),
    );
  async function save(e) {
    e.preventDefault();
    try {
      const c = await api("/config", { method: "PUT", body: data });
      setConfig(c);
      toast("School settings saved");
    } catch (e) {
      toast(e.message, true);
    }
  }
  async function upload(e, kind, principal = false) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const form = new FormData();
      form.append("file", file);
      const { url } = await api("/upload/" + (principal ? "principal" : kind), {
        method: "POST",
        body: form,
      });
      if (principal) {
        setData({ ...data, principalSignature: url });
        toast("Signature uploaded. Save school settings to apply.");
      } else if (kind === "logo") setData({ ...data, logo: url });
      else {
        setUser({ ...user, signature: url });
        toast("Your signature is saved");
      }
    } catch (e) {
      toast(e.message, true);
    }
  }
  async function changePassword(e) {
    e.preventDefault();
    try {
      await api("/auth/password", {
        method: "PUT",
        body: { current, password },
      });
      setUser(null);
    } catch (e) {
      toast(e.message, true);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="SCHOOL IDENTITY & PREFERENCES"
        title="Make it your school’s own."
        subtitle="School information, academic session and signatures."
      />
      <div className="settings-grid">
        {user.role === "admin" && (
          <form className="card" onSubmit={save}>
            <div className="card-heading">
              <h3>School profile</h3>
            </div>
            <div className="form-grid">
              {[
                ["schoolName", "School name"],
                ["address", "School address"],
                ["affiliation", "CBSE affiliation number"],
                ["phone", "Phone"],
                ["phone2", "Alternate phone"],
                ["email", "School email"],
                ["website", "Website"],
                ["session", "Academic session (YYYY-YY)"],
              ].map(([k, label]) => (
                <Field key={k} label={label}>
                  <input
                    required
                    value={data[k] || ""}
                    onChange={(e) => setData({ ...data, [k]: e.target.value })}
                  />
                </Field>
              ))}
              <Field label="School logo">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => upload(e, "logo")}
                />
              </Field>
              <Field label="Principal signature · transparent PNG recommended">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => upload(e, "signature", true)}
                />
              </Field>
              {data.principalSignature && (
                <img
                  className="signature-preview"
                  src={data.principalSignature}
                  alt="Principal signature"
                />
              )}
            </div>
            <div className="subject-profile-editor">
              <h3>Class subject profiles</h3>
              <p>
                Set subjects for each class, including XI/XII. Existing marks
                use subject IDs; do not rename subjects after assessments start.
              </p>
              <select
                value={profileClass}
                onChange={(e) => {
                  setProfileClass(e.target.value);
                  setProfileText(
                    (data.profiles?.[e.target.value] || config.subjects)
                      .map((s) => s.name)
                      .join("\n"),
                  );
                }}
              >
                {classes.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
              <textarea
                rows={7}
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                aria-label="One subject per line"
              />
              <button
                className="btn"
                type="button"
                onClick={() => {
                  const names = profileText
                    .split("\n")
                    .map((x) => x.trim())
                    .filter(Boolean);
                  if (!names.length || names.length > 12)
                    return toast("Enter 1–12 subjects", true);
                  const subjects = names.map((n) => {
                    const found = config.subjects.find(
                      (s) => s.name.toUpperCase() === n.toUpperCase(),
                    );
                    return (
                      found || {
                        id: n
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "_")
                          .slice(0, 40),
                        name: n.toUpperCase(),
                        icon: "BookOpen",
                      }
                    );
                  });
                  setData({
                    ...data,
                    profiles: { ...data.profiles, [profileClass]: subjects },
                  });
                  toast(
                    "Subject profile staged. Save school settings to apply.",
                  );
                }}
              >
                Apply class profile
              </button>
            </div>
            <div className="card-footer">
              <button className="btn primary">
                <Save size={17} /> Save school settings
              </button>
            </div>
          </form>
        )}
        <div>
          <section className="card profile-card">
            <div className="card-heading">
              <h3>Your signature</h3>
              <PenLine size={20} />
            </div>
            <p>
              Used in the class-teacher signature space when you prepare
              reports. Upload a clear PNG or JPG, up to 5 MB.
            </p>
            {user.signature ? (
              <img
                className="signature-preview"
                src={user.signature}
                alt="Your signature"
              />
            ) : (
              <div className="signature-empty">
                Your signature will appear here
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => upload(e, "signature")}
            />
          </section>
          <form className="card profile-card" onSubmit={changePassword}>
            <div className="card-heading">
              <h3>Change password</h3>
              <LockKeyhole size={20} />
            </div>
            <Field label="Current password">
              <input
                type="password"
                required
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </Field>
            <Field label="New password · 6–20 characters">
              <input
                type="password"
                minLength={PASSWORD_MIN}
                maxLength={PASSWORD_MAX}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <button className="btn">Update & sign out</button>
          </form>
          <section className="card profile-card">
            <h3>Result export</h3>
            <p>Download a consolidated result workbook for this session.</p>
            <button
              className="btn"
              onClick={async () => {
                try {
                  if (isDemo())
                    return toast(
                      "Result workbook export is available with the MongoDB server.",
                    );
                  await download(
                    "/export?session=" + config.session,
                    "SRPS_Results.xlsx",
                  );
                } catch (e) {
                  toast(e.message, true);
                }
              }}
            >
              <Download size={16} /> Export results
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
function BulkReports({ students, config, user, toast }) {
  const [cls, setCls] = useState("6"),
    [sec, setSec] = useState("Venus"),
    [session, setSession] = useState(config.session),
    [records, setRecords] = useState([]),
    [busy, setBusy] = useState(false);
  async function prepare() {
    setBusy(true);
    try {
      const selected = students.filter(
        (s) => s.className === cls && s.section === sec,
      );
      if (selected.length > 50)
        throw new Error("Print in batches of up to 50 students");
      const list = [];
      for (const s of selected) {
        const data = await api(`/reports/${s._id}/${session}`);
        if (data.report.status === "published")
          list.push({ student: s, ...data });
      }
      setRecords(list);
      toast(
        `${list.length} published reports prepared; ${selected.length - list.length} unpublished reports skipped.`,
      );
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="PRINT A CLASS, TOGETHER"
        title="Published reports, ready to go."
        subtitle="Select a class and section. Only approved, published reports are included."
      />
      <section className="card">
        <div className="filter-bar">
          <select
            value={cls}
            onChange={(e) => {
              setCls(e.target.value);
              setRecords([]);
            }}
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
          <select
            value={sec}
            onChange={(e) => {
              setSec(e.target.value);
              setRecords([]);
            }}
          >
            {sections.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={session}
            onChange={(e) => {
              setSession(e.target.value);
              setRecords([]);
            }}
          >
            {[...new Set([config.session, ...sessionOptions])].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button className="btn primary" onClick={prepare} disabled={busy}>
            {busy ? (
              <Loader2 className="spin" size={16} />
            ) : (
              <FileText size={16} />
            )}{" "}
            Prepare reports
          </button>
          <button
            className="btn"
            disabled={!records.length}
            onClick={() => printReports().catch((e) => toast(e.message, true))}
          >
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
        <button
          className="btn"
          disabled={!records.length || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await exportReportPdf(
                records.map((r) => ({ ...r, user })),
                `SRPS_class_${cls}_${sec}_${session}.pdf`,
                true,
              );
            } catch (e) {
              toast(e.message, true);
            } finally {
              setBusy(false);
            }
          }}
        >
          Download bulk PDF
        </button>
        {records.map((r) => (
          <div className="bulk-row" key={r.student._id}>
            <CheckCircle2 size={18} />
            <b>{r.student.name}</b>
            <span>{r.student.admissionNo}</span>
            <span>2 pages · Published</span>
          </div>
        ))}
        {!records.length && <Empty text="Prepare your published reports" />}
      </section>
      <div id="print-area" aria-hidden="true">
        {records.flatMap((r) =>
          ["front", "back"].map((side) => (
            <ReportPage
              key={r.student._id + side}
              side={side}
              student={r.student}
              report={r.report}
              config={r.config}
              user={user}
            />
          )),
        )}
      </div>
    </>
  );
}

function MarkInput({ label, max, disabled, value, onChange }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const invalid =
    text !== "" &&
    text !== "AB" &&
    (text === "A" ||
      !Number.isFinite(Number(text)) ||
      Number(text) < 0 ||
      Number(text) > max);
  const canStep =
    text === "" ||
    (text !== "A" && text !== "AB" && Number.isFinite(Number(text)));
  const stepMark = (direction) => {
    if (disabled || !canStep) return;
    const next = Math.max(
      0,
      Math.min(
        max,
        Math.round((Number(text || 0) + direction * 0.5) * 100) / 100,
      ),
    );
    setText(String(next));
    onChange(next);
  };
  return (
    <input
      aria-label={label}
      aria-invalid={invalid}
      className={invalid ? "invalid" : ""}
      disabled={disabled}
      value={text}
      placeholder="—"
      inputMode="decimal"
      title={`Enter 0–${max}; ↑ / ↓ changes by 0.5. AB = absent.`}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          stepMark(e.key === "ArrowUp" ? 1 : -1);
        }
      }}
      onChange={(e) => {
        const raw = e.target.value.toUpperCase();
        if (
          !["", "A", "AB"].includes(raw) &&
          !/^\d{0,3}(\.\d{0,2})?$/.test(raw)
        )
          return;
        if (
          !["", "A", "AB"].includes(raw) &&
          (!Number.isFinite(Number(raw)) || Number(raw) > max)
        )
          return;
        setText(raw);
        onChange(["", "A", "AB"].includes(raw) ? raw : Number(raw));
      }}
    />
  );
}
