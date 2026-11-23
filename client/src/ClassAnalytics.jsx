import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Medal,
  Download,
  Printer,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Users,
  Percent,
} from "lucide-react";
import { api } from "./api";

export default function ClassAnalytics({
  session: initialSession,
  config,
  user,
  toast,
  openStudent,
  classes: propClasses,
  sections: propSections,
}) {
  const [session, setSession] = useState(initialSession || config.session);
  const [selectedClass, setSelectedClass] = useState("1");
  const [selectedSection, setSelectedSection] = useState("all");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const classes = propClasses || [
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
  const sections = [
    "all",
    ...(propSections || [
      "Venus",
      "Mars",
      "Jupiter",
      "Science",
      "Arts",
      "Commerce",
    ]),
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api(
        `/analytics/class?session=${encodeURIComponent(session)}&className=${encodeURIComponent(
          selectedClass,
        )}&section=${encodeURIComponent(selectedSection)}`,
      );
      setData(res);
    } catch (err) {
      toast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session, selectedClass, selectedSection]);

  const summary = data?.summary || {
    totalStudents: 0,
    assessedCount: 0,
    pendingCount: 0,
    avgPercentage: 0,
    highestPercentage: 0,
    overallPassRate: 0,
  };

  const toppers = data?.toppers || [];
  const subjectStats = data?.subjectStats || [];
  const atRisk = data?.atRisk || [];
  const allStudents = data?.students || [];

  const filteredStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      String(s.admissionNo).includes(search),
  );

  // 1-Click Excel Export
  const exportToExcel = async () => {
    if (!data) return;
    setExporting(true);
    try {
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Shree Ram Public School ERP";
      workbook.created = new Date();

      // Sheet 1: Class Toppers & Merit List
      const wsMerit = workbook.addWorksheet(
        `Class ${selectedClass} Merit List`,
      );
      wsMerit.columns = [
        { header: "Rank", key: "rank", width: 10 },
        { header: "Admission No", key: "admissionNo", width: 16 },
        { header: "Student Name", key: "name", width: 25 },
        { header: "Class", key: "className", width: 10 },
        { header: "Section", key: "section", width: 12 },
        { header: "Grand Total", key: "total", width: 14 },
        { header: "Maximum", key: "maximum", width: 12 },
        { header: "Percentage (%)", key: "percentage", width: 16 },
        { header: "Grade", key: "grade", width: 10 },
        { header: "Result", key: "result", width: 16 },
      ];

      allStudents.forEach((s, idx) => {
        wsMerit.addRow({
          rank: idx + 1,
          admissionNo: s.admissionNo,
          name: s.name,
          className: s.className,
          section: s.section,
          total: s.total,
          maximum: s.maximum,
          percentage: s.percentage !== null ? `${s.percentage}%` : "—",
          grade: s.grade,
          result: s.result,
        });
      });

      // Style Sheet 1 header
      wsMerit.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      wsMerit.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" },
      };

      // Sheet 2: Subject Performance Analysis
      const wsSubjects = workbook.addWorksheet("Subject Analysis");
      wsSubjects.columns = [
        { header: "Subject", key: "name", width: 25 },
        { header: "Evaluated Count", key: "evaluatedCount", width: 18 },
        { header: "Class Average", key: "averageScore", width: 16 },
        { header: "Class Highest", key: "highestScore", width: 16 },
        { header: "Passed Students", key: "passCount", width: 16 },
        { header: "Pass Rate (%)", key: "passRate", width: 16 },
        { header: "At-Risk Count", key: "failingCount", width: 16 },
      ];

      subjectStats.forEach((sub) => {
        wsSubjects.addRow({
          name: sub.name,
          evaluatedCount: sub.evaluatedCount,
          averageScore: sub.averageScore,
          highestScore: sub.highestScore,
          passCount: sub.passCount,
          passRate: `${sub.passRate}%`,
          failingCount: sub.failingCount,
        });
      });

      wsSubjects.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      wsSubjects.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E3A8A" },
      };

      // Sheet 3: At-Risk & Remedial List
      const wsAtRisk = workbook.addWorksheet("At-Risk & Remedial");
      wsAtRisk.columns = [
        { header: "Admission No", key: "admissionNo", width: 16 },
        { header: "Student Name", key: "name", width: 25 },
        { header: "Class & Section", key: "classSection", width: 16 },
        { header: "Percentage (%)", key: "percentage", width: 16 },
        { header: "Result Status", key: "result", width: 18 },
        { header: "Failing / Struggling Subjects", key: "failing", width: 35 },
        { header: "Parent Mobile", key: "mobile", width: 18 },
      ];

      atRisk.forEach((s) => {
        const failNames = (s.failingSubjects || []).map((f) => f.name).join(", ");
        wsAtRisk.addRow({
          admissionNo: s.admissionNo,
          name: s.name,
          classSection: `Class ${s.className}-${s.section}`,
          percentage: s.percentage !== null ? `${s.percentage}%` : "—",
          result: s.result,
          failing: failNames || "Overall < 33%",
          mobile: s.mobile || "—",
        });
      });

      wsAtRisk.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      wsAtRisk.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF991B1B" },
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SRPS_Class_${selectedClass}_${selectedSection}_Performance_${session}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Class performance workbook downloaded successfully");
    } catch (err) {
      toast("Export failed: " + err.message, true);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="class-analytics-page">
      {/* Top Filter & Toolbar */}
      <div className="analytics-toolbar">
        <div className="toolbar-filters">
          <div className="filter-group">
            <label>SESSION</label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
            >
              {["2025-26", "2026-27", "2027-28"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>CLASS</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>SECTION</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === "all" ? "All Sections" : sec}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn"
            onClick={loadData}
            disabled={loading}
            title="Refresh analytics"
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>

        <div className="toolbar-actions">
          <button
            className="btn primary"
            onClick={exportToExcel}
            disabled={exporting || loading || !allStudents.length}
          >
            <Download size={16} /> Export Excel Analysis
          </button>
          <button
            className="btn"
            onClick={() => window.print()}
            title="Print performance summary"
          >
            <Printer size={16} /> Print / PDF
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="analytics-loading">
          <RefreshCw size={24} className="spin text-blue" />
          <p>Compiling Class {selectedClass} performance metrics…</p>
        </div>
      ) : (
        <>
          {/* Top 3 Toppers Podium */}
          <section className="toppers-section">
            <div className="section-title-wrap">
              <Trophy size={22} className="text-amber" />
              <div>
                <h2>Class {selectedClass} Honor Roll & Toppers</h2>
                <small>Top academic achievers for session {session}</small>
              </div>
            </div>

            {toppers.length === 0 ? (
              <div className="toppers-empty">
                <Trophy size={36} className="text-muted" />
                <p>No marks entered yet for Class {selectedClass}.</p>
                <small>Enter assessment marks in Report Studio to see class toppers.</small>
              </div>
            ) : (
              <div className="toppers-podium">
                {toppers.map((topper, idx) => {
                  const rankClass =
                    idx === 0
                      ? "rank-first"
                      : idx === 1
                        ? "rank-second"
                        : "rank-third";
                  const medalEmoji = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";

                  return (
                    <div
                      key={topper._id}
                      className={`podium-card ${rankClass}`}
                      onClick={() => openStudent && openStudent(topper)}
                    >
                      <div className="podium-crown">
                        <span className="medal-icon">{medalEmoji}</span>
                        <span className="rank-badge">{topper.badge}</span>
                      </div>

                      <div className="podium-avatar">
                        {topper.name?.slice(0, 1)}
                      </div>

                      <h3 className="podium-student-name">{topper.name}</h3>
                      <p className="podium-meta">
                        Adm: <strong>{topper.admissionNo}</strong> · Class{" "}
                        {topper.className}-{topper.section}
                      </p>

                      <div className="podium-score-pill">
                        <strong>{topper.percentage}%</strong>
                        <span>
                          {topper.total} / {topper.maximum}
                        </span>
                      </div>

                      <div className="podium-grade-pill">
                        Grade {topper.grade} · {topper.result}
                      </div>

                      <span className="podium-action-hint">
                        Open in Studio <ChevronRight size={13} />
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* KPI Summary Cards */}
          <div className="analytics-kpi-grid">
            <div className="analytics-kpi-card">
              <div className="kpi-icon-box blue">
                <Users size={20} />
              </div>
              <div>
                <small>TOTAL STUDENTS</small>
                <strong>{summary.totalStudents}</strong>
                <span>
                  {summary.assessedCount} assessed · {summary.pendingCount} pending
                </span>
              </div>
            </div>

            <div className="analytics-kpi-card">
              <div className="kpi-icon-box emerald">
                <Percent size={20} />
              </div>
              <div>
                <small>CLASS AVERAGE</small>
                <strong>
                  {summary.avgPercentage > 0 ? `${summary.avgPercentage}%` : "—"}
                </strong>
                <span>Overall mean performance</span>
              </div>
            </div>

            <div className="analytics-kpi-card">
              <div className="kpi-icon-box gold">
                <Trophy size={20} />
              </div>
              <div>
                <small>TOP CLASS SCORE</small>
                <strong>
                  {summary.highestPercentage > 0
                    ? `${summary.highestPercentage}%`
                    : "—"}
                </strong>
                <span>Highest recorded percentage</span>
              </div>
            </div>

            <div className="analytics-kpi-card">
              <div className="kpi-icon-box purple">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <small>OVERALL PASS RATE</small>
                <strong>
                  {summary.overallPassRate > 0
                    ? `${summary.overallPassRate}%`
                    : "—"}
                </strong>
                <span>
                  {summary.passCount} of {summary.assessedCount} students passing
                </span>
              </div>
            </div>
          </div>

          {/* Subject-Wise Pass Percentage Breakdown */}
          <section className="analytics-card">
            <div className="card-header-clean">
              <div className="header-title-clean">
                <BarChart3 size={19} className="text-blue" />
                <h3>Subject-Wise Performance & Pass Rates</h3>
              </div>
              <small>Passing criteria: ≥ 33% combined score</small>
            </div>

            <div className="subject-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>SUBJECT</th>
                    <th>EVALUATED</th>
                    <th>CLASS AVERAGE</th>
                    <th>CLASS HIGHEST</th>
                    <th>PASS RATE</th>
                    <th>AT-RISK COUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectStats.map((sub) => {
                    const passRateColor =
                      sub.passRate >= 80
                        ? "pass-high"
                        : sub.passRate >= 60
                          ? "pass-med"
                          : "pass-low";

                    return (
                      <tr key={sub.id}>
                        <td>
                          <b>{sub.name}</b>
                        </td>
                        <td>{sub.evaluatedCount} students</td>
                        <td>
                          <strong>{sub.averageScore}</strong>
                        </td>
                        <td>
                          <span className="badge-high">{sub.highestScore}</span>
                        </td>
                        <td>
                          <div className="pass-rate-cell">
                            <div className="pass-rate-bar-track">
                              <div
                                className={`pass-rate-bar-fill ${passRateColor}`}
                                style={{ width: `${Math.min(100, sub.passRate)}%` }}
                              />
                            </div>
                            <span className="pass-rate-text">{sub.passRate}%</span>
                          </div>
                        </td>
                        <td>
                          {sub.failingCount > 0 ? (
                            <span className="badge-failing">
                              {sub.failingCount} students
                            </span>
                          ) : (
                            <span className="badge-zero">None</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* At-Risk & Remedial Students List */}
          <section className="analytics-card alert-border">
            <div className="card-header-clean">
              <div className="header-title-clean">
                <AlertTriangle size={19} className="text-rose" />
                <div>
                  <h3>Students Requiring Remedial Attention</h3>
                  <small>
                    Students scoring below 33% overall or failing in individual subjects
                  </small>
                </div>
              </div>
              <span className="at-risk-count-pill">
                {atRisk.length} Student{atRisk.length === 1 ? "" : "s"}
              </span>
            </div>

            {atRisk.length === 0 ? (
              <div className="all-clear-box">
                <CheckCircle2 size={24} className="text-emerald" />
                <span>
                  Excellent! No students currently identified as at-risk in Class{" "}
                  {selectedClass}.
                </span>
              </div>
            ) : (
              <div className="at-risk-grid">
                {atRisk.map((s) => (
                  <div
                    key={s._id}
                    className="at-risk-student-card"
                    onClick={() => openStudent && openStudent(s)}
                  >
                    <div className="at-risk-top">
                      <div>
                        <b>{s.name}</b>
                        <small>
                          Adm: {s.admissionNo} · Class {s.className}-{s.section}
                        </small>
                      </div>
                      <span className="at-risk-pct">
                        {s.percentage !== null ? `${s.percentage}%` : "—"}
                      </span>
                    </div>

                    <div className="at-risk-failing-subjects">
                      <small>NEEDS FOCUS IN:</small>
                      <div className="failing-tags">
                        {s.failingSubjects && s.failingSubjects.length > 0 ? (
                          s.failingSubjects.map((f) => (
                            <span key={f.id} className="failing-tag">
                              {f.name} ({f.combinedTotal || 0}m)
                            </span>
                          ))
                        ) : (
                          <span className="failing-tag">
                            Overall Average &lt; 33%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="at-risk-footer">
                      <span className="mobile-text">
                        📞 {s.mobile || "No mobile"}
                      </span>
                      <button
                        className="btn-tiny"
                        onClick={(e) => {
                          e.stopPropagation();
                          openStudent && openStudent(s);
                        }}
                      >
                        Open Studio <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Complete Merit List Table */}
          <section className="analytics-card">
            <div className="card-header-clean">
              <div className="header-title-clean">
                <Award size={19} className="text-blue" />
                <h3>Complete Class Merit & Performance List</h3>
              </div>
              <div className="merit-search">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search student or admission no…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="subject-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>ADMISSION NO</th>
                    <th>STUDENT NAME</th>
                    <th>CLASS & SECTION</th>
                    <th>TOTAL MARKS</th>
                    <th>PERCENTAGE</th>
                    <th>GRADE</th>
                    <th>RESULT</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => (
                    <tr key={s._id}>
                      <td>
                        <span
                          className={`rank-indicator ${
                            idx === 0
                              ? "gold"
                              : idx === 1
                                ? "silver"
                                : idx === 2
                                  ? "bronze"
                                  : ""
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </td>
                      <td>{s.admissionNo}</td>
                      <td>
                        <b>{s.name}</b>
                      </td>
                      <td>
                        Class {s.className}-{s.section}
                      </td>
                      <td>
                        {s.total} / {s.maximum}
                      </td>
                      <td>
                        <strong>
                          {s.percentage !== null ? `${s.percentage}%` : "—"}
                        </strong>
                      </td>
                      <td>
                        <span className="grade-badge">{s.grade}</span>
                      </td>
                      <td>
                        <span
                          className={`result-pill ${
                            s.result === "PASS" ? "pass" : "fail"
                          }`}
                        >
                          {s.result}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-open-studio"
                          onClick={() => openStudent && openStudent(s)}
                          title="Open report in Studio"
                        >
                          Studio <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filteredStudents.length && (
                    <tr>
                      <td colSpan={9} className="text-center py-6 text-muted">
                        No students match the search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

