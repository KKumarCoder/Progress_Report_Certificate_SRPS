import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  GraduationCap,
  Award,
  Printer,
  Home,
  BookOpen,
} from "lucide-react";

export default function VerifyReport({ studentId, session, signature }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetch(`/api/public/verify/${studentId}/${session}/${signature}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Verification failed");
        return json;
      })
      .then((json) => {
        if (active) setData(json);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to verify this report.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [studentId, session, signature]);

  if (loading) {
    return (
      <div className="verify-page">
        <div className="verify-card loading-box">
          <Loader size={130} />
          <h2 style={{ marginTop: 24 }}>Verifying official credentials…</h2>
          <p>Connecting to Shree Ram Public School Examination Server</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="verify-page">
        <div className="verify-card error-box">
          <div className="verify-status-icon error">
            <XCircle size={48} />
          </div>
          <h2>Verification Failed</h2>
          <p className="verify-error-msg">{error || "Invalid verification record"}</p>
          <div className="verify-note">
            This document cannot be validated as an authentic, published report card of Shree Ram Public School. The digital signature may be invalid, or the report has not yet been approved.
          </div>
          <a href="/" className="btn primary" style={{ marginTop: 20 }}>
            <Home size={16} /> Go to School Portal
          </a>
        </div>
      </div>
    );
  }

  const { student, summary, school, publishedAt, terms } = data;
  const isPass = summary.result === "PASS";

  return (
    <div className="verify-page">
      <div className="verify-card">
        {/* Certificate Header */}
        <div className="verify-header">
          <div className="verify-school-brand">
            <img
              src="/anvayrobo-logo.jpeg"
              alt="SRPS Logo"
              className="verify-logo"
            />
            <div>
              <span className="verify-school-eyebrow">OFFICIAL DIGITAL EXAMINATION RECORD</span>
              <h1 className="verify-school-name">{school.name}</h1>
              <p className="verify-school-sub">{school.location} · {school.subtitle}</p>
            </div>
          </div>
          <div className="verify-badge verified">
            <ShieldCheck size={20} />
            <span>AUTHENTICATED RECORD</span>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="verify-banner">
          <CheckCircle2 size={24} color="#15803d" />
          <div className="verify-banner-text">
            <b>Certified Authentic Marksheet</b>
            <span>
              This report card was verified against the official school examination registry for academic session <b>{session}</b>.
            </span>
          </div>
          <div className="verify-timestamp">
            <Calendar size={14} />
            <span>Published: {new Date(publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>

        {/* Student Details Grid */}
        <div className="verify-student-grid">
          <div className="verify-student-avatar">
            {student.photo ? (
              <img src={student.photo} alt={student.name} />
            ) : (
              <div className="verify-avatar-placeholder">
                <User size={36} />
              </div>
            )}
          </div>
          <div className="verify-student-info">
            <span className="verify-student-label">STUDENT NAME</span>
            <h2 className="verify-student-name">{student.name}</h2>
            <div className="verify-meta-chips">
              <span><b>Adm No:</b> {student.admissionNo}</span>
              <span><b>Class:</b> {student.className} - {student.section}</span>
              <span><b>Roll No:</b> {student.rollNo}</span>
              <span><b>House:</b> {student.house}</span>
              <span><b>DOB:</b> {student.dob}</span>
            </div>
            {(student.fatherName || student.motherName) && (
              <div className="verify-parents">
                <span><b>Father:</b> {student.fatherName}</span>
                <span><b>Mother:</b> {student.motherName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Performance Overview Cards */}
        <div className="verify-stats-grid">
          <div className="verify-stat-card">
            <span className="stat-label">TOTAL MARKS</span>
            <span className="stat-value">{summary.total} <small>/ {summary.maximum}</small></span>
          </div>
          <div className="verify-stat-card">
            <span className="stat-label">PERCENTAGE</span>
            <span className="stat-value">{summary.percentage !== null ? `${summary.percentage}%` : "—"}</span>
          </div>
          <div className="verify-stat-card">
            <span className="stat-label">OVERALL GRADE</span>
            <span className="stat-value grade-badge">{summary.grade}</span>
          </div>
          <div className="verify-stat-card">
            <span className="stat-label">FINAL RESULT</span>
            <span className={`stat-value result-badge ${isPass ? "pass" : "review"}`}>
              {summary.result}
            </span>
          </div>
        </div>

        {/* Subject Breakdown */}
        {terms && (
          <div className="verify-subjects-section">
            <h3 className="section-title">
              <BookOpen size={18} /> Subject-wise Assessment Breakdown
            </h3>
            <div className="verify-terms-container">
              {["term1", "term2"].map((termKey) => {
                const termList = terms[termKey] || [];
                const termTitle = termKey === "term1" ? "Term 1 Assessment" : "Term 2 Assessment";
                return (
                  <div key={termKey} className="verify-term-card">
                    <h4>{termTitle}</h4>
                    <table className="verify-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th style={{ textAlign: "right" }}>Total</th>
                          <th style={{ textAlign: "center" }}>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {termList.map((sub) => (
                          <tr key={sub.id}>
                            <td>{sub.name}</td>
                            <td style={{ textAlign: "right", fontWeight: 600 }}>{sub.total ?? "—"}</td>
                            <td style={{ textAlign: "center" }}>
                              <span className="sub-grade">{sub.grade}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info & Actions */}
        <div className="verify-footer">
          <div className="verify-disclaimer">
            <ShieldCheck size={16} />
            <span>
              This is a computer-generated verification document issued by Shree Ram Public School. It requires no physical signature.
            </span>
          </div>
          <div className="verify-actions">
            <button className="btn" onClick={() => window.print()}>
              <Printer size={16} /> Print Verification Slip
            </button>
            <a href="/" className="btn primary">
              <Home size={16} /> School ERP
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

