import React, { useState, useEffect, useRef } from "react";
import {
  CalendarCheck,
  QrCode,
  Users,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Camera,
  RefreshCw,
  Search,
  Download,
  ShieldAlert,
  Sparkles,
  Send,
  Volume2,
  Calendar,
  Layers,
} from "lucide-react";
import { api } from "./api";
import { Html5Qrcode } from "html5-qrcode";

export default function Attendance({ user, toast, initialTab = "student_manual" }) {
  const [tab, setTab] = useState(initialTab); // student_manual | student_qr | monthly_report | staff
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("1");
  const [selectedSection, setSelectedSection] = useState("A");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);

  // Load classes & sections from Academic Masters
  useEffect(() => {
    (async () => {
      try {
        const m = await api("/masters");
        if (m.classes?.length) {
          const sortedCls = m.classes
            .filter((c) => c.active !== false)
            .sort((a, b) => a.order - b.order)
            .map((c) => c.name);
          setClasses(sortedCls);
          if (!sortedCls.includes(selectedClass)) setSelectedClass(sortedCls[0]);
        }
        if (m.sections?.length) {
          const sortedSec = m.sections
            .filter((s) => s.active !== false)
            .sort((a, b) => a.order - b.order)
            .map((s) => s.name);
          setSections(sortedSec);
          if (!sortedSec.includes(selectedSection)) setSelectedSection(sortedSec[0]);
        }
      } catch (err) {
        console.error("Failed to load masters for attendance", err);
      }
    })();
  }, []);

  // Load student attendance for manual tab
  const loadClassAttendance = async () => {
    if (!selectedClass || !selectedSection || !date) return;
    setLoading(true);
    try {
      const res = await api(
        `/attendance/student?className=${encodeURIComponent(selectedClass)}&section=${encodeURIComponent(selectedSection)}&date=${date}`
      );
      setStudents(res.students || []);
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "student_manual") {
      loadClassAttendance();
    }
  }, [tab, selectedClass, selectedSection, date]);

  // Handle single student status toggle
  const updateStudentStatus = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status: newStatus } : s))
    );
  };

  // Bulk actions (Mark All Present / Absent)
  const markAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  // Save batch attendance
  const saveAttendance = async () => {
    setSaving(true);
    try {
      await api("/attendance/student/batch", {
        method: "POST",
        body: {
          className: selectedClass,
          section: selectedSection,
          date,
          records: students.map((s) => ({
            studentId: s.studentId,
            admissionNo: s.admissionNo,
            status: s.status,
            timeIn: s.timeIn,
            remarks: s.remarks,
          })),
        },
      });
      toast?.(`Attendance saved successfully for Class ${selectedClass}-${selectedSection}`);
      loadClassAttendance();
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  // Summary counts
  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.filter((s) => s.status === "absent").length;
  const lateCount = students.filter((s) => s.status === "late").length;
  const halfDayCount = students.filter((s) => s.status === "half_day").length;
  const attendancePercent = students.length
    ? Math.round(((presentCount + lateCount + halfDayCount * 0.5) / students.length) * 100)
    : 0;

  return (
    <div className="attendance-module">
      <div className="page-title">
        <div>
          <div className="eyebrow">ATTENDANCE & TIME REGISTER</div>
          <h1>Multi-Modal Attendance System</h1>
          <p>Manual class roll-call, Gate QR camera scanner, and CBSE monthly muster roll.</p>
        </div>
      </div>

      {/* Module Tabs Navigation */}
      <div className="attendance-tabs-bar">
        <button
          className={`att-tab-btn ${tab === "student_manual" ? "active" : ""}`}
          onClick={() => setTab("student_manual")}
        >
          <CalendarCheck size={17} /> Daily Class Roll Call
        </button>
        <button
          className={`att-tab-btn ${tab === "student_qr" ? "active" : ""}`}
          onClick={() => setTab("student_qr")}
        >
          <QrCode size={17} /> Gate QR Scanner Kiosk
        </button>
        <button
          className={`att-tab-btn ${tab === "monthly_report" ? "active" : ""}`}
          onClick={() => setTab("monthly_report")}
        >
          <Calendar size={17} /> Monthly Muster Register
        </button>
        <button
          className={`att-tab-btn ${tab === "staff" ? "active" : ""}`}
          onClick={() => setTab("staff")}
        >
          <UserCheck size={17} /> Staff Attendance
        </button>
      </div>

      {/* TAB 1: MANUAL CLASS ATTENDANCE */}
      {tab === "student_manual" && (
        <div className="att-card">
          {/* Controls Bar */}
          <div className="att-controls-bar">
            <div className="att-filter-group">
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

            <div className="att-filter-group">
              <label>SECTION</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                {sections.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="att-filter-group">
              <label>DATE</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <button
              className="btn"
              onClick={loadClassAttendance}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
            </button>
          </div>

          {/* Quick Metrics & Batch Actions */}
          <div className="att-stats-ribbon">
            <div className="att-metric">
              <span className="att-metric-val blue">{students.length}</span>
              <span className="att-metric-lbl">Total Students</span>
            </div>
            <div className="att-metric">
              <span className="att-metric-val green">{presentCount}</span>
              <span className="att-metric-lbl">Present</span>
            </div>
            <div className="att-metric">
              <span className="att-metric-val red">{absentCount}</span>
              <span className="att-metric-lbl">Absent</span>
            </div>
            <div className="att-metric">
              <span className="att-metric-val yellow">{lateCount}</span>
              <span className="att-metric-lbl">Late</span>
            </div>
            <div className="att-metric">
              <span className="att-metric-val orange">{attendancePercent}%</span>
              <span className="att-metric-lbl">Present Ratio</span>
            </div>

            <div className="att-batch-actions">
              <button
                type="button"
                className="btn-mark-all-p"
                onClick={() => markAll("present")}
              >
                Mark All Present
              </button>
              <button
                type="button"
                className="btn-mark-all-a"
                onClick={() => markAll("absent")}
              >
                Mark All Absent
              </button>
              <button
                type="button"
                className="btn primary btn-save-att"
                onClick={saveAttendance}
                disabled={saving || !students.length}
              >
                {saving ? "Saving…" : "Save Attendance"}
              </button>
            </div>
          </div>

          {/* Student Attendance List */}
          {loading ? (
            <div className="att-loading">
              <RefreshCw className="spin" size={24} /> Loading class roster…
            </div>
          ) : !students.length ? (
            <div className="att-empty">
              <Users size={36} />
              <h3>No active students found in Class {selectedClass}-{selectedSection}</h3>
              <p>Add students or verify class assignment to start marking attendance.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table att-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>Roll</th>
                    <th>Student Details</th>
                    <th>Admission No</th>
                    <th style={{ width: "320px", textAlign: "center" }}>Attendance Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.studentId} className={`att-row-${s.status}`}>
                      <td className="att-roll-col">
                        <b>{s.rollNo || idx + 1}</b>
                      </td>
                      <td>
                        <div className="att-student-cell">
                          {s.photo ? (
                            <img src={s.photo} alt={s.name} className="att-avatar-img" />
                          ) : (
                            <div className="att-avatar-txt">{s.name.slice(0, 1)}</div>
                          )}
                          <div>
                            <b className="att-student-name">{s.name}</b>
                            {s.timeIn && (
                              <span className="att-time-badge">
                                <Clock size={11} /> In: {s.timeIn}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="att-adm-code">{s.admissionNo}</span>
                      </td>
                      <td>
                        <div className="att-toggle-group">
                          <button
                            type="button"
                            className={`att-status-btn present ${s.status === "present" ? "active" : ""}`}
                            onClick={() => updateStudentStatus(s.studentId, "present")}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            className={`att-status-btn absent ${s.status === "absent" ? "active" : ""}`}
                            onClick={() => updateStudentStatus(s.studentId, "absent")}
                          >
                            A
                          </button>
                          <button
                            type="button"
                            className={`att-status-btn late ${s.status === "late" ? "active" : ""}`}
                            onClick={() => updateStudentStatus(s.studentId, "late")}
                          >
                            L
                          </button>
                          <button
                            type="button"
                            className={`att-status-btn half ${s.status === "half_day" ? "active" : ""}`}
                            onClick={() => updateStudentStatus(s.studentId, "half_day")}
                          >
                            HD
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="att-remark-input"
                          placeholder="Optional remark..."
                          value={s.remarks || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStudents((prev) =>
                              prev.map((item) =>
                                item.studentId === s.studentId ? { ...item, remarks: val } : item
                              )
                            );
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GATE QR SCANNER KIOSK */}
      {tab === "student_qr" && <QrScannerKiosk toast={toast} />}

      {/* TAB 3: MONTHLY MUSTER REGISTER */}
      {tab === "monthly_report" && (
        <MonthlyRegister
          classes={classes}
          sections={sections}
          toast={toast}
        />
      )}

      {/* TAB 4: STAFF ATTENDANCE */}
      {tab === "staff" && <StaffAttendanceTab toast={toast} />}
    </div>
  );
}

// -------------------------------------------------------------
// Component: QR SCANNER KIOSK (Camera Stream & Real-time Punch)
// -------------------------------------------------------------
function QrScannerKiosk({ toast }) {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [recentScans, setRecentScans] = useState([]);
  const [lastScanned, setLastScanned] = useState(null);
  const [busy, setBusy] = useState(false);
  const html5QrCodeRef = useRef(null);

  // Play audio chime on successful scan
  const playBeep = (success = true) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = success ? 880 : 350; // High beep for success, low for warning
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  const handlePunchCode = async (code) => {
    if (!code || busy) return;
    setBusy(true);
    try {
      const res = await api("/attendance/student/punch-qr", {
        method: "POST",
        body: { code },
      });
      playBeep(true);
      setLastScanned(res);
      setRecentScans((prev) => [res, ...prev.slice(0, 9)]);
      if (res.alreadyPunched) {
        toast?.(`${res.student.name} was already punched at ${res.timeIn}`);
      } else {
        toast?.(`Checked in: ${res.student.name} (Class ${res.student.className}-${res.student.section})`);
      }
    } catch (err) {
      playBeep(false);
      toast?.(err.message, true);
    } finally {
      setBusy(false);
    }
  };

  const startScanner = async () => {
    try {
      const qrScanner = new Html5Qrcode("gate-qr-reader");
      html5QrCodeRef.current = qrScanner;
      await qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handlePunchCode(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      toast?.("Failed to access camera: " + err.message, true);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {}
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && scanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [scanning]);

  return (
    <div className="qr-kiosk-layout">
      {/* Left: Camera Feed & Manual Input */}
      <div className="qr-scanner-pane">
        <div className="kiosk-header">
          <div className="kiosk-status-badge">
            <span className="live-dot" /> LIVE GATE CAMERA KIOSK
          </div>
          <h3>Scan Student ID Card QR Code</h3>
          <p>Position QR code inside the viewfinder for instant attendance punch.</p>
        </div>

        <div className="scanner-container">
          <div id="gate-qr-reader" className="qr-video-box" />
          {!scanning && (
            <div className="scanner-idle-overlay">
              <Camera size={48} />
              <button className="btn primary btn-start-cam" onClick={startScanner}>
                Start Camera Scanner
              </button>
            </div>
          )}
        </div>

        {scanning && (
          <div className="scanner-actions-bar">
            <button className="btn btn-stop-cam" onClick={stopScanner}>
              Stop Camera
            </button>
          </div>
        )}

        {/* Manual Barcode / Admission No Fallback */}
        <div className="qr-manual-box">
          <label>MANUAL ADMISSION NO / BARCODE PUNCH</label>
          <div className="manual-input-row">
            <input
              type="text"
              placeholder="e.g. 2025001"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePunchCode(manualCode);
                  setManualCode("");
                }
              }}
            />
            <button
              type="button"
              className="btn primary"
              disabled={!manualCode.trim() || busy}
              onClick={() => {
                handlePunchCode(manualCode);
                setManualCode("");
              }}
            >
              Punch
            </button>
          </div>
        </div>
      </div>

      {/* Right: Last Scanned Pop-up Card & Real-time Stream */}
      <div className="qr-stream-pane">
        <div className="last-scan-card">
          <span className="pane-subtitle">LATEST PUNCHED STUDENT</span>
          {lastScanned ? (
            <div className="student-punch-success-card">
              <div className="punch-avatar-frame">
                {lastScanned.student.photo ? (
                  <img src={lastScanned.student.photo} alt={lastScanned.student.name} />
                ) : (
                  <div className="punch-avatar-txt">{lastScanned.student.name.slice(0, 1)}</div>
                )}
              </div>
              <div className="punch-details">
                <span className="punch-status-badge present">
                  <CheckCircle2 size={13} /> {lastScanned.alreadyPunched ? "ALREADY RECORDED" : "PUNCH SUCCESS"}
                </span>
                <h4>{lastScanned.student.name}</h4>
                <div className="punch-meta">
                  <span>Class: <b>{lastScanned.student.className}-{lastScanned.student.section}</b></span>
                  <span>Adm No: <b>{lastScanned.student.admissionNo}</b></span>
                  <span>Time: <b>{lastScanned.timeIn}</b></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="awaiting-scan-placeholder">
              <QrCode size={36} />
              <p>Awaiting QR scan from camera or barcode scanner…</p>
            </div>
          )}
        </div>

        {/* Recent Scans Stream */}
        <div className="recent-scans-list">
          <span className="pane-subtitle">RECENT GATE SCANS (TODAY)</span>
          {!recentScans.length ? (
            <div className="no-scans-text">No scans recorded in this session yet.</div>
          ) : (
            recentScans.map((item, i) => (
              <div key={i} className="recent-scan-item">
                <div className="recent-avatar-sm">
                  {item.student.photo ? (
                    <img src={item.student.photo} alt="" />
                  ) : (
                    item.student.name.slice(0, 1)
                  )}
                </div>
                <div className="recent-info">
                  <b>{item.student.name}</b>
                  <small>Class {item.student.className}-{item.student.section} · {item.student.admissionNo}</small>
                </div>
                <span className="recent-time">{item.timeIn}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: MONTHLY MUSTER REGISTER (CBSE 31-Day Layout)
// -------------------------------------------------------------
function MonthlyRegister({ classes, sections, toast }) {
  const [selectedClass, setSelectedClass] = useState("1");
  const [selectedSection, setSelectedSection] = useState("A");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMonthlyData = async () => {
    if (!selectedClass || !selectedSection || !month) return;
    setLoading(true);
    try {
      const res = await api(
        `/attendance/student/monthly?className=${encodeURIComponent(selectedClass)}&section=${encodeURIComponent(selectedSection)}&month=${month}`
      );
      setData(res);
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonthlyData();
  }, [selectedClass, selectedSection, month]);

  // Generate days array for the month (1 to 28/30/31)
  const daysInMonth = () => {
    if (!month) return [];
    const [y, m] = month.split("-").map(Number);
    const totalDays = new Date(y, m, 0).getDate();
    return Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${month}-${String(dayNum).padStart(2, "0")}`;
      const dayOfWeek = new Date(y, m - 1, dayNum).getDay();
      return { dayNum, dateStr, isSunday: dayOfWeek === 0 };
    });
  };

  const days = daysInMonth();

  return (
    <div className="att-card">
      <div className="att-controls-bar">
        <div className="att-filter-group">
          <label>CLASS</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {classes.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>
        <div className="att-filter-group">
          <label>SECTION</label>
          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
            {sections.map((s) => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>
        </div>
        <div className="att-filter-group">
          <label>MONTH</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <button className="btn" onClick={loadMonthlyData} disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="att-loading">
          <RefreshCw className="spin" size={24} /> Generating monthly muster roll…
        </div>
      ) : !data || !data.students?.length ? (
        <div className="att-empty">
          <Calendar size={36} />
          <h3>No students found for this class & section</h3>
        </div>
      ) : (
        <div className="table-responsive muster-table-scroll">
          <table className="muster-table">
            <thead>
              <tr>
                <th className="sticky-col first">Roll</th>
                <th className="sticky-col second">Student</th>
                {days.map((d) => (
                  <th key={d.dayNum} className={d.isSunday ? "sunday-col" : ""}>
                    <span>{d.dayNum}</span>
                    <small>{d.isSunday ? "Sun" : ""}</small>
                  </th>
                ))}
                <th>Present</th>
                <th>Absent</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s, idx) => {
                const studentPunches = data.matrix?.[String(s._id)] || {};
                let pCount = 0;
                let aCount = 0;
                let totalWorkDays = 0;

                days.forEach((d) => {
                  if (!d.isSunday) totalWorkDays++;
                  const st = studentPunches[d.dateStr];
                  if (st === "present" || st === "late") pCount++;
                  else if (st === "half_day") pCount += 0.5;
                  else if (st === "absent") aCount++;
                });

                const pct = totalWorkDays ? Math.round((pCount / totalWorkDays) * 100) : 0;
                const isDefaulter = pct < 75 && totalWorkDays > 5;

                return (
                  <tr key={s._id}>
                    <td className="sticky-col first"><b>{s.rollNo || idx + 1}</b></td>
                    <td className="sticky-col second">
                      <div className="muster-name-box">
                        <b>{s.name}</b>
                        <small>{s.admissionNo}</small>
                      </div>
                    </td>
                    {days.map((d) => {
                      const st = studentPunches[d.dateStr];
                      if (d.isSunday) {
                        return <td key={d.dayNum} className="sunday-cell">-</td>;
                      }
                      return (
                        <td key={d.dayNum} className={`muster-cell ${st || "unmarked"}`}>
                          {st === "present" ? "P" : st === "absent" ? "A" : st === "late" ? "L" : st === "half_day" ? "HD" : "·"}
                        </td>
                      );
                    })}
                    <td className="muster-stat-p">{pCount}</td>
                    <td className="muster-stat-a">{aCount}</td>
                    <td className={`muster-stat-pct ${isDefaulter ? "defaulter" : ""}`}>
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Component: STAFF ATTENDANCE TAB
// -------------------------------------------------------------
function StaffAttendanceTab({ toast }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const loadStaffAttendance = async () => {
    setLoading(true);
    try {
      const res = await api(`/attendance/staff?date=${date}`);
      setStaff(res.staff || []);
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffAttendance();
  }, [date]);

  const updateStaffStatus = async (item, newStatus) => {
    setSavingId(item.staffId);
    try {
      await api("/attendance/staff/punch", {
        method: "POST",
        body: {
          staffId: item.staffId,
          date,
          status: newStatus,
          timeIn: item.timeIn || (newStatus === "present" ? new Date().toLocaleTimeString("en-US", { hour12: false }) : ""),
        },
      });
      setStaff((prev) =>
        prev.map((s) => (s.staffId === item.staffId ? { ...s, status: newStatus } : s))
      );
      toast?.(`Updated ${item.name} status to ${newStatus}`);
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="att-card">
      <div className="att-controls-bar">
        <div className="att-filter-group">
          <label>ATTENDANCE DATE</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button className="btn" onClick={loadStaffAttendance} disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Role & Designation</th>
              <th>Status</th>
              <th>Time In / Out</th>
              <th>Punch Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.staffId}>
                <td>
                  <div className="att-student-cell">
                    {s.photo ? (
                      <img src={s.photo} alt={s.name} className="att-avatar-img" />
                    ) : (
                      <div className="att-avatar-txt">{s.name.slice(0, 1)}</div>
                    )}
                    <b>{s.name}</b>
                  </div>
                </td>
                <td>
                  <span className="staff-desig-tag">{s.designation || s.role}</span>
                </td>
                <td>
                  <span className={`staff-role-pill role-${s.status}`}>
                    {s.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className="att-time-badge">
                    <Clock size={12} /> {s.timeIn || "Not punched"}
                  </span>
                </td>
                <td>
                  <div className="att-toggle-group">
                    <button
                      className={`att-status-btn present ${s.status === "present" ? "active" : ""}`}
                      onClick={() => updateStaffStatus(s, "present")}
                      disabled={savingId === s.staffId}
                    >
                      P
                    </button>
                    <button
                      className={`att-status-btn absent ${s.status === "absent" ? "active" : ""}`}
                      onClick={() => updateStaffStatus(s, "absent")}
                      disabled={savingId === s.staffId}
                    >
                      A
                    </button>
                    <button
                      className={`att-status-btn late ${s.status === "late" ? "active" : ""}`}
                      onClick={() => updateStaffStatus(s, "late")}
                      disabled={savingId === s.staffId}
                    >
                      L
                    </button>
                    <button
                      className={`att-status-btn half ${s.status === "leave" ? "active" : ""}`}
                      onClick={() => updateStaffStatus(s, "leave")}
                      disabled={savingId === s.staffId}
                    >
                      Leave
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
