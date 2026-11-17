import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  AlertTriangle,
  Award,
  BarChart2,
  CheckCircle2,
} from "lucide-react";
import { calculate, grade } from "../../shared/engine.js";

export default function GrowthChart({ report, config, student }) {
  if (!report || !config) return null;

  const marks = report.marks || { term1: {}, term2: {} };
  const calc = calculate(marks, config);
  const maxScore =
    (config.components || []).reduce((s, c) => s + (Number(c.max) || 0), 0) || 100;

  // Compute subject growth
  const subjects = (config.subjects || []).map((s, idx) => {
    const t1Obj = calc.terms?.term1?.[idx];
    const t2Obj = calc.terms?.term2?.[idx];

    const t1 = typeof t1Obj?.total === "number" ? t1Obj.total : null;
    const t2 = typeof t2Obj?.total === "number" ? t2Obj.total : null;

    const t1Pct = t1 !== null ? Number(((t1 / maxScore) * 100).toFixed(1)) : null;
    const t2Pct = t2 !== null ? Number(((t2 / maxScore) * 100).toFixed(1)) : null;

    let deltaMarks = null;
    let deltaPct = null;
    let status = "pending"; // 'improved' | 'declined' | 'maintained' | 'pending'

    if (t1 !== null && t2 !== null) {
      deltaMarks = Math.round((t2 - t1) * 10) / 10;
      deltaPct = Number((t2Pct - t1Pct).toFixed(1));
      if (deltaMarks > 0) status = "improved";
      else if (deltaMarks < 0) status = "declined";
      else status = "maintained";
    } else if (t1 !== null && t2 === null) {
      status = "t1_only";
    }

    return {
      id: s.id,
      name: s.name,
      t1,
      t2,
      t1Pct,
      t2Pct,
      t1Grade: t1Obj?.grade || "—",
      t2Grade: t2Obj?.grade || "—",
      deltaMarks,
      deltaPct,
      status,
    };
  });

  // Calculate overall T1 vs T2 comparison
  const t1Assessed = subjects.filter((s) => s.t1 !== null);
  const t2Assessed = subjects.filter((s) => s.t2 !== null);
  const compared = subjects.filter((s) => s.deltaMarks !== null);

  const t1Sum = t1Assessed.reduce((sum, s) => sum + s.t1, 0);
  const t2Sum = t2Assessed.reduce((sum, s) => sum + s.t2, 0);

  const t1OverallPct =
    t1Assessed.length > 0
      ? Number(((t1Sum / (t1Assessed.length * maxScore)) * 100).toFixed(1))
      : null;
  const t2OverallPct =
    t2Assessed.length > 0
      ? Number(((t2Sum / (t2Assessed.length * maxScore)) * 100).toFixed(1))
      : null;

  const overallDeltaPct =
    t1OverallPct !== null && t2OverallPct !== null
      ? Number((t2OverallPct - t1OverallPct).toFixed(1))
      : null;

  // Star improvement & attention needed
  const improvedSubjects = compared.filter((s) => s.deltaMarks > 0);
  const declinedSubjects = compared.filter((s) => s.deltaMarks < 0);

  const topImprovement = [...improvedSubjects].sort(
    (a, b) => b.deltaMarks - a.deltaMarks,
  )[0];
  const mostDeclined = [...declinedSubjects].sort(
    (a, b) => a.deltaMarks - b.deltaMarks,
  )[0];

  return (
    <div className="growth-chart-container">
      <div className="growth-header">
        <div className="growth-title-row">
          <div className="growth-badge-icon">
            <BarChart2 size={20} />
          </div>
          <div>
            <h3>Academic Growth & Trend Analysis</h3>
            <p>
              Term 1 vs Term 2 comparative performance for{" "}
              <strong>{student?.name || "Student"}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="growth-kpi-grid">
        <div className="growth-kpi-card">
          <small>TERM 1 AVERAGE</small>
          <strong>
            {t1OverallPct !== null ? `${t1OverallPct}%` : "—"}
          </strong>
          <span>
            {t1Assessed.length}/{subjects.length} subjects assessed
          </span>
        </div>

        <div className="growth-kpi-card">
          <small>TERM 2 AVERAGE</small>
          <strong>
            {t2OverallPct !== null ? `${t2OverallPct}%` : "—"}
          </strong>
          <span>
            {t2Assessed.length}/{subjects.length} subjects assessed
          </span>
        </div>

        <div
          className={`growth-kpi-card highlight ${
            overallDeltaPct === null
              ? ""
              : overallDeltaPct > 0
                ? "positive"
                : overallDeltaPct < 0
                  ? "negative"
                  : "neutral"
          }`}
        >
          <small>OVERALL TRAJECTORY</small>
          <div className="kpi-value-row">
            {overallDeltaPct !== null && overallDeltaPct > 0 && (
              <TrendingUp size={22} className="text-emerald" />
            )}
            {overallDeltaPct !== null && overallDeltaPct < 0 && (
              <TrendingDown size={22} className="text-rose" />
            )}
            {overallDeltaPct !== null && overallDeltaPct === 0 && (
              <Minus size={22} className="text-slate" />
            )}
            <strong>
              {overallDeltaPct !== null
                ? `${overallDeltaPct > 0 ? "+" : ""}${overallDeltaPct}%`
                : "Awaiting T2"}
            </strong>
          </div>
          <span>
            {overallDeltaPct !== null
              ? overallDeltaPct > 0
                ? "Demonstrating steady academic growth"
                : overallDeltaPct < 0
                  ? "Requires reinforcement in Term 2"
                  : "Consistent performance maintained"
              : "Enter Term 2 marks to compare"}
          </span>
        </div>

        <div className="growth-kpi-card">
          <small>SUBJECT TRENDS</small>
          <div className="growth-trend-chips">
            <span className="chip-green">
              <TrendingUp size={13} /> {improvedSubjects.length} Improved
            </span>
            <span className="chip-red">
              <TrendingDown size={13} /> {declinedSubjects.length} Needs Focus
            </span>
          </div>
          <span>
            {compared.length}/{subjects.length} subjects compared
          </span>
        </div>
      </div>

      {/* Key Subject Insights */}
      {(topImprovement || mostDeclined) && (
        <div className="growth-callouts">
          {topImprovement && (
            <div className="growth-callout positive">
              <Sparkles size={18} className="callout-icon" />
              <div>
                <b>Highest Subject Growth: {topImprovement.name}</b>
                <p>
                  Improved by <strong>+{topImprovement.deltaMarks} marks</strong>{" "}
                  (+{topImprovement.deltaPct}%) from {topImprovement.t1}/
                  {maxScore} in T1 to {topImprovement.t2}/{maxScore} in T2.
                </p>
              </div>
            </div>
          )}
          {mostDeclined && (
            <div className="growth-callout warning">
              <AlertTriangle size={18} className="callout-icon" />
              <div>
                <b>Area Needing Attention: {mostDeclined.name}</b>
                <p>
                  Dropped by{" "}
                  <strong>{mostDeclined.deltaMarks} marks</strong> (
                  {mostDeclined.deltaPct}%) from {mostDeclined.t1}/{maxScore} in
                  T1 to {mostDeclined.t2}/{maxScore} in T2. Recommend targeted
                  revision.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subject-by-Subject Bar Comparison Table */}
      <div className="growth-subjects-list">
        <h4>Subject-wise Progress & Visual Comparison</h4>
        <div className="growth-bars-table">
          {subjects.map((sub) => {
            const t1Width = sub.t1Pct !== null ? Math.min(100, Math.max(0, sub.t1Pct)) : 0;
            const t2Width = sub.t2Pct !== null ? Math.min(100, Math.max(0, sub.t2Pct)) : 0;

            return (
              <div className="growth-subject-row" key={sub.id}>
                <div className="growth-subject-info">
                  <div className="subject-name-group">
                    <strong>{sub.name}</strong>
                    <div className="subject-grades">
                      <span>T1: {sub.t1Grade}</span>
                      <span>·</span>
                      <span>T2: {sub.t2Grade}</span>
                    </div>
                  </div>

                  <div className="growth-status-pill">
                    {sub.status === "improved" && (
                      <span className="badge-growth positive">
                        <TrendingUp size={13} /> +{sub.deltaMarks}m (+
                        {sub.deltaPct}%)
                      </span>
                    )}
                    {sub.status === "declined" && (
                      <span className="badge-growth negative">
                        <TrendingDown size={13} /> {sub.deltaMarks}m (
                        {sub.deltaPct}%)
                      </span>
                    )}
                    {sub.status === "maintained" && (
                      <span className="badge-growth neutral">
                        <Minus size={13} /> Maintained (0%)
                      </span>
                    )}
                    {sub.status === "t1_only" && (
                      <span className="badge-growth pending">
                        Awaiting Term II
                      </span>
                    )}
                    {sub.status === "pending" && (
                      <span className="badge-growth pending">Not entered</span>
                    )}
                  </div>
                </div>

                <div className="growth-bars-container">
                  {/* Term 1 Bar */}
                  <div className="growth-bar-track">
                    <span className="bar-label">Term I</span>
                    <div className="bar-trough">
                      <div
                        className="bar-fill term1-fill"
                        style={{ width: `${t1Width}%` }}
                      />
                    </div>
                    <span className="bar-score">
                      {sub.t1 !== null ? `${sub.t1}/${maxScore} (${sub.t1Pct}%)` : "—"}
                    </span>
                  </div>

                  {/* Term 2 Bar */}
                  <div className="growth-bar-track">
                    <span className="bar-label">Term II</span>
                    <div className="bar-trough">
                      <div
                        className={`bar-fill ${
                          sub.status === "improved"
                            ? "term2-improved"
                            : sub.status === "declined"
                              ? "term2-declined"
                              : "term2-neutral"
                        }`}
                        style={{ width: `${t2Width}%` }}
                      />
                    </div>
                    <span className="bar-score">
                      {sub.t2 !== null ? `${sub.t2}/${maxScore} (${sub.t2Pct}%)` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

