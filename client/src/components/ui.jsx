import React from "react";
import {
  Sun,
  Moon,
  Monitor,
  Home,
  Users,
  BookOpen,
  FileText,
  MoreHorizontal,
  X,
  LogOut,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

export function GraduationBooksIllustration({ size = 88 }) {
  return (
    <svg
      className="anv-hero-3d-svg"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="anvBookOrange" x1="18" y1="74" x2="102" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="anvBookBlue" x1="22" y1="54" x2="98" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="anvCapTop" x1="24" y1="22" x2="96" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>
      {/* Soft shadow */}
      <ellipse cx="60" cy="106" rx="42" ry="7" fill="rgba(8, 25, 65, 0.28)" />
      {/* Bottom orange book */}
      <rect x="20" y="78" width="80" height="22" rx="6" fill="url(#anvBookOrange)" />
      <rect x="26" y="82" width="68" height="14" rx="3" fill="#FFF7ED" />
      <rect x="20" y="78" width="12" height="22" rx="4" fill="#C2410C" />
      {/* Top blue book */}
      <rect x="24" y="56" width="72" height="20" rx="6" fill="url(#anvBookBlue)" />
      <rect x="30" y="60" width="60" height="12" rx="3" fill="#F0F9FF" />
      <rect x="24" y="56" width="11" height="20" rx="4" fill="#0369A1" />
      {/* Graduation cap base */}
      <path d="M40 42H80V53C80 57 71 60 60 60C49 60 40 57 40 53V42Z" fill="#1E293B" />
      {/* Graduation cap mortarboard */}
      <path d="M60 18L102 35L60 52L18 35L60 18Z" fill="url(#anvCapTop)" stroke="#60A5FA" strokeWidth="1.5" />
      <circle cx="60" cy="35" r="3.5" fill="#FBBF24" />
      {/* Golden tassel */}
      <path d="M60 35C74 37 86 41 88 53" stroke="#FBBF24" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="88" cy="56" r="3.5" fill="#F59E0B" />
      {/* Sparkles */}
      <circle cx="20" cy="24" r="2.5" fill="#FFFFFF" fillOpacity="0.85" />
      <circle cx="98" cy="22" r="2" fill="#BAE6FD" fillOpacity="0.9" />
      <circle cx="104" cy="68" r="2.5" fill="#FDE68A" fillOpacity="0.9" />
    </svg>
  );
}

export function HeroBanner({
  title,
  subtitle,
  eyebrow,
  actions,
  variant = "directory",
}) {
  return (
    <section className={`anv-hero anv-hero-${variant}`}>
      <div className="anv-hero-content">
        {eyebrow && <span className="anv-hero-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {actions && <div className="anv-hero-actions">{actions}</div>}
      </div>
      <div className="anv-hero-visual" aria-hidden="true">
        <GraduationBooksIllustration size={92} />
      </div>
    </section>
  );
}

export function StatCard({ icon: Icon, label, value, tone = "blue", sub }) {
  return (
    <div className={`anv-stat-card tone-${tone}`}>
      <div className={`anv-stat-icon tone-${tone}`}>
        {Icon && <Icon size={20} />}
      </div>
      <div className="anv-stat-meta">
        <span className="anv-stat-label">{label}</span>
        <strong className="anv-stat-value">{value}</strong>
        {sub && <small className="anv-stat-sub">{sub}</small>}
      </div>
    </div>
  );
}

export function StatusBadge({ status, children }) {
  const tone =
    status === "published" || status === "active" || status === "PASS"
      ? "success"
      : status === "submitted" || status === "warning"
        ? "warning"
        : status === "disabled" || status === "danger"
          ? "danger"
          : "neutral";
  return <span className={`anv-status-badge ${tone}`}>{children}</span>;
}

export function ThemeSwitcher({ themeMode, onChange }) {
  const options = [
    { id: "light", label: "Light", Icon: Sun },
    { id: "dark", label: "Dark", Icon: Moon },
    { id: "system", label: "System", Icon: Monitor },
  ];
  return (
    <div className="anv-theme-switcher" role="group" aria-label="Theme preference">
      {options.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`anv-theme-btn ${themeMode === id ? "active" : ""}`}
          onClick={() => onChange(id)}
          title={`${label} theme`}
          aria-pressed={themeMode === id}
        >
          <Icon size={14} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export function MobileBottomNav({
  page,
  onNavigate,
  onOpenMore,
  canOpenPage,
  user,
}) {
  const items = [
    { id: "dashboard", label: "Home", Icon: Home, show: canOpenPage(user, "dashboard") },
    { id: "students", label: "Students", Icon: Users, show: canOpenPage(user, "students") },
    { id: "studio", label: "Marks", Icon: BookOpen, show: canOpenPage(user, "studio") },
    {
      id: canOpenPage(user, "review") ? "review" : "bulk",
      label: "Reports",
      Icon: FileText,
      show: canOpenPage(user, "review") || canOpenPage(user, "bulk"),
    },
  ].filter((item) => item.show);

  return (
    <nav className="anv-mobile-bottom-nav" aria-label="Mobile navigation">
      {items.map(({ id, label, Icon }) => {
        const active = page === id || (id === "students" && page === "masters");
        return (
          <button
            key={id}
            type="button"
            className={`anv-bottom-nav-item ${active ? "active" : ""}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        );
      })}
      <button
        type="button"
        className="anv-bottom-nav-item"
        onClick={onOpenMore}
      >
        <MoreHorizontal size={20} />
        <span>More</span>
      </button>
    </nav>
  );
}

export function MobileMoreDrawer({
  open,
  onClose,
  navItems,
  currentPage,
  onNavigate,
  themeMode,
  onThemeChange,
  user,
  onLogout,
  onOpenProfile,
}) {
  if (!open) return null;
  return (
    <div className="anv-drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="anv-more-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="anv-drawer-handle" />
        <div className="anv-drawer-header">
          <div className="anv-drawer-user" onClick={() => { onClose(); onOpenProfile(); }}>
            <div className="anv-drawer-avatar">
              {user.photo ? (
                <img src={user.photo} alt={user.name} />
              ) : (
                user.name?.slice(0, 1) || "U"
              )}
            </div>
            <div>
              <strong>{user.name}</strong>
              <small>{user.designation || user.role}</small>
            </div>
          </div>
          <button type="button" className="anv-icon-btn" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="anv-drawer-theme-row">
          <span>Appearance</span>
          <ThemeSwitcher themeMode={themeMode} onChange={onThemeChange} />
        </div>

        <div className="anv-drawer-links">
          {navItems.map(([id, label, Icon, colorClass]) => (
            <button
              key={id}
              type="button"
              className={`anv-drawer-link ${currentPage === id ? "active" : ""}`}
              onClick={() => {
                onNavigate(id);
                onClose();
              }}
            >
              <span className={`nav-icon-badge color-${colorClass}`}>
                <Icon size={17} />
              </span>
              <span className="anv-drawer-link-label">{label}</span>
              <ChevronRight size={16} className="anv-drawer-arrow" />
            </button>
          ))}
        </div>

        <button type="button" className="anv-drawer-logout" onClick={onLogout}>
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
