import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  Plus,
  Trash2,
  Printer,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Wallet,
  IndianRupee,
  Share2,
  ExternalLink,
  MessageCircle,
  Clock,
  User,
  ShieldCheck,
  RefreshCw,
  X,
  Sparkles,
} from "lucide-react";
import QRCode from "qrcode";
import { api } from "./api";

const PAYMENT_MODES = ["Cash", "UPI", "Cheque", "Bank Transfer", "Online"];
const DISCOUNT_REASONS = [
  "Sibling Concession",
  "Staff Ward Concession",
  "Merit Scholarship",
  "Economically Weaker Section (EWS)",
  "Single Parent Concession",
  "Management Discretion",
  "Other",
];

const MONTHS_LIST = [
  "April 2026",
  "May 2026",
  "June 2026",
  "July 2026",
  "August 2026",
  "September 2026",
  "October 2026",
  "November 2026",
  "December 2026",
  "January 2027",
  "February 2027",
  "March 2027",
  "Term 1 Fee",
  "Term 2 Fee",
  "Annual Composite Fee",
];

export default function Fees({ user, config, toast, initialStudentId = null, initialTab = "collect" }) {
  const [tab, setTab] = useState(initialTab); // collect | structure | receipts | defaulters

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);
  const [stats, setStats] = useState({
    paidMonthly: 0,
    todayCollection: 0,
    todayCash: 0,
    todayOnline: 0,
    pendingFeesAllTime: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Active printable receipt modal state
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Load KPI stats
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api("/fees/stats");
      setStats(res);
    } catch (err) {
      console.error("Failed to load fee stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="fees-module">
      <div className="page-title">
        <div>
          <div className="eyebrow">ACCOUNTS & CASHIER COUNTER</div>
          <h1>Fee Management & Invoicing</h1>
          <p>Instant POS collection counter, fee structure slabs, thermal & A4 receipts, and fee defaulters.</p>
        </div>
      </div>

      {/* KPI Cards Header */}
      <div className="fee-stats-grid">
        <div className="fee-kpi-card purple">
          <div className="fee-kpi-header">
            <span className="fee-kpi-label">PAID FEES (MONTHLY)</span>
            <span className="fee-kpi-icon"><Wallet size={18} /></span>
          </div>
          <div className="fee-kpi-value">₹{Number(stats.paidMonthly || 0).toLocaleString("en-IN")}</div>
          <div className="fee-kpi-sub">
            <span className="fee-kpi-badge">Current Month</span>
          </div>
        </div>

        <div className="fee-kpi-card green">
          <div className="fee-kpi-header">
            <span className="fee-kpi-label">TODAY COLLECTION</span>
            <span className="fee-kpi-icon"><TrendingUp size={18} /></span>
          </div>
          <div className="fee-kpi-value">₹{Number(stats.todayCollection || 0).toLocaleString("en-IN")}</div>
          <div className="fee-kpi-sub">
            <span>Cash: <b>₹{Number(stats.todayCash || 0).toLocaleString("en-IN")}</b></span>
            <span className="sep">•</span>
            <span>Online: <b>₹{Number(stats.todayOnline || 0).toLocaleString("en-IN")}</b></span>
          </div>
        </div>

        <div className="fee-kpi-card red">
          <div className="fee-kpi-header">
            <span className="fee-kpi-label">PENDING FEES (ALL TIME)</span>
            <span className="fee-kpi-icon"><AlertCircle size={18} /></span>
          </div>
          <div className="fee-kpi-value">₹{Number(stats.pendingFeesAllTime || 0).toLocaleString("en-IN")}</div>
          <div className="fee-kpi-sub">
            <span className="fee-kpi-badge danger">Action Required</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="attendance-tabs-bar">
        <button
          className={`att-tab-btn ${tab === "collect" ? "active" : ""}`}
          onClick={() => setTab("collect")}
        >
          <CreditCard size={17} /> Fee Collection (POS)
        </button>
        <button
          className={`att-tab-btn ${tab === "structure" ? "active" : ""}`}
          onClick={() => setTab("structure")}
        >
          <Layers size={17} /> Fee Slabs & Configure
        </button>
        <button
          className={`att-tab-btn ${tab === "receipts" ? "active" : ""}`}
          onClick={() => setTab("receipts")}
        >
          <Receipt size={17} /> Receipts History
        </button>
        <button
          className={`att-tab-btn ${tab === "defaulters" ? "active" : ""}`}
          onClick={() => setTab("defaulters")}
        >
          <AlertCircle size={17} /> Defaulters List
        </button>
      </div>

      {/* Tab 1: Fee Collection POS */}
      {tab === "collect" && (
        <FeeCollectionCounter
          session={config?.session || "2026-2027"}
          toast={toast}
          onSuccess={(tx) => {
            loadStats();
            setActiveReceipt(tx);
          }}
          preselectedStudentId={initialStudentId}
        />
      )}

      {/* Tab 2: Fee Slabs */}
      {tab === "structure" && (
        <FeeStructureConfig
          session={config?.session || "2026-2027"}
          toast={toast}
        />
      )}

      {/* Tab 3: Receipts Ledger */}
      {tab === "receipts" && (
        <FeeReceiptsList
          session={config?.session || "2026-2027"}
          toast={toast}
          onViewReceipt={(r) => setActiveReceipt(r)}
        />
      )}

      {/* Tab 4: Defaulters */}
      {tab === "defaulters" && (
        <FeeDefaultersList
          toast={toast}
          onCollectForStudent={(s) => {
            setTab("collect");
          }}
        />
      )}

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <PrintableReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Subcomponent 1: POS Fee Collection Counter
// ----------------------------------------------------------------------
function FeeCollectionCounter({ session, toast, onSuccess, preselectedStudentId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form State
  const [period, setPeriod] = useState("April 2026");
  const [breakdown, setBreakdown] = useState([
    { head: "Tuition Fee", amount: 2500 },
    { head: "Computer & Smart Class Fee", amount: 300 },
    { head: "Examination Fee", amount: 200 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState("");
  const [fine, setFine] = useState(0);
  const [amountPaid, setAmountPaid] = useState(3000);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load students for autocomplete search
  useEffect(() => {
    (async () => {
      setLoadingStudents(true);
      try {
        const list = await api("/students");
        setAllStudents(list || []);
        if (preselectedStudentId) {
          const match = list.find((s) => s._id === preselectedStudentId);
          if (match) setSelectedStudent(match);
        }
      } catch (err) {
        console.error("Failed to load students for POS", err);
      } finally {
        setLoadingStudents(false);
      }
    })();
  }, [preselectedStudentId]);

  // When student is selected, check if there's a fee structure for their class
  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setSearchTerm("");
    try {
      const structures = await api(`/fees/structures?session=${encodeURIComponent(session)}`);
      const matched = (structures || []).find(
        (st) => Array.isArray(st.classes) && st.classes.includes(student.className)
      );
      if (matched && matched.heads?.length) {
        const heads = matched.heads.map((h) => ({
          head: h.headName,
          amount: Number(h.amount) || 0,
        }));
        // If student has transport opted, add transport fee
        if (student.transportOpted) {
          heads.push({ head: `School Transport (${student.transportStop || "Bus"})`, amount: 1200 });
        }
        setBreakdown(heads);
      }
    } catch (err) {
      console.warn("Could not load fee structure for class", err);
    }
  };

  // Calculations
  const subtotal = breakdown.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const netTotal = Math.max(0, subtotal - (Number(discount) || 0) + (Number(fine) || 0));
  const balanceDue = Math.max(0, netTotal - (Number(amountPaid) || 0));

  // Auto-set amountPaid on subtotal change if untouched
  useEffect(() => {
    setAmountPaid(netTotal);
  }, [subtotal, discount, fine]);

  // Breakdown head manipulations
  const addHead = () => {
    setBreakdown((prev) => [...prev, { head: "Other Fee", amount: 0 }]);
  };
  const removeHead = (idx) => {
    setBreakdown((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateHead = (idx, field, val) => {
    setBreakdown((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  // Filter students based on searchTerm
  const filteredStudents = searchTerm.trim()
    ? allStudents.filter(
        (s) =>
          s.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.mobile?.includes(searchTerm)
      ).slice(0, 8)
    : [];

  // Submit payment
  const handleCollect = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast?.("Please select a student first", true);
      return;
    }
    if (netTotal <= 0 && Number(amountPaid) <= 0) {
      toast?.("Payable amount cannot be zero", true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api("/fees/collect", {
        method: "POST",
        body: {
          admissionNo: selectedStudent.admissionNo,
          session,
          period,
          breakdown: breakdown.map((b) => ({
            head: b.head,
            amount: Number(b.amount) || 0,
          })),
          discount: Number(discount) || 0,
          discountReason,
          fine: Number(fine) || 0,
          amountPaid: Number(amountPaid) || 0,
          paymentMode,
          referenceNo,
        },
      });

      toast?.(`Fee receipt #${res.receiptNo} generated successfully!`);
      onSuccess?.(res);
      // Reset form slightly for next collection
      setAmountPaid(0);
      setDiscount(0);
      setFine(0);
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fee-pos-layout">
      {/* Left Column: Student Selection & Details */}
      <div className="fee-pos-sidebar">
        <div className="att-card">
          <h3 className="section-title">
            <User size={18} /> Select Student
          </h3>
          <p className="section-desc">Search by Admission No, Student Name, or Mobile Phone.</p>

          <div className="fee-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="fee-search-input"
              placeholder="Type admission no or name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {searchTerm.trim().length > 0 && (
            <div className="fee-search-results">
              {filteredStudents.length === 0 ? (
                <div className="fee-no-results">No students match "{searchTerm}"</div>
              ) : (
                filteredStudents.map((s) => (
                  <div
                    key={s._id}
                    className="fee-search-item"
                    onClick={() => handleSelectStudent(s)}
                  >
                    <div className="fee-item-avatar">
                      {s.photo ? (
                        <img src={s.photo} alt={s.name} />
                      ) : (
                        <span>{s.name.slice(0, 1)}</span>
                      )}
                    </div>
                    <div className="fee-item-info">
                      <b>{s.name}</b>
                      <span>
                        Adm #{s.admissionNo} • Class {s.className}-{s.section}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Selected Student Card */}
          {selectedStudent ? (
            <div className="fee-student-card">
              <div className="fee-student-header">
                <div className="fee-avatar-lg">
                  {selectedStudent.photo ? (
                    <img src={selectedStudent.photo} alt={selectedStudent.name} />
                  ) : (
                    <span>{selectedStudent.name.slice(0, 1)}</span>
                  )}
                </div>
                <div>
                  <h4 className="fee-student-name">{selectedStudent.name}</h4>
                  <span className="fee-adm-tag">ADM: {selectedStudent.admissionNo}</span>
                </div>
              </div>

              <div className="fee-student-meta">
                <div className="fee-meta-row">
                  <span className="meta-lbl">Class & Section:</span>
                  <b className="meta-val">
                    Class {selectedStudent.className} - {selectedStudent.section}
                  </b>
                </div>
                <div className="fee-meta-row">
                  <span className="meta-lbl">Roll No:</span>
                  <span className="meta-val">{selectedStudent.rollNo || "N/A"}</span>
                </div>
                <div className="fee-meta-row">
                  <span className="meta-lbl">Father's Name:</span>
                  <span className="meta-val">{selectedStudent.fatherName || "—"}</span>
                </div>
                <div className="fee-meta-row">
                  <span className="meta-lbl">Phone / WhatsApp:</span>
                  <span className="meta-val">{selectedStudent.mobile || "—"}</span>
                </div>
                {selectedStudent.transportOpted && (
                  <div className="fee-meta-row highlight">
                    <span className="meta-lbl">Transport Stop:</span>
                    <span className="meta-val">🚌 {selectedStudent.transportStop || "Opted"}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="btn-change-student"
                onClick={() => setSelectedStudent(null)}
              >
                Change Student
              </button>
            </div>
          ) : (
            <div className="fee-no-student-selected">
              <Sparkles size={32} />
              <p>Search or select a student from above to begin cashier collection.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: POS Billing Form */}
      <div className="fee-pos-main">
        <form onSubmit={handleCollect} className="att-card">
          <div className="fee-card-top">
            <div>
              <h3 className="section-title">
                <IndianRupee size={20} /> Fee Collection Invoice
              </h3>
              <p className="section-desc">Select fee heads, concessions, fine, and payment mode.</p>
            </div>
            <div className="fee-period-selector">
              <label>BILLING PERIOD</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="fee-period-select"
              >
                {MONTHS_LIST.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Fee Heads Table */}
          <div className="fee-heads-section">
            <div className="fee-heads-header">
              <b>FEE HEAD DETAILS</b>
              <button type="button" className="btn-add-head" onClick={addHead}>
                <Plus size={14} /> Add Head
              </button>
            </div>

            <table className="fee-heads-table">
              <thead>
                <tr>
                  <th>Particulars / Fee Head</th>
                  <th style={{ width: "160px", textAlign: "right" }}>Amount (₹)</th>
                  <th style={{ width: "50px" }}></th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        className="fee-head-input"
                        value={item.head}
                        placeholder="e.g. Tuition Fee"
                        onChange={(e) => updateHead(idx, "head", e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="fee-amount-input"
                        value={item.amount}
                        onChange={(e) => updateHead(idx, "amount", e.target.value)}
                        required
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {breakdown.length > 1 && (
                        <button
                          type="button"
                          className="btn-trash-head"
                          onClick={() => removeHead(idx)}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Box */}
          <div className="fee-calc-grid">
            <div className="fee-discounts-box">
              <div className="fee-input-row">
                <label>Discount / Concession (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="fee-calc-input"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>

              {Number(discount) > 0 && (
                <div className="fee-input-row">
                  <label>Concession Reason</label>
                  <select
                    className="fee-calc-select"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                  >
                    <option value="">Select concession reason…</option>
                    {DISCOUNT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="fee-input-row">
                <label>Late Fee / Penalty (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="fee-calc-input"
                  value={fine}
                  onChange={(e) => setFine(e.target.value)}
                />
              </div>

              <div className="fee-payment-mode-box">
                <label>Payment Mode</label>
                <div className="fee-mode-pills">
                  {PAYMENT_MODES.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`fee-mode-pill ${paymentMode === mode ? "active" : ""}`}
                      onClick={() => setPaymentMode(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {paymentMode !== "Cash" && (
                  <div className="fee-input-row mt-2">
                    <label>Transaction / UTR / Cheque Ref No</label>
                    <input
                      type="text"
                      className="fee-calc-input"
                      placeholder="e.g. UPI-1234567890 or Cheque #0045"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="fee-summary-box">
              <div className="fee-sum-line">
                <span>Subtotal (Heads):</span>
                <b>₹{subtotal.toLocaleString("en-IN")}</b>
              </div>
              {Number(discount) > 0 && (
                <div className="fee-sum-line discount">
                  <span>Concession:</span>
                  <b>- ₹{Number(discount).toLocaleString("en-IN")}</b>
                </div>
              )}
              {Number(fine) > 0 && (
                <div className="fee-sum-line fine">
                  <span>Late Fee:</span>
                  <b>+ ₹{Number(fine).toLocaleString("en-IN")}</b>
                </div>
              )}
              <div className="fee-sum-divider" />
              <div className="fee-sum-line total">
                <span>Net Payable:</span>
                <span className="net-amount">₹{netTotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="fee-paid-input-box">
                <div className="fee-paid-label-row">
                  <label>Amount Tendered / Paid (₹)</label>
                  <button
                    type="button"
                    className="btn-pay-full"
                    onClick={() => setAmountPaid(netTotal)}
                  >
                    Full Amount
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="fee-paid-input"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  required
                />
              </div>

              <div className={`fee-balance-box ${balanceDue > 0 ? "partial" : "paid"}`}>
                <span>Balance Due:</span>
                <b>₹{balanceDue.toLocaleString("en-IN")}</b>
                <span className="fee-status-badge">
                  {balanceDue === 0 ? "PAID IN FULL" : "PARTIAL PAYMENT"}
                </span>
              </div>

              <button
                type="submit"
                className="btn primary fee-submit-btn"
                disabled={submitting || !selectedStudent}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="spin" size={17} /> Processing…
                  </>
                ) : (
                  <>
                    <Printer size={17} /> Collect Fee & Generate Receipt
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Subcomponent 2: Fee Slabs / Configuration
// ----------------------------------------------------------------------
function FeeStructureConfig({ session, toast }) {
  const [structures, setStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [heads, setHeads] = useState([
    { headName: "Tuition Fee", amount: 2000 },
    { headName: "Development Charges", amount: 300 },
    { headName: "Examination Fee", amount: 200 },
  ]);
  const [saving, setSaving] = useState(false);

  const loadStructures = async () => {
    setLoading(true);
    try {
      const [stList, masters] = await Promise.all([
        api(`/fees/structures?session=${encodeURIComponent(session)}`),
        api("/masters"),
      ]);
      setStructures(stList || []);
      if (masters.classes?.length) {
        setClasses(masters.classes.filter((c) => c.active !== false).map((c) => c.name));
      }
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStructures();
  }, [session]);

  const toggleClass = (c) => {
    setSelectedClasses((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const addHead = () => {
    setHeads((prev) => [...prev, { headName: "", amount: 0 }]);
  };
  const removeHead = (i) => {
    setHeads((prev) => prev.filter((_, idx) => idx !== i));
  };
  const updateHead = (i, field, val) => {
    setHeads((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: val } : item))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast?.("Structure name is required", true);
    if (!heads.length) return toast?.("Add at least one fee head", true);

    setSaving(true);
    try {
      await api("/fees/structures", {
        method: "POST",
        body: {
          name,
          session,
          frequency,
          classes: selectedClasses,
          heads: heads.map((h) => ({
            headName: h.headName,
            amount: Number(h.amount) || 0,
          })),
        },
      });
      toast?.("Fee structure slab created successfully!");
      setShowAddModal(false);
      setName("");
      setSelectedClasses([]);
      loadStructures();
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fee-structure-page">
      <div className="att-controls-bar">
        <div>
          <b>Fee Structure Slabs</b>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
            Academic Session: {session}
          </p>
        </div>
        <button className="btn primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Create Fee Slab
        </button>
      </div>

      {loading ? (
        <div className="att-loading">
          <RefreshCw className="spin" size={24} /> Loading fee structures…
        </div>
      ) : !structures.length ? (
        <div className="att-empty">
          <Layers size={36} />
          <h3>No Fee Slabs Configured</h3>
          <p>Create class-wise fee slabs so that the cashier counter can auto-populate standard fees.</p>
          <button className="btn primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Create First Fee Slab
          </button>
        </div>
      ) : (
        <div className="fee-slab-grid">
          {structures.map((st) => (
            <div key={st._id} className="fee-slab-card">
              <div className="fee-slab-header">
                <div>
                  <h4 className="fee-slab-title">{st.name}</h4>
                  <span className="fee-freq-badge">{st.frequency?.toUpperCase()}</span>
                </div>
                <div className="fee-slab-total">₹{st.totalAmount?.toLocaleString("en-IN")}</div>
              </div>

              <div className="fee-slab-classes">
                <span className="lbl">Applicable Classes:</span>
                <div className="class-pills">
                  {st.classes?.map((c) => (
                    <span key={c} className="class-pill">
                      Class {c}
                    </span>
                  ))}
                  {(!st.classes || !st.classes.length) && (
                    <span className="class-pill all">All Classes</span>
                  )}
                </div>
              </div>

              <div className="fee-slab-breakdown">
                <table className="fee-slab-table">
                  <tbody>
                    {st.heads?.map((h, i) => (
                      <tr key={i}>
                        <td>{h.headName}</td>
                        <td style={{ textAlign: "right" }}>₹{h.amount?.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content medium">
            <div className="modal-header">
              <h3>Create Class Fee Slab</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="field-group">
                <label>Structure Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Primary Wing Monthly Fee (1 to 5)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="term">Term-wise</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="field-group">
                <label>Select Classes to Apply</label>
                <div className="class-select-grid">
                  {classes.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`class-chip-btn ${selectedClasses.includes(c) ? "active" : ""}`}
                      onClick={() => toggleClass(c)}
                    >
                      Class {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <div className="fee-heads-header">
                  <label>Fee Heads Breakdown</label>
                  <button type="button" className="btn-add-head" onClick={addHead}>
                    <Plus size={14} /> Add Head
                  </button>
                </div>
                <table className="fee-heads-table">
                  <tbody>
                    {heads.map((h, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="text"
                            placeholder="Head name..."
                            value={h.headName}
                            onChange={(e) => updateHead(idx, "headName", e.target.value)}
                            required
                          />
                        </td>
                        <td style={{ width: "140px" }}>
                          <input
                            type="number"
                            min="0"
                            placeholder="Amount"
                            value={h.amount}
                            onChange={(e) => updateHead(idx, "amount", e.target.value)}
                            required
                          />
                        </td>
                        <td style={{ width: "40px", textAlign: "center" }}>
                          {heads.length > 1 && (
                            <button
                              type="button"
                              className="btn-trash-head"
                              onClick={() => removeHead(idx)}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary" disabled={saving}>
                  {saving ? "Saving…" : "Save Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Subcomponent 3: Receipts History / Ledger
// ----------------------------------------------------------------------
function FeeReceiptsList({ session, toast, onViewReceipt }) {
  const [receipts, setReceipts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const res = await api(
        `/fees/receipts?page=${page}&limit=15&search=${encodeURIComponent(search)}&session=${encodeURIComponent(session)}`
      );
      setReceipts(res.receipts || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, [page, session]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadReceipts();
  };

  const shareReceiptWhatsApp = (r) => {
    const text = encodeURIComponent(
      `*SHREE RAM PUBLIC SCHOOL*\nOfficial Fee Receipt: *#${r.receiptNo}*\nStudent: ${r.studentName} (Adm: ${r.admissionNo})\nClass: ${r.className}-${r.section}\nAmount Paid: Rs. ${r.amountPaid}/- (${r.paymentMode})\nBalance Due: Rs. ${r.balanceDue}/-\nDate: ${new Date(r.paidAt).toLocaleDateString("en-IN")}\nThank you!`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="fee-receipts-page">
      <div className="att-controls-bar">
        <form onSubmit={handleSearchSubmit} className="fee-search-form">
          <div className="fee-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search receipt #, admission #, or student name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn">
            Search
          </button>
        </form>

        <div className="fee-receipt-count">
          Showing <b>{receipts.length}</b> of <b>{total}</b> transactions
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Date & Time</th>
              <th>Student Details</th>
              <th>Period</th>
              <th style={{ textAlign: "right" }}>Amount Paid</th>
              <th style={{ textAlign: "right" }}>Balance Due</th>
              <th>Payment Mode</th>
              <th>Status</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>
                  <RefreshCw className="spin" size={24} /> Loading transaction history…
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>
                  No fee receipts recorded matching search criteria.
                </td>
              </tr>
            ) : (
              receipts.map((r) => (
                <tr key={r._id}>
                  <td>
                    <b className="receipt-no-tag">#{r.receiptNo}</b>
                  </td>
                  <td>
                    <span className="receipt-date">
                      {new Date(r.paidAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td>
                    <div>
                      <b>{r.studentName}</b>
                      <span className="fee-row-sub">
                        Adm #{r.admissionNo} • Class {r.className}-{r.section}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="period-pill">{r.period}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <b className="paid-amount-txt">₹{r.amountPaid?.toLocaleString("en-IN")}</b>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className={`bal-amount-txt ${r.balanceDue > 0 ? "due" : ""}`}>
                      ₹{r.balanceDue?.toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td>
                    <span className="mode-pill">{r.paymentMode}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${r.status}`}>
                      {r.status === "paid" ? "PAID" : "PARTIAL"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div className="fee-actions-cell">
                      <button
                        className="btn-icon-action"
                        title="View & Print Official Receipt"
                        onClick={() => onViewReceipt(r)}
                      >
                        <Printer size={15} />
                      </button>
                      <button
                        className="btn-icon-action whatsapp"
                        title="Share Slip on WhatsApp"
                        onClick={() => shareReceiptWhatsApp(r)}
                      >
                        <MessageCircle size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="pagination-bar">
          <button
            className="btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>
            Page <b>{page}</b> of <b>{Math.ceil(total / 15)}</b>
          </span>
          <button
            className="btn"
            disabled={page * 15 >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Subcomponent 4: Defaulters List
// ----------------------------------------------------------------------
function FeeDefaultersList({ toast, onCollectForStudent }) {
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDefaulters = async () => {
    setLoading(true);
    try {
      const list = await api("/fees/defaulters");
      setDefaulters(list || []);
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDefaulters();
  }, []);

  const totalDue = defaulters.reduce((sum, d) => sum + (d.balanceDue || 0), 0);

  const sendWhatsAppReminder = (d) => {
    const message = encodeURIComponent(
      `*REMINDER: SCHOOL FEE PAYMENT*\nDear Parent,\nThis is a gentle reminder from *SHREE RAM PUBLIC SCHOOL* that a fee balance of *₹${d.balanceDue?.toLocaleString("en-IN")}* is pending for your ward *${d.studentName}* (Adm No: ${d.admissionNo}, Class: ${d.className}-${d.section}).\n\nPlease clear the outstanding dues at the school accounts desk or online at your earliest.\nThank you,\nAccounts Office, SRPS`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="fee-defaulters-page">
      <div className="defaulters-header-summary">
        <div>
          <b>Fee Defaulters & Pending Balances</b>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
            Students with outstanding balances from recent fee transactions.
          </p>
        </div>
        <div className="defaulters-total-stat">
          <span>Total Pending Amount:</span>
          <b>₹{totalDue.toLocaleString("en-IN")}</b>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Admission No</th>
              <th>Class & Section</th>
              <th>Period</th>
              <th style={{ textAlign: "right" }}>Total Bill</th>
              <th style={{ textAlign: "right" }}>Amount Paid</th>
              <th style={{ textAlign: "right" }}>Pending Balance</th>
              <th>Last Paid Date</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>
                  <RefreshCw className="spin" size={24} /> Loading defaulters list…
                </td>
              </tr>
            ) : defaulters.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>
                  <CheckCircle2 size={32} style={{ color: "var(--brand-emerald)" }} />
                  <h4>No Outstanding Defaulters!</h4>
                  <p>All recorded fee invoices are currently fully cleared.</p>
                </td>
              </tr>
            ) : (
              defaulters.map((d) => (
                <tr key={d._id}>
                  <td>
                    <b>{d.studentName}</b>
                  </td>
                  <td>
                    <span className="att-adm-code">{d.admissionNo}</span>
                  </td>
                  <td>
                    Class {d.className}-{d.section}
                  </td>
                  <td>{d.period}</td>
                  <td style={{ textAlign: "right" }}>₹{d.totalAmount?.toLocaleString("en-IN")}</td>
                  <td style={{ textAlign: "right" }}>₹{d.amountPaid?.toLocaleString("en-IN")}</td>
                  <td style={{ textAlign: "right" }}>
                    <b className="due-amount-badge">₹{d.balanceDue?.toLocaleString("en-IN")}</b>
                  </td>
                  <td>{new Date(d.paidAt).toLocaleDateString("en-IN")}</td>
                  <td style={{ textAlign: "center" }}>
                    <div className="fee-actions-cell">
                      <button
                        className="btn-wa-reminder"
                        onClick={() => sendWhatsAppReminder(d)}
                        title="Send WhatsApp payment reminder"
                      >
                        <MessageCircle size={14} /> WhatsApp Notice
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Subcomponent 5: Printable Receipt Modal (A4 & 3-Inch Thermal Roll)
// ----------------------------------------------------------------------
function PrintableReceiptModal({ receipt, onClose }) {
  const [printFormat, setPrintFormat] = useState("a4"); // a4 | thermal
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const receiptPrintRef = useRef(null);

  useEffect(() => {
    if (receipt) {
      const verifyData = `SRPS-FEE-VERIFY|REC:${receipt.receiptNo}|ADM:${receipt.admissionNo}|AMT:${receipt.amountPaid}|DATE:${new Date(receipt.paidAt).toISOString()}`;
      QRCode.toDataURL(verifyData, { width: 140, margin: 1 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("QR Code generation error", err));
    }
  }, [receipt]);

  const handlePrint = () => {
    window.print();
  };

  if (!receipt) return null;

  return (
    <div className="modal-backdrop receipt-modal-backdrop">
      <div className={`receipt-modal-dialog ${printFormat}`}>
        {/* Modal Toolbar (hidden during print) */}
        <div className="receipt-toolbar no-print">
          <div className="receipt-format-toggle">
            <button
              className={`format-btn ${printFormat === "a4" ? "active" : ""}`}
              onClick={() => setPrintFormat("a4")}
            >
              Official A4 / A5 Slip
            </button>
            <button
              className={`format-btn ${printFormat === "thermal" ? "active" : ""}`}
              onClick={() => setPrintFormat("thermal")}
            >
              3-Inch Thermal Roll (80mm)
            </button>
          </div>

          <div className="receipt-toolbar-actions">
            <button className="btn primary print-trigger-btn" onClick={handlePrint}>
              <Printer size={16} /> Print Receipt
            </button>
            <button className="btn-close-receipt" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable View Container */}
        <div className="receipt-scroll-container">
          {printFormat === "a4" ? (
            /* ==========================================================
               A4 / A5 OFFICIAL FEE RECEIPT
               ========================================================== */
            <div className="receipt-paper a4" ref={receiptPrintRef}>
              <div className="receipt-watermark">SRPS</div>

              {/* Header */}
              <div className="receipt-header">
                <img
                  src="/anvayrobo-logo.jpeg"
                  alt="SRPS Logo"
                  className="receipt-logo"
                />
                <div className="receipt-title-block">
                  <h2>SHREE RAM PUBLIC SCHOOL</h2>
                  <p className="receipt-subtitle">
                    Affiliated to CBSE, New Delhi • Senior Secondary
                  </p>
                  <p className="receipt-contact">
                    Main Campus, City Road • Phone: +91 8340202627 • Email: srpskanhra@gmail.com
                  </p>
                  <div className="receipt-badge-title">OFFICIAL FEE RECEIPT</div>
                </div>
                {qrCodeUrl && (
                  <div className="receipt-qr-block">
                    <img src={qrCodeUrl} alt="Receipt QR Verification" />
                    <span>Scan to Verify</span>
                  </div>
                )}
              </div>

              {/* Meta details bar */}
              <div className="receipt-meta-grid">
                <div>
                  <span className="lbl">RECEIPT NO:</span>
                  <b className="val highlight">#{receipt.receiptNo}</b>
                </div>
                <div>
                  <span className="lbl">DATE & TIME:</span>
                  <span className="val">
                    {new Date(receipt.paidAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div>
                  <span className="lbl">ACADEMIC SESSION:</span>
                  <span className="val">{receipt.session || "2026-2027"}</span>
                </div>
                <div>
                  <span className="lbl">BILLING PERIOD:</span>
                  <span className="val highlight">{receipt.period}</span>
                </div>
              </div>

              {/* Student info box */}
              <div className="receipt-student-box">
                <div className="student-line">
                  <span>Student Name:</span>
                  <b>{receipt.studentName}</b>
                </div>
                <div className="student-line">
                  <span>Admission No:</span>
                  <b>{receipt.admissionNo}</b>
                </div>
                <div className="student-line">
                  <span>Class & Section:</span>
                  <b>Class {receipt.className} - {receipt.section}</b>
                </div>
                <div className="student-line">
                  <span>Payment Mode:</span>
                  <b>{receipt.paymentMode} {receipt.referenceNo ? `(${receipt.referenceNo})` : ""}</b>
                </div>
              </div>

              {/* Fee Items Table */}
              <table className="receipt-items-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Particulars / Fee Head</th>
                    <th style={{ width: "160px", textAlign: "right" }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.breakdown?.map((b, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{b.head}</td>
                      <td style={{ textAlign: "right" }}>₹{Number(b.amount || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" style={{ textAlign: "right" }}><b>Subtotal:</b></td>
                    <td style={{ textAlign: "right" }}><b>₹{Number(receipt.subtotal || 0).toLocaleString("en-IN")}</b></td>
                  </tr>
                  {Number(receipt.discount || 0) > 0 && (
                    <tr>
                      <td colSpan="2" style={{ textAlign: "right" }}>
                        Concession / Discount {receipt.discountReason ? `(${receipt.discountReason})` : ""}:
                      </td>
                      <td style={{ textAlign: "right" }}>- ₹{Number(receipt.discount).toLocaleString("en-IN")}</td>
                    </tr>
                  )}
                  {Number(receipt.fine || 0) > 0 && (
                    <tr>
                      <td colSpan="2" style={{ textAlign: "right" }}>Late Fee / Penalty:</td>
                      <td style={{ textAlign: "right" }}>+ ₹{Number(receipt.fine).toLocaleString("en-IN")}</td>
                    </tr>
                  )}
                  <tr className="receipt-total-row">
                    <td colSpan="2" style={{ textAlign: "right" }}><b>NET PAYABLE:</b></td>
                    <td style={{ textAlign: "right" }}><b>₹{Number(receipt.totalAmount || 0).toLocaleString("en-IN")}</b></td>
                  </tr>
                  <tr className="receipt-paid-row">
                    <td colSpan="2" style={{ textAlign: "right" }}><b>AMOUNT RECEIVED:</b></td>
                    <td style={{ textAlign: "right" }}><b>₹{Number(receipt.amountPaid || 0).toLocaleString("en-IN")}</b></td>
                  </tr>
                  {Number(receipt.balanceDue || 0) > 0 && (
                    <tr className="receipt-due-row">
                      <td colSpan="2" style={{ textAlign: "right" }}><b>BALANCE DUE:</b></td>
                      <td style={{ textAlign: "right" }}><b>₹{Number(receipt.balanceDue).toLocaleString("en-IN")}</b></td>
                    </tr>
                  )}
                </tfoot>
              </table>

              {/* Terms and Signatures */}
              <div className="receipt-footer">
                <div className="receipt-notes">
                  <p><b>Note:</b> Fees once deposited are non-refundable and non-transferable.</p>
                  <p>Computer generated invoice, requires no manual alteration.</p>
                </div>
                <div className="receipt-signatures">
                  <div className="sign-box">
                    <div className="sign-line"></div>
                    <span>Depositor Signature</span>
                  </div>
                  <div className="sign-box">
                    <div className="sign-line"></div>
                    <span>Cashier / Accounts Officer</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ==========================================================
               3-INCH THERMAL ROLL POS RECEIPT (80mm)
               ========================================================== */
            <div className="receipt-paper thermal" ref={receiptPrintRef}>
              <div className="thermal-header">
                <h3>SHREE RAM PUBLIC SCHOOL</h3>
                <p>CBSE Affiliated • Sr. Secondary</p>
                <p>Phone: +91 8340202627</p>
                <div className="thermal-divider" />
                <b>FEE CASH RECEIPT</b>
                <div className="thermal-divider" />
              </div>

              <div className="thermal-meta">
                <div><span>Receipt No:</span> <b>#{receipt.receiptNo}</b></div>
                <div><span>Date:</span> {new Date(receipt.paidAt).toLocaleDateString("en-IN")}</div>
                <div><span>Student:</span> <b>{receipt.studentName}</b></div>
                <div><span>Adm No:</span> {receipt.admissionNo}</div>
                <div><span>Class:</span> {receipt.className}-{receipt.section}</div>
                <div><span>Period:</span> {receipt.period}</div>
                <div><span>Mode:</span> {receipt.paymentMode}</div>
              </div>

              <div className="thermal-divider" />

              <table className="thermal-table">
                <thead>
                  <tr>
                    <th>Particulars</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.breakdown?.map((b, i) => (
                    <tr key={i}>
                      <td>{b.head}</td>
                      <td style={{ textAlign: "right" }}>₹{Number(b.amount || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="thermal-divider" />

              <div className="thermal-totals">
                <div><span>Subtotal:</span> ₹{Number(receipt.subtotal || 0).toLocaleString("en-IN")}</div>
                {Number(receipt.discount || 0) > 0 && (
                  <div><span>Concession:</span> -₹{Number(receipt.discount).toLocaleString("en-IN")}</div>
                )}
                {Number(receipt.fine || 0) > 0 && (
                  <div><span>Fine:</span> +₹{Number(receipt.fine).toLocaleString("en-IN")}</div>
                )}
                <div className="thermal-grand">
                  <span>TOTAL PAID:</span>
                  <b>₹{Number(receipt.amountPaid || 0).toLocaleString("en-IN")}</b>
                </div>
                {Number(receipt.balanceDue || 0) > 0 && (
                  <div className="thermal-due">
                    <span>BALANCE DUE:</span>
                    <b>₹{Number(receipt.balanceDue).toLocaleString("en-IN")}</b>
                  </div>
                )}
              </div>

              <div className="thermal-divider" />

              {qrCodeUrl && (
                <div className="thermal-qr">
                  <img src={qrCodeUrl} alt="Thermal QR" />
                </div>
              )}

              <div className="thermal-footer">
                <p>Fees non-refundable.</p>
                <p>Thank you for choosing SRPS!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
