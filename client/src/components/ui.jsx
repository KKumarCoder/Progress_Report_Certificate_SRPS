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
        <div className="anv-hero-badge">
          <GraduationCap size={38} strokeWidth={1.75} />
        </div>
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
