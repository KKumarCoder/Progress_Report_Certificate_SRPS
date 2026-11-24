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
  BarChart3,
  Plus,
  ChevronRight,
  FileText,
} from "lucide-react";

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
  const firstName = user?.name ? user.name.split(" ")[0] : "educator";

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">YOUR SCHOOL, AT A GLANCE</span>
          <h1>Good to see you, {firstName}.</h1>
          <p>A little less paperwork. A lot more progress.</p>
        </div>
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
      </div>

      <div className="overview-stats">
        {[
          [Users, "Students", students.length, "In your accessible classes"],
          [School, "Class sections", groups.size, "Active sections"],
          [
            BookOpen,
            "Academic session",
            config.session || "2026-27",
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
          {hasModule(user, "studio") && (
            <button
              className="btn primary"
              onClick={() => (students[0] ? open(students[0]) : go("students"))}
            >
              Open report studio <ArrowRight size={16} />
            </button>
          )}
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
