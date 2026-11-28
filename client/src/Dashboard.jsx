import React from "react";
import {
  Users,
  School,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  ChevronRight,
  FileText,
  Calendar,
} from "lucide-react";
import { GraduationBooksIllustration } from "./components/ui";

function hasModule(user, id) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (Array.isArray(user.moduleAccess)) return user.moduleAccess.includes(id);
  const roleModules = {
    teacher: ["overview", "students", "studio", "bulk", "settings"],
    principal: [
      "overview",
      "students",
      "studio",
      "review",
      "bulk",
      "settings",
      "audit",
    ],
  };
  return (roleModules[user.role] || []).includes(id);
}

export default function Dashboard({
  students = [],
  config = {},
  open,
  go,
  user = {},
  toast,
}) {
  const groups = new Set(students.map((s) => s.className + "/" + s.section));

  return (
    <>
      <div className="overview-stats anv-kpi-grid">
        <button
          type="button"
          className="anv-kpi-card tone-blue"
          onClick={() => go(user.role === "admin" ? "masters" : "students")}
        >
          <div className="anv-kpi-icon tone-blue">
            <Users size={24} />
          </div>
          <div className="anv-kpi-body">
            <strong>{groups.size}</strong>
            <span>Sections</span>
          </div>
          <span className="anv-kpi-arrow" aria-hidden="true">
            <ChevronRight size={15} />
          </span>
        </button>

        <button
          type="button"
          className="anv-kpi-card tone-green"
          onClick={() => go("students")}
        >
          <div className="anv-kpi-icon tone-green">
            <GraduationCap size={24} />
          </div>
          <div className="anv-kpi-body">
            <strong>{students.length}</strong>
            <span>Students</span>
          </div>
          <span className="anv-kpi-arrow" aria-hidden="true">
            <ChevronRight size={15} />
          </span>
        </button>

        <button
          type="button"
          className="anv-kpi-card anv-kpi-wide tone-amber"
          onClick={() => go("settings")}
        >
          <div className="anv-kpi-icon tone-amber">
            <Calendar size={24} />
          </div>
          <div className="anv-kpi-body">
            <span>Academic Session</span>
            <strong>{config.session || "2026-27"}</strong>
            <div className="anv-kpi-progress" aria-hidden="true">
              <span />
            </div>
          </div>
          <span className="anv-kpi-arrow" aria-hidden="true">
            <ChevronRight size={15} />
          </span>
        </button>
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
          {hasModule(user, "studio") && (
            <button
              className="btn primary"
              onClick={() => (students[0] ? open(students[0]) : go("students"))}
            >
              Open report studio <ArrowRight size={16} />
            </button>
          )}
        </div>
        <div className="anv-welcome-mobile-art" aria-hidden="true">
          <GraduationBooksIllustration size={96} />
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
        {hasModule(user, "studio") && (
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
                  <div className="student-avatar">{s.name?.[0] || "S"}</div>
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
              <div className="empty-state">
                <FileText size={36} />
                <h3>Add your first students</h3>
                <p>Your records will appear here.</p>
              </div>
            )}
          </section>
        )}

        <section className="card steps-card">
          <div className="card-heading">
            <div>
              <h3>Your report workflow</h3>
              <p>Clear steps. Reliable records.</p>
            </div>
            <ShieldCheck size={22} />
          </div>
          {[
            [
              "01",
              "Bring students in",
              "Import your Excel sheet or register students once.",
            ],
            [
              "02",
              "Assess with confidence",
              "Enter Term I & II marks with live totals and grades.",
            ],
            [
              "03",
              "Review, publish, celebrate",
              "Approve reports, bulk print, or send via WhatsApp.",
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
