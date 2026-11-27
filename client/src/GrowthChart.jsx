import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Award,
  BarChart2,
  PieChart,
  CheckCircle2,
  AlertCircle,
  Star,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from "lucide-react";
import { calculate, grade } from "../../shared/engine.js";

export default function GrowthChart({ report, config, student }) {
  if (!report || !config) return null;

  const [chartView, setChartView] = useState("all"); // 'all' | 'bars' | 'pie'

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
    let status = "pending"; // 'improved' | 'declined' | 'maintained' | 't1_only' | 'pending'

    if (t1 !== null && t2 !== null) {
      deltaMarks = Math.round((t2 - t1) * 10) / 10;
      deltaPct = Number((t2Pct - t1Pct).toFixed(1));
      if (deltaMarks > 0) status = "improved";
      else if (deltaMarks < 0) status = "declined";
      else status = "maintained";
    } else if (t1 !== null && t2 === null) {
      status = "t1_only";
    }

    // Effective percentage for mastery pie chart (prefer T2, then T1)
    const effectivePct = t2Pct !== null ? t2Pct : t1Pct;

    return {
      id: s.id,
      name: s.name,
      t1,
      t2,
      t1Pct,
      t2Pct,
      effectivePct,
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

  const improvedSubjects = compared.filter((s) => s.deltaMarks > 0);
  const declinedSubjects = compared.filter((s) => s.deltaMarks < 0);
  const maintainedSubjects = compared.filter((s) => s.deltaMarks === 0);

  const topImprovement = [...improvedSubjects].sort(
    (a, b) => b.deltaMarks - a.deltaMarks,
  )[0];
  const mostDeclined = [...declinedSubjects].sort(
    (a, b) => a.deltaMarks - b.deltaMarks,
  )[0];

  // Strongest subject overall
  const evaluatedSubjects = subjects.filter((s) => s.effectivePct !== null);
  const highestScoring = [...evaluatedSubjects].sort(
    (a, b) => (b.effectivePct || 0) - (a.effectivePct || 0),
  )[0];

  // ==========================================
  // Dynamic Pie / Donut Chart Slices
  // ==========================================
  const masteryCategories = [
    {
      id: "distinction",
      label: "A Grade (Distinction 81–100%)",
      shortLabel: "A Grade (81–100%)",
      color: "#10b981", // Emerald Green
      darkColor: "#34d399",
      subjects: evaluatedSubjects.filter((s) => s.effectivePct >= 81),
    },
    {
      id: "proficient",
      label: "B Grade (Proficient 61–80%)",
      shortLabel: "B Grade (61–80%)",
      color: "#3b82f6", // Royal Blue
      darkColor: "#60a5fa",
      subjects: evaluatedSubjects.filter(
        (s) => s.effectivePct >= 61 && s.effectivePct < 81,
      ),
    },
    {
      id: "progressing",
      label: "C Grade (Progressing 41–60%)",
      shortLabel: "C Grade (41–60%)",
      color: "#f59e0b", // Amber / Warm Gold
      darkColor: "#fbbf24",
      subjects: evaluatedSubjects.filter(
        (s) => s.effectivePct >= 41 && s.effectivePct < 61,
      ),
    },
    {
      id: "focus",
      label: "D & Below (Needs Focus ≤40%)",
      shortLabel: "D & Below (≤40%)",
      color: "#ef4444", // Rose / Coral
      darkColor: "#f87171",
      subjects: evaluatedSubjects.filter((s) => s.effectivePct < 41),
    },
  ];

  const totalEvaluated = evaluatedSubjects.length;
  const pieRadius = 46;
  const pieCircumference = 2 * Math.PI * pieRadius;

  let cumulativeOffset = 0;
  const pieSegments = masteryCategories.map((cat) => {
    const count = cat.subjects.length;
    const share = totalEvaluated > 0 ? count / totalEvaluated : 0;
    const dashLength = share * pieCircumference;
    const segment = {
      ...cat,
      count,
      sharePct: Math.round(share * 100),
      dashArray: `${dashLength.toFixed(2)} ${pieCircumference.toFixed(2)}`,
      dashOffset: (-cumulativeOffset * pieCircumference).toFixed(2),
    };
    cumulativeOffset += share;
    return segment;
  });

  const studentName = student?.name || "Student";
  const activePct = t2OverallPct !== null ? t2OverallPct : t1OverallPct;

  return (
    <div className="growth-chart-container">
      {/* Header with vibrant accent & view toggle */}
      <div className="growth-header">
        <div className="growth-title-row">
          <div className="growth-badge-icon">
            <BarChart2 size={22} />
          </div>
          <div>
            <h3>Academic Growth & Trend Analytics</h3>
            <p>
              Term 1 vs Term 2 comparative performance for{" "}
              <strong>{studentName}</strong>
            </p>
          </div>
        </div>

        <div className="growth-view-toggles">
          <button
            type="button"
            className={`growth-toggle-btn ${chartView === "all" ? "active" : ""}`}
            onClick={() => setChartView("all")}
            title="Show All Visuals"
          >
            <Layers size={14} /> All
          </button>
          <button
            type="button"
            className={`growth-toggle-btn ${chartView === "pie" ? "active" : ""}`}
            onClick={() => setChartView("pie")}
            title="Performance Distribution Donut"
          >
            <PieChart size={14} /> Pie Chart
          </button>
          <button
            type="button"
            className={`growth-toggle-btn ${chartView === "bars" ? "active" : ""}`}
            onClick={() => setChartView("bars")}
            title="Comparison Graph"
          >
            <BarChart2 size={14} /> Bars
          </button>
        </div>
      </div>

      {/* 4 Modern Colorful KPI Metric Cards */}
      <div className="growth-kpi-grid">
        {/* Card 1: Term 1 Average */}
        <div className="growth-kpi-card kpi-card-cyan">
          <div className="kpi-header-row">
            <small>TERM 1 AVERAGE</small>
            <span className="kpi-term-badge t1-badge">Term I</span>
          </div>
          <strong className="kpi-number text-cyan">
            {t1OverallPct !== null ? `${t1OverallPct}%` : "—"}
          </strong>
          <span>
            {t1Assessed.length}/{subjects.length} subjects assessed
          </span>
          <div className="kpi-progress-bar">
            <div
              className="kpi-progress-fill bg-cyan"
              style={{ width: `${t1OverallPct || 0}%` }}
            />
          </div>
        </div>

        {/* Card 2: Term 2 Average */}
        <div className="growth-kpi-card kpi-card-purple">
          <div className="kpi-header-row">
            <small>TERM 2 AVERAGE</small>
            <span className="kpi-term-badge t2-badge">Term II</span>
          </div>
          <strong className="kpi-number text-purple">
            {t2OverallPct !== null ? `${t2OverallPct}%` : "—"}
          </strong>
          <span>
            {t2Assessed.length}/{subjects.length} subjects assessed
          </span>
          <div className="kpi-progress-bar">
            <div
              className="kpi-progress-fill bg-purple"
              style={{ width: `${t2OverallPct || 0}%` }}
            />
          </div>
        </div>

        {/* Card 3: Overall Trajectory / Momentum */}
        <div
          className={`growth-kpi-card kpi-card-momentum ${
            overallDeltaPct === null
              ? "neutral"
              : overallDeltaPct > 0
                ? "positive"
                : overallDeltaPct < 0
                  ? "negative"
                  : "neutral"
          }`}
        >
          <div className="kpi-header-row">
            <small>GROWTH TRAJECTORY</small>
            {overallDeltaPct !== null && overallDeltaPct > 0 && (
              <span className="kpi-tag-momentum tag-up">
                <ArrowUpRight size={13} /> Improving
              </span>
            )}
            {overallDeltaPct !== null && overallDeltaPct < 0 && (
              <span className="kpi-tag-momentum tag-down">
                <ArrowDownRight size={13} /> Needs Focus
              </span>
            )}
          </div>
          <div className="kpi-value-row">
            {overallDeltaPct !== null && overallDeltaPct > 0 && (
              <TrendingUp size={26} className="text-emerald animate-pulse" />
            )}
            {overallDeltaPct !== null && overallDeltaPct < 0 && (
              <TrendingDown size={26} className="text-rose" />
            )}
            {overallDeltaPct !== null && overallDeltaPct === 0 && (
              <Minus size={26} className="text-slate" />
            )}
            <strong className="kpi-number">
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
                  ? "Requires targeted revision in Term 2"
                  : "Consistent performance maintained"
              : "Enter Term 2 marks to compare"}
          </span>
        </div>

        {/* Card 4: Subject Trends Breakdown */}
        <div className="growth-kpi-card kpi-card-amber">
          <div className="kpi-header-row">
            <small>SUBJECT TRENDS</small>
            <span className="kpi-term-badge t-amber">Performance</span>
          </div>
          <div className="growth-trend-chips">
            <span className="chip-green">
              <TrendingUp size={13} /> {improvedSubjects.length} Improved
            </span>
            <span className="chip-red">
              <TrendingDown size={13} /> {declinedSubjects.length} Needs Focus
            </span>
            {maintainedSubjects.length > 0 && (
              <span className="chip-neutral">
                <Minus size={13} /> {maintainedSubjects.length} Steady
              </span>
            )}
          </div>
          <span style={{ marginTop: "4px" }}>
            {compared.length}/{subjects.length} subjects compared across terms
          </span>
        </div>
      </div>

      {/* Dynamic Pie Chart & Performance Highlights Section */}
      {(chartView === "all" || chartView === "pie") && (
        <div className="growth-visuals-grid">
          {/* Dynamic SVG Pie / Donut Chart */}
          <div className="growth-panel-card pie-chart-panel">
            <div className="panel-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <PieChart size={18} className="text-purple" />
                <h4>Subject Mastery & Grade Distribution</h4>
              </div>
              <span className="badge-evaluated">
                {totalEvaluated}/{subjects.length} Evaluated
              </span>
            </div>

            <div className="donut-chart-layout">
              {/* SVG Donut Visual */}
              <div className="donut-svg-wrapper">
                <svg
                  viewBox="0 0 120 120"
                  className="donut-svg"
                  aria-label="Grade distribution pie chart"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r={pieRadius}
                    className="donut-track"
                    fill="transparent"
                    strokeWidth="14"
                  />
                  {totalEvaluated === 0 ? (
                    <circle
                      cx="60"
                      cy="60"
                      r={pieRadius}
                      fill="transparent"
                      stroke="#cbd5e1"
                      strokeWidth="14"
                      strokeDasharray="4 4"
                    />
                  ) : (
                    pieSegments.map(
                      (seg) =>
                        seg.count > 0 && (
                          <circle
                            key={seg.id}
                            cx="60"
                            cy="60"
                            r={pieRadius}
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="14"
                            strokeDasharray={seg.dashArray}
                            strokeDashoffset={seg.dashOffset}
                            className="donut-slice"
                            style={{
                              transform: "rotate(-90deg)",
                              transformOrigin: "60px 60px",
                              transition: "all 0.4s ease",
                            }}
                          />
                        ),
                    )
                  )}
                </svg>
                {/* Center Badge in Donut */}
                <div className="donut-center-info">
                  <span className="donut-center-pct">
                    {activePct !== null ? `${activePct}%` : "—"}
                  </span>
                  <small className="donut-center-label">
                    {activePct !== null && activePct >= 80
                      ? "🌟 Distinction"
                      : activePct !== null && activePct >= 60
                        ? "👏 Proficient"
                        : activePct !== null
                          ? "📈 Progressing"
                          : "Pending"}
                  </small>
                </div>
              </div>

              {/* Dynamic Legend */}
              <div className="donut-legend-col">
                {pieSegments.map((seg) => (
                  <div key={seg.id} className="donut-legend-item">
                    <div className="legend-marker-row">
                      <span
                        className="legend-dot"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="legend-label">{seg.shortLabel}</span>
                    </div>
                    <div className="legend-values">
                      <strong>{seg.count} Sub</strong>
                      <span className="legend-share">({seg.sharePct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Insights & Subject Highlights */}
          <div className="growth-panel-card highlights-panel">
            <div className="panel-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} className="text-amber" />
                <h4>Key Performance Highlights</h4>
              </div>
            </div>

            <div className="highlights-stack">
              {/* Star Top Subject */}
              {highestScoring && (
                <div className="highlight-item-card star-item">
                  <div className="highlight-icon-box bg-emerald-soft">
                    <Star size={18} className="text-emerald" />
                  </div>
                  <div className="highlight-text-box">
                    <div className="highlight-title-row">
                      <b>Top Subject: {highestScoring.name}</b>
                      <span className="badge-highlight-score">
                        {highestScoring.effectivePct}%
                      </span>
                    </div>
                    <p>
                      Leading scholastic subject with strong conceptual understanding and excellence.
                    </p>
                  </div>
                </div>
              )}

              {/* Greatest Improvement */}
              {topImprovement ? (
                <div className="highlight-item-card growth-item">
                  <div className="highlight-icon-box bg-indigo-soft">
                    <TrendingUp size={18} className="text-indigo" />
                  </div>
                  <div className="highlight-text-box">
                    <div className="highlight-title-row">
                      <b>Fastest Growth: {topImprovement.name}</b>
                      <span className="badge-growth-gain">
                        +{topImprovement.deltaMarks}m (+{topImprovement.deltaPct}%)
                      </span>
                    </div>
                    <p>
                      Advanced from {topImprovement.t1}/{maxScore} in T1 to{" "}
                      {topImprovement.t2}/{maxScore} in T2.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="highlight-item-card growth-item">
                  <div className="highlight-icon-box bg-indigo-soft">
                    <Target size={18} className="text-indigo" />
                  </div>
                  <div className="highlight-text-box">
                    <b>Comparative Growth Tracking</b>
                    <p>
                      Enter both Term I and Term II marks to calculate subject-wise trajectory.
                    </p>
                  </div>
                </div>
              )}

              {/* Focus Recommendation */}
              {mostDeclined ? (
                <div className="highlight-item-card focus-item">
                  <div className="highlight-icon-box bg-rose-soft">
                    <AlertCircle size={18} className="text-rose" />
                  </div>
                  <div className="highlight-text-box">
                    <div className="highlight-title-row">
                      <b>Area to Strengthen: {mostDeclined.name}</b>
                      <span className="badge-growth-drop">
                        {mostDeclined.deltaMarks}m ({mostDeclined.deltaPct}%)
                      </span>
                    </div>
                    <p>
                      Dropped from {mostDeclined.t1}/{maxScore} in T1 to{" "}
                      {mostDeclined.t2}/{maxScore} in T2. Recommend focused practice.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="highlight-item-card focus-item">
                  <div className="highlight-icon-box bg-emerald-soft">
                    <CheckCircle2 size={18} className="text-emerald" />
                  </div>
                  <div className="highlight-text-box">
                    <b>Steady Learning Attitude</b>
                    <p>
                      {studentName} maintains positive classroom interest and consistent learning habits.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dual-Axis Comparative Bar Graph (Term 1 vs Term 2) */}
      {(chartView === "all" || chartView === "bars") && (
        <div className="growth-subjects-list">
          <div className="panel-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart2 size={18} className="text-cyan" />
              <h4>Term 1 vs Term 2 Dual-Bar Comparison Graph</h4>
            </div>
            <div className="graph-legend-pills">
              <span className="pill-t1-legend">
                <span className="legend-sample-bar t1-fill" /> Term I
              </span>
              <span className="pill-t2-legend">
                <span className="legend-sample-bar t2-fill" /> Term II
              </span>
            </div>
          </div>

          <div className="growth-bars-table">
            {subjects.map((sub) => {
              const t1Width =
                sub.t1Pct !== null ? Math.min(100, Math.max(0, sub.t1Pct)) : 0;
              const t2Width =
                sub.t2Pct !== null ? Math.min(100, Math.max(0, sub.t2Pct)) : 0;

              return (
                <div className="growth-subject-row" key={sub.id}>
                  <div className="growth-subject-info">
                    <div className="subject-name-group">
                      <strong className="sub-title-text">{sub.name}</strong>
                      <div className="subject-grades">
                        <span className="sub-grade-pill t1-grade">
                          T1: {sub.t1Grade}
                        </span>
                        <span className="grade-arrow">→</span>
                        <span className="sub-grade-pill t2-grade">
                          T2: {sub.t2Grade}
                        </span>
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
                          <Minus size={13} /> 0% Steady
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
                          className="bar-fill term1-gradient-fill"
                          style={{ width: `${t1Width}%` }}
                        />
                      </div>
                      <span className="bar-score">
                        {sub.t1 !== null
                          ? `${sub.t1}/${maxScore} (${sub.t1Pct}%)`
                          : "—"}
                      </span>
                    </div>

                    {/* Term 2 Bar */}
                    <div className="growth-bar-track">
                      <span className="bar-label">Term II</span>
                      <div className="bar-trough">
                        <div
                          className={`bar-fill ${
                            sub.status === "improved"
                              ? "term2-improved-gradient"
                              : sub.status === "declined"
                                ? "term2-declined-gradient"
                                : "term2-neutral-gradient"
                          }`}
                          style={{ width: `${t2Width}%` }}
                        />
                      </div>
                      <span className="bar-score">
                        {sub.t2 !== null
                          ? `${sub.t2}/${maxScore} (${sub.t2Pct}%)`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
