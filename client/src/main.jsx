import { PASSWORD_MIN, PASSWORD_MAX } from "../../shared/password-policy.js";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer, toast as notify } from "react-toastify";
import QRCode from "qrcode";
import {
  GraduationCap,
  Award,
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
  Minus,
  SlidersHorizontal,
  Download,
  Printer,
  Save,
  Check,
  ArrowLeft,
  ArrowRight,
  LogOut,
  FileText,
  RefreshCw,
  Trash2,
  Power,
  Send,
  Eye,
  EyeOff,
  FileSpreadsheet,
  CheckCircle2,
  X,
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
  Moon,
  HardDrive,
  Folder,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  List,
  Clock,
  Clock3,
  ArrowUpDown,
  Mail,
  CheckCheck,
  BarChart3,
  Trophy,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Phone,
  Layers,
  Tag,
  Home,
  Briefcase,
  UserPlus,
  QrCode,
  Bell,
  MessageSquare,
  Bot,
  Menu,
  Calendar,
} from "lucide-react";
import {
  DEFAULT_CONFIG,
  ACTIVITIES,
  calculate,
  validateMarks,
  getTermComponents,
  resolveConfigForClass,
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
import Dashboard from "./Dashboard";
import templateMapping from "../../shared/template-mapping.json";
import { exportReportPdf, printReports } from "./report-export";
import { getNextClass } from "../../shared/report-template.js";
import Loader from "./Loader";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/600-italic.css";
import "@fontsource/great-vibes/400.css";
import "./style.css";
import "./anvayrobo.css";
import "react-toastify/dist/ReactToastify.css";
import {
  HeroBanner,
  StatCard,
  StatusBadge,
  ThemeSwitcher,
  MobileBottomNav,
  MobileMoreDrawer,
} from "./components/ui";
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

let classes = [...DEFAULT_CLASSES];
let sections = [...DEFAULT_SECTIONS];
let houses = [...DEFAULT_HOUSES];
let designations = [...DEFAULT_DESIGNATIONS];

const ROLE_MODULES = {
  teacher: ["overview", "students", "studio", "bulk", "settings"],
  principal: [
    "overview",
    "analytics",
    "students",
    "studio",
    "review",
    "bulk",
    "settings",
    "audit",
  ],
};
const MODULE_LABELS = [
  ["overview", "Overview"],
  ["analytics", "Class Analytics"],
  ["students", "Students"],
  ["studio", "Report studio"],
  ["review", "Report Review"],
  ["bulk", "Bulk print / export"],
  ["audit", "Activity log"],
  ["settings", "Settings"],
  ["audit", "Activity log"],
];
const ACTION_LABELS = [
  ["studentCreate", "Add students"], ["studentEdit", "Edit student details"],
  ["studentStatus", "Disable / enable students"], ["studentDelete", "Permanently delete students"],
  ["studentWhatsapp", "Send reports by WhatsApp"],
  ["studentEmail", "Send reports by email"],
];
const hasModule = (user, id) => user.role === "admin" ||
  (Array.isArray(user.moduleAccess) ? user.moduleAccess : ROLE_MODULES[user.role] || []).includes(id);
const canOpenPage = (user, id) => {
  if (user.role === "admin") return true;
  if (id === "masters") return false;
  if (id === "dashboard") return hasModule(user, "overview");
  return hasModule(user, id);
};
const hasStudentAction = (user, id) => user.role === "admin" ||
  (Array.isArray(user.studentActions) ? user.studentActions : user.role === "teacher" ? ACTION_LABELS.map(([key]) => key) : user.role === "principal" ? ["studentWhatsapp", "studentEmail"] : []).includes(id);
const HOUSE_BADGES = {
  himalya: { label: "Himalaya", className: "himalya", Icon: Mountain },
  himalaya: { label: "Himalaya", className: "himalya", Icon: Mountain },
  arawali: { label: "Aravali", className: "aravali", Icon: Flame },
  aravali: { label: "Aravali", className: "aravali", Icon: Flame },
  nilgiri: { label: "Nilgiri", className: "nilgiri", Icon: Trees },
  shivalik: { label: "Shivalik", className: "shivalik", Icon: Sun },
};
const getHouseBadge = (houseName) => {
  const key = (houseName || "").toLowerCase().trim();
  return (
    HOUSE_BADGES[key] || {
      label: houseName || "Unassigned",
      className: "himalya",
      Icon: Home,
    }
  );
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

function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 4,
  onPageChange,
  onPageSizeChange,
  itemLabel = "entries",
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrent = Math.min(Math.max(1, currentPage), totalPages);

  if (totalItems === 0) return null;

  const startIdx = (safeCurrent - 1) * pageSize + 1;
  const endIdx = Math.min(safeCurrent * pageSize, totalItems);

  const handleStepSize = (delta) => {
    const next = Math.max(10, pageSize + delta);
    if (next !== pageSize) {
      onPageSizeChange(next);
      onPageChange(1);
    }
  };

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        <span className="pagination-info-badge" title={`Showing ${startIdx}–${endIdx} of ${totalItems} ${itemLabel}`}>
          <Layers size={14} className="pagination-info-icon" />
          <span>
            <b>{startIdx}–{endIdx}</b> / <b>{totalItems}</b>
          </span>
        </span>
      </div>

      <div className="pagination-controls">
        <div className="page-size-controller" title="Adjust entries per page (±5)">
          <span className="controller-label-icon" title="Entries per page">
            <SlidersHorizontal size={14} />
          </span>
          <button
            type="button"
            className="step-btn minus-btn"
            disabled={pageSize <= 10}
            onClick={() => handleStepSize(-5)}
            title="Decrease by 5 entries (Minimum: 10)"
            aria-label="Decrease entries per page"
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>
          <span className="page-size-display-badge" title={`${pageSize} per page`}>
            <b>{pageSize}</b>
          </span>
          <button
            type="button"
            className="step-btn plus-btn"
            onClick={() => handleStepSize(5)}
            title="Increase by 5 entries (+5)"
            aria-label="Increase entries per page"
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>

        <div className="page-nav-pill-group">
          <button
            type="button"
            className="page-nav-btn prev-btn"
            disabled={safeCurrent <= 1}
            onClick={() => onPageChange(safeCurrent - 1)}
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} strokeWidth={2.2} />
          </button>

          <div className="current-page-pill" title={`Page ${safeCurrent} of ${totalPages}`}>
            <span className="page-curr-num">{safeCurrent}</span>
            <span className="page-slash">/</span>
            <span className="page-total-num">{totalPages}</span>
          </div>

          <button
            type="button"
            className="page-nav-btn next-btn"
            disabled={safeCurrent >= totalPages}
            onClick={() => onPageChange(safeCurrent + 1)}
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
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
  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem("srps_theme_mode") || localStorage.getItem("srps_theme") || "light";
    } catch {
      return "light";
    }
  });
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false,
  );
  const theme = themeMode === "system" ? (systemDark ? "dark" : "light") : themeMode;
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [user, setUser] = useState(null),
    [checking, setChecking] = useState(true),
    [page, setPage] = useState("dashboard"),
    [students, setStudents] = useState([]),
    [config, setConfig] = useState(DEFAULT_CONFIG),
    [masters, setMasters] = useState(null),
    [studentSubTab, setStudentSubTab] = useState("directory"),
    [studentsMenuOpen, setStudentsMenuOpen] = useState(false),
    [selected, setSelected] = useState(null),
    [sidebar, setSidebar] = useState(false),
    [collapsed, setCollapsed] = useState(() => {
      try {
        return localStorage.getItem("srps_sidebar_collapsed") === "true";
      } catch {
        return false;
      }
    }),
    [reportDirty, setReportDirty] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("srps_sidebar_collapsed", String(next));
      } catch { }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") document.documentElement.classList.add("dark-theme");
    else document.documentElement.classList.remove("dark-theme");
    try {
      localStorage.setItem("srps_theme_mode", themeMode);
      localStorage.setItem("srps_theme", theme);
    } catch { }
  }, [theme, themeMode]);

  useEffect(() => {
    if (user && !canOpenPage(user, page)) {
      setPage("dashboard");
    }
  }, [user, page]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && sidebar) {
        setSidebar(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebar]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        if (collapsed) {
          setStudentsMenuOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [collapsed]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const cur = prev === "system" ? theme : prev;
      return cur === "dark" ? "light" : "dark";
    });
  };
  const navigate = (id) => {
    if (reportDirty && !confirm("Discard unsaved report changes?")) return;
    setReportDirty(false);
    setPage(id);
    if (id !== "students" && id !== "masters") {
      setStudentsMenuOpen(false);
    }
    if (window.innerWidth <= 768) setSidebar(false);
  };
  const toast = (message, error = false) => {
    if (error) notify.error(message);
    else notify.success(message);
  };
  const handleUpdateMasters = (newMasters) => {
    setMasters(newMasters);
    if (Array.isArray(newMasters?.classes)) {
      classes = newMasters.classes
        .filter((c) => c.active !== false)
        .map((c) => String(c.name || c.id));
    }
    if (Array.isArray(newMasters?.sections)) {
      sections = newMasters.sections
        .filter((s) => s.active !== false)
        .map((s) => String(s.name || s.id));
    }
    if (Array.isArray(newMasters?.houses)) {
      houses = newMasters.houses
        .filter((h) => h.active !== false)
        .map((h) => String(h.name || h.id));
    }
    if (Array.isArray(newMasters?.designations)) {
      designations = newMasters.designations
        .filter((d) => d.active !== false)
        .map((d) => String(d.name || d.id));
    }
  };
  useEffect(() => {
    api("/auth/me")
      .then((currentUser) => {
        setUser(currentUser);
        const firstPage = [
          "dashboard",
          "students",
          "studio",
          "review",
          "bulk",
          "settings",
          "audit",
        ].find((id) => canOpenPage(currentUser, id));
        setPage(firstPage || "dashboard");
      })
      .catch(() => { })
      .finally(() => setChecking(false));
  }, []);
  async function load(forUser = user) {
    const [s, c, m] = await Promise.all([
      !forUser || hasModule(forUser, "students") ? api("/students") : Promise.resolve([]),
      api("/config"),
      api("/masters").catch(() => null),
    ]);
    setStudents(s);
    setConfig(c);
    if (m) handleUpdateMasters(m);
  }
  useEffect(() => {
    if (user) load().catch((e) => toast(e.message, true));
  }, [user]);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const syncConfig = () => {
      if (document.visibilityState === "hidden") return;
      api("/config")
        .then((c) => {
          if (!cancelled && c) setConfig(c);
        })
        .catch(() => { });
    };
    syncConfig();
    window.addEventListener("focus", syncConfig);
    document.addEventListener("visibilitychange", syncConfig);
    const timer = setInterval(syncConfig, 15000);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", syncConfig);
      document.removeEventListener("visibilitychange", syncConfig);
      clearInterval(timer);
    };
  }, [user, page]);
  useEffect(() => {
    const expireSession = () => {
      setUser(null);
      setStudents([]);
      setSelected(null);
      setPage("dashboard");
    };
    const handleUserUpdate = () => {
      api("/auth/me").then(setUser).catch(() => { });
    };
    window.addEventListener("srps:session-expired", expireSession);
    window.addEventListener("srps:user-updated", handleUserUpdate);
    return () => {
      window.removeEventListener("srps:session-expired", expireSession);
      window.removeEventListener("srps:user-updated", handleUserUpdate);
    };
  }, []);
  useEffect(() => {
    if (user && !canOpenPage(user, page)) {
      const firstPage = [
        "dashboard",
        "students",
        "studio",
        "review",
        "bulk",
        "settings",
        "audit",
      ].find((id) => canOpenPage(user, id));
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
        <Loader size={130} text="Opening Report Studio…" />
      </div>
    );
  if (location.hash.startsWith("#reset-password=") || !user)
    return <Login onLogin={setUser} toast={toast} />;
  const nav = [
    ["dashboard", "Overview", LayoutDashboard, "blue"],
    ["analytics", "Class Analytics", BarChart3, "teal"],
    ["students", "Students", Users, "cyan"],
    ["studio", "Report studio", BookOpen, "purple"],
    ...(!isDemo() && (["admin", "principal"].includes(user.role) || hasModule(user, "review"))
      ? [["review", "Report Review", ClipboardCheck, "amber"]]
      : []),
    ["bulk", "Bulk print", Printer, "rose"],
    ...(user.role === "admin"
      ? [
        ["import", "Excel import", Upload, "emerald"],
        ["users", "Users & access", ShieldCheck, "indigo"],
      ]
      : []),
    ...((["admin", "principal"].includes(user.role) || hasModule(user, "audit"))
      ? [["audit", "Activity log", History, "orange"]]
      : []),
    ...(user.role === "admin" ? [["drive", "Report Drive", HardDrive, "sky"]] : []),
    ["settings", "Settings", Settings, "slate"],
  ].filter(([id]) => canOpenPage(user, id));
  return (
    <div className={`app-shell ${theme === "dark" ? "dark-theme" : ""} ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className={`sidebar ${sidebar ? "shown" : ""} ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-brand-header">
          <a className="brand" onClick={() => navigate("dashboard")} title="ANVAYROBO ERP">
            <div className="brand-logo-frame">
              <img
                className="primary-company-logo"
                src="/anvayrobo-logo.jpeg"
                alt="ANVAYROBO"
                width="56"
                height="56"
              />
            </div>
            <span className="primary-company-name">
              <span className="brand-wordmark">
                <span className="brand-anvay">ANVAY</span>
                <span className="brand-robo">ROBO</span>
              </span>
              <span className="brand-sub">AI • ROBOTICS • STEM • AUTOMATION</span>
            </span>
          </a>
          <button
            type="button"
            className="sidebar-chevron-toggle"
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar (>>)" : "Collapse sidebar (<<)"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
          </button>
        </div>
        <div className="school-label" title="SHREE RAM PUBLIC SCHOOL · SRPS REPORT STUDIO">
          <span className="school-name">SHREE RAM PUBLIC SCHOOL</span>
          <span className="school-tag">SRPS · REPORT STUDIO</span>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {nav.map(([id, label, Icon, colorClass]) => {
            if (id === "students") {
              const isStudentsActive = page === "students" || page === "masters";
              return (
                <div key={id} ref={dropdownRef} className="nav-dropdown-group">
                  <button
                    className={`nav-parent-btn ${isStudentsActive ? "active" : ""}`}
                    onClick={() => {
                      setStudentsMenuOpen((prev) => !prev);
                      navigate("students");
                      setStudentSubTab("directory");
                      if (window.innerWidth <= 800) setSidebar(false);
                    }}
                    title={label}
                  >
                    <span className={`nav-icon-badge color-${colorClass} ${isStudentsActive ? "active-glow" : ""}`}>
                      <Icon size={18} />
                    </span>
                    <span className="nav-label-text">{label}</span>
                    <span
                      className={`dropdown-chevron ${studentsMenuOpen ? "open" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setStudentsMenuOpen((prev) => !prev);
                      }}
                      title="Toggle Students Submenu"
                    >
                      <ChevronDown size={15} />
                    </span>
                    {isStudentsActive && <span className="nav-dot" />}
                  </button>
                  {studentsMenuOpen && (
                    <div className="nav-sub-menu">
                      <div className="nav-sub-header">STUDENTS MODULE</div>
                      <button
                        className={`nav-sub-btn ${page === "students" && studentSubTab === "directory" ? "active" : ""}`}
                        onClick={() => {
                          navigate("students");
                          setStudentSubTab("directory");
                          if (collapsed) setStudentsMenuOpen(false);
                          if (window.innerWidth <= 800) setSidebar(false);
                        }}
                        title="Student Directory"
                      >
                        <span className="nav-sub-icon-pill">
                          <Users size={14} />
                        </span>
                        <span className="nav-sub-label">Student Directory</span>
                      </button>
                      {user.role === "admin" && (
                        <button
                          className={`nav-sub-btn ${page === "masters" || (page === "students" && studentSubTab === "masters") ? "active" : ""}`}
                          onClick={() => {
                            navigate("masters");
                            setStudentSubTab("masters");
                            if (collapsed) setStudentsMenuOpen(false);
                            if (window.innerWidth <= 800) setSidebar(false);
                          }}
                          title="Academic Masters"
                        >
                          <span className="nav-sub-icon-pill">
                            <Layers size={14} />
                          </span>
                          <span className="nav-sub-label">Academic Masters</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button
                key={id}
                className={page === id ? "active" : ""}
                onClick={() => {
                  navigate(id);
                  if (window.innerWidth <= 800) setSidebar(false);
                }}
                title={label}
              >
                <span className={`nav-icon-badge color-${colorClass} ${page === id ? "active-glow" : ""}`}>
                  <Icon size={18} />
                </span>
                <span className="nav-label-text">{label}</span>
                {page === id && <span className="nav-dot" />}
              </button>
            );
          })}
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
        <button
          className="user-card"
          onClick={logout}
          title={`${user.name} (${user.designation || user.role}) — Click to logout`}
          aria-label="Logout"
        >
          <div className="avatar">
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              user.name?.slice(0, 1)
            )}
          </div>
          <div className="user-details">
            <b>{user.name}</b>
            <small>{user.designation || user.role} account</small>
          </div>
          <span className="logout-badge" title="Logout">
            <LogOut size={17} />
          </span>
        </button>
      </aside>
      {sidebar && typeof window !== "undefined" && window.innerWidth <= 768 && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebar(false)}
          aria-hidden="true"
        />
      )}
      <main className="workspace">
        <header className="topbar">
          <div className="topbar-left-group">
            <button
              type="button"
              className="anv-mobile-menu-btn"
              onClick={() => setSidebar((s) => !s)}
              aria-label="Open menu"
            >
              <Menu size={19} />
            </button>
            <div className="anv-mobile-brand-mini" onClick={() => navigate("dashboard")}>
              <img src="/anvayrobo-logo.jpeg" alt="ANVAYROBO" />
              <span>ANVAYROBO</span>
            </div>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <b>{page === "masters" ? "Academic Masters" : nav.find((x) => x[0] === page)?.[1]}</b>
            <span className="session-chip">
              <Calendar size={13} />
              <span>Session {config.session}</span>
            </span>
          </div>
          <div className="topbar-right">
            <div className="anv-notif-wrap">
              <button
                type="button"
                className="anv-icon-btn"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={17} />
                <span className="anv-notif-dot">{students.length ? Math.min(99, students.length) : 1}</span>
              </button>
              {notifOpen && (
                <div className="anv-notif-popover" role="region" aria-label="Notifications">
                  <div className="anv-notif-head">
                    <span>Workspace Updates</span>
                    <button type="button" className="text-button" onClick={() => setNotifOpen(false)}>
                      Close
                    </button>
                  </div>
                  <button
                    type="button"
                    className="anv-notif-item"
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("students");
                    }}
                  >
                    <Users size={16} />
                    <div>
                      <strong>{students.length} Active Students</strong>
                      <div>Session {config.session} directory synced</div>
                    </div>
                  </button>
                  {canOpenPage(user, "review") && (
                    <button
                      type="button"
                      className="anv-notif-item"
                      onClick={() => {
                        setNotifOpen(false);
                        navigate("review");
                      }}
                    >
                      <ClipboardCheck size={16} />
                      <div>
                        <strong>Report Review Queue</strong>
                        <div>Inspect submitted &amp; published report cards</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
            <div
              className={`topbar-user-capsule ${theme === "dark" ? "is-dark" : "is-light"}`}
            >
              <button
                type="button"
                className="topbar-avatar-circle topbar-toggle-knob"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="topbar-avatar-img"
                  />
                ) : (
                  <span className="topbar-avatar-letter">
                    {user.name?.slice(0, 1) || "S"}
                  </span>
                )}
                <span className="theme-toggle-indicator">
                  {theme === "dark" ? <Moon size={9} /> : <Sun size={9} />}
                </span>
              </button>
              <div
                className="topbar-user-text"
                onClick={() => setViewingProfile(true)}
                title="Click to view/edit profile"
              >
                <span className="user-capsule-name">{user.name?.split(" ")[0] || "School"}</span>
                <span className="user-capsule-role">{user.designation || (user.role === "admin" ? "Principal" : "Staff")}</span>
              </div>
            </div>
          </div>
        </header>
        {viewingProfile && (
          <StaffViewModal
            staff={user}
            onClose={() => setViewingProfile(false)}
            onEdit={() => {
              setViewingProfile(false);
              setEditingProfile(true);
            }}
            onManageAccess={user.role === "admin" ? () => {
              setViewingProfile(false);
              setPage("users");
            } : null}
          />
        )}
        {editingProfile && (
          <StaffModal
            staff={user}
            currentUser={user}
            onClose={() => setEditingProfile(false)}
            onSaved={(updatedUser) => {
              setEditingProfile(false);
              setUser(updatedUser);
              window.dispatchEvent(new CustomEvent("srps:user-updated", { detail: updatedUser }));
              toast("Profile updated successfully");
            }}
            toast={toast}
          />
        )}
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
              classes={classes}
              sections={sections}
            />
          )}
          {page === "students" && (
            <Students
              students={students}
              open={open}
              go={navigate}
              reload={load}
              toast={toast}
              user={user}
              session={config.session}
              masters={masters}
              onUpdateMasters={handleUpdateMasters}
              subTab={studentSubTab}
              onTabChange={setStudentSubTab}
            />
          )}
          {page === "masters" && (
            <AcademicMasters
              masters={masters}
              onUpdateMasters={handleUpdateMasters}
              toast={toast}
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
          {page === "users" && <UserAccess toast={toast} user={user} />}{" "}
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
      <MobileBottomNav
        page={page}
        onNavigate={navigate}
        onOpenMore={() => setMoreDrawerOpen(true)}
        canOpenPage={canOpenPage}
        user={user}
      />
      <MobileMoreDrawer
        open={moreDrawerOpen}
        onClose={() => setMoreDrawerOpen(false)}
        navItems={nav}
        currentPage={page}
        onNavigate={navigate}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        user={user}
        onLogout={logout}
        onOpenProfile={() => setViewingProfile(true)}
      />
    </div>
  );
}
function CompanyBrand() {
  return (
    <div className="company-brand">
      <div className="brand-logo-frame mini">
        <img
          src="/anvayrobo-logo.jpeg"
          alt="ANVAYROBO company logo"
          width="44"
          height="44"
        />
      </div>
      <div>
        <span>Powered by</span>
        <strong className="brand-wordmark">
          <span className="brand-anvay">ANVAY</span>
          <span className="brand-robo">ROBO</span>
        </strong>
        <small className="brand-sub">AI • ROBOTICS • STEM • AUTOMATION</small>
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

function StudentFlipBook({
  student,
  session,
  reportStatus,
  onOpen,
  onEdit,
  onToggleStatus,
  onDelete,
  onIdCard,
  onWhatsApp,
  onEmail,
  user,
  teacher,
  statusBusy = false,
  whatsappBusy = false,
  emailBusy = false,
}) {
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const badge = getHouseBadge(student.house);
  const HouseIcon = badge?.Icon || Home;
  const isPublished = reportStatus?.published;

  const canEdit = hasStudentAction(user, "studentEdit");
  const canStatus = hasStudentAction(user, "studentStatus");
  const canDelete = hasStudentAction(user, "studentDelete");
  const canWhatsapp = hasStudentAction(user, "studentWhatsapp");
  const canEmail = hasStudentAction(user, "studentEmail");

  const whatsappReady = Boolean(student.active && isPublished);
  const emailReady = Boolean(student.active && isPublished && student.email);

  const handleWrapperClick = () => {
    const isTouchOrMobile =
      typeof window !== "undefined" &&
      window.matchMedia?.("(hover: none), (max-width: 1024px)").matches;
    if (isTouchOrMobile && !isOpen) {
      setIsOpen(true);
      return;
    }
    onOpen();
  };

  return (
    <div
      className={`student-book-wrapper ${isOpen ? "is-open" : ""}`}
      onClick={handleWrapperClick}
      onMouseLeave={() => {
        setPage(1);
        setIsOpen(false);
      }}
      title={`Click to open ${student.name} in Report Studio`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleWrapperClick();
        }
      }}
    >
      <div className="student-book">
        {/* Inside Page (Realistic 3-page interactive mini book) */}
        <div className={`student-book-inside page-${page}`}>
          {/* Top Page Switch Tabs (Report, Actions, Faculty) */}
          <div className="book-page-nav-bar" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={`book-nav-tab ${page === 1 ? "active" : ""}`}
              onClick={() => setPage(1)}
              title="Page 1: Progress Report Preview"
            >
              <FileText size={10} />
              <span>Report</span>
            </button>
            <button
              type="button"
              className={`book-nav-tab ${page === 2 ? "active" : ""}`}
              onClick={() => setPage(2)}
              title="Page 2: Student Actions"
            >
              <Sparkles size={10} />
              <span>Actions</span>
            </button>
            <button
              type="button"
              className={`book-nav-tab ${page === 3 ? "active" : ""}`}
              onClick={() => setPage(3)}
              title="Page 3: Class Teacher Profile"
            >
              <GraduationCap size={10} />
              <span>Teacher</span>
            </button>
            <span className="book-page-counter">{page}/3</span>
            {isOpen && (
              <button
                type="button"
                className="book-nav-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  setPage(1);
                }}
                title="Close preview"
                aria-label="Close preview"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {page === 1 && (
            /* PAGE 1: Academic Progress Report Card Preview */
            <div className="book-page-content page-report">
              <div className="mini-report-header">
                <img
                  src="/srps-logo.png"
                  alt="SRPS Emblem"
                  className="mini-emblem-img"
                />
                <div className="mini-header-text">
                  <h4>SHREE RAM PUBLIC SCHOOL</h4>
                  <p>PROGRESS REPORT CARD</p>
                  <small>SESSION {session || "2025-26"}</small>
                </div>
              </div>

              <div className="mini-student-meta">
                <div className="mini-meta-row">
                  <span>Student:</span>
                  <b>{student.name}</b>
                </div>
                <div className="mini-meta-row">
                  <span>Adm No:</span>
                  <b>#{student.admissionNo}</b>
                </div>
                <div className="mini-meta-row">
                  <span>Class & Sec:</span>
                  <b>Class {student.className} - {student.section}</b>
                </div>
                <div className="mini-meta-row">
                  <span>House:</span>
                  <b>{badge?.label || student.house || "—"}</b>
                </div>
              </div>

              <div className="mini-scorecard-preview">
                <div className="mini-score-row">
                  <span className="term-tag">Term 1 Assessment</span>
                  <div className="mini-progress-track">
                    <div className="mini-progress-fill" style={{ width: "85%" }} />
                  </div>
                </div>
                <div className="mini-score-row">
                  <span className="term-tag">Term 2 Assessment</span>
                  <div className="mini-progress-track">
                    <div className="mini-progress-fill term2" style={{ width: "78%" }} />
                  </div>
                </div>
                <div className="mini-status-row">
                  <span className="mini-status-label">Status:</span>
                  <span className={`mini-status-badge ${isPublished ? "published" : "draft"}`}>
                    {isPublished ? "Published" : "Assessment Active"}
                  </span>
                </div>
              </div>

              <div className="mini-book-action-row" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="open-studio-action-btn"
                  onClick={onOpen}
                  title="Open Report Studio"
                >
                  <SquareArrowOutUpRight size={12} />
                  <span>Open Studio</span>
                </button>
                <button
                  type="button"
                  className="book-page-turn-btn"
                  onClick={() => setPage(2)}
                  title="Turn to Page 2: Student Actions"
                >
                  <span>Actions</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {page === 2 && (
            /* PAGE 2: Creative Student Action Buttons */
            <div className="book-page-content page-actions">
              <div className="page2-header" onClick={(e) => e.stopPropagation()}>
                <span className="page2-title-tag">STUDENT ACTIONS</span>
                <span className="page2-sub-tag">{student.name.split(" ")[0]}</span>
              </div>

              {/* Creative Actions Cluster matching user images */}
              <div className="creative-actions-cluster" onClick={(e) => e.stopPropagation()}>
                {/* 1. Edit details */}
                {canEdit && onEdit && (
                  <button
                    type="button"
                    className="creative-action-btn edit-action"
                    title={`Edit ${student.name}'s details`}
                    onClick={onEdit}
                  >
                    <div className="action-circle edit-circle">
                      <PenLine size={16} />
                    </div>
                    <span className="action-label">Edit</span>
                  </button>
                )}

                {/* 2. Disable / Enable status */}
                {canStatus && onToggleStatus && (
                  <button
                    type="button"
                    className={`creative-action-btn status-action ${student.active ? "active" : "disabled"}`}
                    title={`${student.active ? "Disable" : "Enable"} ${student.name}`}
                    disabled={statusBusy}
                    onClick={onToggleStatus}
                  >
                    <div className={`action-circle status-circle ${student.active ? "active" : "disabled"}`}>
                      {statusBusy ? (
                        <Loader size={14} inline />
                      ) : student.active ? (
                        <Power size={16} />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                    </div>
                    <span className="action-label">{student.active ? "Active" : "Disabled"}</span>
                  </button>
                )}

                {/* 3. WhatsApp Report Delivery */}
                {canWhatsapp && onWhatsApp && (
                  <button
                    type="button"
                    className={`creative-action-btn whatsapp-action ${whatsappReady ? "ready" : "locked"}`}
                    title={
                      !student.active
                        ? "Enable student before sending report"
                        : isPublished
                          ? `${reportStatus?.sentAt ? "Resend" : "Send"} published report by WhatsApp`
                          : "Available after the report is published"
                    }
                    disabled={!whatsappReady || whatsappBusy}
                    onClick={onWhatsApp}
                  >
                    <div className="action-circle whatsapp-circle">
                      {whatsappBusy ? (
                        <Loader size={14} inline />
                      ) : (
                        <WhatsAppIcon size={17} />
                      )}
                      {reportStatus?.sentAt && (
                        <span className="action-tick-badge" title="Delivered">✓</span>
                      )}
                    </div>
                    <span className="action-label">WhatsApp</span>
                  </button>
                )}

                {/* 4. Email Report Delivery */}
                {canEmail && onEmail && (
                  <button
                    type="button"
                    className={`creative-action-btn email-action ${emailReady ? "ready" : "locked"}`}
                    title={
                      !student.active
                        ? "Enable student before sending report"
                        : !student.email
                          ? "Add parent/guardian email in Edit student"
                          : isPublished
                            ? `${reportStatus?.emailSentAt ? "Resend" : "Send"} published report by email`
                            : "Available after the report is published"
                    }
                    disabled={!emailReady || emailBusy}
                    onClick={onEmail}
                  >
                    <div className="action-circle email-circle">
                      {emailBusy ? (
                        <Loader size={14} inline />
                      ) : (
                        <Mail size={16} />
                      )}
                      {reportStatus?.emailSentAt && (
                        <span className="action-tick-badge" title="Email sent">✓</span>
                      )}
                    </div>
                    <span className="action-label">Email</span>
                  </button>
                )}

                {/* 5. Print ID Card with QR */}
                {student.active && onIdCard && (
                  <button
                    type="button"
                    className="creative-action-btn idcard-action"
                    title={`Print ID Card with QR for ${student.name}`}
                    onClick={onIdCard}
                  >
                    <div className="action-circle idcard-circle">
                      <QrCode size={16} />
                    </div>
                    <span className="action-label">ID Card</span>
                  </button>
                )}

                {/* 6. Delete Student (admin only) */}
                {canDelete && onDelete && (
                  <button
                    type="button"
                    className="creative-action-btn delete-action"
                    title={`Permanently delete ${student.name}`}
                    onClick={onDelete}
                  >
                    <div className="action-circle delete-circle">
                      <Trash2 size={16} />
                    </div>
                    <span className="action-label">Delete</span>
                  </button>
                )}
              </div>

              <div className="mini-book-action-row nav-two-way" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="book-back-turn-btn"
                  onClick={() => setPage(1)}
                  title="Back to Report Preview"
                >
                  <ChevronLeft size={13} />
                  <span>Report</span>
                </button>
                <button
                  type="button"
                  className="book-page-turn-btn"
                  onClick={() => setPage(3)}
                  title="Turn to Page 3: Class Teacher"
                >
                  <span>Teacher</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {page === 3 && (
            /* PAGE 3: Class Teacher (Faculty) Profile */
            <div className="book-page-content page-teacher">
              <div className="page3-header" onClick={(e) => e.stopPropagation()}>
                <span className="faculty-badge-pill">
                  <GraduationCap size={11} />
                  <span>CLASS IN-CHARGE</span>
                </span>
                <span className="faculty-class-tag">
                  Class {student.className} · {student.section}
                </span>
              </div>

              <div className="teacher-showcase-card">
                <div className="teacher-avatar-wrapper">
                  {teacher?.photo ? (
                    <img
                      src={teacher.photo}
                      alt={teacher.name || "Class Teacher"}
                      className="teacher-avatar-large"
                    />
                  ) : (
                    <div className="teacher-avatar-placeholder">
                      <span>{teacher?.name ? teacher.name.trim().charAt(0).toUpperCase() : (user?.name ? user.name.trim().charAt(0).toUpperCase() : "T")}</span>
                    </div>
                  )}
                  <span className="teacher-verified-shield" title="Verified Faculty">✓</span>
                </div>

                <div className="teacher-profile-info">
                  <h4 className="teacher-name-title" title={teacher?.name || user?.name || "Class Teacher"}>
                    {teacher?.name || (user?.role === "teacher" ? user.name : "Class Educator")}
                  </h4>
                  <div className="teacher-designation-badge">
                    <span>{teacher?.designation || (user?.role === "teacher" ? user.designation : "PRT") || "PRT"}</span>
                  </div>
                  <p className="teacher-role-description">
                    SRPS Academic Educator & Class Mentor
                  </p>
                </div>

                <div className="teacher-contact-capsule">
                  <span className="capsule-item">Class {student.className}-{student.section}</span>
                  <span className="capsule-dot">•</span>
                  <span className="capsule-item">In-Charge</span>
                </div>
              </div>

              <div className="mini-book-action-row nav-two-way" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="book-back-turn-btn"
                  onClick={() => setPage(2)}
                  title="Back to Actions"
                >
                  <ChevronLeft size={13} />
                  <span>Actions</span>
                </button>
                <button
                  type="button"
                  className="open-studio-action-btn compact"
                  onClick={onOpen}
                  title="Open Report Studio"
                >
                  <SquareArrowOutUpRight size={12} />
                  <span>Studio</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Front Cover (3D flap that rotates -82deg on hover or tap) */}
        <div
          className="student-book-cover"
          onClick={(e) => {
            if (isOpen) {
              e.stopPropagation();
              setIsOpen(false);
              setPage(1);
            }
          }}
        >
          <div className="cover-spine-crease" />

          <div className="cover-top-badge">
            <span className="school-mini-tag">SRPS REPORT STUDIO</span>
            <span className="session-pill">{session || "2025-26"}</span>
          </div>

          <div className="cover-portrait-box">
            {student.photo ? (
              <img
                src={student.photo}
                alt={student.name}
                className="cover-avatar-img"
              />
            ) : (
              <div className={`cover-avatar-fallback house-${badge?.className || "default"}`}>
                <span>{student.name ? student.name[0] : "S"}</span>
              </div>
            )}
          </div>

          <div className="cover-info-block">
            <h3 className="cover-student-name" title={student.name}>
              {student.name}
            </h3>
            <div className="cover-class-pill">
              <GraduationCap size={13} />
              <span>Class {student.className} · {student.section}</span>
            </div>
            <div className="cover-adm-badge">
              <span>Adm No: <b>{student.admissionNo}</b></span>
              {student.rollNo && student.rollNo !== student.admissionNo && (
                <span>Roll: <b>{student.rollNo}</b></span>
              )}
            </div>
          </div>

          <div className="cover-footer-row">
            <span className={`cover-house-tag house-${badge?.className || "default"}`}>
              <HouseIcon size={12} />
              <span>{badge?.label || student.house || "School"}</span>
            </span>
            <span className="cover-flip-hint">
              <span className="hint-desktop">Hover to preview</span>
              <span className="hint-mobile">Tap to preview</span>
              <span className="flip-arrow">➔</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Students({
  students,
  open,
  go,
  reload,
  toast,
  user,
  session,
  compact = false,
  masters,
  onUpdateMasters,
  subTab: propSubTab,
  onTabChange,
}) {
  const [internalSubTab, setInternalSubTab] = useState(propSubTab || "directory");
  const subTab = propSubTab !== undefined ? propSubTab : internalSubTab;
  const setSubTab = (t) => {
    setInternalSubTab(t);
    if (onTabChange) onTabChange(t);
  };
  const [q, setQ] = useState(""),
    [cls, setCls] = useState(""),
    [sec, setSec] = useState(""),
    [editing, setEditing] = useState(null),
    [idCardStudent, setIdCardStudent] = useState(null),
    [showPromotionModal, setShowPromotionModal] = useState(false),
    [status, setStatus] = useState("active"),
    [shown, setShown] = useState(students),
    [statusBusy, setStatusBusy] = useState(false),
    [reportStatuses, setReportStatuses] = useState({}),
    [whatsappBusyId, setWhatsappBusyId] = useState(""),
    [emailBusyId, setEmailBusyId] = useState(""),
    [classTeachers, setClassTeachers] = useState([]),
    [currentPage, setCurrentPage] = useState(1),
    [pageSize, setPageSize] = useState(10),
    [viewMode, setViewMode] = useState(() => {
      try {
        return localStorage.getItem("srps_students_view_mode") || "list";
      } catch {
        return "list";
      }
    });

  useEffect(() => {
    try {
      localStorage.setItem("srps_students_view_mode", viewMode);
    } catch { }
  }, [viewMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, cls, sec, status]);
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
        .catch(() => { });
    };
    fetchStatus();
    const timer = setInterval(fetchStatus, 8000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [session, students, user.role, user.studentActions]);

  useEffect(() => {
    let cancelled = false;
    api("/class-teachers")
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setClassTeachers(data);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, []);
  const filtered = shown.filter(
    (s) =>
      (!cls || s.className === cls) &&
      (!sec || s.section === sec) &&
      `${s.name} ${s.admissionNo} ${s.house}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const pagedStudents = filtered.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
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
  if (!compact && user.role === "admin" && subTab === "masters") {
    return (
      <AcademicMasters
        masters={masters}
        onUpdateMasters={onUpdateMasters}
        toast={toast}
      />
    );
  }

  return (
    <>
      {!compact && (
        <>
          <HeroBanner
            title="Student Directory"
            subtitle="Every student. One place."
            actions={
              <>
                {["admin", "principal"].includes(user.role) && (
                  <button
                    type="button"
                    className="btn anv-compact-action"
                    onClick={() => setShowPromotionModal(true)}
                    title="Promote Class"
                    aria-label="Promote Class"
                  >
                    <ArrowUpDown size={16} />
                    <span className="anv-action-label">Promote</span>
                  </button>
                )}
                {hasStudentAction(user, "studentCreate") && (
                  <button
                    className="btn primary anv-compact-action"
                    onClick={() => setEditing({})}
                    title="Add Student"
                    aria-label="Add Student"
                  >
                    <Plus size={17} />
                    <span className="anv-action-label">Add</span>
                  </button>
                )}
              </>
            }
          />
          <div className="anv-stats-row">
            <StatCard
              icon={Users}
              label="Total Students"
              value={students.length}
              tone="blue"
            />
            <StatCard
              icon={CheckCircle2}
              label="Active Students"
              value={students.filter((s) => s.active !== false).length}
              tone="green"
            />
            <StatCard
              icon={Search}
              label="Matching Filter"
              value={filtered.length}
              tone="amber"
            />
            <StatCard
              icon={Calendar}
              label="This Session"
              value={session}
              tone="purple"
            />
          </div>
        </>
      )}
      <div className={!compact ? "anv-directory-layout" : ""}>
      <section className="card directory">
        <div className="filter-bar anv-filter-bar">
          <label className="search-box">
            <Search size={17} />
            <input
              placeholder="Search name, admission no. or house…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <div className="anv-filter-controls-row">
            <select
              aria-label="Filter class"
              value={cls}
              onChange={(e) => setCls(e.target.value)}
            >
              <option value="">Class</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {!compact && canManageStudents && hasStudentAction(user, "studentStatus") && (
              <select
                aria-label="Filter student status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            )}
            <select
              aria-label="Filter section"
              value={sec}
              onChange={(e) => setSec(e.target.value)}
            >
              <option value="">Section</option>
              {sections.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <div className="view-mode-toggle" title="Switch layout view">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
                aria-label="List View"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="3D Flip Book Grid View"
                aria-label="3D Flip Book Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>
        {viewMode === "list" ? (
          <>
          <div className="anv-mobile-student-cards">
            {pagedStudents.map((s) => (
              <div key={s._id} className="anv-mobile-student-card">
                <div className="anv-msc-top">
                  <div className="anv-msc-identity" onClick={() => open(s)} style={{ cursor: "pointer" }}>
                    <div className="anv-msc-avatar">
                      {s.photo ? <img src={s.photo} alt={s.name} /> : s.name?.slice(0, 1) || "S"}
                    </div>
                    <div className="anv-msc-title">
                      <b>{s.name}</b>
                      <div className="anv-msc-meta-pills">
                        <span className="anv-msc-pill class-pill">
                          Class {s.className} · {s.section}
                        </span>
                        <span className="anv-msc-pill adm-pill">
                          #{s.admissionNo}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button type="button" className="anv-icon-btn anv-msc-go-btn" onClick={() => open(s)} title="Open report">
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="anv-msc-actions">
                  <button type="button" className="anv-msc-action-btn report-btn" onClick={() => open(s)}>
                    <BookOpen size={14} /> <span>Report</span>
                  </button>
                  <button type="button" className="anv-msc-action-btn id-btn" onClick={() => setIdCardStudent(s)}>
                    <QrCode size={14} /> <span>ID Card</span>
                  </button>
                  {hasStudentAction(user, "studentEdit") && (
                    <button type="button" className="anv-msc-action-btn edit-btn" onClick={() => setEditing(s)}>
                      <PenLine size={14} /> <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
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
                {pagedStudents.map((s) => (
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
                        const badge = getHouseBadge(s.house);
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
                        {s.active && (
                          <button
                            className="icon-button"
                            title={`Print ID Card with QR for ${s.name}`}
                            aria-label={`Print ID Card with QR for ${s.name}`}
                            onClick={() => setIdCardStudent(s)}
                          >
                            <QrCode size={16} />
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
                                {emailBusyId === String(s._id) ? <Loader size={18} inline /> : <Mail size={18} />}
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
          </>
        ) : (
          <div className="students-book-grid">
            {pagedStudents.map((s) => {
              const classTeacher =
                classTeachers.find((t) =>
                  (t.assignments || []).some(
                    (a) =>
                      String(a.className || "").trim().toLowerCase() === String(s.className || "").trim().toLowerCase() &&
                      String(a.section || "").trim().toLowerCase() === String(s.section || "").trim().toLowerCase(),
                  ),
                ) ||
                (user.role === "teacher" &&
                  (user.assignments || []).some(
                    (a) =>
                      String(a.className || "").trim().toLowerCase() === String(s.className || "").trim().toLowerCase() &&
                      String(a.section || "").trim().toLowerCase() === String(s.section || "").trim().toLowerCase(),
                  )
                  ? user
                  : user.role === "teacher"
                    ? user
                    : null);

              return (
                <StudentFlipBook
                  key={s._id}
                  student={s}
                  session={session}
                  reportStatus={reportStatuses[String(s._id)]}
                  onOpen={() => open(s)}
                  onEdit={() => setEditing(s)}
                  onToggleStatus={() => toggleStatus(s)}
                  onDelete={() => permanentlyDelete(s)}
                  onIdCard={() => setIdCardStudent(s)}
                  onWhatsApp={() => sendStudentReport(s)}
                  onEmail={() => sendStudentEmail(s)}
                  user={user}
                  teacher={classTeacher}
                  statusBusy={statusBusy}
                  whatsappBusy={whatsappBusyId === String(s._id)}
                  emailBusy={emailBusyId === String(s._id)}
                />
              );
            })}
          </div>
        )}
        {!filtered.length && <Empty text="No students found" />}
        <Pagination
          currentPage={safeCurrentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          itemLabel="students"
        />
      </section>
      </div>
      {editing && (
        <StudentModal
          student={editing}
          user={user}
          close={() => setEditing(null)}
          reload={reload}
          toast={toast}
        />
      )}
      {idCardStudent && (
        <StudentIdCardModal
          student={idCardStudent}
          onClose={() => setIdCardStudent(null)}
        />
      )}
      {showPromotionModal && (
        <PromotionModal
          students={students}
          classes={classes}
          sections={sections}
          reload={reload}
          toast={toast}
          onClose={() => setShowPromotionModal(false)}
        />
      )}
    </>
  );
}

function StudentIdCardModal({ student, onClose }) {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    if (student) {
      const payload = `SRPS-ID|ADM:${student.admissionNo}|NAME:${student.name}|CLS:${student.className}-${student.section}|DOB:${student.dob || ""}|PHONE:${student.mobile || ""}`;
      QRCode.toDataURL(payload, { width: 130, margin: 1 })
        .then(setQrUrl)
        .catch((err) => console.error("Error generating ID card QR", err));
    }
  }, [student]);

  const handlePrint = () => {
    window.print();
  };

  if (!student) return null;

  return (
    <div className="modal-backdrop receipt-modal-backdrop">
      <div className="receipt-modal-dialog id-card-dialog">
        <div className="receipt-toolbar no-print">
          <b>Student Identity Card</b>
          <div className="receipt-toolbar-actions">
            <button className="btn primary print-trigger-btn" onClick={handlePrint}>
              <Printer size={16} /> Print ID Card
            </button>
            <button className="btn-close-receipt" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="id-card-preview-area">
          <div className="school-id-card cr80">
            {/* Header with school name and logo */}
            <div className="id-card-header">
              <img
                src="/anvayrobo-logo.jpeg"
                alt="SRPS Logo"
                className="id-card-logo"
              />
              <div className="id-card-school-info">
                <h3>SHREE RAM PUBLIC SCHOOL</h3>
                <p>CBSE AFFILIATED · SENIOR SECONDARY</p>
                <span>KANHRA, CITY CAMPUS</span>
              </div>
            </div>

            <div className="id-card-title-bar">
              STUDENT IDENTITY CARD
            </div>

            {/* Body with photo & student details */}
            <div className="id-card-body">
              <div className="id-card-photo-box">
                {student.photo ? (
                  <img src={student.photo} alt={student.name} />
                ) : (
                  <div className="id-card-avatar-placeholder">
                    {student.name.slice(0, 1)}
                  </div>
                )}
                <span className="id-card-session-tag">2026-27</span>
              </div>

              <div className="id-card-info-table">
                <div className="id-card-name">{student.name}</div>
                <div className="id-card-row">
                  <span className="lbl">Class & Sec:</span>
                  <b>{student.className} - {student.section}</b>
                </div>
                <div className="id-card-row">
                  <span className="lbl">Admission No:</span>
                  <b>{student.admissionNo}</b>
                </div>
                {student.rollNo && (
                  <div className="id-card-row">
                    <span className="lbl">Roll No:</span>
                    <span>{student.rollNo}</span>
                  </div>
                )}
                <div className="id-card-row">
                  <span className="lbl">Father's Name:</span>
                  <span>{student.fatherName || "—"}</span>
                </div>
                <div className="id-card-row">
                  <span className="lbl">DOB:</span>
                  <span>{student.dob || "—"}</span>
                </div>
                <div className="id-card-row">
                  <span className="lbl">Blood Group:</span>
                  <b>{student.bloodGroup || "—"}</b>
                </div>
                <div className="id-card-row">
                  <span className="lbl">Emergency Phone:</span>
                  <b>{student.emergencyContact || student.mobile || "—"}</b>
                </div>
              </div>

              {qrUrl && (
                <div className="id-card-qr-box">
                  <img src={qrUrl} alt="Student QR Verification" />
                  <span>Scan to verify</span>
                </div>
              )}
            </div>

            {/* Footer with Principal signature */}
            <div className="id-card-footer">
              <div className="id-card-stamp">Valid for Session 2026-2027</div>
              <div className="id-card-sign">
                <div className="sign-line" />
                <span>Principal Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromotionModal({ students, classes, sections, reload, toast, onClose }) {
  const [fromClass, setFromClass] = useState(classes[0] || "1");
  const [fromSection, setFromSection] = useState(sections[0] || "A");
  const [toClass, setToClass] = useState(classes[1] || "2");
  const [toSection, setToSection] = useState(sections[0] || "A");
  const [selectedIds, setSelectedIds] = useState([]);
  const [saving, setSaving] = useState(false);

  // Filter students by source class and section
  const cohort = students.filter(
    (s) => s.className === fromClass && s.section === fromSection && s.active
  );

  // Auto-select all by default when cohort changes
  useEffect(() => {
    setSelectedIds(cohort.map((s) => s._id));
  }, [fromClass, fromSection, students]);

  const toggleStudent = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cohort.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cohort.map((s) => s._id));
    }
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    if (!selectedIds.length) {
      return toast?.("Select at least one student to promote", true);
    }
    if (fromClass === toClass && fromSection === toSection) {
      return toast?.("Target Class and Section must be different from current", true);
    }

    if (
      !window.confirm(
        `Are you sure you want to promote ${selectedIds.length} student(s) from Class ${fromClass}-${fromSection} to Class ${toClass}-${toSection}?`
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const res = await api("/students/promote", {
        method: "POST",
        body: {
          studentIds: selectedIds,
          toClass,
          toSection,
        },
      });
      toast?.(`Successfully promoted ${res.promoted} student(s) to Class ${toClass}-${toSection}!`);
      await reload();
      onClose();
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: "680px" }}>
        <div className="modal-head">
          <div>
            <h2>Batch Class Promotion</h2>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
              Promote passing students to the next academic cohort.
            </p>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handlePromote}>
          {/* Source and Target Cohorts */}
          <div className="promotion-cohort-grid">
            <div className="promotion-cohort-box source">
              <h4>Current Cohort (Source)</h4>
              <div className="field-row">
                <Field label="Current Class">
                  <select
                    value={fromClass}
                    onChange={(e) => setFromClass(e.target.value)}
                  >
                    {classes.map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Current Section">
                  <select
                    value={fromSection}
                    onChange={(e) => setFromSection(e.target.value)}
                  >
                    {sections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            <div className="promotion-arrow-icon">
              <ArrowRight size={22} />
            </div>

            <div className="promotion-cohort-box target">
              <h4>Promote To (Target)</h4>
              <div className="field-row">
                <Field label="Target Class *">
                  <select
                    value={toClass}
                    onChange={(e) => setToClass(e.target.value)}
                    required
                  >
                    {classes.map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Target Section *">
                  <select
                    value={toSection}
                    onChange={(e) => setToSection(e.target.value)}
                    required
                  >
                    {sections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </div>

          {/* Student selection table */}
          <div className="promotion-students-list">
            <div className="promotion-list-header">
              <b>Students in Class {fromClass}-{fromSection} ({cohort.length})</b>
              <button
                type="button"
                className="btn-select-all"
                onClick={toggleSelectAll}
              >
                {selectedIds.length === cohort.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            {cohort.length === 0 ? (
              <div className="empty-subtle" style={{ padding: "20px", textAlign: "center" }}>
                No active students found in Class {fromClass}-{fromSection}.
              </div>
            ) : (
              <div className="promotion-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}></th>
                      <th>Student Name</th>
                      <th>Admission No</th>
                      <th>Roll No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohort.map((s) => (
                      <tr key={s._id} onClick={() => toggleStudent(s._id)} style={{ cursor: "pointer" }}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(s._id)}
                            onChange={() => toggleStudent(s._id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>
                          <b>{s.name}</b>
                        </td>
                        <td>{s.admissionNo}</td>
                        <td>{s.rollNo || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={saving || !selectedIds.length}
            >
              {saving ? "Promoting…" : `Promote Selected (${selectedIds.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function StudentModal({ student, user, close, reload, toast }) {
  const [data, setData] = useState({
    admissionNo: "",
    rollNo: "",
    name: "",
    className: student?.className || classes[0] || "6",
    section: student?.section || sections[0] || "Venus",
    house: student?.house || houses[0] || "Himalaya",
    gender: "Male",
    bloodGroup: "B+",
    aadhaarNo: "",
    penNo: "",
    category: "General",
    motherName: "",
    fatherName: "",
    dob: "",
    address: "",
    mobile: "",
    emergencyContact: "",
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
      <form className="modal" onSubmit={save} style={{ maxWidth: "780px" }}>
        <div className="modal-head">
          <h2>{student._id ? "Edit student" : "Add a student"}</h2>
          <button type="button" className="icon-button" onClick={close}>
            <X />
          </button>
        </div>
        <div className="form-grid">
          {[
            ["admissionNo", "Admission number *"],
            ["rollNo", "Roll Number"],
            ["name", "Student name *"],
            ["fatherName", "Father’s name"],
            ["motherName", "Mother’s name"],
            ["dob", "Date of birth"],
            ["mobile", "Parent/guardian WhatsApp number"],
            ["emergencyContact", "Emergency contact phone"],
            ["email", "Parent/guardian email"],
            ["aadhaarNo", "Student Aadhaar Number"],
            ["penNo", "PEN (Permanent Education No)"],
            ["address", "Address"],
          ].map(([k, label]) => (
            <Field key={k} label={label}>
              <input
                type={k === "dob" ? "date" : k === "email" ? "email" : "text"}
                required={["admissionNo", "name"].includes(k)}
                value={data[k] || ""}
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
          <Field label="Gender">
            <select
              value={data.gender || "Male"}
              onChange={(e) => set("gender", e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Blood Group">
            <select
              value={data.bloodGroup || "B+"}
              onChange={(e) => set("bloodGroup", e.target.value)}
            >
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </Field>
          <Field label="Social Category">
            <select
              value={data.category || "General"}
              onChange={(e) => set("category", e.target.value)}
            >
              {["General", "OBC", "SC", "ST", "EWS"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </Field>
          <Field label="House">
            <select
              value={data.house}
              onChange={(e) => set("house", e.target.value)}
            >
              {(houses.length ? houses : ["Himalaya", "Aravali", "Nilgiri", "Shivalik"]).map((c) => (
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
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [studentPickerQuery, setStudentPickerQuery] = useState("");
  const studentPickerRef = useRef(null);
  useEffect(() => {
    if (!studentPickerOpen) return;
    const handleOutside = (e) => {
      if (studentPickerRef.current && !studentPickerRef.current.contains(e.target)) {
        setStudentPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [studentPickerOpen]);
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
    if (report && report.status !== "published") {
      setConfig(resolveConfigForClass(baseConfig, student?.className));
    }
  }, [baseConfig, student?.className, report?.status]);
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
    const normalizedMarks = {};
    for (const t of ["term1", "term2"]) {
      normalizedMarks[t] = {};
      for (const [subId, row] of Object.entries(report.marks?.[t] || {})) {
        const cleanRow = {};
        for (const [k, v] of Object.entries(row || {})) {
          cleanRow[k] = v === "A" ? "AB" : v;
        }
        normalizedMarks[t][subId] = cleanRow;
      }
    }
    const cleanReport = { ...report, marks: normalizedMarks };
    const errors = validateMarks(cleanReport.marks, config);
    if (errors.length) {
      toast(errors[0], true);
      return null;
    }
    setBusy(true);
    try {
      const r = await api(`/reports/${student._id}/${session}`, {
        method: "PUT",
        body: cleanReport,
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
        <Loader size={130} text="Loading report…" />
      </div>
    );
  const calc = calculate(report.marks, config),
    locked = report.status !== "draft";
  return (
    <>
      <div className="studio-heading">
        <div>
          <h1>
            Report studio{" "}
            <span className={"status-badge " + report.status}>
              {report.status}
            </span>
          </h1>
          <div className="anv-student-picker" ref={studentPickerRef}>
            <button
              type="button"
              className={`anv-student-picker-trigger ${studentPickerOpen ? "open" : ""}`}
              aria-label="Choose student"
              aria-expanded={studentPickerOpen}
              onClick={() => setStudentPickerOpen((v) => !v)}
            >
              <span className="anv-sp-avatar">
                {student.photo ? (
                  <img src={student.photo} alt={student.name} />
                ) : (
                  student.name?.slice(0, 1) || "S"
                )}
              </span>
              <span className="anv-sp-info">
                <b>
                  {student.name} · {student.admissionNo}
                </b>
                <small>
                  Class {student.className} · {student.section}
                </small>
              </span>
              <ChevronDown size={16} className="anv-sp-chevron" />
            </button>

            {studentPickerOpen && (
              <div className="anv-student-picker-menu">
                <div className="anv-sp-search-wrap">
                  <Search size={14} />
                  <input
                    type="text"
                    value={studentPickerQuery}
                    onChange={(e) => setStudentPickerQuery(e.target.value)}
                    placeholder="Search name, adm no, class..."
                    autoFocus
                  />
                  {studentPickerQuery && (
                    <button
                      type="button"
                      className="anv-sp-clear"
                      onClick={() => setStudentPickerQuery("")}
                      aria-label="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <div className="anv-sp-list">
                  {students
                    .filter((s) => {
                      const q = studentPickerQuery.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        String(s.name || "").toLowerCase().includes(q) ||
                        String(s.admissionNo || "").toLowerCase().includes(q) ||
                        String(s.className || "").toLowerCase().includes(q) ||
                        String(s.section || "").toLowerCase().includes(q)
                      );
                    })
                    .map((s) => {
                      const isSelected = s._id === student._id;
                      return (
                        <button
                          key={s._id}
                          type="button"
                          className={`anv-sp-item ${isSelected ? "active" : ""}`}
                          onClick={() => {
                            setStudentPickerOpen(false);
                            setStudentPickerQuery("");
                            if (s._id === student._id) return;
                            if (dirty && !confirm("Discard unsaved changes?")) return;
                            changeStudent(s);
                          }}
                        >
                          <span className="anv-sp-item-avatar">
                            {s.photo ? (
                              <img src={s.photo} alt={s.name} />
                            ) : (
                              s.name?.slice(0, 1) || "S"
                            )}
                          </span>
                          <span className="anv-sp-item-meta">
                            <b>{s.name} · {s.admissionNo}</b>
                            <small>Class {s.className} · {s.section}</small>
                          </span>
                          {isSelected && <Check size={15} className="anv-sp-check" />}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
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
            className="btn anv-studio-icon-btn"
            onClick={() => printReports().catch((e) => toast(e.message, true))}
            title="Print report"
            aria-label="Print report"
          >
            <Printer size={17} />
          </button>
          <button
            className="btn anv-studio-icon-btn"
            onClick={pdf}
            disabled={pdfBusy}
            title="Download PDF"
            aria-label="Download PDF"
          >
            {pdfBusy ? <Loader size={17} inline /> : <Download size={17} />}
          </button>
          {!locked && (
            <button
              className="btn primary anv-studio-icon-btn"
              disabled={busy}
              onClick={save}
              title={busy ? "Saving…" : "Save draft"}
              aria-label={busy ? "Saving…" : "Save draft"}
            >
              <Save size={17} />
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
              <div className="marks-entry">
                <table>
                  <thead>
                    <tr>
                      <th>SUBJECT</th>
                      {getTermComponents(term, config).map((c) => (
                        <th key={c.id} title={c.label}>
                          {c.label}
                          <small>/{c.max}</small>
                        </th>
                      ))}
                      <th>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.subjects.map((s, i) => {
                      const comps = getTermComponents(term, config);
                      return (
                        <tr key={s.id}>
                          <td>
                            <b>{s.name}</b>
                            <small>{calc.terms?.[term]?.[i]?.grade || "—"}</small>
                          </td>
                          {comps.map((c) => {
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
                              {calc.terms?.[term]?.[i]?.total ?? "—"}
                            </b>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="entry-legend">
                {(() => {
                  const t1 = getTermComponents("term1", config);
                  const t2 = getTermComponents("term2", config);
                  const cur = term === "term1" ? t1 : t2;
                  const t1Max = t1.reduce((s, c) => s + Number(c.max || 0), 0);
                  const t2Max = t2.reduce((s, c) => s + Number(c.max || 0), 0);
                  const curMax = term === "term1" ? t1Max : t2Max;
                  return (
                    <>
                      <span>{cur.map((c) => `${c.label}: ${c.max}`).join(" · ")}</span>
                      <span>
                        Term Max: {curMax} · Subject Total: {t1Max + t2Max}
                      </span>
                    </>
                  );
                })()}
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
              <p>A+ · A · B+ · B · C grading scale</p>
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
                            {["A+", "A", "B+", "B", "C"].map((g) => (
                              <option key={g} value={g}>{g}</option>
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
                    const chosen = other
                      ? teacherRemarks.includes(report.remarks)
                        ? ""
                        : report.remarks || ""
                      : e.target.value.replaceAll("{name}", student?.name || "Student");
                    update({
                      ...report,
                      remarks: chosen,
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
                      placeholder="Write your remarks here… (use {name} for student name)"
                      maxLength={1000}
                      value={report.remarks}
                      onChange={(e) =>
                        update({ ...report, remarks: e.target.value })
                      }
                      rows={4}
                    />
                    <div style={{ marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        Dynamic tag <code>{`{name}`}</code> automatically replaces with student's actual name.
                      </span>
                      <span style={{ fontSize: "11px", color: "#245A91", fontWeight: 600 }}>
                        ✍️ Prints in Realistic Handwritten Blue Ink ({config?.handwritingFont || "Kalam"})
                      </span>
                    </div>
                  </Field>
                )}
              {/* Attendance entry with Green Attended Days and Red Total Days */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px", marginBottom: "8px" }}>
                <Field label="Attended Days (Green)">
                  <input
                    type="text"
                    disabled={locked}
                    placeholder="e.g. 185"
                    value={(() => {
                      const str = String(report.attendance || "").trim();
                      if (str.includes("/")) return str.split("/")[0].replace(/[^0-9]/g, "").trim() || str.split("/")[0].trim();
                      return str;
                    })()}
                    onChange={(e) => {
                      const present = e.target.value.trim();
                      const currentTotal = (() => {
                        const str = String(report.attendance || "").trim();
                        if (str.includes("/")) return str.split("/")[1].replace(/[^0-9]/g, "").trim() || str.split("/")[1].trim();
                        return "";
                      })();
                      update({
                        ...report,
                        attendance: currentTotal ? `${present} / ${currentTotal}` : present,
                      });
                    }}
                    style={{ fontWeight: "700", color: "#16a34a" }}
                  />
                </Field>
                <Field label="Total Working Days (Red)">
                  <input
                    type="text"
                    disabled={locked}
                    placeholder="e.g. 200"
                    value={(() => {
                      const str = String(report.attendance || "").trim();
                      if (str.includes("/")) return str.split("/")[1].replace(/[^0-9]/g, "").trim() || str.split("/")[1].trim();
                      return "";
                    })()}
                    onChange={(e) => {
                      const total = e.target.value.trim();
                      const currentPresent = (() => {
                        const str = String(report.attendance || "").trim();
                        if (str.includes("/")) return str.split("/")[0].replace(/[^0-9]/g, "").trim() || str.split("/")[0].trim();
                        return str;
                      })();
                      update({
                        ...report,
                        attendance: total ? `${currentPresent || "0"} / ${total}` : currentPresent,
                      });
                    }}
                    style={{ fontWeight: "700", color: "#dc2626" }}
                  />
                </Field>
              </div>

              {/* Promoted To with Automatic default and manual override */}
              <Field label={`Promoted To (Auto: ${getNextClass(student.className)} · or manual custom)`}>
                <input
                  type="text"
                  disabled={locked}
                  placeholder={`Auto: ${getNextClass(student.className)}`}
                  value={report.promotedTo || ""}
                  onChange={(e) =>
                    update({ ...report, promotedTo: e.target.value })
                  }
                  style={{ fontWeight: "700", color: "#002060" }}
                />
                <span className="field-hint" style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", display: "block" }}>
                  Auto: <b>{getNextClass(student.className)}</b> (leave empty to use automatic next class, or type custom value).
                </span>
              </Field>
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
              <span className="single-page-badge" style={{ fontSize: "12px", fontWeight: "600", padding: "4px 10px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", color: "#1d4ed8" }}>
                Single Page A4
              </span>
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
            side="front"
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
                  side="front"
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
            <FileText size={14} /> A4 portrait · 1 page{" "}
            <span>Approved single-page artwork · proportional fit</span>
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
            {busy ? <Loader size={17} inline /> : <Eye size={17} />}{" "}
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
function AcademicMasters({ masters, onUpdateMasters, toast }) {
  const [activeTab, setActiveTab] = useState("classes");
  const [saving, setSaving] = useState(false);

  // Form states for adding
  const [newClassName, setNewClassName] = useState("");
  const [newClassOrder, setNewClassOrder] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [newHouseName, setNewHouseName] = useState("");
  const [newHouseColor, setNewHouseColor] = useState("#105568");
  const [newDesignationName, setNewDesignationName] = useState("");

  // Edit modal
  const [editingItem, setEditingItem] = useState(null); // { type, item }
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState(1);
  const [editColor, setEditColor] = useState("#105568");

  const currentClasses = Array.isArray(masters?.classes) && masters.classes.length
    ? masters.classes
    : DEFAULT_CLASSES.map((c, i) => ({ id: c, name: c, active: true, order: i + 1 }));

  const currentSections = Array.isArray(masters?.sections) && masters.sections.length
    ? masters.sections
    : DEFAULT_SECTIONS.map((s) => ({ id: s, name: s, active: true }));

  const currentHouses = Array.isArray(masters?.houses) && masters.houses.length
    ? masters.houses
    : DEFAULT_HOUSES.map((h, i) => ({
      id: h,
      name: h,
      color: ["#0284c7", "#f59e0b", "#10b981", "#8b5cf6"][i % 4],
      active: true,
    }));

  const currentDesignations = Array.isArray(masters?.designations) && masters.designations.length
    ? masters.designations
    : DEFAULT_DESIGNATIONS.map((d) => ({ id: d, name: d, active: true }));

  const [classPage, setClassPage] = useState(1);
  const [classPageSize, setClassPageSize] = useState(4);
  const [secPage, setSecPage] = useState(1);
  const [secPageSize, setSecPageSize] = useState(4);
  const [housePage, setHousePage] = useState(1);
  const [housePageSize, setHousePageSize] = useState(4);
  const [desigPage, setDesigPage] = useState(1);
  const [desigPageSize, setDesigPageSize] = useState(4);

  const safeClassPage = Math.min(Math.max(1, classPage), Math.max(1, Math.ceil(currentClasses.length / classPageSize)));
  const pagedClasses = currentClasses.slice((safeClassPage - 1) * classPageSize, safeClassPage * classPageSize);

  const safeSecPage = Math.min(Math.max(1, secPage), Math.max(1, Math.ceil(currentSections.length / secPageSize)));
  const pagedSections = currentSections.slice((safeSecPage - 1) * secPageSize, safeSecPage * secPageSize);

  const safeHousePage = Math.min(Math.max(1, housePage), Math.max(1, Math.ceil(currentHouses.length / housePageSize)));
  const pagedHouses = currentHouses.slice((safeHousePage - 1) * housePageSize, safeHousePage * housePageSize);

  const safeDesigPage = Math.min(Math.max(1, desigPage), Math.max(1, Math.ceil(currentDesignations.length / desigPageSize)));
  const pagedDesignations = currentDesignations.slice((safeDesigPage - 1) * desigPageSize, safeDesigPage * desigPageSize);

  const getBundle = () => ({
    classes: currentClasses,
    sections: currentSections,
    houses: currentHouses,
    designations: currentDesignations,
  });

  async function persistMasters(nextMasters) {
    setSaving(true);
    try {
      const res = await api("/masters", {
        method: "PUT",
        body: nextMasters,
      });
      const updated = res?.masters || res;
      if (updated && (Array.isArray(updated.classes) || Array.isArray(updated.sections))) {
        onUpdateMasters(updated);
      }
      toast("Academic masters updated successfully");
    } catch (err) {
      toast(err.message, true);
    } finally {
      setSaving(false);
    }
  }

  // CLASS ACTIONS
  function handleAddClass(e) {
    e.preventDefault();
    const name = newClassName.trim();
    if (!name) return toast("Class name is required", true);
    if (currentClasses.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return toast(`Class "${name}" already exists`, true);
    }
    const order = Number(newClassOrder) || (currentClasses.length + 1);
    const updated = [
      ...currentClasses,
      { id: name, name, active: true, order },
    ].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    const idx = updated.findIndex((c) => c.id === name);
    if (idx >= 0) setClassPage(Math.floor(idx / classPageSize) + 1);
    persistMasters({ ...getBundle(), classes: updated });
    setNewClassName("");
    setNewClassOrder("");
  }

  function handleToggleClass(item) {
    const updated = currentClasses.map((c) =>
      c.id === item.id ? { ...c, active: !c.active } : c
    );
    persistMasters({ ...getBundle(), classes: updated });
  }

  function handleDeleteClass(item) {
    if (!confirm(`Permanently delete Class "${item.name}" from masters? Existing student records will retain this class name, but it will be removed from future selection lists.`)) return;
    const updated = currentClasses.filter((c) => c.id !== item.id);
    persistMasters({ ...getBundle(), classes: updated });
  }

  // SECTION ACTIONS
  function handleAddSection(e) {
    e.preventDefault();
    const name = newSectionName.trim();
    if (!name) return toast("Section name is required", true);
    if (currentSections.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      return toast(`Section "${name}" already exists`, true);
    }
    const updated = [...currentSections, { id: name, name, active: true }];
    persistMasters({ ...getBundle(), sections: updated });
    setNewSectionName("");
  }

  function handleToggleSection(item) {
    const updated = currentSections.map((s) =>
      s.id === item.id ? { ...s, active: !s.active } : s
    );
    persistMasters({ ...getBundle(), sections: updated });
  }

  function handleDeleteSection(item) {
    if (!confirm(`Permanently delete Section "${item.name}" from masters?`)) return;
    const updated = currentSections.filter((s) => s.id !== item.id);
    persistMasters({ ...getBundle(), sections: updated });
  }

  // HOUSE ACTIONS
  function handleAddHouse(e) {
    e.preventDefault();
    const name = newHouseName.trim();
    if (!name) return toast("House name is required", true);
    if (currentHouses.some((h) => h.name.toLowerCase() === name.toLowerCase())) {
      return toast(`House "${name}" already exists`, true);
    }
    const color = newHouseColor || "#0284c7";
    const updated = [...currentHouses, { id: name, name, color, active: true }];
    persistMasters({ ...getBundle(), houses: updated });
    setNewHouseName("");
  }

  function handleToggleHouse(item) {
    const updated = currentHouses.map((h) =>
      h.id === item.id ? { ...h, active: !h.active } : h
    );
    persistMasters({ ...getBundle(), houses: updated });
  }

  function handleDeleteHouse(item) {
    if (!confirm(`Permanently delete House "${item.name}" from masters?`)) return;
    const updated = currentHouses.filter((h) => h.id !== item.id);
    persistMasters({ ...getBundle(), houses: updated });
  }

  // DESIGNATION ACTIONS
  function handleAddDesignation(e) {
    e.preventDefault();
    const name = newDesignationName.trim();
    if (!name) return toast("Designation title is required", true);
    if (currentDesignations.some((d) => d.name.toLowerCase() === name.toLowerCase())) {
      return toast(`Designation "${name}" already exists`, true);
    }
    const updated = [...currentDesignations, { id: name, name, active: true }];
    persistMasters({ ...getBundle(), designations: updated });
    setNewDesignationName("");
  }

  function handleToggleDesignation(item) {
    const updated = currentDesignations.map((d) =>
      d.id === item.id ? { ...d, active: !d.active } : d
    );
    persistMasters({ ...getBundle(), designations: updated });
  }

  function handleDeleteDesignation(item) {
    if (!confirm(`Permanently delete Designation "${item.name}" from masters?`)) return;
    const updated = currentDesignations.filter((d) => d.id !== item.id);
    persistMasters({ ...getBundle(), designations: updated });
  }

  // EDIT MODAL HANDLERS
  function openEdit(type, item) {
    setEditingItem({ type, item });
    setEditName(item.name || item.id);
    setEditOrder(item.order || 1);
    setEditColor(item.color || "#105568");
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingItem) return;
    const { type, item } = editingItem;
    const name = editName.trim();
    if (!name) return toast("Name is required", true);

    const bundle = getBundle();
    if (type === "class") {
      const updated = currentClasses.map((c) =>
        c.id === item.id ? { ...c, name, order: Number(editOrder) || c.order } : c
      ).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      persistMasters({ ...bundle, classes: updated });
    } else if (type === "section") {
      const updated = currentSections.map((s) =>
        s.id === item.id ? { ...s, name } : s
      );
      persistMasters({ ...bundle, sections: updated });
    } else if (type === "house") {
      const updated = currentHouses.map((h) =>
        h.id === item.id ? { ...h, name, color: editColor } : h
      );
      persistMasters({ ...bundle, houses: updated });
    } else if (type === "designation") {
      const updated = currentDesignations.map((d) =>
        d.id === item.id ? { ...d, name } : d
      );
      persistMasters({ ...bundle, designations: updated });
    }
    setEditingItem(null);
  }

  return (
    <div className="academic-masters-container">
      <PageTitle
        eyebrow="SCHOOL CONFIGURATION & TAXONOMY"
        title="Academic Masters"
        subtitle="Configure classes, sections, houses, faculty designations, and system roles with real-time updates."
      >
        {saving && (
          <span className="saving-indicator">
            <Loader size={16} inline /> Saving changes…
          </span>
        )}
      </PageTitle>

      <div className="masters-tabs-bar">
        <button
          type="button"
          className={`master-tab-btn ${activeTab === "classes" ? "active" : ""}`}
          onClick={() => setActiveTab("classes")}
        >
          <GraduationCap size={16} /> Classes ({currentClasses.length})
        </button>
        <button
          type="button"
          className={`master-tab-btn ${activeTab === "sections" ? "active" : ""}`}
          onClick={() => setActiveTab("sections")}
        >
          <Tag size={16} /> Sections ({currentSections.length})
        </button>
        <button
          type="button"
          className={`master-tab-btn ${activeTab === "houses" ? "active" : ""}`}
          onClick={() => setActiveTab("houses")}
        >
          <Home size={16} /> Houses ({currentHouses.length})
        </button>
        <button
          type="button"
          className={`master-tab-btn ${activeTab === "designations" ? "active" : ""}`}
          onClick={() => setActiveTab("designations")}
        >
          <Briefcase size={16} /> Designations ({currentDesignations.length})
        </button>
        <button
          type="button"
          className={`master-tab-btn ${activeTab === "roles" ? "active" : ""}`}
          onClick={() => setActiveTab("roles")}
        >
          <ShieldCheck size={16} /> System Roles (3)
        </button>
      </div>

      {/* CLASSES TAB */}
      {activeTab === "classes" && (
        <div className="master-content-card">
          <div className="master-header-row">
            <div>
              <h3>Class Configuration</h3>
              <p className="hint">
                Add, reorder, or enable/disable academic standards (e.g. Balvatika-1, Balvatika-2, Balvatika-3, Class 1 to 12).
              </p>
            </div>
            <span className="master-count-badge">
              {currentClasses.filter((c) => c.active !== false).length} Active Classes
            </span>
          </div>

          <form className="masters-add-bar" onSubmit={handleAddClass}>
            <input
              required
              placeholder="Enter new class name (e.g. Balvatika-1, Nursery, 11-PCM)..."
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="master-input-name"
            />
            <input
              type="number"
              placeholder="Order"
              value={newClassOrder}
              onChange={(e) => setNewClassOrder(e.target.value)}
              className="master-input-order"
              title="Display order / sorting number"
            />
            <button type="submit" className="btn primary" disabled={saving}>
              <Plus size={16} /> Add Class
            </button>
          </form>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>ORDER</th>
                  <th>CLASS NAME</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pagedClasses.map((c) => {
                  const isActive = c.active !== false;
                  return (
                    <tr key={c.id} className={!isActive ? "row-disabled" : ""}>
                      <td>
                        <span className="order-pill">{c.order ?? "—"}</span>
                      </td>
                      <td>
                        <strong className="class-name-text">Class {c.name}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${isActive ? "active" : "disabled"}`}>
                          {isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions" style={{ justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className={`icon-button ${isActive ? "disable" : "enable"}`}
                            title={isActive ? "Disable Class" : "Enable Class"}
                            onClick={() => handleToggleClass(c)}
                            disabled={saving}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            title="Edit Class"
                            onClick={() => openEdit("class", c)}
                          >
                            <PenLine size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger"
                            title="Delete Class"
                            onClick={() => handleDeleteClass(c)}
                            disabled={saving}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={safeClassPage}
            totalItems={currentClasses.length}
            pageSize={classPageSize}
            onPageChange={setClassPage}
            onPageSizeChange={setClassPageSize}
            itemLabel="classes"
          />
        </div>
      )}

      {/* SECTIONS TAB */}
      {activeTab === "sections" && (
        <div className="master-content-card">
          <div className="master-header-row">
            <div>
              <h3>Section Configuration</h3>
              <p className="hint">
                Manage school sections and stream divisions (e.g. Venus, Mars, Jupiter, Science, Arts, Commerce).
              </p>
            </div>
            <span className="master-count-badge">
              {currentSections.filter((s) => s.active !== false).length} Active Sections
            </span>
          </div>

          <form className="masters-add-bar" onSubmit={handleAddSection}>
            <input
              required
              placeholder="Enter new section name (e.g. Jupiter, Science, Section A)..."
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              className="master-input-name"
            />
            <button type="submit" className="btn primary" disabled={saving}>
              <Plus size={16} /> Add Section
            </button>
          </form>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SECTION NAME</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pagedSections.map((s) => {
                  const isActive = s.active !== false;
                  return (
                    <tr key={s.id} className={!isActive ? "row-disabled" : ""}>
                      <td>
                        <strong className="section-name-text">{s.name}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${isActive ? "active" : "disabled"}`}>
                          {isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions" style={{ justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className={`icon-button ${isActive ? "disable" : "enable"}`}
                            title={isActive ? "Disable Section" : "Enable Section"}
                            onClick={() => handleToggleSection(s)}
                            disabled={saving}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            title="Edit Section"
                            onClick={() => openEdit("section", s)}
                          >
                            <PenLine size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger"
                            title="Delete Section"
                            onClick={() => handleDeleteSection(s)}
                            disabled={saving}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={safeSecPage}
            totalItems={currentSections.length}
            pageSize={secPageSize}
            onPageChange={setSecPage}
            onPageSizeChange={setSecPageSize}
            itemLabel="sections"
          />
        </div>
      )}

      {/* HOUSES TAB */}
      {activeTab === "houses" && (
        <div className="master-content-card">
          <div className="master-header-row">
            <div>
              <h3>House Configuration</h3>
              <p className="hint">
                Configure student houses, color themes, and badge styling (e.g. Himalaya, Aravali, Nilgiri, Shivalik).
              </p>
            </div>
            <span className="master-count-badge">
              {currentHouses.filter((h) => h.active !== false).length} Active Houses
            </span>
          </div>

          <form className="masters-add-bar" onSubmit={handleAddHouse}>
            <input
              required
              placeholder="Enter new house name (e.g. Himalaya, Ashoka, Tagore)..."
              value={newHouseName}
              onChange={(e) => setNewHouseName(e.target.value)}
              className="master-input-name"
            />
            <div className="color-picker-input-group">
              <label>Color</label>
              <input
                type="color"
                value={newHouseColor}
                onChange={(e) => setNewHouseColor(e.target.value)}
                className="color-swatch-box"
              />
              <span className="color-hex-label">{newHouseColor}</span>
            </div>
            <button type="submit" className="btn primary" disabled={saving}>
              <Plus size={16} /> Add House
            </button>
          </form>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>HOUSE BADGE</th>
                  <th>COLOR ACCENT</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pagedHouses.map((h) => {
                  const isActive = h.active !== false;
                  return (
                    <tr key={h.id} className={!isActive ? "row-disabled" : ""}>
                      <td>
                        <span
                          className="house-preview-badge"
                          style={{
                            borderColor: h.color || "#0284c7",
                            color: h.color || "#0284c7",
                            backgroundColor: `${h.color || "#0284c7"}18`,
                          }}
                        >
                          <Home size={14} /> {h.name}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span
                            className="color-dot-indicator"
                            style={{ backgroundColor: h.color || "#0284c7" }}
                          />
                          <code>{h.color || "#0284c7"}</code>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${isActive ? "active" : "disabled"}`}>
                          {isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions" style={{ justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className={`icon-button ${isActive ? "disable" : "enable"}`}
                            title={isActive ? "Disable House" : "Enable House"}
                            onClick={() => handleToggleHouse(h)}
                            disabled={saving}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            title="Edit House"
                            onClick={() => openEdit("house", h)}
                          >
                            <PenLine size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger"
                            title="Delete House"
                            onClick={() => handleDeleteHouse(h)}
                            disabled={saving}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={safeHousePage}
            totalItems={currentHouses.length}
            pageSize={housePageSize}
            onPageChange={setHousePage}
            onPageSizeChange={setHousePageSize}
            itemLabel="houses"
          />
        </div>
      )}

      {/* DESIGNATIONS TAB */}
      {activeTab === "designations" && (
        <div className="master-content-card">
          <div className="master-header-row">
            <div>
              <h3>Faculty & Staff Designations</h3>
              <p className="hint">
                Manage positions and academic titles (e.g. Principal, Vice Principal, PGT, TGT, PRT, Class Teacher, Subject Teacher).
              </p>
            </div>
            <span className="master-count-badge">
              {currentDesignations.filter((d) => d.active !== false).length} Active Designations
            </span>
          </div>

          <form className="masters-add-bar" onSubmit={handleAddDesignation}>
            <input
              required
              placeholder="Enter designation title (e.g. PGT Physics, Class Teacher, Librarian)..."
              value={newDesignationName}
              onChange={(e) => setNewDesignationName(e.target.value)}
              className="master-input-name"
            />
            <button type="submit" className="btn primary" disabled={saving}>
              <Plus size={16} /> Add Designation
            </button>
          </form>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>DESIGNATION / POSITION</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pagedDesignations.map((d) => {
                  const isActive = d.active !== false;
                  return (
                    <tr key={d.id} className={!isActive ? "row-disabled" : ""}>
                      <td>
                        <strong className="designation-name-text">{d.name}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${isActive ? "active" : "disabled"}`}>
                          {isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions" style={{ justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className={`icon-button ${isActive ? "disable" : "enable"}`}
                            title={isActive ? "Disable Designation" : "Enable Designation"}
                            onClick={() => handleToggleDesignation(d)}
                            disabled={saving}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            title="Edit Designation"
                            onClick={() => openEdit("designation", d)}
                          >
                            <PenLine size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger"
                            title="Delete Designation"
                            onClick={() => handleDeleteDesignation(d)}
                            disabled={saving}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={safeDesigPage}
            totalItems={currentDesignations.length}
            pageSize={desigPageSize}
            onPageChange={setDesigPage}
            onPageSizeChange={setDesigPageSize}
            itemLabel="designations"
          />
        </div>
      )}

      {/* ROLES TAB */}
      {activeTab === "roles" && (
        <div className="master-content-card">
          <div className="master-header-row">
            <div>
              <h3>System Roles & Capabilities</h3>
              <p className="hint">
                Antigravity ERP enforces a role-based access control (RBAC) hierarchy. Staff members are mapped to one of these system roles.
              </p>
            </div>
          </div>

          <div className="roles-grid-cards">
            <div className="role-spec-card">
              <div className="role-spec-head">
                <span className="role-badge admin">Administrator</span>
                <code>admin</code>
              </div>
              <p className="role-spec-desc">
                Full administrative authority over the entire ERP platform, student records, staff directory, academic masters, templates, and security logs.
              </p>
              <ul className="role-features-list">
                <li><Check size={14} /> Full access to all students, marks & report cards</li>
                <li><Check size={14} /> Manage faculty accounts, designations & class assignments</li>
                <li><Check size={14} /> Manage Academic Masters (Classes, Sections, Houses)</li>
                <li><Check size={14} /> Excel bulk import, Report Drive, and Activity Audit log</li>
              </ul>
            </div>

            <div className="role-spec-card">
              <div className="role-spec-head">
                <span className="role-badge principal">Principal</span>
                <code>principal</code>
              </div>
              <p className="role-spec-desc">
                Executive academic leadership for review, verification, publishing approvals, and parent dispatch across all school classes.
              </p>
              <ul className="role-features-list">
                <li><Check size={14} /> Access to all student records and classes across the school</li>
                <li><Check size={14} /> Report Review & Approval workflow</li>
                <li><Check size={14} /> Class-wide performance and analytics dashboards</li>
                <li><Check size={14} /> Send verified report cards via WhatsApp & Email</li>
              </ul>
            </div>

            <div className="role-spec-card">
              <div className="role-spec-head">
                <span className="role-badge teacher">Teacher / Faculty</span>
                <code>teacher</code>
              </div>
              <p className="role-spec-desc">
                Class educators assigned to assess students and enter term marks for their designated classes and sections.
              </p>
              <ul className="role-features-list">
                <li><Check size={14} /> Scoped access to assigned classes & sections only</li>
                <li><Check size={14} /> Student assessment, term marks, and teacher remarks</li>
                <li><Check size={14} /> Report card preview and calibration tools</li>
                <li><Check size={14} /> Multiple classes assignable per teacher</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="modal-backdrop">
          <form className="modal master-edit-modal" onSubmit={handleSaveEdit}>
            <div className="modal-head">
              <h2>
                Edit {editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}: {editingItem.item.name}
              </h2>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditingItem(null)}
              >
                <X />
              </button>
            </div>
            <div className="form-grid">
              <Field label="Name / Title *">
                <input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </Field>

              {editingItem.type === "class" && (
                <Field label="Display Order (Numeric)">
                  <input
                    type="number"
                    value={editOrder}
                    onChange={(e) => setEditOrder(e.target.value)}
                  />
                </Field>
              )}

              {editingItem.type === "house" && (
                <Field label="Badge Color">
                  <div className="color-picker-input-group">
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="color-swatch-box"
                    />
                    <span className="color-hex-label">{editColor}</span>
                  </div>
                </Field>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary" disabled={saving}>
                <Check size={16} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function UserAccess({ toast, user: currentUser }) {
  const [users, setUsers] = useState([]),
    [subTab, setSubTab] = useState("Staff_Details"),
    [q, setQ] = useState(""),
    [roleFilter, setRoleFilter] = useState(""),
    [classFilter, setClassFilter] = useState(""),
    [sectionFilter, setSectionFilter] = useState(""),
    [statusFilter, setStatusFilter] = useState("all"),
    [addModal, setAddModal] = useState(false),
    [editingStaff, setEditingStaff] = useState(null),
    [viewingStaff, setViewingStaff] = useState(null),
    [permissionUser, setPermissionUser] = useState(null),
    [assignments, setAssignments] = useState([]),
    [moduleAccess, setModuleAccess] = useState([]),
    [studentActions, setStudentActions] = useState([]),
    [ac, setAc] = useState("6"),
    [as, setAs] = useState("Venus"),
    [busyActionId, setBusyActionId] = useState(""),
    [staffPage, setStaffPage] = useState(1),
    [staffPageSize, setStaffPageSize] = useState(4),
    [permPage, setPermPage] = useState(1),
    [permPageSize, setPermPageSize] = useState(4);

  useEffect(() => {
    setStaffPage(1);
  }, [q, roleFilter, classFilter, sectionFilter, statusFilter]);

  const load = async () => {
    try {
      const data = await api("/users");
      setUsers(data);
    } catch (e) {
      toast(e.message, true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function handleToggle(u) {
    if (currentUser && String(u._id) === String(currentUser._id) && u.active) {
      alert("You cannot disable your own administrator account.");
      return;
    }
    if (u.role === "admin" && u.active) {
      const otherAdmins = users.filter(
        (x) => x.role === "admin" && x.active && String(x._id) !== String(u._id),
      );
      if (!otherAdmins.length) {
        alert("The only active administrator cannot be disabled.");
        return;
      }
    }
    const nextState = !u.active;
    if (!confirm(`${nextState ? "Enable" : "Disable"} staff account for "${u.name}"?`))
      return;
    setBusyActionId(String(u._id));
    try {
      await api("/users/" + u._id, {
        method: "PUT",
        body: { active: nextState },
      });
      await load();
      toast(`Staff member "${u.name}" ${nextState ? "enabled" : "disabled"}`);
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusyActionId("");
    }
  }

  async function handleDelete(u) {
    if (currentUser && String(u._id) === String(currentUser._id)) {
      alert("You cannot delete your own administrator account.");
      return;
    }
    if (u.role === "admin") {
      const otherAdmins = users.filter(
        (x) => x.role === "admin" && x.active && String(x._id) !== String(u._id),
      );
      if (!otherAdmins.length) {
        alert("The only active administrator cannot be deleted.");
        return;
      }
    }
    if (
      !confirm(
        `Are you sure you want to permanently delete staff member "${u.name}" (${u.email})? This action cannot be undone.`,
      )
    )
      return;
    setBusyActionId(String(u._id));
    try {
      await api("/users/" + u._id, { method: "DELETE" });
      await load();
      toast(`Staff member "${u.name}" permanently deleted`);
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusyActionId("");
    }
  }

  function openPermissions(u) {
    setPermissionUser(u);
    setAssignments(u.assignments || []);
    setModuleAccess(u.moduleAccess || []);
    setStudentActions(u.studentActions || []);
    setModuleAccess(
      Array.isArray(u.moduleAccess) && u.moduleAccess.length > 0
        ? u.moduleAccess
        : ROLE_MODULES[u.role] || []
    );
    setStudentActions(
      Array.isArray(u.studentActions) && u.studentActions.length > 0
        ? u.studentActions
        : u.role === "teacher"
          ? ACTION_LABELS.map(([key]) => key)
          : u.role === "principal"
            ? ["studentWhatsapp", "studentEmail"]
            : []
    );
  }

  async function saveAccess() {
    if (!permissionUser) return;
    try {
      await api("/users/" + permissionUser._id, {
        method: "PUT",
        body: { assignments, moduleAccess, studentActions },
      });
      const staffName = permissionUser.name;
      setPermissionUser(null);
      await load();
      toast(
        `Access updated. ${staffName} must sign in again for the new access to apply.`,
      );
    } catch (e) {
      toast(e.message, true);
    }
  }

  const filteredUsers = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter === "active" && !u.active) return false;
    if (statusFilter === "disabled" && u.active) return false;
    if (classFilter && u.role === "teacher") {
      const hasCls = (u.assignments || []).some(
        (a) => String(a.className) === String(classFilter),
      );
      if (!hasCls) return false;
    }
    if (sectionFilter && u.role === "teacher") {
      const hasSec = (u.assignments || []).some(
        (a) => a.section === sectionFilter,
      );
      if (!hasSec) return false;
    }
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      const matchName = (u.name || "").toLowerCase().includes(query);
      const matchEmail = (u.email || "").toLowerCase().includes(query);
      const matchPhone = (u.phone || "").toLowerCase().includes(query);
      const matchDesig = (u.designation || "").toLowerCase().includes(query);
      const matchClasses = (u.assignments || []).some((a) =>
        `class ${a.className} ${a.section}`.toLowerCase().includes(query),
      );
      if (
        !matchName &&
        !matchEmail &&
        !matchPhone &&
        !matchDesig &&
        !matchClasses
      )
        return false;
    }
    return true;
  });

  const totalStaffPages = Math.max(1, Math.ceil(filteredUsers.length / staffPageSize));
  const safeStaffPage = Math.min(Math.max(1, staffPage), totalStaffPages);
  const pagedStaff = filteredUsers.slice(
    (safeStaffPage - 1) * staffPageSize,
    safeStaffPage * staffPageSize,
  );

  const totalPermPages = Math.max(1, Math.ceil(users.length / permPageSize));
  const safePermPage = Math.min(Math.max(1, permPage), totalPermPages);
  const pagedPermUsers = users.slice(
    (safePermPage - 1) * permPageSize,
    safePermPage * permPageSize,
  );

  const totalCount = users.length;
  const teachersCount = users.filter((u) => u.role === "teacher").length;
  const adminsCount = users.filter((u) => u.role === "admin").length;
  const principalsCount = users.filter((u) => u.role === "principal").length;
  const activeCount = users.filter((u) => u.active).length;

  return (
    <>
      <div className="staff-subnav">
        <button
          type="button"
          className={subTab === "Staff_Details" ? "active" : ""}
          onClick={() => setSubTab("Staff_Details")}
        >
          <Users size={16} /> Staff Details (Directory)
        </button>
        <button
          type="button"
          className={subTab === "permissions" ? "active" : ""}
          onClick={() => setSubTab("permissions")}
        >
          <ShieldCheck size={16} /> Permissions & Role Matrix
        </button>
      </div>

      {subTab === "Staff_Details" ? (
        <>
          <PageTitle
            eyebrow="FACULTY & EDUCATOR DIRECTORY"
            title="Staff Directory & Details"
            subtitle="Manage school teachers, designations, phone numbers, profile photos, and multiple class assignments in real time."
          >
            <button className="btn primary" onClick={() => setAddModal(true)}>
              <Plus size={17} /> Add staff member
            </button>
          </PageTitle>

          <div className="staff-kpi-bar">
            <div className="kpi-card">
              <span className="kpi-val">{totalCount}</span>
              <span className="kpi-lbl">Total Staff</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-val blue">{teachersCount}</span>
              <span className="kpi-lbl">Teachers</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-val purple">{principalsCount}</span>
              <span className="kpi-lbl">Principals</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-val teal">{adminsCount}</span>
              <span className="kpi-lbl">Administrators</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-val green">{activeCount}</span>
              <span className="kpi-lbl">Active Accounts</span>
            </div>
          </div>

          <section className="card directory staff-directory-card">
            <div className="filter-bar">
              <label className="search-box">
                <Search size={18} />
                <input
                  placeholder="Search staff by name, email, phone, designation or class…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </label>

              <select
                aria-label="Filter role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="teacher">Teachers</option>
                <option value="principal">Principals</option>
                <option value="admin">Administrators</option>
              </select>

              <select
                aria-label="Filter class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter section"
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                <option value="">All Sections</option>
                {sections.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter account status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="disabled">Disabled Only</option>
              </select>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>STAFF MEMBER</th>
                    <th>ROLE & DESIGNATION</th>
                    <th>CONTACT INFO</th>
                    <th>ASSIGNED CLASSES & SECTIONS</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedStaff.map((u) => {
                    const initials = (u.name || "S")
                      .split(" ")
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase();
                    return (
                      <tr key={u._id}>
                        <td>
                          <div className="staff-cell-flex">
                            <div className="staff-avatar-sm">
                              {u.photo ? (
                                <img
                                  src={u.photo}
                                  alt={u.name}
                                  className="staff-avatar-img"
                                />
                              ) : (
                                <span className={`staff-avatar-txt role-${u.role}`}>
                                  {initials}
                                </span>
                              )}
                            </div>
                            <div className="staff-meta">
                              <b>{u.name}</b>
                              <small className="muted block">{u.email}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="staff-role-box">
                            <span className={`staff-role-pill role-${u.role}`}>
                              {u.role === "admin"
                                ? "Administrator"
                                : u.role === "principal"
                                  ? "Principal"
                                  : "Teacher"}
                            </span>
                            {u.designation && (
                              <span className="staff-desig-tag">
                                {u.designation}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="staff-contact-box">
                            {u.phone ? (
                              <a
                                href={`tel:${u.phone}`}
                                className="staff-phone-link"
                                title="Call phone"
                              >
                                <Phone size={13} /> {u.phone}
                              </a>
                            ) : (
                              <span className="muted">—</span>
                            )}
                          </div>
                        </td>

                        <td>
                          {u.role === "teacher" ? (
                            <div className="assigned-chips-wrap">
                              {u.assignments && u.assignments.length > 0 ? (
                                u.assignments.map((a, i) => (
                                  <span
                                    className="assigned-chip"
                                    key={`${a.className}-${a.section}-${i}`}
                                  >
                                    Class {a.className} · {a.section}
                                  </span>
                                ))
                              ) : (
                                <span className="muted">None assigned</span>
                              )}
                            </div>
                          ) : (
                            <span className="all-classes-pill">
                              All classes (Full access)
                            </span>
                          )}
                        </td>

                        <td>
                          <span
                            className={
                              "pill " + (u.active ? "green" : "pill-disabled")
                            }
                          >
                            {u.active ? "Active" : "Disabled"}
                          </span>
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <div className="row-actions staff-actions-row">
                            <button
                              className="icon-button"
                              title="View full staff profile"
                              onClick={() => setViewingStaff(u)}
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              className="icon-button"
                              title="Edit staff details, photo, and classes"
                              onClick={() => setEditingStaff(u)}
                            >
                              <PenLine size={16} />
                            </button>

                            <button
                              className="icon-button"
                              title="Configure module & action permissions"
                              onClick={() => openPermissions(u)}
                            >
                              <ShieldCheck size={16} />
                            </button>

                            <button
                              className={`icon-button ${u.active ? "btn-disable" : "btn-enable"
                                }`}
                              title={
                                u.active
                                  ? "Disable staff account"
                                  : "Enable staff account"
                              }
                              disabled={busyActionId === String(u._id)}
                              onClick={() => handleToggle(u)}
                            >
                              <Power size={16} />
                            </button>

                            <button
                              className="icon-button danger"
                              title="Permanently delete staff member"
                              disabled={
                                busyActionId === String(u._id) ||
                                (currentUser &&
                                  String(u._id) === String(currentUser._id))
                              }
                              onClick={() => handleDelete(u)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!filteredUsers.length && (
              <Empty text="No staff members matching your search or filters" />
            )}

            <Pagination
              currentPage={safeStaffPage}
              totalItems={filteredUsers.length}
              pageSize={staffPageSize}
              onPageChange={setStaffPage}
              onPageSizeChange={setStaffPageSize}
              pageSizeOptions={[10, 20, 50, 100]}
              itemLabel="staff members"
            />
          </section>
        </>
      ) : (
        <>
          <PageTitle
            eyebrow="THE RIGHT ACCESS, FOR EVERY EDUCATOR"
            title="Role & Permission Matrix"
            subtitle="Administrators manage. Principals approve. Teachers assess assigned classes."
          >
            <button className="btn primary" onClick={() => setAddModal(true)}>
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
                {pagedPermUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <b>{u.name}</b>
                      {u.designation && (
                        <small className="staff-desig-tag inline">
                          {u.designation}
                        </small>
                      )}
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
                          onClick={() => openPermissions(u)}
                        >
                          Manage access
                        </button>
                      )}
                      <button
                        className="icon-button"
                        title="Enable / disable account"
                        onClick={() => handleToggle(u)}
                        disabled={busyActionId === String(u._id)}
                      >
                        <LockKeyhole size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={safePermPage}
              totalItems={users.length}
              pageSize={permPageSize}
              onPageChange={setPermPage}
              onPageSizeChange={setPermPageSize}
              pageSizeOptions={[10, 20, 50, 100]}
              itemLabel="accounts"
            />
          </section>
        </>
      )}

      {addModal && (
        <StaffModal
          onClose={() => setAddModal(false)}
          onSaved={load}
          toast={toast}
        />
      )}

      {editingStaff && (
        <StaffModal
          staff={editingStaff}
          currentUser={currentUser}
          onClose={() => setEditingStaff(null)}
          onSaved={async () => {
            await load();
            if (currentUser && String(editingStaff._id) === String(currentUser._id)) {
              window.dispatchEvent(new CustomEvent("srps:user-updated"));
            }
          }}
          toast={toast}
        />
      )}

      {viewingStaff && (
        <StaffViewModal
          staff={viewingStaff}
          onClose={() => setViewingStaff(null)}
          onEdit={() => {
            const s = viewingStaff;
            setViewingStaff(null);
            setEditingStaff(s);
          }}
          onManageAccess={() => {
            const s = viewingStaff;
            setViewingStaff(null);
            openPermissions(s);
          }}
        />
      )}

      {permissionUser && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head">
              <h2>{permissionUser.name} · Access & Permissions</h2>
              <button
                className="icon-button"
                onClick={() => setPermissionUser(null)}
              >
                <X />
              </button>
            </div>
            <div className="access-editor">
              <p>Choose which modules and student actions this account can use.</p>
              <h3>Module access</h3>
              <div className="permission-grid">
                {MODULE_LABELS.map(([moduleId, label]) => {
                  return (
                    <label className="permission-check" key={moduleId}>
                      <input
                        type="checkbox"
                        checked={moduleAccess.includes(moduleId)}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          setModuleAccess((current) => {
                            if (enabled) {
                              const requiresStudents = [
                                "overview",
                                "analytics",
                                "studio",
                                "review",
                                "bulk",
                              ].includes(moduleId);
                              if (requiresStudents && !current.includes("students")) {
                                return [...new Set([...current, "students", moduleId])];
                              }
                              return [...new Set([...current, moduleId])];
                            }
                            if (moduleId === "students") {
                              return current.filter(
                                (id) =>
                                  ![
                                    "students",
                                    "overview",
                                    "analytics",
                                    "studio",
                                    "review",
                                    "bulk",
                                  ].includes(id),
                              );
                            }
                            return current.filter((id) => id !== moduleId);
                          });
                          if (moduleId === "students" && !enabled)
                            setStudentActions([]);
                        }}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })
                }
              </div>

              <h3>Student actions</h3>
              <div className="permission-grid">
                {ACTION_LABELS.map(([actionId, label]) => (
                  <label className="permission-check" key={actionId}>
                    <input
                      type="checkbox"
                      checked={studentActions.includes(actionId)}
                      onChange={(e) =>
                        setStudentActions((current) =>
                          e.target.checked
                            ? [...current, actionId]
                            : current.filter((id) => id !== actionId),
                        )
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              {permissionUser.role !== "teacher" ? (
                <p>Administrators and principals have access to all classes.</p>
              ) : (
                <>
                  <p>
                    Assigned classes for {permissionUser.name}. Add or remove
                    classes, then click Save Access.
                  </p>
                  <div className="assigned-chips-wrap" style={{ margin: "10px 0" }}>
                    {assignments.map((a, i) => (
                      <span
                        className="assigned-chip"
                        key={`${a.className}-${a.section}-${i}`}
                      >
                        Class {a.className} · {a.section}
                        <button
                          type="button"
                          className="chip-remove"
                          onClick={() =>
                            setAssignments(
                              assignments.filter((_, j) => j !== i),
                            )
                          }
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
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
                      type="button"
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
                      <Plus size={16} /> Assign Class
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

function StaffModal({ staff, currentUser, onClose, onSaved, toast }) {
  const isEdit = Boolean(staff?._id);
  const isSelf = Boolean(currentUser && staff && String(staff._id) === String(currentUser._id));
  const [name, setName] = useState(staff?.name || "");
  const [email, setEmail] = useState(staff?.email || "");
  const [phone, setPhone] = useState(staff?.phone || "");
  const [designation, setDesignation] = useState(staff?.designation || "");
  const [photo, setPhoto] = useState(staff?.photo || "");
  const [role, setRole] = useState(staff?.role || "teacher");
  const [assignments, setAssignments] = useState(
    staff?.assignments?.length
      ? staff.assignments
      : staff?.role === "teacher"
        ? [{ className: "6", section: "Venus" }]
        : [],
  );
  const [password, setPassword] = useState("");
  const [selClass, setSelClass] = useState("6");
  const [selSection, setSelSection] = useState("Venus");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const quickDesignations = designations.length ? designations : DEFAULT_DESIGNATIONS;

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api("/upload/staff-photo", {
        method: "POST",
        body: fd,
      });
      setPhoto(res.url);
      toast("Profile photo uploaded successfully");
    } catch (err) {
      toast(err.message, true);
    } finally {
      setUploading(false);
    }
  }

  function addClassAssignment() {
    if (
      assignments.some(
        (a) => String(a.className) === String(selClass) && a.section === selSection,
      )
    ) {
      toast(`Class ${selClass} · ${selSection} is already assigned`);
      return;
    }
    setAssignments([...assignments, { className: selClass, section: selSection }]);
  }

  function removeClassAssignment(idx) {
    setAssignments(assignments.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return toast("Staff full name is required", true);
    if (!email.trim()) return toast("Valid staff email is required", true);
    if (
      !isEdit &&
      (!password ||
        password.length < PASSWORD_MIN ||
        password.length > PASSWORD_MAX)
    ) {
      return toast(
        `Temporary password must be ${PASSWORD_MIN}–${PASSWORD_MAX} characters`,
        true,
      );
    }
    if (
      isEdit &&
      password &&
      (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX)
    ) {
      return toast(
        `Password must be ${PASSWORD_MIN}–${PASSWORD_MAX} characters`,
        true,
      );
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        designation: designation.trim(),
        photo: photo.trim(),
        role,
        assignments: role === "teacher" ? assignments : [],
      };
      if (password) payload.password = password;

      if (isEdit) {
        await api("/users/" + staff._id, {
          method: "PUT",
          body: payload,
        });
        toast(`Staff member "${name}" updated successfully`);
      } else {
        await api("/users", {
          method: "POST",
          body: payload,
        });
        toast(`Staff account for "${name}" created successfully`);
      }
      onSaved();
      onClose();
    } catch (err) {
      toast(err.message, true);
    } finally {
      setSaving(false);
    }
  }

  const initials = (name || "S")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="modal-backdrop">
      <form className="modal staff-modal" onSubmit={handleSubmit}>
        <div className="modal-head">
          <h2>{isEdit ? `Edit Staff: ${staff.name}` : "Add New Staff Member"}</h2>
          <button type="button" className="icon-button" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="staff-photo-section">
          <div className="staff-photo-avatar">
            {photo ? (
              <img
                src={photo}
                alt={name || "Staff preview"}
                className="staff-avatar-preview"
              />
            ) : (
              <div className="staff-avatar-placeholder">
                {name ? initials : <Users size={28} />}
              </div>
            )}
          </div>
          <div className="staff-photo-controls">
            <label className="btn text-btn-upload">
              {uploading ? (
                <Loader size={15} inline />
              ) : (
                <Upload size={15} />
              )}
              {uploading
                ? "Uploading…"
                : photo
                  ? "Change Photo"
                  : "Upload Profile Photo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoUpload}
                style={{ display: "none" }}
              />
            </label>
            {photo && (
              <button
                type="button"
                className="text-button text-danger"
                onClick={() => setPhoto("")}
              >
                Remove photo
              </button>
            )}
            <small className="muted block">Square JPG, PNG, or WebP</small>
          </div>
        </div>

        <div className="form-grid">
          <Field label="Full Name *">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meenakshi Sundaram"
            />
          </Field>

          <Field label="Staff Email (Login ID) *">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. meenakshi@srpskanhra.com"
            />
          </Field>

          <Field label="Phone / WhatsApp Number">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
            />
          </Field>

          <Field label="System Role *">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isSelf && staff?.role === "admin"}
            >
              <option value="teacher">Teacher (Class Assessment)</option>
              <option value="principal">Principal (Review & Approval)</option>
              <option value="admin">Administrator (Full Access)</option>
            </select>
            {isSelf && staff?.role === "admin" && (
              <small className="muted" style={{ display: "block", marginTop: 4, fontSize: 11 }}>
                System Role is locked to Administrator to preserve ERP access. Set <strong>Principal</strong> in Designation / Position below.
              </small>
            )}
          </Field>

          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Designation / Position">
              <input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. PGT Mathematics, Class Teacher, Vice Principal…"
              />
              <div className="quick-suggestions">
                {quickDesignations.map((d) => (
                  <button
                    type="button"
                    key={d}
                    className={`suggestion-pill ${designation === d ? "selected" : ""
                      }`}
                    onClick={() => setDesignation(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {role === "teacher" && (
            <div
              className="staff-class-assignments-box"
              style={{ gridColumn: "1 / -1" }}
            >
              <label className="assignments-title">
                ASSIGNED CLASSES & SECTIONS ({assignments.length})
              </label>
              <p className="hint">
                A single teacher can be assigned multiple classes. Assessment and
                student records will be scoped to these classes.
              </p>

              {assignments.length > 0 ? (
                <div className="assigned-chips-wrap">
                  {assignments.map((a, idx) => (
                    <span
                      className="assigned-chip"
                      key={`${a.className}-${a.section}-${idx}`}
                    >
                      Class {a.className} · {a.section}
                      <button
                        type="button"
                        className="chip-remove"
                        onClick={() => removeClassAssignment(idx)}
                        title="Remove assignment"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted small-note">
                  No classes assigned yet. Add one or more classes below.
                </p>
              )}

              <div className="add-class-row">
                <select
                  value={selClass}
                  onChange={(e) => setSelClass(e.target.value)}
                  title="Select Class"
                >
                  {classes.map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
                <select
                  value={selSection}
                  onChange={(e) => setSelSection(e.target.value)}
                  title="Select Section"
                >
                  {sections.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn"
                  onClick={addClassAssignment}
                >
                  <Plus size={15} /> Add Class
                </button>
                {assignments.length > 0 && (
                  <button
                    type="button"
                    className="text-button text-danger"
                    onClick={() => setAssignments([])}
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}

          <div style={{ gridColumn: "1 / -1" }}>
            <Field
              label={
                isEdit
                  ? "New Password (leave blank to keep existing)"
                  : "Temporary Password (6–20 characters) *"
              }
            >
              <input
                type="password"
                required={!isEdit}
                minLength={PASSWORD_MIN}
                maxLength={PASSWORD_MAX}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  isEdit
                    ? "•••••••• (leave blank to keep unchanged)"
                    : "Enter temporary password (6–20 characters)"
                }
              />
            </Field>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? (
              <>
                <Loader size={16} inline /> Saving…
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Staff Account"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function StaffViewModal({ staff, onClose, onEdit, onManageAccess }) {
  if (!staff) return null;
  const initials = (staff.name || "S")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="modal-backdrop">
      <div className="modal staff-view-modal">
        <div className="modal-head">
          <h2>Staff Profile</h2>
          <button type="button" className="icon-button" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="staff-view-card">
          <div className="staff-view-header">
            <div className="staff-view-avatar">
              {staff.photo ? (
                <img
                  src={staff.photo}
                  alt={staff.name}
                  className="staff-view-img"
                />
              ) : (
                <span className={`staff-avatar-lg role-${staff.role}`}>
                  {initials}
                </span>
              )}
            </div>

            <div className="staff-view-title-block">
              <h3>{staff.name}</h3>
              {staff.designation && (
                <span className="staff-desig-tag large">{staff.designation}</span>
              )}
              <div className="staff-badge-row">
                <span className={`staff-role-pill role-${staff.role}`}>
                  {staff.role === "admin"
                    ? "Administrator"
                    : staff.role === "principal"
                      ? "Principal"
                      : "Teacher"}
                </span>
                <span className={"pill " + (staff.active ? "green" : "pill-disabled")}>
                  {staff.active ? "Active Account" : "Disabled Account"}
                </span>
              </div>
            </div>
          </div>

          <div className="staff-info-grid">
            <div className="info-item">
              <span className="info-label">Email / Login ID</span>
              <span className="info-value">
                <Mail size={14} /> {staff.email}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Phone / WhatsApp</span>
              <span className="info-value">
                <Phone size={14} /> {staff.phone || "Not specified"}
              </span>
            </div>

            <div className="info-item full-width">
              <span className="info-label">Assigned Classes & Sections</span>
              {staff.role === "teacher" ? (
                <div className="assigned-chips-wrap">
                  {staff.assignments && staff.assignments.length > 0 ? (
                    staff.assignments.map((a, i) => (
                      <span
                        className="assigned-chip"
                        key={`${a.className}-${a.section}-${i}`}
                      >
                        Class {a.className} · {a.section}
                      </span>
                    ))
                  ) : (
                    <span className="muted">No classes assigned</span>
                  )}
                </div>
              ) : (
                <span className="all-classes-pill">
                  All classes (Administrator / Principal full access)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {onManageAccess && (
            <button type="button" className="btn" onClick={onManageAccess}>
              <ShieldCheck size={16} /> Manage Permissions
            </button>
          )}
          {onEdit && (
            <button type="button" className="btn primary" onClick={onEdit}>
              <PenLine size={16} /> Edit Details
            </button>
          )}
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
function ReportReview({ session, open, toast, user }) {
  const [rows, setRows] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPageSize, setReviewPageSize] = useState(10);
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
        .catch(() => { });
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
  const submittedCount = rows.filter((r) => r.status === "submitted").length;
  const publishedCount = rows.filter((r) => r.status === "published").length;

  return (
    <div className="anv-review-page">
      <div className="anv-review-hero">
        <div className="anv-review-hero-top">
          <div>
            <span className="anv-review-eyebrow">ADMINISTRATION · ACADEMIC SESSION</span>
            <h2>Report Review</h2>
            <p>
              Review teacher submissions, publish completed reports, reopen for corrections, and send locked PDFs.
            </p>
          </div>
          <button type="button" className="anv-review-refresh-btn" onClick={load} title="Refresh review queue" aria-label="Refresh">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
        <div className="anv-review-stats-row">
          <div className="anv-review-stat stat-gold">
            <ClipboardCheck size={15} />
            <span><b>{rows.length}</b> Total</span>
          </div>
          <div className="anv-review-stat stat-orange">
            <Clock size={15} />
            <span><b>{submittedCount}</b> Submitted</span>
          </div>
          <div className="anv-review-stat stat-green">
            <CheckCircle2 size={15} />
            <span><b>{publishedCount}</b> Published</span>
          </div>
        </div>
      </div>

      <div className="anv-review-security-note">
        <div className="anv-review-lock-badge">
          <LockKeyhole size={18} />
        </div>
        <div className="anv-review-security-text">
          <b>Locked PDF Password Format</b>
          <p>
            Published PDFs require <code className="anv-review-code">AdmNo@YYYY-MM-DD</code> (student’s admission number, <b>@</b>, then date of birth).
          </p>
        </div>
      </div>

      {!rows.length ? (
        <div className="anv-review-empty">
          <div className="anv-review-empty-icon">
            <ClipboardCheck size={28} />
          </div>
          <h3>No submitted or published reports for this session</h3>
          <p>Submitted teacher reports and published student PDFs will appear here for quick approval and delivery.</p>
          <div className="anv-review-empty-pills">
            <span className="pill-yellow">1. Teacher Submits</span>
            <span className="pill-orange">2. Admin Reviews</span>
            <span className="pill-green">3. Publish &amp; Send</span>
          </div>
        </div>
      ) : (
        <div className="review-table-wrap anv-review-table-card">
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
              {(() => {
                const totalReviewPages = Math.max(1, Math.ceil(rows.length / reviewPageSize));
                const safeReviewPage = Math.min(Math.max(1, reviewPage), totalReviewPages);
                const pagedReviewRows = rows.slice((safeReviewPage - 1) * reviewPageSize, safeReviewPage * reviewPageSize);
                return pagedReviewRows.map((row) => (
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
                ));
              })()}
            </tbody>
          </table>
          <Pagination
            currentPage={reviewPage}
            totalItems={rows.length}
            pageSize={reviewPageSize}
            onPageChange={setReviewPage}
            onPageSizeChange={setReviewPageSize}
            itemLabel="reports"
          />
        </div>
      )}
    </div>
  );
}

function AuditLog() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  useEffect(() => {
    api("/audit").then(setRows);
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const pagedRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

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
            {pagedRows.map((r, i) => (
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
        <Pagination
          currentPage={safePage}
          totalItems={rows.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[15, 25, 50, 100]}
          itemLabel="log records"
        />
      </section>
    </>
  );
}
function SchoolSettings({ config, setConfig, user, setUser, toast }) {
  const [subTab, setSubTab] = useState("school"); // "school" | "subjects" | "security"
  const [data, setData] = useState(config);
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [profileClass, setProfileClass] = useState("6");
  const [profileText, setProfileText] = useState(
    (config.profiles?.["6"] || config.subjects).map((s) => s.name).join("\n"),
  );
  const [indicatorText, setIndicatorText] = useState(
    (config.activities || ACTIVITIES).join("\n"),
  );
  const [termComponents, setTermComponents] = useState(
    () => config.termComponents || DEFAULT_CONFIG.termComponents,
  );
  const [termComponentRules, setTermComponentRules] = useState(
    () => config.termComponentRules || [],
  );
  const [ruleFromClass, setRuleFromClass] = useState(() => classes[0] || "Balvatika-1");
  const [ruleToClass, setRuleToClass] = useState(() => classes.find((c) => c === "5") || classes[Math.min(7, classes.length - 1)] || classes[0] || "5");
  const [ruleFaMax, setRuleFaMax] = useState(() => String(config.termComponents?.term1?.[0]?.max ?? 20));
  const [ruleSaMax, setRuleSaMax] = useState("50");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSelectClass = (cls) => {
    setProfileClass(cls);
    const subList =
      data.profiles?.[cls] ||
      config.profiles?.[cls] ||
      config.subjects ||
      [];
    setProfileText(subList.map((s) => s.name).join("\n"));
  };

  async function save(e, overrideData = null) {
    if (e && e.preventDefault) e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...(overrideData || data) };
      if (!overrideData || overrideData.termComponentRules === undefined) {
        delete payload.termComponentRules;
      }
      if (!overrideData || overrideData.termComponents === undefined) {
        delete payload.termComponents;
      }
      const c = await api("/config", { method: "PUT", body: payload });
      setConfig(c);
      setData(c);
      toast("School settings saved successfully");
      return c;
    } catch (e) {
      toast(e.message, true);
      return null;
    } finally {
      setIsSaving(false);
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
        setData((prev) => ({ ...prev, principalSignature: url }));
        toast("Principal signature uploaded. Save school settings to apply.");
      } else if (kind === "logo") {
        setData((prev) => ({ ...prev, logo: url }));
        toast("School logo uploaded. Save school settings to apply.");
      } else {
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

  const applyProfile = ({ silent = false } = {}) => {
    const names = profileText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    if (!names.length || names.length > 12) {
      toast("Enter 1–12 subjects", true);
      return null;
    }
    const subjects = names.map((n) => {
      const found = (config.subjects || []).find(
        (s) => s.name.toUpperCase() === n.toUpperCase(),
      );
      const cleanId =
        n
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
          .slice(0, 40) || "subject";
      return (
        found || {
          id: cleanId,
          name: n.toUpperCase(),
          icon: "BookOpen",
        }
      );
    });
    if (new Set(subjects.map((s) => s.id)).size !== subjects.length) {
      toast("Each subject in a class must have a unique name", true);
      return null;
    }
    const updatedProfiles = {
      ...(data.profiles || config.profiles || {}),
      [profileClass]: subjects,
    };
    setData((prev) => ({
      ...prev,
      profiles: updatedProfiles,
    }));
    if (!silent) {
      toast(`Subjects staged for Class ${profileClass}. Saving...`);
    }
    return updatedProfiles;
  };

  const applyIndicators = () => {
    const list = indicatorText
      .split("\n")
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean);
    if (!list.length || list.length > 8) {
      toast("Enter 1–8 co-scholastic indicators", true);
      return null;
    }
    const unique = [...new Set(list)];
    if (unique.length !== list.length) {
      toast("Indicator names must be unique", true);
      return null;
    }
    setData((prev) => ({
      ...prev,
      activities: unique,
    }));
    toast("Indicators staged. Click Save settings to apply.");
    return unique;
  };

  const currentIndicators =
    data.activities || config.activities || ACTIVITIES;

  const currentClassSubjects =
    data.profiles?.[profileClass] ||
    config.profiles?.[profileClass] ||
    config.subjects ||
    [];

  // For Teacher view
  if (user.role === "teacher") {
    return (
      <>
        <PageTitle
          eyebrow="ACCOUNT & SIGNATURE"
          title="Teacher Profile & Settings"
          subtitle="Manage your report signature and account security."
        />
        <div className="teacher-settings-grid">
          <section className="card settings-card">
            <div className="settings-card-header">
              <div>
                <h3>
                  <PenLine size={18} />
                  <span>Class Teacher Signature</span>
                </h3>
                <p>Used in the class-teacher signature space on reports you prepare.</p>
              </div>
            </div>
            <div className="asset-box-card">
              <div className="asset-preview-container signature-checkerboard">
                {user.signature ? (
                  <img
                    className="asset-preview-img"
                    src={user.signature}
                    alt="Teacher signature"
                  />
                ) : (
                  <div className="asset-empty-state">
                    <PenLine size={24} />
                    <span>No signature uploaded yet</span>
                  </div>
                )}
              </div>
              <p className="asset-desc">Upload a clean transparent PNG or JPG (up to 5 MB).</p>
              <label className="asset-upload-label-btn">
                <Upload size={14} />
                <span>Upload Signature</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => upload(e, "signature")}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </section>

          <form className="card settings-card" onSubmit={changePassword}>
            <div className="settings-card-header">
              <div>
                <h3>
                  <LockKeyhole size={18} />
                  <span>Change Password</span>
                </h3>
                <p>Ensure your account remains safe with a strong password.</p>
              </div>
            </div>
            <div className="settings-form-col">
              <Field label="Current password">
                <div className="password-field-wrapper">
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowCurrent(!showCurrent)}
                    title={showCurrent ? "Hide password" : "Show password"}
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <Field label="New password (6–20 characters)">
                <div className="password-field-wrapper">
                  <input
                    type={showNew ? "text" : "password"}
                    minLength={PASSWORD_MIN}
                    maxLength={PASSWORD_MAX}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowNew(!showNew)}
                    title={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <button className="btn primary" style={{ marginTop: 12 }}>
                <LockKeyhole size={15} /> Update & sign out
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  // Admin View: 3 clean sub-tabs without the redundant "Your signature" card!
  return (
    <>
      <div className="settings-subnav">
        <button
          type="button"
          className={subTab === "school" ? "active" : ""}
          onClick={() => setSubTab("school")}
        >
          <School size={16} /> School Profile & Branding
        </button>
        <button
          type="button"
          className={subTab === "subjects" ? "active" : ""}
          onClick={() => setSubTab("subjects")}
        >
          <BookOpen size={16} /> Class Subject Profiles
        </button>
        <button
          type="button"
          className={subTab === "indicators" ? "active" : ""}
          onClick={() => setSubTab("indicators")}
        >
          <Award size={16} /> Co-Scholastic Indicators
        </button>
        <button
          type="button"
          className={subTab === "exams" ? "active" : ""}
          onClick={() => setSubTab("exams")}
        >
          <SlidersHorizontal size={16} /> Exam Marks (FA / SA)
        </button>
        <button
          type="button"
          className={subTab === "security" ? "active" : ""}
          onClick={() => setSubTab("security")}
        >
          <ShieldCheck size={16} /> Security & Export
        </button>
      </div>

      {subTab === "school" && (
        <form onSubmit={save} className="settings-content-wrapper">
          <PageTitle
            eyebrow="SCHOOL PROFILE & IDENTITY"
            title="School Information & Official Branding"
            subtitle="Configure school contact details, affiliation, official logo, and principal signature."
          >
            <button type="submit" className="btn primary" disabled={isSaving}>
              <Save size={16} /> {isSaving ? "Saving..." : "Save school settings"}
            </button>
          </PageTitle>

          {/* School Information Card */}
          <section className="card settings-card">
            <div className="settings-card-header">
              <div>
                <h3>
                  <School size={18} />
                  <span>General School Information</span>
                </h3>
                <p>Printed on student report cards, official transcripts, and portal headers.</p>
              </div>
            </div>

            <div className="form-grid">
              {[
                ["schoolName", "School name"],
                ["address", "School address"],
                ["affiliation", "CBSE affiliation number"],
                ["session", "Academic session (YYYY-YY)"],
                ["phone", "Primary phone"],
                ["phone2", "Alternate phone"],
                ["email", "Official school email"],
                ["website", "Official website"],
              ].map(([k, label]) => (
                <Field key={k} label={label}>
                  <input
                    required
                    value={data[k] || ""}
                    onChange={(e) => setData({ ...data, [k]: e.target.value })}
                  />
                </Field>
              ))}
            </div>
          </section>

          {/* Official Visual Assets: Logo & Principal Signature */}
          <section className="card settings-card">
            <div className="settings-card-header">
              <div>
                <h3>
                  <PenLine size={18} />
                  <span>Official School Assets & Principal Signature</span>
                </h3>
                <p>High-resolution logo and authorized Principal signature for automated document signing.</p>
              </div>
            </div>

            <div className="school-assets-grid">
              {/* Asset 1: School Logo */}
              <div className="asset-box-card">
                <div className="asset-preview-container">
                  <img
                    className="asset-preview-img"
                    src={data.logo || "/srps-logo.png"}
                    alt="School Logo"
                  />
                </div>
                <h4 className="asset-title">School Emblem / Logo</h4>
                <p className="asset-desc">
                  PNG, JPG or SVG. Displayed in high resolution on report cards and documents.
                </p>
                <label className="asset-upload-label-btn">
                  <Upload size={14} />
                  <span>Upload School Logo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={(e) => upload(e, "logo")}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* Asset 2: Principal Signature */}
              <div className="asset-box-card">
                <div className="asset-preview-container signature-checkerboard">
                  {data.principalSignature ? (
                    <img
                      className="asset-preview-img"
                      src={data.principalSignature}
                      alt="Principal signature"
                    />
                  ) : (
                    <div className="asset-empty-state">
                      <PenLine size={24} />
                      <span>No signature uploaded</span>
                    </div>
                  )}
                </div>
                <h4 className="asset-title">Principal Signature</h4>
                <p className="asset-desc">
                  Transparent PNG recommended (up to 5 MB). Printed in the Principal signature space.
                </p>
                <label className="asset-upload-label-btn">
                  <PenLine size={14} />
                  <span>Upload Principal Signature</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => upload(e, "signature", true)}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Teacher Remarks Handwriting Style */}
          <section className="card settings-card">
            <div className="settings-card-header">
              <div>
                <h3>
                  <PenLine size={18} />
                  <span>Teacher Remarks Handwriting Style</span>
                </h3>
                <p>
                  Choose the realistic handwriting font for teacher remarks printed on student report cards and PDFs.
                </p>
              </div>
            </div>

            <div className="handwriting-styles-grid">
              {[
                {
                  id: "kalam",
                  name: "Kalam",
                  badge: "Recommended",
                  family: "SRPSKalam",
                  desc: "Authentic, natural school teacher handwriting with organic curves and warmth.",
                  sample: "Aarav is an outstanding student who consistently demonstrates academic excellence.",
                },
                {
                  id: "caveat",
                  name: "Caveat",
                  badge: "Casual Script",
                  family: "SRPSCaveat",
                  desc: "Elegant and smooth connected cursive handwriting style.",
                  sample: "Aarav is an outstanding student who consistently demonstrates academic excellence.",
                },
                {
                  id: "patrickHand",
                  name: "Patrick Hand",
                  badge: "Neat Print",
                  family: "SRPSPatrickHand",
                  desc: "Clean, legible, and friendly printed handwriting style.",
                  sample: "Aarav is an outstanding student who consistently demonstrates academic excellence.",
                },
              ].map((style) => {
                const isSelected = (data.handwritingFont || "kalam") === style.id;
                return (
                  <div
                    key={style.id}
                    className={`handwriting-font-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setData({ ...data, handwritingFont: style.id })}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="handwriting-font-card-header">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 600, fontSize: "15px" }}>{style.name}</span>
                          <span className={`badge ${isSelected ? "badge-primary" : "badge-secondary"}`}>
                            {style.badge}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--color-text-secondary, #64748b)", margin: "4px 0 0" }}>
                          {style.desc}
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="handwritingFont"
                        checked={isSelected}
                        onChange={() => setData({ ...data, handwritingFont: style.id })}
                      />
                    </div>
                    <div
                      className="handwriting-sample-box"
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px dashed #cbd5e1",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: style.family,
                          fontSize: "17px",
                          color: "#245A91",
                          lineHeight: "1.4",
                          transform: "rotate(-0.6deg)",
                          transformOrigin: "left center",
                        }}
                      >
                        “{style.sample}”
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="settings-action-bar">
            <span className="settings-action-hint">
              Click save to apply your changes across all modules and report generators.
            </span>
            <button type="submit" className="btn primary" disabled={isSaving}>
              <Save size={16} /> {isSaving ? "Saving..." : "Save school settings"}
            </button>
          </div>
        </form>
      )}

      {subTab === "subjects" && (
        <div className="settings-content-wrapper">
          <PageTitle
            eyebrow="ACADEMIC CURRICULUM"
            title="Class Subject Profiles"
            subtitle="Configure subjects taught in each class. Subject mappings determine marks entry and report cards."
          >
            <button
              type="button"
              className="btn primary"
              disabled={isSaving}
              onClick={async (e) => {
                const updated = applyProfile({ silent: true });
                if (updated) {
                  await save(e, { ...data, profiles: updated });
                }
              }}
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save school settings"}
            </button>
          </PageTitle>

          <section className="card settings-card">
            <div className="settings-card-header">
              <div>
                <h3>
                  <BookOpen size={18} />
                  <span>Subject Profile for Class {profileClass}</span>
                </h3>
                <p>Select a class below to preview and modify its active subject curriculum.</p>
              </div>
            </div>

            {/* Class Pill Selector */}
            <div className="class-pill-selector">
              {classes.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`class-pill-btn ${profileClass === c ? "active" : ""}`}
                  onClick={() => handleSelectClass(c)}
                >
                  Class {c}
                </button>
              ))}
            </div>

            <div className="subjects-split-layout">
              {/* Left Column: Visual Chips */}
              <div className="subject-chips-box">
                <div className="subject-chips-header">
                  <span className="subject-box-title">Active Subjects</span>
                  <span className="subject-count-pill">
                    {currentClassSubjects.length} Subjects
                  </span>
                </div>
                <div className="subject-chips-list">
                  {currentClassSubjects.map((s, idx) => (
                    <div key={s.id || idx} className="subject-item-chip">
                      <span className="subject-chip-num">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <BookOpen size={14} className="subject-chip-icon" />
                      <span className="subject-chip-name">{s.name}</span>
                    </div>
                  ))}
                  {!currentClassSubjects.length && (
                    <div className="empty-subjects-note">No subjects configured yet.</div>
                  )}
                </div>
              </div>

              {/* Right Column: Textarea Editor */}
              <div className="subject-textarea-box">
                <label className="subject-editor-label">
                  <b>Edit Subjects for Class {profileClass}</b>
                  <span>Enter 1 to 12 subjects (one subject per line).</span>
                </label>
                <textarea
                  rows={8}
                  value={profileText}
                  onChange={(e) => setProfileText(e.target.value)}
                  placeholder={"ENGLISH\nHINDI\nMATHEMATICS\nSCIENCE\nSOCIAL SCIENCE"}
                  aria-label="One subject per line"
                />
                <div className="subject-actions-row">
                  <button
                    type="button"
                    className="btn"
                    disabled={isSaving}
                    onClick={async (e) => {
                      const updated = applyProfile({ silent: true });
                      if (updated) {
                        const saved = await save(e, { ...data, profiles: updated });
                        if (saved) toast(`Subjects saved for Class ${profileClass}`);
                      }
                    }}
                  >
                    <Check size={15} /> {isSaving ? "Saving..." : `Save Class ${profileClass}`}
                  </button>
                  <button
                    type="button"
                    className="btn primary"
                    disabled={isSaving}
                    onClick={async (e) => {
                      const updated = applyProfile({ silent: true });
                      if (updated) {
                        await save(e, { ...data, profiles: updated });
                      }
                    }}
                  >
                    <Save size={15} /> {isSaving ? "Saving..." : "Apply & Save All"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {subTab === "indicators" && (
        <div className="settings-content-wrapper">
          <PageTitle
            eyebrow="CO-SCHOLASTIC CURRICULUM"
            title="Co-Scholastic Indicators & Activity Profiles"
            subtitle="Configure indicators assessed across terms. Changes apply instantly to Report Studio and student report cards."
          >
            <button
              type="button"
              className="btn primary"
              disabled={isSaving}
              onClick={async (e) => {
                const updated = applyIndicators();
                if (updated) {
                  await save(e, { ...data, activities: updated });
                } else {
                  await save(e);
                }
              }}
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save school settings"}
            </button>
          </PageTitle>

          <section className="card settings-card">
            <div className="settings-card-header">
              <div>
                <h3>
                  <Award size={18} />
                  <span>Co-Scholastic Indicator Topics</span>
                </h3>
                <p>Define topics for Part B (Co-Scholastic Activities, A+ · A · B+ · B · C grading scale).</p>
              </div>
            </div>

            <div className="subjects-split-layout">
              {/* Left Column: Visual Chips */}
              <div className="subject-chips-box">
                <div className="subject-chips-header">
                  <span className="subject-box-title">Active Indicators</span>
                  <span className="subject-count-pill">
                    {currentIndicators.length} Indicators
                  </span>
                </div>
                <div className="subject-chips-list">
                  {currentIndicators.map((act, idx) => (
                    <div key={act || idx} className="subject-item-chip">
                      <span className="subject-chip-num">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <Award size={14} className="subject-chip-icon" />
                      <span className="subject-chip-name">{act}</span>
                    </div>
                  ))}
                  {!currentIndicators.length && (
                    <div className="empty-subjects-note">No indicators configured yet.</div>
                  )}
                </div>
              </div>

              {/* Right Column: Textarea Editor & Presets */}
              <div className="subject-textarea-box">
                <label className="subject-editor-label">
                  <b>Edit Indicator Topics (All at a time)</b>
                  <span>Enter 1 to 4 indicator topics (one topic per line).</span>
                </label>
                <textarea
                  rows={6}
                  value={indicatorText}
                  onChange={(e) => setIndicatorText(e.target.value)}
                  placeholder={"ARTS ACTIVITY\nSOCIAL SKILLS\nSCIENTIFIC SKILLS\nCULTURAL ACTIVITY"}
                  aria-label="One indicator per line"
                />

                {/* Quick Presets */}
                <div
                  className="indicator-presets-row"
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginTop: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--muted, #64748b)",
                      alignSelf: "center",
                      fontWeight: "600",
                    }}
                  >
                    Presets:
                  </span>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => {
                      const p =
                        "ARTS ACTIVITY\nSOCIAL SKILLS\nSCIENTIFIC SKILLS\nCULTURAL ACTIVITY";
                      setIndicatorText(p);
                    }}
                  >
                    Current SRPS (4)
                  </button>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => {
                      const p =
                        "WORK EDUCATION\nART EDUCATION\nHEALTH & PHYSICAL EDUCATION\nDISCIPLINE";
                      setIndicatorText(p);
                    }}
                  >
                    CBSE Standard (4)
                  </button>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => {
                      const p =
                        "CREATIVE ARTS\nSOCIAL & EMOTIONAL SKILLS\nPHYSICAL FITNESS\nCITIZENSHIP & VALUES";
                      setIndicatorText(p);
                    }}
                  >
                    Primary / Skills (4)
                  </button>
                </div>

                <div className="subject-actions-row">
                  <button
                    type="button"
                    className="btn"
                    onClick={applyIndicators}
                  >
                    <Check size={15} /> Stage Indicators
                  </button>
                  <button
                    type="button"
                    className="btn primary"
                    disabled={isSaving}
                    onClick={async (e) => {
                      const updated = applyIndicators();
                      if (updated) {
                        setIsSaving(true);
                        try {
                          const c = await api("/config", {
                            method: "PUT",
                            body: { ...data, activities: updated },
                          });
                          setConfig(c);
                          setData(c);
                          toast("Co-scholastic indicators saved successfully");
                        } catch (err) {
                          toast(err.message, true);
                        } finally {
                          setIsSaving(false);
                        }
                      }
                    }}
                  >
                    <Save size={15} /> Apply & Save All
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {subTab === "exams" && (
        <div className="settings-content-wrapper">
          <PageTitle
            eyebrow="EXAMINATION STRUCTURE"
            title="Exam Marks Configuration (FA & SA)"
            subtitle="Modify FA-1, FA-2, SA-1, FA-3, FA-4 & SA-2 labels and maximum marks. Changes sync in real time to Teachers & Principal."
          >
            <button
              type="button"
              className="btn primary"
              disabled={isSaving}
              onClick={async (e) => {
                const saved = await save(e, { ...data, termComponents, termComponentRules });
                if (saved?.termComponents) setTermComponents(saved.termComponents);
                if (saved?.termComponentRules) setTermComponentRules(saved.termComponentRules);
              }}
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save Exam Settings"}
            </button>
          </PageTitle>

          <section className="card settings-card">
            <div className="settings-card-header">
              <div>
                <h3>
                  <SlidersHorizontal size={18} />
                  <span>Term I &amp; Term II Assessment Components</span>
                </h3>
                <p>
                  Update the display label or maximum marks for any FA / SA exam. Totals, percentages, grades, and validation update automatically across all accounts.
                </p>
              </div>
              <button
                type="button"
                className="btn"
                disabled={isSaving}
                onClick={() => setTermComponents(DEFAULT_CONFIG.termComponents)}
              >
                <RefreshCw size={14} /> Reset Defaults (25 / 25 / 100)
              </button>
            </div>

            <div className="subjects-split-layout">
              {[
                { key: "term1", title: "Term I (FA-1, FA-2, SA-1)" },
                { key: "term2", title: "Term II (FA-3, FA-4, SA-2)" },
              ].map((termMeta) => {
                const list = termComponents?.[termMeta.key] || [];
                const termSum = list.reduce((s, c) => s + Number(c.max || 0), 0);
                return (
                  <div key={termMeta.key} className="subject-chips-box">
                    <div className="subject-chips-header">
                      <span className="subject-box-title">{termMeta.title}</span>
                      <span className="subject-count-pill">Term Max: {termSum}</span>
                    </div>
                    <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                      {list.map((comp, idx) => (
                        <div
                          key={comp.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 120px",
                            gap: 10,
                            alignItems: "end",
                          }}
                        >
                          <label style={{ display: "grid", gap: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.75 }}>
                              Label ({comp.id.toUpperCase()})
                            </span>
                            <input
                              type="text"
                              maxLength={20}
                              value={comp.label}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTermComponents((prev) => ({
                                  ...prev,
                                  [termMeta.key]: (prev[termMeta.key] || []).map((item, i) =>
                                    i === idx ? { ...item, label: val } : item,
                                  ),
                                }));
                              }}
                            />
                          </label>
                          <label style={{ display: "grid", gap: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.75 }}>
                              Max Marks
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={500}
                              step="any"
                              value={comp.max}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTermComponents((prev) => ({
                                  ...prev,
                                  [termMeta.key]: (prev[termMeta.key] || []).map((item, i) =>
                                    i === idx
                                      ? { ...item, max: val === "" ? "" : Number(val) }
                                      : item,
                                  ),
                                }));
                              }}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="subject-actions-row"
              style={{
                marginTop: 18,
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>
                {(() => {
                  const t1 = (termComponents?.term1 || []).reduce((s, c) => s + Number(c.max || 0), 0);
                  const t2 = (termComponents?.term2 || []).reduce((s, c) => s + Number(c.max || 0), 0);
                  return `Term I Max: ${t1} · Term II Max: ${t2} · Per Subject Total: ${t1 + t2}`;
                })()}
              </span>
              <button
                type="button"
                className="btn primary"
                disabled={isSaving}
                onClick={async (e) => {
                  const saved = await save(e, { ...data, termComponents, termComponentRules });
                  if (saved?.termComponents) setTermComponents(saved.termComponents);
                  if (saved?.termComponentRules) setTermComponentRules(saved.termComponentRules);
                }}
              >
                <Save size={15} /> {isSaving ? "Saving..." : "Save Exam Settings"}
              </button>
            </div>
          </section>

          <section className="card settings-card" style={{ marginTop: 18 }}>
            <div className="settings-card-header">
              <div>
                <h3>
                  <Layers size={18} />
                  <span>Class-Wise SA / FA Marks Rules (Custom Class Ranges)</span>
                </h3>
                <p>
                  Alag-alag class range ke liye SA-1 / SA-2 ya FA marks set karein (e.g. Balvatika-1 se Class 5 tak SA = 50, Class 6 se 11 tak SA = 100).
                </p>
              </div>
              <button
                type="button"
                className="btn"
                disabled={isSaving}
                onClick={() => {
                  const idx5 = classes.indexOf("5");
                  const idx6 = classes.indexOf("6");
                  const lowerClasses = idx5 >= 0 ? classes.slice(0, idx5 + 1) : classes.filter((c) => ["Balvatika-1", "Balvatika-2", "Balvatika-3", "1", "2", "3", "4", "5"].includes(c));
                  const upperClasses = idx6 >= 0 ? classes.slice(idx6) : classes.filter((c) => !lowerClasses.includes(c));
                  const faVal = Number(termComponents?.term1?.[0]?.max) || 20;
                  const makeTC = (fa, sa) => ({
                    term1: [
                      { id: "fa1", label: termComponents?.term1?.[0]?.label || "FA-1", max: fa },
                      { id: "fa2", label: termComponents?.term1?.[1]?.label || "FA-2", max: fa },
                      { id: "sa1", label: termComponents?.term1?.[2]?.label || "SA-1", max: sa },
                    ],
                    term2: [
                      { id: "fa3", label: termComponents?.term2?.[0]?.label || "FA-3", max: fa },
                      { id: "fa4", label: termComponents?.term2?.[1]?.label || "FA-4", max: fa },
                      { id: "sa2", label: termComponents?.term2?.[2]?.label || "SA-2", max: sa },
                    ],
                  });
                  const nextRules = [];
                  if (lowerClasses.length) {
                    nextRules.push({
                      id: "rule_lower",
                      label: `${lowerClasses[0]} to ${lowerClasses[lowerClasses.length - 1]}`,
                      fromClass: lowerClasses[0],
                      toClass: lowerClasses[lowerClasses.length - 1],
                      classes: lowerClasses,
                      termComponents: makeTC(faVal, 50),
                    });
                  }
                  if (upperClasses.length) {
                    nextRules.push({
                      id: "rule_upper",
                      label: `${upperClasses[0]} to ${upperClasses[upperClasses.length - 1]}`,
                      fromClass: upperClasses[0],
                      toClass: upperClasses[upperClasses.length - 1],
                      classes: upperClasses,
                      termComponents: makeTC(faVal, 100),
                    });
                  }
                  setTermComponentRules(nextRules);
                  toast("Preset rules staged. Click Save Exam Settings to apply.");
                }}
              >
                <Sparkles size={14} /> Preset: Balvatika-1..5 (SA=50) &amp; 6+ (SA=100)
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 10,
                alignItems: "end",
                marginTop: 12,
              }}
            >
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.75 }}>From Class</span>
                <select value={ruleFromClass} onChange={(e) => setRuleFromClass(e.target.value)}>
                  {classes.map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.75 }}>To Class</span>
                <select value={ruleToClass} onChange={(e) => setRuleToClass(e.target.value)}>
                  {classes.map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.75 }}>FA (1–4) Max</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={ruleFaMax}
                  onChange={(e) => setRuleFaMax(e.target.value)}
                />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.75 }}>SA (1–2) Max</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={ruleSaMax}
                  onChange={(e) => setRuleSaMax(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  const i1 = classes.indexOf(ruleFromClass);
                  const i2 = classes.indexOf(ruleToClass);
                  if (i1 < 0 || i2 < 0) return toast("Select valid classes", true);
                  const start = Math.min(i1, i2);
                  const end = Math.max(i1, i2);
                  const rangeClasses = classes.slice(start, end + 1);
                  const fa = Number(ruleFaMax);
                  const sa = Number(ruleSaMax);
                  if (!Number.isFinite(fa) || fa < 1 || fa > 500 || !Number.isFinite(sa) || sa < 1 || sa > 500) {
                    return toast("Enter valid FA & SA max marks (1–500)", true);
                  }
                  const newRule = {
                    id: `rule_${Date.now()}`,
                    label: `${classes[start]} to ${classes[end]}`,
                    fromClass: classes[start],
                    toClass: classes[end],
                    classes: rangeClasses,
                    termComponents: {
                      term1: [
                        { id: "fa1", label: termComponents?.term1?.[0]?.label || "FA-1", max: fa },
                        { id: "fa2", label: termComponents?.term1?.[1]?.label || "FA-2", max: fa },
                        { id: "sa1", label: termComponents?.term1?.[2]?.label || "SA-1", max: sa },
                      ],
                      term2: [
                        { id: "fa3", label: termComponents?.term2?.[0]?.label || "FA-3", max: fa },
                        { id: "fa4", label: termComponents?.term2?.[1]?.label || "FA-4", max: fa },
                        { id: "sa2", label: termComponents?.term2?.[2]?.label || "SA-2", max: sa },
                      ],
                    },
                  };
                  setTermComponentRules((prev) => {
                    const cleaned = prev
                      .map((r) => ({
                        ...r,
                        classes: (r.classes || []).filter((c) => !rangeClasses.includes(c)),
                      }))
                      .filter((r) => r.classes.length > 0);
                    return [...cleaned, newRule];
                  });
                  toast(`Added rule for ${classes[start]} to ${classes[end]}. Click Save Exam Settings to apply.`);
                }}
              >
                <Plus size={15} /> Add Range Rule
              </button>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {termComponentRules.map((rule) => {
                const fa = rule.termComponents?.term1?.[0]?.max ?? "—";
                const sa = rule.termComponents?.term1?.[2]?.max ?? "—";
                const t1 = (rule.termComponents?.term1 || []).reduce((s, c) => s + Number(c.max || 0), 0);
                const t2 = (rule.termComponents?.term2 || []).reduce((s, c) => s + Number(c.max || 0), 0);
                return (
                  <div
                    key={rule.id}
                    className="subject-item-chip"
                    style={{ justifyContent: "space-between", padding: "12px 14px" }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {rule.label || `${rule.classes[0]} to ${rule.classes[rule.classes.length - 1]}`}
                        <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, opacity: 0.75 }}>
                          ({rule.classes.length} classes: {rule.classes.join(", ")})
                        </span>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>
                        FA: <b>{fa}</b> · SA-1 &amp; SA-2: <b>{sa}</b> · Subject Total: <b>{t1 + t2}</b>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-button danger"
                      onClick={() => setTermComponentRules((prev) => prev.filter((r) => r.id !== rule.id))}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                );
              })}
              {!termComponentRules.length && (
                <div className="empty-subjects-note">
                  No class-specific rules configured. All classes currently use the global default FA/SA marks above.
                </div>
              )}
            </div>

            <div className="subject-actions-row" style={{ marginTop: 16, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn primary"
                disabled={isSaving}
                onClick={async (e) => {
                  const saved = await save(e, { ...data, termComponents, termComponentRules });
                  if (saved?.termComponents) setTermComponents(saved.termComponents);
                  if (saved?.termComponentRules) setTermComponentRules(saved.termComponentRules);
                }}
              >
                <Save size={15} /> {isSaving ? "Saving..." : "Save Exam Settings"}
              </button>
            </div>
          </section>
        </div>
      )}

      {subTab === "security" && (
        <div className="settings-content-wrapper">
          <PageTitle
            eyebrow="ACCOUNT & TOOLS"
            title="Security & Consolidated Result Export"
            subtitle="Manage administrator password and export school session results."
          />

          <div className="security-export-grid">
            {/* Card 1: Change Password */}
            <form className="card settings-card" onSubmit={changePassword}>
              <div className="settings-card-header">
                <div>
                  <h3>
                    <LockKeyhole size={18} />
                    <span>Change Password</span>
                  </h3>
                  <p>Update your administrator login password.</p>
                </div>
              </div>

              <div className="settings-form-col">
                <Field label="Current password">
                  <div className="password-field-wrapper">
                    <input
                      type={showCurrent ? "text" : "password"}
                      required
                      value={current}
                      onChange={(e) => setCurrent(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-eye-btn"
                      onClick={() => setShowCurrent(!showCurrent)}
                      title={showCurrent ? "Hide password" : "Show password"}
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>

                <Field label="New password (6–20 characters)">
                  <div className="password-field-wrapper">
                    <input
                      type={showNew ? "text" : "password"}
                      minLength={PASSWORD_MIN}
                      maxLength={PASSWORD_MAX}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-eye-btn"
                      onClick={() => setShowNew(!showNew)}
                      title={showNew ? "Hide password" : "Show password"}
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>

                <button className="btn primary" style={{ marginTop: 12 }}>
                  <LockKeyhole size={15} /> Update & sign out
                </button>
              </div>
            </form>

            {/* Card 2: Consolidated Result Export */}
            <section className="card settings-card">
              <div className="settings-card-header">
                <div>
                  <h3>
                    <FileSpreadsheet size={18} />
                    <span>Consolidated Results Export</span>
                  </h3>
                  <p>Download comprehensive academic records for session {config.session || "2025-26"}.</p>
                </div>
              </div>

              <div className="export-card-body">
                <div className="export-session-tag">
                  <span>Target Academic Session: <b>{config.session || "2025-26"}</b></span>
                </div>
                <p className="export-details-text">
                  Generates an official formatted Excel workbook containing all classes, student marks,
                  grades, attendance, and remarks in one consolidated spreadsheet.
                </p>
                <button
                  type="button"
                  className="btn primary export-btn"
                  disabled={isExporting}
                  onClick={async () => {
                    try {
                      setIsExporting(true);
                      if (isDemo()) {
                        return toast(
                          "Result workbook export is available with the MongoDB server.",
                        );
                      }
                      await download(
                        "/export?session=" + (config.session || "2025-26"),
                        "SRPS_Results.xlsx",
                      );
                      toast("Result workbook downloaded successfully");
                    } catch (e) {
                      toast(e.message, true);
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                >
                  <FileSpreadsheet size={16} />
                  <span>{isExporting ? "Exporting..." : "Export Results Workbook (.xlsx)"}</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("UI Error caught by ErrorBoundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2>Something went wrong in the workspace</h2>
          <p style={{ color: "#dc2626", margin: "16px 0" }}>{this.state.error?.message || "Unknown error"}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
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
  </ErrorBoundary>,
);
function BulkReports({ students, config, user, toast }) {
  const [cls, setCls] = useState("6"),
    [sec, setSec] = useState("Venus"),
    [session, setSession] = useState(config.session),
    [records, setRecords] = useState([]),
    [busy, setBusy] = useState(false),
    [bulkWhatsappOpen, setBulkWhatsappOpen] = useState(false),
    [bulkPage, setBulkPage] = useState(1),
    [bulkPageSize, setBulkPageSize] = useState(10);
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
              <Loader size={16} inline />
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
        {(() => {
          const totalBulkPages = Math.max(1, Math.ceil(records.length / bulkPageSize));
          const safeBulkPage = Math.min(Math.max(1, bulkPage), totalBulkPages);
          const pagedRecords = records.slice((safeBulkPage - 1) * bulkPageSize, safeBulkPage * bulkPageSize);
          return (
            <>
              {pagedRecords.map((r) => (
                <div className="bulk-row" key={r.student._id}>
                  <CheckCircle2 size={18} />
                  <b>{r.student.name}</b>
                  <span>{r.student.admissionNo}</span>
                  <span>2 pages · Published</span>
                </div>
              ))}
              {!records.length && <Empty text="Prepare your published reports" />}
              {records.length > 0 && (
                <Pagination
                  currentPage={safeBulkPage}
                  totalItems={records.length}
                  pageSize={bulkPageSize}
                  onPageChange={setBulkPage}
                  onPageSizeChange={setBulkPageSize}
                  itemLabel="reports"
                />
              )}
            </>
          );
        })()}
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
        {records.map((r) => (
          <ReportPage
            key={r.student._id}
            side="front"
            student={r.student}
            report={r.report}
            config={r.config}
            user={user}
          />
        ))}
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
      onBlur={() => {
        if (text === "A") {
          setText("AB");
          onChange("AB");
        }
      }}
      onChange={(e) => {
        const raw = e.target.value.toUpperCase();
        if (text === "AB" && raw === "A") {
          setText("");
          onChange("");
          return;
        }
        if (raw === "A") {
          setText("AB");
          onChange("AB");
          return;
        }
        if (
          !["", "AB"].includes(raw) &&
          !/^\d{0,3}(\.\d{0,2})?$/.test(raw)
        )
          return;
        if (
          !["", "AB"].includes(raw) &&
          (!Number.isFinite(Number(raw)) || Number(raw) > max)
        )
          return;
        setText(raw);
        onChange(["", "AB"].includes(raw) ? raw : Number(raw));
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
  const classesIn = [...new Set(reports.filter((r) => r.session === pathParts[0]).map((r) => r.className))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const sectionsIn = [...new Set(reports.filter((r) => r.session === pathParts[0] && r.className === pathParts[1]).map((r) => r.section))].sort();
  const folders = !pathParts.length ? sessions.map((name) => ({ name, count: reports.filter((r) => r.session === name).length }))
    : pathParts.length === 1 ? classesIn.map((name) => ({ name: `Class ${name}`, value: name, count: reports.filter((r) => r.session === pathParts[0] && r.className === name).length }))
      : pathParts.length === 2 ? sectionsIn.map((name) => ({ name, count: reports.filter((r) => r.session === pathParts[0] && r.className === pathParts[1] && r.section === name).length })) : [];
  const sortedReports = [...reports].sort((a, b) => sortBy === "Name"
    ? String(a.studentName).localeCompare(String(b.studentName), undefined, { sensitivity: "base" })
    : new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  const pathReports = reports.filter((r) => r.session === pathParts[0] && r.className === pathParts[1] && r.section === pathParts[2]);
  const search = query.trim().toLowerCase();
  const visibleFiles = (search ? sortedReports.filter((r) => [r.studentName, r.admissionNo, r.session, r.className, r.section].some((v) => String(v || "").toLowerCase().includes(search)))
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
  const folderIcon = (size = 22) => <Folder size={size} fill="currentColor" strokeWidth={1.8} />;
  const folderRow = (item) => <button className="drive-entry" key={item.name} onClick={() => folderTarget(item)}>
    <span className="drive-entry-icon drive-folder-icon">{folderIcon(21)}</span>
    <span className="drive-entry-name"><b>{item.name}</b><small>{item.count} {item.count === 1 ? "report" : "reports"}</small></span>
    <span className="drive-entry-date">—</span><span className="drive-entry-type">Folder</span><ChevronRight size={17} />
  </button>;
  const fileRow = (r, grid = false) => <article className={"drive-entry drive-report-entry " + (grid ? "drive-report-card" : "")} key={r.id}>
    <span className="drive-entry-icon drive-pdf-icon"><FileText size={22} /><i>PDF</i></span>
    <span className="drive-entry-name"><b>{r.studentName}</b><small>Admission {r.admissionNo || "—"} · Class {r.className} · {r.section}</small></span>
    <span className="drive-entry-date">{r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : "—"}</span>
    {grid ? <small className="drive-card-session">{r.session} · {r.archiveReady ? "PDF report" : "Legacy report"}</small> : <span className="drive-entry-type">PDF</span>}
    {r.archiveReady ? <button className="drive-download" aria-label={`Download ${r.studentName} report`} title="Download password-protected PDF" disabled={busy} onClick={() => downloadReport(r)}><Download size={19} /></button> : <span className="drive-legacy">Legacy</span>}
  </article>;
  return <section className="report-drive-shell">
    <header className="drive-topbar">
      <div className="drive-brand"><span className="drive-brand-mark"><HardDrive size={22} /></span><span>Report Drive</span></div>
      <label className="drive-search"><Search size={21} /><input value={query} onChange={(e) => { setQuery(e.target.value); setRecentMode(false); }} placeholder="Search reports by student, admission no., class…" /></label>
      <button className="drive-lock-button" onClick={stage === "open" ? lock : requestOtp} disabled={busy}><LockKeyhole size={17} />{stage === "open" ? "Lock" : "Verify"}</button>
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
                {busy ? <Loader size={18} inline /> : <Send size={18} />}
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
                {busy ? <Loader size={18} inline /> : <LockKeyhole size={18} />}
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
          <button className={!recentMode ? "drive-side-link active" : "drive-side-link"} onClick={() => { go([]); setQuery(""); }}><HardDrive size={18} /> My Drive</button>
          <button className={recentMode ? "drive-side-link active" : "drive-side-link"} onClick={() => { setPathParts([]); setRecentMode(true); setQuery(""); }}><Clock3 size={18} /> Recent reports</button>
          <div className="drive-tree-label">SESSIONS <span>{sessions.length}</span></div>
          <div className="drive-tree">{sessions.map((session) => <button key={session} className={pathParts[0] === session && !recentMode ? "drive-tree-item selected" : "drive-tree-item"} onClick={() => { go([session]); setQuery(""); }}><span>▸</span>{folderIcon(16)}<span>{session}</span></button>)}</div>
          <div className="drive-sidebar-bottom"><LockKeyhole size={15} /><span>Admin-only archive<br /><b>OTP verified</b></span></div>
        </aside>
        <main className="drive-main">
          <div className="drive-toolbar">
            <div className="drive-breadcrumbs"><button onClick={() => { go([]); setQuery(""); }}>My Drive</button>{!search && pathParts.map((part, i) => <React.Fragment key={`${i}-${part}`}><ChevronRight size={16} /><button onClick={() => go(pathParts.slice(0, i + 1))}>{i === 1 ? `Class ${part}` : part}</button></React.Fragment>)}{search && <><ChevronRight size={16} /><b>Search results</b></>}{recentMode && <><ChevronRight size={16} /><b>Recent reports</b></>}</div>
            <div className="drive-toolbar-actions"><span className="drive-status"><LockKeyhole size={14} /> Private</span><div className="drive-view-switch"><button className={view === "list" ? "selected" : ""} onClick={() => setView("list")} aria-label="List view" title="List view"><List size={18} /></button><button className={view === "grid" ? "selected" : ""} onClick={() => setView("grid")} aria-label="Grid view" title="Grid view"><LayoutGrid size={18} /></button></div></div>
          </div>
          <div className="drive-title-row"><div><h1>{search ? "Search results" : recentMode ? "Recent reports" : pathParts.length === 0 ? "My Drive" : pathParts.length === 1 ? pathParts[0] : pathParts.length === 2 ? `Class ${pathParts[1]}` : pathParts[2]}</h1><p>{search ? `${visibleFiles.length} matching reports` : recentMode ? "Recently published report cards" : pathParts.length ? `${folders.length ? folders.length + " folders" : pathReports.length + " reports"}` : "Academic sessions and published report cards"}</p></div><div className="drive-title-actions"><button className="drive-archive-all" onClick={archiveAll} disabled={archiving}>{archiving ? <RefreshCw className="spin" size={16} /> : <HardDrive size={16} />} {archiving ? `Archiving ${archiveProgress?.archived || 0}…` : "Archive all reports"}</button><button className="drive-sort" onClick={() => setSortBy(sortBy === "Name" ? "Last modified" : "Name")} title="Switch sort order"><ArrowUpDown size={16} /> {sortBy} <ChevronDown size={15} /></button></div></div>
          {!search && !recentMode && folders.length > 0 && <><h2 className="drive-section-heading">{pathParts.length ? "Folders" : "Sessions"}</h2><div className={view === "grid" ? "drive-folder-grid" : "drive-folder-list"}>{folders.map(folderRow)}</div></>}
          {(!folders.length || search || recentMode || pathParts.length === 3 || pathParts.length === 0) && <><h2 className="drive-section-heading">{search ? "Reports" : recentMode ? "Published reports" : pathParts.length === 3 ? "Reports" : pathParts.length === 0 ? "Recently published" : ""}</h2>{view === "grid" ? <div className="drive-report-grid">{visibleFiles.slice(0, pathParts.length === 0 && !search && !recentMode ? 8 : undefined).map((r) => fileRow(r, true))}</div> : <div className="drive-table-wrap"><div className="drive-table-head"><span>Name</span><span>Published</span><span>Type</span><span> </span></div>{visibleFiles.map((r) => fileRow(r))}</div>}{!visibleFiles.length && <div className="drive-empty">{search ? "No reports match your search." : "No published reports in this folder yet."}</div>}</>}
          <div className="drive-security-note"><LockKeyhole size={14} /> PDF password: admission number@DOB (YYYY-MM-DD) · Reports stay in private server storage</div>
        </main>
      </div>
    )}
  </section>;
}
