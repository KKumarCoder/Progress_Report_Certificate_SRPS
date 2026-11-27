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

// ============================================================================
// Dynamic SVG KPI Diagram Components
// ============================================================================

function RadialGaugeChart({ value, color1, color2, label, sublabel, id }) {
  const r = 36;
  const stroke = 8;
  const circ = 2 * Math.PI * r;
  const hasValue = typeof value === "number";
  const pct = hasValue ? Math.min(100, Math.max(0, value)) : 0;
  const strokeDashoffset = circ - (pct / 100) * circ;

  return (
    <div className="kpi-diagram-container">
      <div className="kpi-diagram-wrapper">
        <svg height="92" width="92" viewBox="0 0 92 92" className="kpi-radial-svg">
          <defs>
            <linearGradient id={`radial-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color1} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx="46"
            cy="46"
            r={r}
            fill="transparent"
            stroke="var(--gauge-track, #e2e8f0)"
            strokeWidth={stroke}
            className="gauge-bg-track"
          />
          {/* Active progress arc */}
          {hasValue && pct > 0 ? (
            <circle
              cx="46"
              cy="46"
              r={r}
              fill="transparent"
              stroke={`url(#radial-grad-${id})`}
              strokeWidth={stroke}
              strokeDasharray={`${circ} ${circ}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 46 46)"
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          ) : (
            <circle
              cx="46"
              cy="46"
              r={r}
              fill="transparent"
              stroke="var(--gauge-track, #cbd5e1)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}
        </svg>
        <div className="kpi-radial-center">
          <span className="kpi-radial-val" style={{ color: color1 }}>
            {hasValue ? `${value}%` : "—"}
          </span>
          <small className="kpi-radial-label">{hasValue ? "Score" : "Pending"}</small>
        </div>
      </div>
    </div>
  );
}

function MomentumWaveChart({ delta }) {
  const isEvaluated = typeof delta === "number";
  const isUp = isEvaluated && delta > 0;
  const isDown = isEvaluated && delta < 0;

  const strokeColor = !isEvaluated
    ? "#94a3b8"
    : isUp
      ? "#10b981"
      : isDown
        ? "#ef4444"
        : "#6366f1";

  // Dynamic SVG curve coordinates
  const pathD = !isEvaluated
    ? "M 8 46 Q 44 46 66 46 T 122 46"
    : isUp
      ? "M 8 68 Q 38 64 64 42 T 122 16"
      : isDown
        ? "M 8 18 Q 38 28 64 50 T 122 72"
        : "M 8 46 Q 44 46 66 46 T 122 46";

  const areaD = !isEvaluated
    ? "M 8 46 Q 44 46 66 46 T 122 46 L 122 84 L 8 84 Z"
    : isUp
      ? "M 8 68 Q 38 64 64 42 T 122 16 L 122 84 L 8 84 Z"
      : isDown
        ? "M 8 18 Q 38 28 64 50 T 122 72 L 122 84 L 8 84 Z"
        : "M 8 46 Q 44 46 66 46 T 122 46 L 122 84 L 8 84 Z";

  return (
    <div className="kpi-diagram-container">
      <div className="kpi-diagram-wrapper momentum-wrapper">
        <svg height="92" width="130" viewBox="0 0 130 92" className="kpi-wave-svg">
          <defs>
            <linearGradient id="momentum-gradient-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Subtle baseline grid */}
          <line x1="8" y1="46" x2="122" y2="46" stroke="var(--gauge-track, #e2e8f0)" strokeWidth="1" strokeDasharray="3 3" />
          {/* Area fill */}
          <path d={areaD} fill="url(#momentum-gradient-fill)" />
          {/* Wave line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={!isEvaluated ? "4 4" : "none"}
          />
          {/* Focus indicator node */}
          <circle
            cx="122"
            cy={!isEvaluated ? 46 : isUp ? 16 : isDown ? 72 : 46}
            r="4.5"
            fill={strokeColor}
          />
        </svg>
        <div className="kpi-radial-center momentum-center">
          <span className="kpi-radial-val" style={{ color: strokeColor }}>
            {isEvaluated ? `${delta > 0 ? "+" : ""}${delta}%` : "Awaiting T2"}
          </span>
          <small className="kpi-radial-label">
            {!isEvaluated ? "Pending" : isUp ? "Upward ↗" : isDown ? "Focus ↘" : "Steady →"}
          </small>
        </div>
      </div>
    </div>
  );
}

function MiniDonutChart({ improved, maintained, declined, pending, total }) {
  const r = 35;
  const stroke = 8;
  const circ = 2 * Math.PI * r;

  const slices = [
    { count: improved, color: "#10b981", label: "Improved" },
    { count: maintained, color: "#6366f1", label: "Steady" },
    { count: declined, color: "#ef4444", label: "Needs Focus" },
    { count: pending, color: "#94a3b8", label: "Pending" },
  ];

  const safeTotal = total > 0 ? total : 1;
  let accumulated = 0;

  return (
    <div className="kpi-diagram-container">
      <div className="kpi-diagram-wrapper">
        <svg height="92" width="92" viewBox="0 0 92 92" className="kpi-radial-svg">
          <circle
            cx="46"
            cy="46"
            r={r}
            fill="transparent"
            stroke="var(--gauge-track, #e2e8f0)"
            strokeWidth={stroke}
            className="gauge-bg-track"
          />
          {total === 0 ? (
            <circle
              cx="46"
              cy="46"
              r={r}
              fill="transparent"
              stroke="var(--gauge-track, #cbd5e1)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          ) : (
            slices.map((s, idx) => {
              if (s.count <= 0) return null;
              const share = s.count / safeTotal;
              const dashLength = share * circ;
              const offset = -accumulated * circ;
              accumulated += share;

              return (
                <circle
                  key={idx}
                  cx="46"
                  cy="46"
                  r={r}
                  fill="transparent"
                  stroke={s.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${dashLength.toFixed(2)} ${circ.toFixed(2)}`}
                  strokeDashoffset={offset.toFixed(2)}
                  transform="rotate(-90 46 46)"
                  style={{ transition: "all 0.6s ease" }}
                />
              );
            })
          )}
        </svg>
        <div className="kpi-radial-center">
          <span className="kpi-radial-val" style={{ color: "#0f172a" }}>
            {total}
          </span>
          <small className="kpi-radial-label">Subjects</small>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main GrowthChart Component
// ============================================================================

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
  const pendingSubjectsCount = subjects.length - compared.length;

  const topImprovement = [...improvedSubjects].sort(
    (a, b) => b.deltaMarks - a.deltaMarks,
  )[0];
  const mostDeclined = [...declinedSubjects].sort(
    (a, b) => a.deltaMarks - b.deltaMarks,
  )[0];

  const evaluatedSubjects = subjects.filter((s) => s.effectivePct !== null);
  const highestScoring = [...evaluatedSubjects].sort(
    (a, b) => (b.effectivePct || 0) - (a.effectivePct || 0),
  )[0];

  // Dynamic Pie / Donut Chart Slices
  const masteryCategories = [
    {
      id: "distinction",
      label: "A Grade (Distinction 81–100%)",
      shortLabel: "A Grade (81–100%)",
      color: "#10b981",
      subjects: evaluatedSubjects.filter((s) => s.effectivePct >= 81),
    },
    {
      id: "proficient",
      label: "B Grade (Proficient 61–80%)",
      shortLabel: "B Grade (61–80%)",
      color: "#3b82f6",
      subjects: evaluatedSubjects.filter(
        (s) => s.effectivePct >= 61 && s.effectivePct < 81,
      ),
    },
    {
      id: "progressing",
      label: "C Grade (Progressing 41–60%)",
      shortLabel: "C Grade (41–60%)",
      color: "#f59e0b",
      subjects: evaluatedSubjects.filter(
        (s) => s.effectivePct >= 41 && s.effectivePct < 61,
      ),
    },
    {
      id: "focus",
      label: "D & Below (Needs Focus ≤40%)",
      shortLabel: "D & Below (≤40%)",
      color: "#ef4444",
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
      {/* Top Header */}
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

      {/* 4 Dynamic SVG Chart Diagram KPI Cards (Balanced 4-Column / 2x2 Grid) */}
      <div className="growth-kpi-grid">
        {/* Card 1: Term 1 Radial Progress Diagram */}
        <div className="growth-kpi-card kpi-card-cyan">
          <div className="kpi-header-row">
            <small>TERM 1 AVERAGE</small>
            <span className="kpi-term-badge t1-badge">Term I</span>
          </div>
          <RadialGaugeChart
            value={t1OverallPct}
            color1="#0284c7"
            color2="#38bdf8"
            label="Term I"
            id="t1"
          />
          <div className="kpi-footer-row">
            <span>
              <strong>{t1Assessed.length}</strong> of {subjects.length} subjects assessed
            </span>
            <div className="kpi-progress-bar">
              <div
                className="kpi-progress-fill bg-cyan"
                style={{ width: `${t1OverallPct || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Term 2 Radial Progress Diagram */}
        <div className="growth-kpi-card kpi-card-purple">
          <div className="kpi-header-row">
            <small>TERM 2 AVERAGE</small>
            <span className="kpi-term-badge t2-badge">Term II</span>
          </div>
          <RadialGaugeChart
            value={t2OverallPct}
            color1="#7c3aed"
            color2="#c084fc"
            label="Term II"
            id="t2"
          />
          <div className="kpi-footer-row">
            <span>
              <strong>{t2Assessed.length}</strong> of {subjects.length} subjects assessed
            </span>
            <div className="kpi-progress-bar">
              <div
                className="kpi-progress-fill bg-purple"
                style={{ width: `${t2OverallPct || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Dynamic Growth Trajectory Wave Chart */}
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
          <MomentumWaveChart delta={overallDeltaPct} />
          <div className="kpi-footer-row">
            <span>
              {overallDeltaPct !== null
                ? overallDeltaPct > 0
                  ? "Steady upward momentum across terms"
                  : overallDeltaPct < 0
                    ? "Requires reinforcement in Term 2"
                    : "Consistent academic progress maintained"
                : "Enter Term 2 marks to compare"}
            </span>
          </div>
        </div>

        {/* Card 4: Subject Performance Donut Chart */}
        <div className="growth-kpi-card kpi-card-amber">
          <div className="kpi-header-row">
            <small>SUBJECT TRENDS</small>
            <span className="kpi-term-badge t-amber">Distribution</span>
          </div>
          <MiniDonutChart
            improved={improvedSubjects.length}
            maintained={maintainedSubjects.length}
            declined={declinedSubjects.length}
            pending={pendingSubjectsCount}
            total={subjects.length}
          />
          <div className="kpi-footer-row">
            <div className="growth-trend-chips">
              <span className="chip-green">
                <TrendingUp size={11} /> {improvedSubjects.length} Up
              </span>
              <span className="chip-red">
                <TrendingDown size={11} /> {declinedSubjects.length} Focus
              </span>
              {maintainedSubjects.length > 0 && (
                <span className="chip-neutral">
                  <Minus size={11} /> {maintainedSubjects.length} Steady
                </span>
              )}
            </div>
          </div>
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
