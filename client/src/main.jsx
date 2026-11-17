import { PASSWORD_MIN, PASSWORD_MAX } from "../../shared/password-policy.js";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer, toast as notify } from "react-toastify";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Upload,
  Settings,
  ShieldCheck,
  History,
  ClipboardCheck,
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
  Power,
  Send,
  Eye,
  CheckCircle2,
  X,
  Menu,
  PenLine,
  Loader2,
  School,
  LockKeyhole,
  ExternalLink,
  SquareArrowOutUpRight,
  Mountain,
  Flame,
  Trees,
  Sun,
  HardDrive,
  Folder,
  ChevronLeft,
  LayoutGrid,
  List,
  Clock3,
  ArrowUpDown,
  Mail,
  CheckCheck,
  BarChart3,
  Trophy,
  Sparkles,
  TrendingUp,
  AlertTriangle,
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
import VerifyReport from "./VerifyReport";
import BulkWhatsappModal from "./BulkWhatsappModal";
import GrowthChart from "./GrowthChart";
import SmartRemarks from "./SmartRemarks";
import ClassAnalytics from "./ClassAnalytics";
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
import "react-toastify/dist/ReactToastify.css";
const classes = Array.from({ length: 12 }, (_, i) => String(i + 1)),
  sections = ["Venus", "Mars"];
const ROLE_MODULES = {
  teacher: ["overview", "students", "studio", "bulk", "settings"],
  principal: ["overview", "students", "studio", "review", "bulk", "settings", "audit"],
};
const MODULE_LABELS = [
  ["overview", "Overview"], ["students", "Students"], ["studio", "Report studio"],
  ["review", "Report Review"], ["bulk", "Bulk print / export"],
  ["settings", "Settings"], ["audit", "Activity log"],
];
const ACTION_LABELS = [
  ["studentCreate", "Add students"], ["studentEdit", "Edit student details"],
  ["studentStatus", "Disable / enable students"], ["studentDelete", "Permanently delete students"],
  ["studentWhatsapp", "Send reports by WhatsApp"],
  ["studentEmail", "Send reports by email"],
];
const hasModule = (user, id) => user.role === "admin" ||
  (Array.isArray(user.moduleAccess) ? user.moduleAccess : ROLE_MODULES[user.role] || []).includes(id);
const canOpenPage = (user, id) => hasModule(user, id === "dashboard" || id === "analytics" ? "overview" : id);
const hasStudentAction = (user, id) => user.role === "admin" ||
  (Array.isArray(user.studentActions) ? user.studentActions : user.role === "teacher" ? ACTION_LABELS.map(([key]) => key) : user.role === "principal" ? ["studentWhatsapp", "studentEmail"] : []).includes(id);
const HOUSE_BADGES = {
  himalya: { label: "Himalaya", className: "himalya", Icon: Mountain },
  himalaya: { label: "Himalaya", className: "himalya", Icon: Mountain },
  arawali: { label: "Arawali", className: "aravali", Icon: Flame },
  aravali: { label: "Arawali", className: "aravali", Icon: Flame },
  nilgiri: { label: "Nilgiri", className: "nilgiri", Icon: Trees },
  shivalik: { label: "Shivalik", className: "shivalik", Icon: Sun },
};
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
function WhatsAppDeliveryBadge({ statusObj, compact = false }) {
  if (!statusObj?.published || (!statusObj?.sentAt && !statusObj?.whatsappDeliveryStatus)) {
    return compact ? null : <span style={{ color: "#94a3b8", fontSize: 11 }}>—</span>;
  }
  const status = statusObj.whatsappDeliveryStatus || (statusObj.sentAt ? "sent" : null);
  if (!status) return compact ? null : <span style={{ color: "#94a3b8", fontSize: 11 }}>Not sent</span>;

  if (status === "read") {
    return (
      <span
        className="wa-status-badge read"
        title={`Viewed by parent${statusObj.whatsappReadAt ? ` on ${new Date(statusObj.whatsappReadAt).toLocaleString()}` : ""}`}
      >
        <CheckCheck size={14} className="blue-tick" /> {compact ? "Read" : `Read ${statusObj.whatsappReadAt ? new Date(statusObj.whatsappReadAt).toLocaleDateString() : ""}`}
      </span>
    );
  }
  if (status === "delivered") {
    return (
      <span
        className="wa-status-badge delivered"
        title={`Delivered to parent phone${statusObj.whatsappDeliveredAt ? ` on ${new Date(statusObj.whatsappDeliveredAt).toLocaleString()}` : ""}`}
      >
        <CheckCheck size={14} /> {compact ? "Delivered" : `Delivered ${statusObj.whatsappDeliveredAt ? new Date(statusObj.whatsappDeliveredAt).toLocaleDateString() : ""}`}
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span
        className="wa-status-badge failed"
        title={statusObj.whatsappFailureReason || "Delivery failed"}
      >
        <X size={14} /> Failed
      </span>
    );
  }
  return (
    <span
      className="wa-status-badge sent"
      title={`Sent on ${statusObj.sentAt ? new Date(statusObj.sentAt).toLocaleString() : "WhatsApp"}`}
    >
      <Clock3 size={13} /> {compact ? "Sent" : `Sent ${statusObj.sentAt ? new Date(statusObj.sentAt).toLocaleDateString() : ""}`}
    </span>
  );
}
function WhatsAppIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M16 2.4A13.4 13.4 0 0 0 4.55 22.75L2.8 29.2l6.62-1.72A13.4 13.4 0 1 0 16 2.4Z"
      />
      <path
        fill="#fff"
        d="M23.54 19.1c-.4-.2-2.34-1.15-2.7-1.28-.36-.14-.62-.2-.88.2-.26.4-1.02 1.28-1.25 1.55-.23.26-.46.3-.86.1-.4-.2-1.7-.63-3.23-2-1.2-1.06-2-2.37-2.23-2.77-.23-.4-.02-.62.18-.82.18-.18.4-.46.6-.69.2-.23.26-.4.4-.66.13-.26.06-.5-.04-.69-.1-.2-.89-2.14-1.22-2.93-.32-.76-.64-.66-.88-.67l-.75-.01c-.26 0-.69.1-1.05.5-.36.4-1.38 1.35-1.38 3.29s1.42 3.81 1.62 4.07c.2.26 2.8 4.28 6.8 6 .95.41 1.69.66 2.27.84.95.3 1.82.26 2.5.16.76-.11 2.34-.96 2.67-1.88.33-.92.33-1.71.23-1.88-.1-.16-.36-.26-.76-.46Z"
      />
    </svg>
  );
}
function App() {
  const [user, setUser] = useState(null),
    [checking, setChecking] = useState(true),
    [page, setPage] = useState("dashboard"),
    [students, setStudents] = useState([]),
    [config, setConfig] = useState(DEFAULT_CONFIG),
    [selected, setSelected] = useState(null),
    [sidebar, setSidebar] = useState(false),
    [reportDirty, setReportDirty] = useState(false);
  const navigate = (id) => {
    if (reportDirty && !confirm("Discard unsaved report changes?")) return;
    setReportDirty(false);
    setPage(id);
  };
  const toast = (message, error = false) => {
    if (error) notify.error(message);
    else notify.success(message);
  };
  useEffect(() => {
    api("/auth/me")
      .then((currentUser) => {
        setUser(currentUser);
        const firstPage = ["dashboard", "students", "studio", "review", "bulk", "settings", "audit"]
          .find((id) => canOpenPage(currentUser, id));
        setPage(firstPage || "dashboard");
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);
  async function load(forUser = user) {
    const [s, c] = await Promise.all([
      !forUser || hasModule(forUser, "students") ? api("/students") : Promise.resolve([]),
      api("/config"),
    ]);
    setStudents(s);
    setConfig(c);
  }
  useEffect(() => {
    if (user) load().catch((e) => toast(e.message, true));
  }, [user]);
  useEffect(() => {
    const expireSession = () => {
      setUser(null);
      setStudents([]);
      setSelected(null);
      setPage("dashboard");
    };
    window.addEventListener("srps:session-expired", expireSession);
    return () => window.removeEventListener("srps:session-expired", expireSession);
  }, []);
  useEffect(() => {
    if (user && !canOpenPage(user, page)) {
      const firstPage = ["dashboard", "students", "studio", "review", "bulk", "settings", "audit"]
        .find((id) => canOpenPage(user, id));
      setPage(firstPage || "dashboard");
    }
  }, [user, page]);
  const open = (s) => {
    setSelected(s);
    setPage("studio");
  };
  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
    setSelected(null);
  }
  const verifyMatch = window.location.pathname.match(
    /^\/verify\/([a-f0-9]{24})\/(\d{4}-\d{2})\/([a-f0-9]{16})/i,
  );
  if (verifyMatch) {
    return (
      <VerifyReport
        studentId={verifyMatch[1]}
        session={verifyMatch[2]}
        signature={verifyMatch[3]}
      />
    );
  }
  if (checking)
    return (
      <div className="loading-screen">
        <Loader2 className="spin" /> Opening Report Studio…
      </div>
    );
  if (location.hash.startsWith("#reset-password=") || !user)
    return <Login onLogin={setUser} toast={toast} />;
  const nav = [
    ["dashboard", "Overview", LayoutDashboard],
    ["analytics", "Class Analytics", BarChart3],
    ["students", "Students", Users],
    ["studio", "Report studio", BookOpen],
    ...(!isDemo() && ["admin", "principal"].includes(user.role)
      ? [["review", "Report Review", ClipboardCheck]]
      : []),
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
    ...(user.role === "admin" ? [["drive", "Report Drive", HardDrive]] : []),
    ["settings", "Settings", Settings],
  ].filter(([id]) => canOpenPage(user, id));
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
          {page === "analytics" && (
            <ClassAnalytics
              session={config.session}
              config={config}
              user={user}
              toast={toast}
              openStudent={open}
            />
          )}
          {page === "students" && (
            <Students
              students={students}
              open={open}
              reload={load}
              toast={toast}
              user={user}
              session={config.session}
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
                  session={config.session}
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
          {page === "review" && (
            <ReportReview session={config.session} open={open} toast={toast} user={user} />
          )}
          {page === "audit" && <AuditLog />}
          {page === "drive" && <ReportDrive toast={toast} />}
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
        {hasModule(user, "studio") && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn" onClick={() => go("analytics")}>
              <BarChart3 size={17} /> Class Analytics
            </button>
            <button className="btn primary" onClick={() => go("studio")}>
              <Plus size={17} /> Create report
            </button>
          </div>
        )}
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
          {hasModule(user, "studio") && <button
            className="btn primary"
            onClick={() => (students[0] ? open(students[0]) : go("students"))}
          >
            Open report studio <ArrowRight size={16} />
          </button>}
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
        {hasModule(user, "studio") && <section className="card">
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
        </section>}
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
function Students({ students, open, reload, toast, user, session, compact = false }) {
  const [q, setQ] = useState(""),
    [cls, setCls] = useState(""),
    [sec, setSec] = useState(""),
    [editing, setEditing] = useState(null),
    [status, setStatus] = useState("active"),
    [shown, setShown] = useState(students),
    [statusBusy, setStatusBusy] = useState(false),
    [reportStatuses, setReportStatuses] = useState({}),
    [whatsappBusyId, setWhatsappBusyId] = useState(""),
    [emailBusyId, setEmailBusyId] = useState("");
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const rows =
          status === "active"
            ? students
            : await api("/students?status=disabled");
        if (!cancelled) setShown(rows);
      } catch (e) {
        if (!cancelled) toast(e.message, true);
      }
    };
    refresh();
    return () => {
      cancelled = true;
    };
  }, [students, status]);
  useEffect(() => {
    if (!hasStudentAction(user, "studentWhatsapp") && !hasStudentAction(user, "studentEmail")) {
      setReportStatuses({});
      return;
    }
    let cancelled = false;
    const fetchStatus = () => {
      api(`/student-report-status?session=${encodeURIComponent(session)}`)
        .then((data) => {
          if (!cancelled) setReportStatuses(data);
        })
        .catch(() => {});
    };
    fetchStatus();
    const timer = setInterval(fetchStatus, 8000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [session, students, user.role, user.studentActions]);
  const filtered = shown.filter(
    (s) =>
      (!cls || s.className === cls) &&
      (!sec || s.section === sec) &&
      `${s.name} ${s.admissionNo} ${s.house}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const canManageStudents = ["admin", "teacher", "principal"].includes(user.role);
  async function toggleStatus(s) {
    const enable = !s.active;
    if (
      !confirm(
        `${enable ? "Enable" : "Disable"} ${s.name}? Existing reports will remain stored.`,
      )
    )
      return;
    setStatusBusy(true);
    try {
      await api(`/students/${s._id}/status`, {
        method: "PATCH",
        body: { active: enable },
      });
      await reload();
      if (status === "disabled") {
        const rows = await api("/students?status=disabled");
        setShown(rows);
      }
      toast(enable ? "Student enabled" : "Student disabled");
    } catch (e) {
      toast(e.message, true);
    } finally {
      setStatusBusy(false);
    }
  }
  async function permanentlyDelete(s) {
    if (
      !confirm(
        `Permanently delete ${s.name} (${s.admissionNo}) and all of their report cards? This cannot be undone.`,
      )
    )
      return;
    try {
      await api(`/students/${s._id}`, { method: "DELETE" });
      await reload();
      if (status === "disabled")
        setShown(await api("/students?status=disabled"));
      toast("Student and all associated reports permanently deleted");
    } catch (e) {
      toast(e.message, true);
    }
  }
  async function sendStudentReport(s) {
    const reportState = reportStatuses[String(s._id)];
    if (!reportState?.published) return;
    if (
      !confirm(
        `${reportState.sentAt ? "Resend" : "Send"} ${s.name}'s published, password-locked report to the saved parent/guardian WhatsApp number?`,
      )
    )
      return;
    setWhatsappBusyId(String(s._id));
    try {
      const result = await api(`/reports/${s._id}/${session}/whatsapp`, {
        method: "POST",
        body: {},
      });
      setReportStatuses((current) => ({
        ...current,
        [String(s._id)]: { ...current[String(s._id)], sentAt: result.sentAt },
      }));
      toast(`Locked report sent to ${result.recipient} on WhatsApp`);
    } catch (e) {
      toast(e.message, true);
    } finally {
      setWhatsappBusyId("");
    }
  }
  async function sendStudentEmail(s) {
    const reportState = reportStatuses[String(s._id)];
    if (!reportState?.published) return;
    if (!s.email) {
      toast("Add the parent/guardian email in Edit student first.", true);
      return;
    }
    if (!confirm(`${reportState.emailSentAt ? "Resend" : "Send"} ${s.name}'s password-protected report card to ${s.email}?`)) return;
    setEmailBusyId(String(s._id));
    try {
      const result = await api(`/reports/${s._id}/${session}/email`, { method: "POST", body: {} });
      setReportStatuses((current) => ({
        ...current,
        [String(s._id)]: { ...current[String(s._id)], emailSentAt: result.sentAt },
      }));
      toast(`Locked report emailed to ${result.recipient}`);
    } catch (e) {
      toast(e.message, true);
    } finally {
      setEmailBusyId("");
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
          {hasStudentAction(user, "studentCreate") && (
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
          {!compact && canManageStudents && hasStudentAction(user, "studentStatus") && (
            <select
              aria-label="Filter student status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active students</option>
              <option value="disabled">Disabled students</option>
            </select>
          )}
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
                      {!s.active && <span className="pill">Disabled</span>}
                    </div>
                  </td>
                  <td>{s.admissionNo}</td>
                  <td>
                    Class {s.className}
                    <span className="muted"> · {s.section}</span>
                  </td>
                  <td>
                    {(() => {
                      const badge = HOUSE_BADGES[(s.house || "").toLowerCase()];
                      const HouseIcon = badge?.Icon;
                      return (
                        <span
                          className={`house-pill house-icon-only ${badge?.className || ""}`}
                          title={badge?.label || s.house || "Unassigned"}
                          aria-label={badge?.label || s.house || "Unassigned"}
                        >
                          {HouseIcon ? (
                            <HouseIcon size={17} aria-hidden="true" />
                          ) : (
                            <span aria-hidden="true">—</span>
                          )}
                        </span>
                      );
                    })()}
                  </td>
                  <td>
                    <div className="row-actions">
                      {s.active && hasModule(user, "studio") && (
                        <button
                          className="icon-button open-studio-button"
                          title={`Open ${s.name} in report studio`}
                          aria-label={`Open ${s.name} in report studio`}
                          onClick={() => open(s)}
                        >
                          <SquareArrowOutUpRight size={17} />
                        </button>
                      )}
                      {canManageStudents && (
                        <>
                          {hasStudentAction(user, "studentEdit") && (
                          <button
                            className="icon-button"
                            title="Edit student"
                            onClick={() => setEditing(s)}
                          >
                            <PenLine size={16} />
                          </button>
                          )}
                          {hasStudentAction(user, "studentStatus") && (
                          <button
                            className={`icon-button student-status-icon ${s.active ? "disable" : "enable"}`}
                            title={`${s.active ? "Disable" : "Enable"} ${s.name}`}
                            aria-label={`${s.active ? "Disable" : "Enable"} ${s.name}`}
                            disabled={statusBusy}
                            onClick={() => toggleStatus(s)}
                          >
                            {s.active ? <Power size={17} /> : <CheckCircle2 size={17} />}
                          </button>
                          )}
                          {hasStudentAction(user, "studentDelete") && (
                          <button
                            className="icon-button danger"
                            title="Permanently delete student and all reports"
                            aria-label="Permanently delete student and all reports"
                            onClick={() => permanentlyDelete(s)}
                          >
                              <Trash2 size={16} />
                          </button>
                          )}
                        </>
                      )}
                      {(hasStudentAction(user, "studentWhatsapp") || hasStudentAction(user, "studentEmail")) && (
                      <div className="report-delivery-actions">
                      {hasStudentAction(user, "studentWhatsapp") && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <button
                            className={`icon-button whatsapp-icon-button ${reportStatuses[String(s._id)]?.published && s.active ? "ready" : "not-ready"}`}
                            title={
                              !s.active
                                ? "Enable student before sending report"
                                : reportStatuses[String(s._id)]?.published
                                  ? `${reportStatuses[String(s._id)]?.sentAt ? "Resend" : "Send"} published report by WhatsApp`
                                  : "Available after the report is published by administration"
                            }
                            aria-label={`WhatsApp report for ${s.name}${reportStatuses[String(s._id)]?.published ? "" : " (available after publication)"}`}
                            disabled={
                              !s.active ||
                              !reportStatuses[String(s._id)]?.published ||
                              whatsappBusyId === String(s._id)
                            }
                            onClick={() => sendStudentReport(s)}
                          >
                            <WhatsAppIcon size={19} />
                          </button>
                          <WhatsAppDeliveryBadge statusObj={reportStatuses[String(s._id)]} compact />
                        </div>
                      )}
                      {hasStudentAction(user, "studentEmail") && (
                        <button
                          className={`icon-button email-report-button ${reportStatuses[String(s._id)]?.published && s.active ? "ready" : "not-ready"}`}
                          title={!s.active ? "Enable student before sending report" : !s.email ? "Add parent/guardian email in Edit student" : reportStatuses[String(s._id)]?.published ? `${reportStatuses[String(s._id)]?.emailSentAt ? "Resend" : "Send"} published report by email` : "Available after the report is published"}
                          aria-label={`Email report for ${s.name}`}
                          disabled={!s.active || !s.email || !reportStatuses[String(s._id)]?.published || emailBusyId === String(s._id)}
                          onClick={() => sendStudentEmail(s)}
                        >
                          {emailBusyId === String(s._id) ? <Loader2 size={18} className="spin" /> : <Mail size={18} />}
                        </button>
                      )}
                      </div>
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
          user={user}
          close={() => setEditing(null)}
          reload={reload}
          toast={toast}
        />
      )}
    </>
  );
}
function StudentModal({ student, user, close, reload, toast }) {
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
      email: "",
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
      if (student._id) f.append("studentId", student._id);
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
            ["mobile", "Parent/guardian WhatsApp number"],
            ["email", "Parent/guardian email"],
            ["address", "Address"],
          ].map(([k, label]) => (
            <Field key={k} label={label}>
              <input
                type={k === "dob" ? "date" : k === "email" ? "email" : "text"}
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
          {(user.role === "admin" || hasStudentAction(user, student._id ? "studentEdit" : "studentCreate")) && (
            <Field label="Student photo · PNG / JPG">
              <div className="student-photo-upload">
                {data.photo && <img src={data.photo} alt={`${data.name || "Student"} current photo`} />}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={photo}
                />
              </div>
            </Field>
          )}
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
    if (report.status === "published" && !report.templateSnapshot) {
      toast("Legacy published report has no secure snapshot. Reopen and republish it to apply the new PDF password.", true);
      return;
    }
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
              ["growth", "📈 Growth"],
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
                ? "Published report is locked. Password: admission number@DOB (DOB format YYYY-MM-DD)."
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
          {tab === "growth" && (
            <GrowthChart
              report={report}
              config={config}
              student={student}
            />
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
              <SmartRemarks
                report={report}
                config={config}
                student={student}
                onSelectRemark={(rem) => {
                  setOtherRemark(false);
                  update({
                    ...report,
                    remarks: rem,
                  });
                  toast("Applied smart remark to report");
                }}
              />
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
    [moduleAccess, setModuleAccess] = useState([]),
    [studentActions, setStudentActions] = useState([]),
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
        body: { assignments, moduleAccess, studentActions },
      });
      const staffName = editing.name;
      setEditing(null);
      await load();
      toast(`Access updated. ${staffName} must sign in again for the new access to apply.`);
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
                  {u.role === "admin" ? (
                    <span className="muted">Full admin access</span>
                  ) : (
                    <button
                      className="text-button"
                      onClick={() => {
                        setEditing(u);
                        setAssignments(u.assignments || []);
                        setModuleAccess(u.moduleAccess || []);
                        setStudentActions(u.studentActions || []);
                      }}
                    >
                      Manage access
                    </button>
                  )}
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
              <p>Choose which modules and student actions this account can use.</p>
              <h3>Module access</h3>
              <div className="permission-grid">
                {(ROLE_MODULES[editing.role] || []).map((moduleId) => {
                  const label = MODULE_LABELS.find(([id]) => id === moduleId)?.[1] || moduleId;
                  return (
                    <label className="permission-check" key={moduleId}>
                      <input
                        type="checkbox"
                        checked={moduleAccess.includes(moduleId)}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          setModuleAccess((current) => {
                            if (enabled) return moduleId === "students" || current.includes("students")
                              ? [...new Set([...current, moduleId])]
                              : [...new Set([...current, "students", moduleId])];
                            if (moduleId === "students") return current.filter((id) => !["students", "overview", "studio", "bulk"].includes(id));
                            return current.filter((id) => id !== moduleId);
                          });
                          if (moduleId === "students" && !enabled) setStudentActions([]);
                        }}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
              <h3>Student actions</h3>
              <div className="permission-grid">
                {ACTION_LABELS.map(([actionId, label]) => (
                  <label className="permission-check" key={actionId}>
                    <input
                      type="checkbox"
                      checked={studentActions.includes(actionId)}
                      onChange={(e) => setStudentActions((current) => e.target.checked
                        ? [...current, actionId]
                        : current.filter((id) => id !== actionId))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {editing.role !== "teacher" ? (
                <p>Administrators and principals have access to all classes.</p>
              ) : (
                <>
                  <p>For a class transfer, replace the old assignment below, then save access.</p>
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
                    <button
                      className="btn"
                      onClick={() => setAssignments([{ className: ac, section: as }])}
                      title="Remove existing class assignments and set only the selected class"
                    >
                      Replace all with Class {ac} · {as}
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
function ReportReview({ session, open, toast, user }) {
  const [rows, setRows] = useState([]);
  const [busyId, setBusyId] = useState("");
  async function load() {
    try {
      setRows(await api(`/review?session=${encodeURIComponent(session)}`));
    } catch (e) {
      toast(e.message, true);
    }
  }
  useEffect(() => {
    load();
    const timer = setInterval(() => {
      api(`/review?session=${encodeURIComponent(session)}`)
        .then(setRows)
        .catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, [session]);
  async function transition(row, action) {
    const verb = action === "publish" ? "mark all done and publish" : "reopen";
    if (
      !confirm(
        `${verb[0].toUpperCase()}${verb.slice(1)} ${row.student.name}'s report?`,
      )
    )
      return;
    setBusyId(String(row._id));
    try {
      await api(`/reports/${row.student._id}/${session}/${action}`, {
        method: "POST",
        body: { revision: row.revision },
      });
      toast(
        action === "publish"
          ? "Report reviewed and published"
          : "Report reopened for editing",
      );
      await load();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusyId("");
    }
  }
  async function send(row) {
    if (
      !confirm(
        `Send the locked report link for ${row.student.name} to ${row.student.mobile || "the saved WhatsApp number"}? PDF password: admission number@DOB (DOB format YYYY-MM-DD).`,
      )
    )
      return;
    setBusyId(String(row._id));
    try {
      await api(`/reports/${row.student._id}/${session}/whatsapp`, {
        method: "POST",
        body: {},
      });
      toast(
        `Locked report link sent to ${row.student.mobile || "saved WhatsApp number"}`,
      );
      await load();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusyId("");
    }
  }
  async function sendEmail(row) {
    const recipient = row.student.email;
    if (!recipient) {
      toast("Add the parent/guardian email in Edit student first.", true);
      return;
    }
    if (!confirm(`${row.emailSentAt ? "Resend" : "Send"} ${row.student.name}'s password-protected report PDF to ${recipient}?`)) return;
    setBusyId(String(row._id));
    try {
      await api(`/reports/${row.student._id}/${session}/email`, { method: "POST", body: {} });
      toast(`Locked report emailed to ${recipient}`);
      await load();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusyId("");
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="ADMINISTRATION · ACADEMIC SESSION"
        title="Report Review"
        subtitle="Review teacher submissions, publish completed reports, reopen when corrections are needed, and send locked reports to parents."
      >
        <button className="btn" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </PageTitle>
      <div className="review-password-note">
        <LockKeyhole size={18} /> Published PDFs require a password to open. The
        password is the student’s admission number, followed by @, then date of birth (YYYY-MM-DD).
      </div>
      {!rows.length ? (
        <Empty text="No submitted or published reports for this session" />
      ) : (
        <div className="review-table-wrap">
          <table className="review-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class / section</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>WhatsApp</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td>
                    <strong>{row.student.name}</strong>
                    <small>{row.student.admissionNo}</small>
                  </td>
                  <td>
                    {row.student.className} / {row.student.section}
                  </td>
                  <td>
                    <span className={`status-badge ${row.status}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    {row.submittedAt
                      ? new Date(row.submittedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <WhatsAppDeliveryBadge
                      statusObj={{
                        published: row.status === "published",
                        sentAt: row.whatsappSentAt,
                        whatsappDeliveryStatus: row.whatsappDeliveryStatus,
                        whatsappDeliveredAt: row.whatsappDeliveredAt,
                        whatsappReadAt: row.whatsappReadAt,
                        whatsappFailureReason: row.whatsappFailureReason,
                      }}
                    />
                  </td>
                  <td>
                    {row.emailSentAt
                      ? `Sent ${new Date(row.emailSentAt).toLocaleDateString()}`
                      : row.status === "published"
                        ? "Not sent"
                        : "—"}
                  </td>
                  <td>
                    <div className="review-row-actions">
                      {hasModule(user, "studio") && (
                        <button className="btn" onClick={() => open(row.student)}>
                          <Eye size={15} /> Review
                        </button>
                      )}
                      {row.status === "submitted" ? (
                        <button
                          className="btn primary"
                          disabled={busyId === String(row._id)}
                          onClick={() => transition(row, "publish")}
                        >
                          <CheckCircle2 size={15} /> All done · Publish
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn"
                            disabled={busyId === String(row._id)}
                            onClick={() => transition(row, "reopen")}
                          >
                            <RefreshCw size={15} /> Reopen
                          </button>
                          {hasModule(user, "students") && hasStudentAction(user, "studentWhatsapp") && <button
                            className="icon-button whatsapp-icon-button"
                            disabled={busyId === String(row._id)}
                            onClick={() => send(row)}
                            title={row.whatsappSentAt ? "Resend locked report by WhatsApp" : "Send locked report by WhatsApp"}
                            aria-label={row.whatsappSentAt ? "Resend report by WhatsApp" : "Send report by WhatsApp"}
                          >
                            <WhatsAppIcon size={20} />
                          </button>}
                          {hasModule(user, "students") && hasStudentAction(user, "studentEmail") && (
                            <button
                              className="icon-button email-report-button ready"
                              disabled={busyId === String(row._id) || !row.student.email}
                              onClick={() => sendEmail(row)}
                              title={!row.student.email ? "Add parent/guardian email to student record" : row.emailSentAt ? "Resend locked report by email" : "Send locked report by email"}
                              aria-label={row.emailSentAt ? "Resend report by email" : "Send report by email"}
                            >
                              <Mail size={19} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
createRoot(document.getElementById("root")).render(
  <>
    <App />
    <ToastContainer
      position="bottom-right"
      autoClose={4500}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      theme="light"
    />
  </>,
);
function BulkReports({ students, config, user, toast }) {
  const [cls, setCls] = useState("6"),
    [sec, setSec] = useState("Venus"),
    [session, setSession] = useState(config.session),
    [records, setRecords] = useState([]),
    [busy, setBusy] = useState(false),
    [bulkWhatsappOpen, setBulkWhatsappOpen] = useState(false);
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
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "14px 0" }}>
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
          {hasStudentAction(user, "studentWhatsapp") && (
            <button
              className="btn whatsapp-bulk-trigger"
              disabled={!records.length || busy}
              onClick={() => setBulkWhatsappOpen(true)}
            >
              <Send size={16} /> Send WhatsApp to Class ({records.length})
            </button>
          )}
        </div>
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
      <BulkWhatsappModal
        isOpen={bulkWhatsappOpen}
        onClose={() => setBulkWhatsappOpen(false)}
        records={records}
        cls={cls}
        sec={sec}
        session={session}
        toast={toast}
        onRecordUpdated={(studentId, sentAt) => {
          setRecords((prev) =>
            prev.map((r) =>
              String(r.student._id) === String(studentId)
                ? { ...r, report: { ...r.report, whatsappSentAt: sentAt } }
                : r,
            ),
          );
        }}
      />
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

function ReportDrive({ toast }) {
  const [stage, setStage] = useState("locked");
  const [code, setCode] = useState("");
  const [reports, setReports] = useState([]);
  const [pathParts, setPathParts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("srpskanhra@gmail.com");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("list");
  const [recentMode, setRecentMode] = useState(false);
  const [sortBy, setSortBy] = useState("Last modified");
  const [archiving, setArchiving] = useState(false);
  const [archiveProgress, setArchiveProgress] = useState(null);
  const loadReports = async () => setReports(await api("/report-drive/reports"));
  const requestOtp = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await api("/report-drive/request-otp", {
        method: "POST",
        body: {},
      });
      setSentTo(result.destination);
      setStage("otp");
      toast?.(`Verification code sent to ${result.destination}`);
    } catch (e) {
      setError(e.message);
      toast?.(e.message, true);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (stage !== "open") return;
    const timer = setTimeout(() => {
      void lock();
    }, 10 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [stage]);
  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/report-drive/verify-otp", { method: "POST", body: { code } });
      await loadReports();
      setStage("open");
      toast?.("Report Drive unlocked successfully");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const lock = async () => {
    try {
      await api("/report-drive/lock", { method: "POST", body: {} });
    } finally {
      setReports([]);
      setPathParts([]);
      setCode("");
      setQuery("");
      setStage("locked");
    }
  };
  const sessions = [...new Set(reports.map((r) => r.session))].sort().reverse();
  const classesIn = [...new Set(reports.filter((r) => r.session === pathParts[0]).map((r) => r.className))].sort((a,b) => a.localeCompare(b, undefined, {numeric:true}));
  const sectionsIn = [...new Set(reports.filter((r) => r.session === pathParts[0] && r.className === pathParts[1]).map((r) => r.section))].sort();
  const folders = !pathParts.length ? sessions.map((name) => ({ name, count: reports.filter((r) => r.session === name).length }))
    : pathParts.length === 1 ? classesIn.map((name) => ({ name: `Class ${name}`, value: name, count: reports.filter((r) => r.session === pathParts[0] && r.className === name).length }))
    : pathParts.length === 2 ? sectionsIn.map((name) => ({ name, count: reports.filter((r) => r.session === pathParts[0] && r.className === pathParts[1] && r.section === name).length })) : [];
  const sortedReports = [...reports].sort((a,b) => sortBy === "Name"
    ? String(a.studentName).localeCompare(String(b.studentName), undefined, { sensitivity: "base" })
    : new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  const pathReports = reports.filter((r) => r.session === pathParts[0] && r.className === pathParts[1] && r.section === pathParts[2]);
  const search = query.trim().toLowerCase();
  const visibleFiles = (search ? sortedReports.filter((r) => [r.studentName,r.admissionNo,r.session,r.className,r.section].some((v) => String(v || "").toLowerCase().includes(search)))
    : recentMode ? sortedReports : pathParts.length === 0 ? sortedReports.slice(0, 8) : pathReports);
  const archiveAll = async () => {
    setArchiving(true);
    setArchiveProgress({ archived: 0, legacy: 0, failed: 0 });
    let after;
    const totals = { archived: 0, legacy: 0, failed: 0 };
    try {
      while (true) {
        const batch = await api("/report-drive/archive-batch", { method: "POST", body: after ? { after } : {} });
        totals.archived += batch.archived;
        totals.legacy += batch.legacy;
        totals.failed += batch.failed;
        setArchiveProgress({ ...totals });
        if (batch.done) break;
        after = batch.nextCursor;
      }
      await loadReports();
      toast?.(`${totals.archived} reports archived${totals.legacy ? ` · ${totals.legacy} legacy reports need republishing` : ""}${totals.failed ? ` · ${totals.failed} failed` : ""}`, totals.failed > 0);
    } catch (e) {
      toast?.(e.message, true);
    } finally {
      setArchiving(false);
      setTimeout(() => setArchiveProgress(null), 5000);
    }
  };
  const downloadReport = async (r) => {
    setBusy(true);
    try { await download(`/report-drive/reports/${r.id}/download`, `${r.session}-Class-${r.className}-${r.studentName}.pdf`); }
    catch (e) { toast?.(e.message, true); }
    finally { setBusy(false); }
  };
  const go = (parts) => { setPathParts(parts); setRecentMode(false); };
  const folderTarget = (item) => {
    if (!pathParts.length) go([item.name]);
    else if (pathParts.length === 1) go([pathParts[0], item.value]);
    else go([pathParts[0], pathParts[1], item.name]);
  };
  const folderIcon = (size=22) => <Folder size={size} fill="currentColor" strokeWidth={1.8}/>;
  const folderRow = (item) => <button className="drive-entry" key={item.name} onClick={() => folderTarget(item)}>
    <span className="drive-entry-icon drive-folder-icon">{folderIcon(21)}</span>
    <span className="drive-entry-name"><b>{item.name}</b><small>{item.count} {item.count === 1 ? "report" : "reports"}</small></span>
    <span className="drive-entry-date">—</span><span className="drive-entry-type">Folder</span><ChevronRight size={17}/>
  </button>;
  const fileRow = (r, grid=false) => <article className={"drive-entry drive-report-entry " + (grid ? "drive-report-card" : "")} key={r.id}>
    <span className="drive-entry-icon drive-pdf-icon"><FileText size={22}/><i>PDF</i></span>
    <span className="drive-entry-name"><b>{r.studentName}</b><small>Admission {r.admissionNo || "—"} · Class {r.className} · {r.section}</small></span>
    <span className="drive-entry-date">{r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : "—"}</span>
    {grid ? <small className="drive-card-session">{r.session} · {r.archiveReady ? "PDF report" : "Legacy report"}</small> : <span className="drive-entry-type">PDF</span>}
    {r.archiveReady ? <button className="drive-download" aria-label={`Download ${r.studentName} report`} title="Download password-protected PDF" disabled={busy} onClick={() => downloadReport(r)}><Download size={19}/></button> : <span className="drive-legacy">Legacy</span>}
  </article>;
  return <section className="report-drive-shell">
    <header className="drive-topbar">
      <div className="drive-brand"><span className="drive-brand-mark"><HardDrive size={22}/></span><span>Report Drive</span></div>
      <label className="drive-search"><Search size={21}/><input value={query} onChange={(e) => { setQuery(e.target.value); setRecentMode(false); }} placeholder="Search reports by student, admission no., class…"/></label>
      <button className="drive-lock-button" onClick={stage === "open" ? lock : requestOtp} disabled={busy}><LockKeyhole size={17}/>{stage === "open" ? "Lock" : "Verify"}</button>
      <span className="drive-profile" title="Administrator">A</span>
    </header>
    {stage !== "open" ? (
      <div className="drive-auth-stage">
        <div className="drive-lock-card">
          <div className="drive-lock-header">
            <div className="drive-lock-icon">
              <ShieldCheck size={32} />
            </div>
            <span className="drive-shield-pill">ADMIN SECURITY 2FA</span>
            <h2>Two-Step Administrator Verification</h2>
            <p className="drive-lock-desc">
              Report Drive contains private school archives and locked student certificates.
              {stage === "otp"
                ? ` Enter the 6-digit verification code sent to your email.`
                : ` Two-factor authentication is required to access or download archived reports.`}
            </p>
          </div>

          <div className="drive-security-infobox">
            <div className="security-info-item">
              <Mail size={15} />
              <span>Admin Email: <b>{sentTo}</b></span>
            </div>
            <div className="security-info-item">
              <Clock3 size={15} />
              <span>Code Validity: <b>5 Minutes</b></span>
            </div>
            <div className="security-info-item">
              <LockKeyhole size={15} />
              <span>Security Level: <b>Encrypted School Archive</b></span>
            </div>
          </div>

          {stage === "locked" ? (
            <div className="drive-lock-actions">
              <button
                type="button"
                className="btn-drive-send-otp"
                onClick={requestOtp}
                disabled={busy}
              >
                {busy ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                {busy ? "Sending Verification Code…" : "Send Verification Code to Email"}
              </button>
            </div>
          ) : (
            <form onSubmit={verify} className="drive-lock-form">
              <label htmlFor="drive-otp">ENTER 6-DIGIT VERIFICATION CODE</label>
              <div className="drive-otp-input-wrapper">
                <input
                  id="drive-otp"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  autoFocus
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="0 0 0 0 0 0"
                />
              </div>
              <button
                type="submit"
                className="btn-drive-unlock"
                disabled={busy || code.length !== 6}
              >
                {busy ? <Loader2 size={18} className="spin" /> : <LockKeyhole size={18} />}
                {busy ? "Verifying Access…" : "Unlock Report Drive"}
              </button>
              <div className="drive-otp-links">
                <button
                  type="button"
                  className="btn-drive-text"
                  disabled={busy}
                  onClick={requestOtp}
                >
                  <RefreshCw size={13} className={busy ? "spin" : ""} /> Resend new code
                </button>
                <span className="dot-divider">•</span>
                <button
                  type="button"
                  className="btn-drive-text"
                  onClick={() => {
                    setStage("locked");
                    setCode("");
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="drive-error-pill">
              <AlertTriangle size={15} /> {error}
            </div>
          )}
        </div>
      </div>
    ) : (
      <div className="drive-workspace">
        <aside className="drive-sidebar">
        <div className="drive-sidebar-label">ARCHIVE</div>
        <button className={!recentMode ? "drive-side-link active" : "drive-side-link"} onClick={() => { go([]); setQuery(""); }}><HardDrive size={18}/> My Drive</button>
        <button className={recentMode ? "drive-side-link active" : "drive-side-link"} onClick={() => { setPathParts([]); setRecentMode(true); setQuery(""); }}><Clock3 size={18}/> Recent reports</button>
        <div className="drive-tree-label">SESSIONS <span>{sessions.length}</span></div>
        <div className="drive-tree">{sessions.map((session) => <button key={session} className={pathParts[0] === session && !recentMode ? "drive-tree-item selected" : "drive-tree-item"} onClick={() => { go([session]); setQuery(""); }}><span>▸</span>{folderIcon(16)}<span>{session}</span></button>)}</div>
        <div className="drive-sidebar-bottom"><LockKeyhole size={15}/><span>Admin-only archive<br/><b>OTP verified</b></span></div>
      </aside>
      <main className="drive-main">
        <div className="drive-toolbar">
          <div className="drive-breadcrumbs"><button onClick={() => { go([]); setQuery(""); }}>My Drive</button>{!search && pathParts.map((part,i)=><React.Fragment key={`${i}-${part}`}><ChevronRight size={16}/><button onClick={() => go(pathParts.slice(0,i+1))}>{i===1?`Class ${part}`:part}</button></React.Fragment>)}{search&&<><ChevronRight size={16}/><b>Search results</b></>}{recentMode&&<><ChevronRight size={16}/><b>Recent reports</b></>}</div>
          <div className="drive-toolbar-actions"><span className="drive-status"><LockKeyhole size={14}/> Private</span><div className="drive-view-switch"><button className={view === "list" ? "selected" : ""} onClick={() => setView("list")} aria-label="List view" title="List view"><List size={18}/></button><button className={view === "grid" ? "selected" : ""} onClick={() => setView("grid")} aria-label="Grid view" title="Grid view"><LayoutGrid size={18}/></button></div></div>
        </div>
        <div className="drive-title-row"><div><h1>{search ? "Search results" : recentMode ? "Recent reports" : pathParts.length === 0 ? "My Drive" : pathParts.length === 1 ? pathParts[0] : pathParts.length === 2 ? `Class ${pathParts[1]}` : pathParts[2]}</h1><p>{search ? `${visibleFiles.length} matching reports` : recentMode ? "Recently published report cards" : pathParts.length ? `${folders.length ? folders.length + " folders" : pathReports.length + " reports"}` : "Academic sessions and published report cards"}</p></div><div className="drive-title-actions"><button className="drive-archive-all" onClick={archiveAll} disabled={archiving}>{archiving ? <RefreshCw className="spin" size={16}/> : <HardDrive size={16}/>} {archiving ? `Archiving ${archiveProgress?.archived || 0}…` : "Archive all reports"}</button><button className="drive-sort" onClick={() => setSortBy(sortBy === "Name" ? "Last modified" : "Name")} title="Switch sort order"><ArrowUpDown size={16}/> {sortBy} <ChevronDown size={15}/></button></div></div>
        {!search && !recentMode && folders.length > 0 && <><h2 className="drive-section-heading">{pathParts.length ? "Folders" : "Sessions"}</h2><div className={view === "grid" ? "drive-folder-grid" : "drive-folder-list"}>{folders.map(folderRow)}</div></>}
        {(!folders.length || search || recentMode || pathParts.length === 3 || pathParts.length === 0) && <><h2 className="drive-section-heading">{search ? "Reports" : recentMode ? "Published reports" : pathParts.length === 3 ? "Reports" : pathParts.length === 0 ? "Recently published" : ""}</h2>{view === "grid" ? <div className="drive-report-grid">{visibleFiles.slice(0, pathParts.length === 0 && !search && !recentMode ? 8 : undefined).map((r) => fileRow(r,true))}</div> : <div className="drive-table-wrap"><div className="drive-table-head"><span>Name</span><span>Published</span><span>Type</span><span> </span></div>{visibleFiles.map((r) => fileRow(r))}</div>}{!visibleFiles.length&&<div className="drive-empty">{search ? "No reports match your search." : "No published reports in this folder yet."}</div>}</>}
        <div className="drive-security-note"><LockKeyhole size={14}/> PDF password: admission number@DOB (YYYY-MM-DD) · Reports stay in private server storage</div>
      </main>
    </div>
    )}
  </section>;
}
