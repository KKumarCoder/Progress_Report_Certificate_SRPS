import React from "react";
import { Sparkles, Check, ArrowRight, Wand2 } from "lucide-react";
import { calculate, grade } from "../../shared/engine.js";

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
  const secondTop = rankedSubjects[1]?.name;
  const lowestSubject =
    rankedSubjects.length > 1
      ? rankedSubjects[rankedSubjects.length - 1]?.name
      : null;

  const pct = calc.percentage;
  const suggestions = [];

  // 1. Academic Excellence & Recognition
  if (pct !== null && pct >= 80) {
    suggestions.push({
      category: "Excellence",
      badge: "🌟 Top Performer",
      text: `Outstanding academic performance throughout the session. Demonstrates exceptional mastery in ${topSubject} and sets a commendable example of discipline and dedication.`,
    });
  } else if (pct !== null && pct >= 60) {
    suggestions.push({
      category: "Commendable",
      badge: "👏 Commendable Effort",
      text: `Displays consistent dedication and sound conceptual clarity, particularly in ${topSubject}. A polite and well-disciplined student.`,
    });
  } else {
    suggestions.push({
      category: "Encouragement",
      badge: "🌱 Growing Potential",
      text: `Shows earnest effort and good manners in class. Has strong potential to elevate overall academic performance with focused revision.`,
    });
  }

  // 2. Targeted Guidance (Strength + Focus Area)
  if (lowestSubject && lowestSubject !== topSubject) {
    suggestions.push({
      category: "Targeted Focus",
      badge: "🎯 Strength & Focus",
      text: `Demonstrates commendable grasp in ${topSubject}. Dedicated daily practice and regular revision in ${lowestSubject} will ensure well-rounded excellence.`,
    });
  } else {
    suggestions.push({
      category: "Targeted Focus",
      badge: "🎯 Core Competence",
      text: `Active participant in class with solid grasp in core subjects. Regular writing practice will help enhance precision and exam presentation.`,
    });
  }

  // 3. Growth & Progress
  suggestions.push({
    category: "Progress",
    badge: "📈 Steady Progress",
    text: `Hardworking student making pleasing, steady progress across both terms. Maintains neat notebooks and demonstrates active classroom participation.`,
  });

  // 4. Motivation & Self-Belief
  if (pct !== null && pct < 50) {
    suggestions.push({
      category: "Remedial Focus",
      badge: "💡 Remedial Guidance",
      text: `Possesses good potential. Regular attendance, active class attention, and dedicated revision in ${lowestSubject || "key subjects"} are strongly encouraged for upcoming assessments.`,
    });
  } else {
    suggestions.push({
      category: "Motivation",
      badge: "✨ Enthusiastic Learner",
      text: `A curious and cooperative student with a positive attitude towards learning. Keep up the wonderful enthusiasm and effort!`,
    });
  }

  return suggestions;
}

export default function SmartRemarks({ report, config, student, onSelectRemark }) {
  const suggestions = generateSmartRemarks(report, config, student);

  if (!suggestions.length) return null;

  return (
    <div className="smart-remarks-container">
      <div className="smart-remarks-heading">
        <div className="smart-heading-text">
          <Sparkles size={16} className="text-amber" />
          <b>AI / Smart Remarks Generator</b>
        </div>
        <small>Personalized based on {student?.name || "student"}’s actual scores</small>
      </div>

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
                    <Check size={13} /> Applied
                  </span>
                )}
              </div>
              <p className="remark-text">“{item.text}”</p>
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
                      <Check size={14} /> Currently Selected
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
    </div>
  );
}

