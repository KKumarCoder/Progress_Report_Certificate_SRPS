import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Check,
  Wand2,
  BookOpen,
  Search,
  CheckCircle2,
  PenLine,
} from "lucide-react";
import { calculate } from "../../shared/engine.js";
import { ALL_REMARKS, REMARK_CATEGORIES, formatRemark } from "../../shared/remarks.js";

export function generateSmartRemarks(report, config, student) {
  if (!report || !config) return [];

  const marks = report.marks || { term1: {}, term2: {} };
  const calc = calculate(marks, config);
  const maxScore =
    (config.components || []).reduce((s, c) => s + (Number(c.max) || 0), 0) || 100;

  // Rank subjects
  const rankedSubjects = (config.subjects || []).map((s, idx) => {
    const t1 = calc.terms?.term1?.[idx]?.total;
    const t2 = calc.terms?.term2?.[idx]?.total;
    const total =
      (typeof t1 === "number" ? t1 : 0) + (typeof t2 === "number" ? t2 : 0);
    const count = (typeof t1 === "number" ? 1 : 0) + (typeof t2 === "number" ? 1 : 0);
    const avg = count > 0 ? total / count : null;
    return {
      name: s.name,
      avg,
      pct: avg !== null ? (avg / maxScore) * 100 : null,
    };
  }).filter((s) => s.avg !== null);

  rankedSubjects.sort((a, b) => (b.pct || 0) - (a.pct || 0));

  const topSubject = rankedSubjects[0]?.name || "academics";
  const lowestSubject =
    rankedSubjects.length > 1
      ? rankedSubjects[rankedSubjects.length - 1]?.name
      : null;

  const pct = calc.percentage;
  const sName = student?.name || "Student";
  const suggestions = [];

  // 1. Academic Excellence & Recognition
  if (pct !== null && pct >= 80) {
    suggestions.push({
      category: "Excellence",
      badge: "🌟 Top Performer",
      text: `${sName} is an outstanding student who consistently demonstrates academic excellence.`,
    });
  } else if (pct !== null && pct >= 60) {
    suggestions.push({
      category: "Commendable",
      badge: "👏 Commendable Effort",
      text: `${sName} is a sincere and hardworking student who performs very well in ${topSubject}.`,
    });
  } else {
    suggestions.push({
      category: "Encouragement",
      badge: "🌱 Growing Potential",
      text: `${sName} is making progress and has the ability to achieve even greater success through continued efforts.`,
    });
  }

  // 2. Targeted Guidance (Strength + Focus Area)
  if (lowestSubject && lowestSubject !== topSubject) {
    suggestions.push({
      category: "Targeted Focus",
      badge: "🎯 Strength & Focus",
      text: `${sName} shows commendable grasp in ${topSubject} and will benefit from regular practice in ${lowestSubject}.`,
    });
  } else {
    suggestions.push({
      category: "Targeted Focus",
      badge: "🎯 Core Competence",
      text: `${sName} possesses good learning abilities and actively participates in classroom activities.`,
    });
  }

  // 3. Growth & Progress
  suggestions.push({
    category: "Progress",
    badge: "📈 Steady Progress",
    text: `${sName} is progressing very well and displays excellent learning habits and responsible behaviour.`,
  });

  // 4. Motivation & Self-Belief
  if (pct !== null && pct < 50) {
    suggestions.push({
      category: "Remedial Focus",
      badge: "💡 Remedial Guidance",
      text: `${sName} has good potential and can achieve better results through dedication, regular practice and perseverance.`,
    });
  } else {
    suggestions.push({
      category: "Motivation",
      badge: "✨ Enthusiastic Learner",
      text: `${sName} is an enthusiastic learner with a cheerful personality and a strong desire to succeed.`,
    });
  }

  return suggestions;
}

const CATEGORY_TABS = [
  { id: "all", label: "All Remarks (100)" },
  { id: "positive", label: "🌟 Positive (1–30)" },
  { id: "improvement", label: "🌱 Needs Improvement (31–40, 71–80)" },
  { id: "personality", label: "🎨 Personality & Co-Curricular (41–70, 81–100)" },
];

export default function SmartRemarks({ report, config, student, onSelectRemark }) {
  const [activeTab, setActiveTab] = useState("recommended"); // "recommended" | "library"
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const studentName = student?.name || "Student";

  const suggestions = useMemo(
    () => generateSmartRemarks(report, config, student),
    [report, config, student],
  );

  const filteredLibrary = useMemo(() => {
    let list = ALL_REMARKS;
    if (selectedCategory !== "all") {
      list = list.filter((r) => r.master === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const formatted = formatRemark(r.text, studentName).toLowerCase();
        return (
          formatted.includes(q) ||
          r.sub.toLowerCase().includes(q) ||
          r.text.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [selectedCategory, searchQuery, studentName]);

  const currentFontKey = config?.handwritingFont || "kalam";
  const fontDisplayNames = {
    kalam: "Kalam (Natural Handwriting)",
    caveat: "Caveat (Casual Script)",
    patrickHand: "Patrick Hand (Neat Print)",
  };

  const getSubcategoryLabel = (subId) => {
    for (const cat of Object.values(REMARK_CATEGORIES)) {
      const sub = cat.subcategories.find((s) => s.id === subId);
      if (sub) return sub.label;
    }
    return subId;
  };

  return (
    <div className="smart-remarks-container">
      {/* Top Header */}
      <div className="smart-remarks-heading">
        <div className="smart-heading-text">
          <Sparkles size={16} className="text-amber" />
          <b>Teacher Remarks Studio</b>
          <span className="remarks-font-indicator" title="Selected handwriting font on report cards">
            <PenLine size={13} />
            <span>Ink Font: {fontDisplayNames[currentFontKey] || "Kalam"}</span>
          </span>
        </div>
        <small>Personalized for {studentName}</small>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="remarks-mode-nav">
        <button
          type="button"
          className={`remarks-mode-btn ${activeTab === "recommended" ? "active" : ""}`}
          onClick={() => setActiveTab("recommended")}
        >
          <Sparkles size={14} /> Recommended for {studentName} ({suggestions.length})
        </button>
        <button
          type="button"
          className={`remarks-mode-btn ${activeTab === "library" ? "active" : ""}`}
          onClick={() => setActiveTab("library")}
        >
          <BookOpen size={14} /> 100 Remarks Library
        </button>
      </div>

      {/* Recommended Tab */}
      {activeTab === "recommended" && (
        <div className="smart-remarks-list">
          {suggestions.map((item, idx) => {
            const isSelected = report.remarks === item.text;
            return (
              <div
                key={idx}
                className={`smart-remark-card ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectRemark(item.text)}
              >
                <div className="remark-card-top">
                  <span className="remark-badge">{item.badge}</span>
                  {isSelected && (
                    <span className="remark-active-pill">
                      <CheckCircle2 size={13} /> Applied to Report
                    </span>
                  )}
                </div>
                <p className="remark-text handwriting-preview">“{item.text}”</p>
                <div className="remark-card-footer">
                  <button
                    type="button"
                    className={`btn-apply-remark ${isSelected ? "applied" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRemark(item.text);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <Check size={14} /> Currently Applied
                      </>
                    ) : (
                      <>
                        <Wand2 size={13} /> 1-Click Apply
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 100 Remarks Library Tab */}
      {activeTab === "library" && (
        <div className="remarks-library-wrapper">
          {/* Category Filter Tabs */}
          <div className="remarks-category-pills">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`remarks-cat-pill ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="remarks-search-bar">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder={`Search 100 remarks for ${studentName} (e.g. discipline, creative, practice)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          {/* Remarks List */}
          <div className="remarks-library-list">
            {filteredLibrary.length === 0 ? (
              <div className="remarks-empty">No remarks found matching “{searchQuery}”.</div>
            ) : (
              filteredLibrary.map((item) => {
                const formatted = formatRemark(item.text, studentName);
                const isSelected = report.remarks === formatted;
                return (
                  <div
                    key={item.id}
                    className={`smart-remark-card ${isSelected ? "selected" : ""}`}
                    onClick={() => onSelectRemark(formatted)}
                  >
                    <div className="remark-card-top">
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span className="remark-num-pill">#{item.id}</span>
                        <span className="remark-badge">{getSubcategoryLabel(item.sub)}</span>
                      </div>
                      {isSelected && (
                        <span className="remark-active-pill">
                          <CheckCircle2 size={13} /> Applied
                        </span>
                      )}
                    </div>
                    <p className="remark-text handwriting-preview">“{formatted}”</p>
                    <div className="remark-card-footer">
                      <button
                        type="button"
                        className={`btn-apply-remark ${isSelected ? "applied" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRemark(formatted);
                        }}
                      >
                        {isSelected ? (
                          <>
                            <Check size={14} /> Applied
                          </>
                        ) : (
                          <>
                            <Wand2 size={13} /> 1-Click Apply
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
