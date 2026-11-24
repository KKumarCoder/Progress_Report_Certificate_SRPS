import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Layers,
  Receipt,
  Plus,
  Trash2,
  Printer,
  Search,
  IndianRupee,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  X,
  MessageCircle,
  Wallet,
  TrendingUp,
  Sparkles,
  Filter,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit,
  Copy,
  Download,
  Upload,
  ShieldCheck,
  Tag,
  ArrowRight,
  UserCheck,
  Users,
  Check,
  Bus,
  Settings,
  ArrowLeft,
  FileSpreadsheet,
} from "lucide-react";
import QRCode from "qrcode";
import { api, isDemo } from "./api";

const MONTHS_LIST_12 = [
  "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
];

const FULL_MONTHS_NAMES = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March"
];

function numToWords(n) {
  const num = Number(n);
  if (!num || isNaN(num)) return "Zero Rupees Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function convert(val) {
    if (val < 20) return a[val];
    if (val < 100) return b[Math.floor(val / 10)] + (val % 10 !== 0 ? " " + a[val % 10] : "");
    if (val < 1000) return a[Math.floor(val / 100)] + " Hundred" + (val % 100 !== 0 ? " and " + convert(val % 100) : "");
    if (val < 100000) return convert(Math.floor(val / 1000)) + " Thousand" + (val % 1000 !== 0 ? " " + convert(val % 1000) : "");
    if (val < 10000000) return convert(Math.floor(val / 100000)) + " Lakh" + (val % 100000 !== 0 ? " " + convert(val % 100000) : "");
    return convert(Math.floor(val / 10000000)) + " Crore" + (val % 10000000 !== 0 ? " " + convert(val % 10000000) : "");
  }
  return `Rupees ${convert(Math.floor(num))} Only`;
}

// ----------------------------------------------------------------------
// Main Fees Module Component
// ----------------------------------------------------------------------
export default function Fees({
  user,
  config,
  toast,
  initialStudentId = null,
  initialTab = "receipt",
  onTabChange,
}) {
  // Normalize tab
  const getNormalizedTab = (t) => {
    if (["collect", "receipt", "receipts"].includes(t)) return "receipt";
    if (["structure", "configure"].includes(t)) return "configure";
    if (["revert", "reverts"].includes(t)) return "revert";
    if (["discounts", "discount"].includes(t)) return "discounts";
    if (["demand", "demand-bill"].includes(t)) return "demand";
    if (["carry-forward"].includes(t)) return "carry-forward";
    if (["assign"].includes(t)) return "assign";
    if (["approvals"].includes(t)) return "approvals";
    if (["defaulters"].includes(t)) return "defaulters";
    return "receipt";
  };

  const [activeModule, setActiveModule] = useState(() => getNormalizedTab(initialTab));
  const [activeReceipt, setActiveReceipt] = useState(null);

  useEffect(() => {
    if (initialTab) {
      setActiveModule(getNormalizedTab(initialTab));
    }
  }, [initialTab]);

  const handleSelectModule = (mod) => {
    setActiveModule(mod);
    onTabChange?.(mod);
  };

  return (
    <div className="fees-erp-container">
      {/* Top Header Navigation Pills */}
      <div className="fee-top-subnav no-print">
        <button
          className={`fee-subnav-btn ${activeModule === "configure" ? "active" : ""}`}
          onClick={() => handleSelectModule("configure")}
        >
          <Settings size={15} /> Fees Configure
        </button>
        <button
          className={`fee-subnav-btn ${activeModule === "receipt" ? "active" : ""}`}
          onClick={() => handleSelectModule("receipt")}
        >
          <CreditCard size={15} /> Fees Receipt & POS
        </button>
        <button
          className={`fee-subnav-btn ${activeModule === "revert" ? "active" : ""}`}
          onClick={() => handleSelectModule("revert")}
        >
          <RefreshCw size={15} /> Payment Revert
        </button>
        <button
          className={`fee-subnav-btn ${activeModule === "discounts" ? "active" : ""}`}
          onClick={() => handleSelectModule("discounts")}
        >
          <Tag size={15} /> Discount Fees
        </button>
        <button
          className={`fee-subnav-btn ${activeModule === "demand" ? "active" : ""}`}
          onClick={() => handleSelectModule("demand")}
        >
          <FileText size={15} /> Demand Bill
        </button>
        <button
          className={`fee-subnav-btn ${activeModule === "carry-forward" ? "active" : ""}`}
          onClick={() => handleSelectModule("carry-forward")}
        >
          <ArrowRight size={15} /> Carry Forward
        </button>
        <button
          className={`fee-subnav-btn ${activeModule === "assign" ? "active" : ""}`}
          onClick={() => handleSelectModule("assign")}
        >
          <CheckCircle2 size={15} /> Assign Fees
        </button>
        <button
          className={`fee-subnav-btn ${activeModule === "approvals" ? "active" : ""}`}
          onClick={() => handleSelectModule("approvals")}
        >
          <ShieldCheck size={15} /> Fee Approvals
        </button>
      </div>

      {/* 1. Fees Configure */}
      {activeModule === "configure" && (
        <FeesConfigure
          session={config?.session || "2026-2027"}
          toast={toast}
        />
      )}

      {/* 2. Fees Receipt & POS */}
      {activeModule === "receipt" && (
        <FeesReceiptConsole
          session={config?.session || "2026-2027"}
          toast={toast}
          initialStudentId={initialStudentId}
          onOpenReceipt={(r) => setActiveReceipt(r)}
        />
      )}

      {/* 3. Payment Revert */}
      {activeModule === "revert" && (
        <PaymentRevertConsole
          session={config?.session || "2026-2027"}
          toast={toast}
          onOpenReceipt={(r) => setActiveReceipt(r)}
        />
      )}

      {/* 4. Discount Fees Report */}
      {activeModule === "discounts" && (
        <DiscountFeesReport
          session={config?.session || "2026-2027"}
          toast={toast}
        />
      )}

      {/* 5. Demand Bill */}
      {activeModule === "demand" && (
        <DemandBillConsole
          session={config?.session || "2026-2027"}
          toast={toast}
        />
      )}

      {/* 6. Fees Carry Forward */}
      {activeModule === "carry-forward" && (
        <FeesCarryForward
          session={config?.session || "2026-2027"}
          toast={toast}
        />
      )}

      {/* 7. Assign Fees */}
      {activeModule === "assign" && (
        <FeeAssignmentConsole
          session={config?.session || "2026-2027"}
          toast={toast}
        />
      )}

      {/* 8. Fee Approvals */}
      {activeModule === "approvals" && (
        <FeeApprovalsConsole
          session={config?.session || "2026-2027"}
          toast={toast}
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

// ======================================================================
// MODULE 1: Fees Configure (Screenshot 1, 2, 3)
// Tabs: Fees Head | Frequency | Fees Plan
// ======================================================================
function FeesConfigure({ session, toast }) {
  const [tab, setTab] = useState("heads"); // heads | frequency | plans

  return (
    <div className="fee-console-wrap">
      {/* Console Header Banner */}
      <div className="fee-console-banner">
        <div className="banner-left">
          <div className="banner-badge-row">
            <span className="session-active-pill">{session} Active</span>
          </div>
          <h2>Fees Configuration Console</h2>
          <p>Configure fee heads, payment frequencies, bank accounts, and class fees plans.</p>
        </div>
        <div className="banner-right">
          <button className="btn-banner-action" onClick={() => window.location.reload()}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Console Sub Tabs */}
      <div className="console-tabs-strip">
        <button
          className={`console-tab-item ${tab === "heads" ? "active" : ""}`}
          onClick={() => setTab("heads")}
        >
          <Layers size={16} /> Fees Head
        </button>
        <button
          className={`console-tab-item ${tab === "frequency" ? "active" : ""}`}
          onClick={() => setTab("frequency")}
        >
          <Clock size={16} /> Frequency
        </button>
        <button
          className={`console-tab-item ${tab === "plans" ? "active" : ""}`}
          onClick={() => setTab("plans")}
        >
          <Calendar size={16} /> Fees Plan
        </button>
      </div>

      {tab === "heads" && <FeesHeadSection session={session} toast={toast} />}
      {tab === "frequency" && <FeesFrequencySection toast={toast} />}
      {tab === "plans" && <FeesPlanSection session={session} toast={toast} />}
    </div>
  );
}

// 1.1 Fees Head Tab (Screenshot 1)
function FeesHeadSection({ session, toast }) {
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Form State
  const [headName, setHeadName] = useState("");
  const [groupName, setGroupName] = useState("TUITION FEE");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [accountName, setAccountName] = useState("TUITION FEE");
  const [selectedMonths, setSelectedMonths] = useState([...MONTHS_LIST_12]);
  const [editingId, setEditingId] = useState(null);

  const loadHeads = async () => {
    setLoading(true);
    try {
      const res = await api(`/fees/heads?session=${session}`);
      setHeads(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeads();
  }, [session]);

  const toggleMonth = (m) => {
    if (selectedMonths.includes(m)) {
      setSelectedMonths(selectedMonths.filter((x) => x !== m));
    } else {
      setSelectedMonths([...selectedMonths, m]);
    }
  };

  const toggleSelectAllMonths = () => {
    if (selectedMonths.length === MONTHS_LIST_12.length) {
      setSelectedMonths([]);
    } else {
      setSelectedMonths([...MONTHS_LIST_12]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!headName.trim()) {
      toast?.("Fees Head name is required", true);
      return;
    }
    try {
      await api("/fees/heads", {
        method: "POST",
        body: {
          id: editingId,
          name: headName,
          groupName,
          frequency,
          accountName,
          months: selectedMonths,
          session,
        },
      });
      toast?.(editingId ? "Fees Heading updated" : "Fees Heading added successfully");
      setHeadName("");
      setEditingId(null);
      loadHeads();
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  const handleEdit = (h) => {
    setEditingId(h._id);
    setHeadName(h.name);
    setGroupName(h.groupName || "TUITION FEE");
    setFrequency(h.frequency || "MONTHLY");
    setAccountName(h.accountName || "TUITION FEE");
    setSelectedMonths(h.months?.length ? h.months : [...MONTHS_LIST_12]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this fee head?")) return;
    try {
      await api(`/fees/heads/${id}`, { method: "DELETE" });
      toast?.("Fees Heading deleted");
      loadHeads();
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  const filtered = heads.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.groupName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fee-card-stack">
      {/* Form Card */}
      <form onSubmit={handleSave} className="erp-white-card">
        <div className="card-top-title">
          <span className="bullet-dot" />
          <h3>{editingId ? "Edit Fees Heading" : "+ Add New Fees Heading"}</h3>
        </div>

        <div className="form-row-4col">
          <div className="form-group">
            <label>FEES HEAD <span className="req">*</span></label>
            <input
              type="text"
              className="erp-input"
              placeholder="e.g., Tuition Fee"
              value={headName}
              onChange={(e) => setHeadName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>GROUP NAME <span className="req">*</span></label>
            <div className="input-with-action">
              <select
                className="erp-select"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              >
                <option value="TUITION FEE">TUITION FEE</option>
                <option value="ADMISSION FEE">ADMISSION FEE</option>
                <option value="EXAMINATION FEE">EXAMINATION FEE</option>
                <option value="REGISTRATION FEE">REGISTRATION FEE</option>
                <option value="TRANSPORT FEE">TRANSPORT FEE</option>
                <option value="HOSTEL FEE">HOSTEL FEE</option>
                <option value="ID CARD">ID CARD</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>FREQUENCY <span className="req">*</span></label>
            <select
              className="erp-select"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="MONTHLY">MONTHLY</option>
              <option value="ONE TIME">ONE TIME</option>
              <option value="QUARTLY">QUARTLY</option>
              <option value="ANNUALLY">ANNUALLY</option>
            </select>
          </div>

          <div className="form-group">
            <label>ACCOUNT NAME <span className="req">*</span></label>
            <select
              className="erp-select"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            >
              <option value="TUITION FEE">TUITION FEE</option>
              <option value="ADMISSION FEE">ADMISSION FEE</option>
              <option value="SCHOOL MAIN A/C">SCHOOL MAIN A/C</option>
              <option value="CANARA BANK A/C">CANARA BANK A/C</option>
            </select>
          </div>
        </div>

        {/* 12 Month Selector Row */}
        <div className="month-selector-block">
          <div className="month-selector-head">
            <label>SELECT MONTHS <span className="req">*</span></label>
            <button
              type="button"
              className="btn-select-all-toggle"
              onClick={toggleSelectAllMonths}
            >
              <span className={`toggle-switch ${selectedMonths.length === MONTHS_LIST_12.length ? "on" : ""}`} />
              <span>Select All</span>
            </button>
          </div>

          <div className="month-pills-row">
            {MONTHS_LIST_12.map((m) => {
              const active = selectedMonths.includes(m);
              return (
                <button
                  type="button"
                  key={m}
                  className={`month-cell-box ${active ? "selected" : ""}`}
                  onClick={() => toggleMonth(m)}
                >
                  <span className="m-name">{m}</span>
                  <span className={`m-dot ${active ? "active" : ""}`} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-actions-right">
          {editingId && (
            <button
              type="button"
              className="btn-cancel-edit"
              onClick={() => {
                setEditingId(null);
                setHeadName("");
              }}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-erp-save blue">
            💾 Save Heading
          </button>
        </div>
      </form>

      {/* List Table Card */}
      <div className="erp-white-card">
        <div className="card-top-title">
          <span className="bullet-dot" />
          <h3>Fees Heads List</h3>
        </div>

        <div className="table-filter-bar">
          <div className="table-search-box">
            <span>Search:</span>
            <input
              type="text"
              placeholder="Filter headings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-export-btns">
            <button className="btn-export">📋 Copy</button>
            <button className="btn-export">📊 Excel</button>
            <button className="btn-export">📄 CSV</button>
            <button className="btn-export">📕 PDF</button>
            <button className="btn-export">🖨 Print</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="erp-table head-matrix-table">
            <thead>
              <tr>
                <th>FEES HEADING</th>
                <th>GROUP</th>
                <th>ACCOUNT</th>
                <th>FREQUENCY</th>
                {MONTHS_LIST_12.map((m) => (
                  <th key={m} style={{ width: "36px", textAlign: "center" }}>
                    {m.toUpperCase()}
                  </th>
                ))}
                <th style={{ width: "80px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h._id}>
                  <td><b>{h.name}</b></td>
                  <td><span className="pill-neutral">{h.groupName}</span></td>
                  <td><span className="pill-cyan">{h.accountName}</span></td>
                  <td><span className="pill-green">{h.frequency}</span></td>
                  {MONTHS_LIST_12.map((m) => {
                    const active = (h.months || []).includes(m);
                    return (
                      <td key={m} style={{ textAlign: "center" }}>
                        {active ? (
                          <span className="matrix-check">✓</span>
                        ) : (
                          <span className="matrix-empty">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: "center" }}>
                    <div className="action-icons">
                      <button className="icon-edit" onClick={() => handleEdit(h)}>
                        <Edit size={14} />
                      </button>
                      <button className="icon-trash" onClick={() => handleDelete(h._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={17} style={{ textAlign: "center", padding: "24px" }}>
                    No fee headings configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 1.2 Frequency Tab (Screenshot 2)
function FeesFrequencySection({ toast }) {
  const [freqs, setFreqs] = useState([]);
  const [freqName, setFreqName] = useState("");
  const [selectedMonths, setSelectedMonths] = useState([...MONTHS_LIST_12]);
  const [search, setSearch] = useState("");

  const loadFreqs = async () => {
    try {
      const res = await api("/fees/frequencies");
      setFreqs(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFreqs();
  }, []);

  const toggleMonth = (m) => {
    if (selectedMonths.includes(m)) {
      setSelectedMonths(selectedMonths.filter((x) => x !== m));
    } else {
      setSelectedMonths([...selectedMonths, m]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!freqName.trim()) {
      toast?.("Frequency name required", true);
      return;
    }
    try {
      await api("/fees/frequencies", {
        method: "POST",
        body: { name: freqName, months: selectedMonths },
      });
      toast?.("Frequency saved");
      setFreqName("");
      loadFreqs();
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this frequency?")) return;
    try {
      await api(`/fees/frequencies/${id}`, { method: "DELETE" });
      toast?.("Frequency deleted");
      loadFreqs();
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  return (
    <div className="fee-two-col-grid">
      {/* Left Column: Add Frequency */}
      <form onSubmit={handleSave} className="erp-white-card">
        <div className="card-top-title">
          <Clock size={16} style={{ color: "#10b981" }} />
          <h3>Add Frequency</h3>
        </div>

        <div className="form-group" style={{ marginBottom: "16px" }}>
          <label>FREQUENCY NAME <span className="req">*</span></label>
          <input
            type="text"
            className="erp-input"
            placeholder="e.g., Monthly, Annually"
            value={freqName}
            onChange={(e) => setFreqName(e.target.value)}
            required
          />
        </div>

        <div className="month-selector-block" style={{ marginBottom: "20px" }}>
          <div className="month-selector-head">
            <label>SELECT MONTHS</label>
            <button
              type="button"
              className="btn-select-all-toggle"
              onClick={() => {
                if (selectedMonths.length === MONTHS_LIST_12.length) setSelectedMonths([]);
                else setSelectedMonths([...MONTHS_LIST_12]);
              }}
            >
              <span className={`toggle-switch ${selectedMonths.length === MONTHS_LIST_12.length ? "on" : ""}`} />
              <span>Select All</span>
            </button>
          </div>

          <div className="month-pills-row">
            {MONTHS_LIST_12.map((m) => {
              const active = selectedMonths.includes(m);
              return (
                <button
                  type="button"
                  key={m}
                  className={`month-cell-box ${active ? "selected" : ""}`}
                  onClick={() => toggleMonth(m)}
                >
                  <span className="m-name">{m}</span>
                  <span className={`m-dot ${active ? "active" : ""}`} />
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" className="btn-erp-save green full-width">
          💾 Save Frequency
        </button>
      </form>

      {/* Right Column: Configured Frequencies List */}
      <div className="erp-white-card">
        <div className="card-top-title">
          <Layers size={16} style={{ color: "#3b82f6" }} />
          <h3>Configured Frequencies</h3>
        </div>

        <div className="table-filter-bar">
          <div className="entries-select">
            <span>Show</span>
            <select className="erp-select-compact"><option>25</option></select>
            <span>entries</span>
          </div>
          <div className="table-search-box">
            <span>Search:</span>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="erp-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>#</th>
              <th>FREQUENCY NAME</th>
              <th>MONTHS</th>
              <th style={{ width: "60px", textAlign: "center" }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {freqs.map((f, i) => (
              <tr key={f._id || i}>
                <td>{i + 1}</td>
                <td><b>{f.name}</b></td>
                <td>
                  <div className="pills-wrap">
                    {(f.months || []).map((m) => (
                      <span key={m} className="pill-cyan">{m}</span>
                    ))}
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>
                  <div className="action-icons">
                    <button className="icon-trash" onClick={() => handleDelete(f._id)}>
                      <Trash2 size={14} />
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

// 1.3 Fees Plan Tab (Screenshot 3)
function FeesPlanSection({ session, toast }) {
  const [plans, setPlans] = useState([]);
  const [heads, setHeads] = useState([]);
  const [search, setSearch] = useState("");

  // Form State
  const [heading, setHeading] = useState("");
  const [selectedClasses, setSelectedClasses] = useState(["1 st"]);
  const [dueDate, setDueDate] = useState("2026-04-10");
  const [category, setCategory] = useState("NA");
  const [amount, setAmount] = useState("");

  const loadData = async () => {
    try {
      const [pRes, hRes] = await Promise.all([
        api(`/fees/plans?session=${session}`),
        api(`/fees/heads?session=${session}`),
      ]);
      setPlans(pRes || []);
      setHeads(hRes || []);
      if (hRes?.length) setHeading(hRes[0].name);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [session]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!heading || !amount) {
      toast?.("Heading and Amount required", true);
      return;
    }
    try {
      await api("/fees/plans", {
        method: "POST",
        body: {
          heading,
          classes: selectedClasses,
          dueDate,
          category,
          amount: Number(amount),
          session,
        },
      });
      toast?.("Fees Plan saved");
      setAmount("");
      loadData();
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this fee plan?")) return;
    try {
      await api(`/fees/plans/${id}`, { method: "DELETE" });
      toast?.("Fees Plan deleted");
      loadData();
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  const AVAILABLE_CLASSES = [
    "Balvatika_1", "Balvatika_2", "Balvatika_3",
    "1 st", "2 nd", "3 rd", "4 th", "5 th",
    "6 th", "7 th", "8 th", "9 th", "10 th", "11 th", "12 th"
  ];

  const toggleClassSelect = (c) => {
    if (selectedClasses.includes(c)) {
      setSelectedClasses(selectedClasses.filter((x) => x !== c));
    } else {
      setSelectedClasses([...selectedClasses, c]);
    }
  };

  const filtered = plans.filter((p) =>
    p.heading?.toLowerCase().includes(search.toLowerCase()) ||
    p.classes?.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fee-two-col-grid plans-layout">
      {/* Left Column: Add Fees Plan */}
      <form onSubmit={handleSave} className="erp-white-card">
        <div className="card-top-title">
          <FileText size={16} style={{ color: "#2563eb" }} />
          <h3>Add Fees Plan</h3>
        </div>

        <div className="form-group" style={{ marginBottom: "14px" }}>
          <label>FEES HEADING <span className="req">*</span></label>
          <select
            className="erp-select"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            required
          >
            {heads.map((h) => (
              <option key={h._id} value={h.name}>{h.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: "14px" }}>
          <label>CLASS <span className="req">*</span></label>
          <div className="classes-picker-wrap">
            {AVAILABLE_CLASSES.map((c) => (
              <button
                type="button"
                key={c}
                className={`class-chip-toggle ${selectedClasses.includes(c) ? "selected" : ""}`}
                onClick={() => toggleClassSelect(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "14px" }}>
          <label>DUE DATE</label>
          <input
            type="date"
            className="erp-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: "14px" }}>
          <label>CATEGORY</label>
          <select
            className="erp-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="NA">NA</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="RTE">RTE</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label>FEES VALUE <span className="req">*</span></label>
          <input
            type="number"
            step="0.01"
            className="erp-input"
            placeholder="e.g., 500.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-erp-save sky-blue full-width">
          💾 Save Plan
        </button>
      </form>

      {/* Right Column: Fees Plans List */}
      <div className="erp-white-card">
        <div className="card-top-title">
          <Calendar size={16} style={{ color: "#06b6d4" }} />
          <h3>Fees Plans List</h3>
        </div>

        <div className="table-filter-bar">
          <div className="table-search-box">
            <span>Search:</span>
            <input
              type="text"
              placeholder="Search plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-export-btns">
            <button className="btn-export">📋 Copy</button>
            <button className="btn-export">📊 Excel</button>
            <button className="btn-export">📄 CSV</button>
            <button className="btn-export">📕 PDF</button>
            <button className="btn-export">🖨 Print</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>FEES HEAD</th>
                <th>CLASSES</th>
                <th>CATEGORIES</th>
                <th style={{ textAlign: "right" }}>VALUE</th>
                <th>DUE DATE</th>
                <th style={{ width: "60px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td><b>{p.heading}</b></td>
                  <td>
                    <div className="pills-wrap">
                      {(p.classes || []).map((c) => (
                        <span key={c} className="pill-class-badge">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td><span className="pill-neutral">{p.category || "NA"}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <b>₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</b>
                  </td>
                  <td>
                    <span className="due-date-pill">📅 {p.dueDate || "10 Apr 2026"}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div className="action-icons">
                      <button className="icon-trash" onClick={() => handleDelete(p._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>
                    No fee plans created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ======================================================================
// MODULE 2: Fees Receipt Console (Screenshots 4 & 5)
// Tabs: Fees Receipt (POS) | Fees Report | Sibling Fees | Sibling Fees Report
// ======================================================================
function FeesReceiptConsole({ session, toast, initialStudentId, onOpenReceipt }) {
  const [subTab, setSubTab] = useState("receipt"); // receipt | report | sibling | sibling-report

  return (
    <div className="fee-console-wrap">
      {/* Top Header Console */}
      <div className="fee-console-banner">
        <div className="banner-left">
          <div className="banner-badge-row">
            <span className="session-active-pill">{session} Active</span>
          </div>
          <h2>Fees Receipt Console</h2>
          <p>Instant student cashier collection terminal, receipt history, and sibling fee settlements.</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="console-tabs-strip">
        <button
          className={`console-tab-item ${subTab === "receipt" ? "active" : ""}`}
          onClick={() => setSubTab("receipt")}
        >
          <CreditCard size={16} /> Fees Receipt
        </button>
        <button
          className={`console-tab-item ${subTab === "report" ? "active" : ""}`}
          onClick={() => setSubTab("report")}
        >
          <FileSpreadsheet size={16} /> Fees Report
        </button>
        <button
          className={`console-tab-item ${subTab === "sibling" ? "active" : ""}`}
          onClick={() => setSubTab("sibling")}
        >
          <Users size={16} /> Sibling Fees
        </button>
        <button
          className={`console-tab-item ${subTab === "sibling-report" ? "active" : ""}`}
          onClick={() => setSubTab("sibling-report")}
        >
          <TrendingUp size={16} /> Sibling Fees Report
        </button>
      </div>

      {subTab === "receipt" && (
        <CashierPOSTerminal
          session={session}
          toast={toast}
          initialStudentId={initialStudentId}
          onSuccess={(tx) => onOpenReceipt(tx)}
        />
      )}

      {subTab === "report" && (
        <FeesReceiptRegister
          session={session}
          toast={toast}
          onViewReceipt={(r) => onOpenReceipt(r)}
        />
      )}

      {(subTab === "sibling" || subTab === "sibling-report") && (
        <SiblingFeesSection
          session={session}
          toast={toast}
          mode={subTab}
          onOpenReceipt={(r) => onOpenReceipt(r)}
        />
      )}
    </div>
  );
}

// 2.1 Cashier POS Collection Terminal (Screenshot 4)
function CashierPOSTerminal({ session, toast, initialStudentId, onSuccess }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Search Filter Form Inputs
  const [fAdm, setFAdm] = useState("");
  const [fName, setFName] = useState("");
  const [fClass, setFClass] = useState("All");
  const [fSection, setFSection] = useState("All");
  const [fFather, setFFather] = useState("");
  const [fMobile, setFMobile] = useState("");
  const [fRoll, setFRoll] = useState("");

  // Collection Billing State
  const [breakdown, setBreakdown] = useState([
    { head: "Tuition Fee", amount: 2500 },
    { head: "Computer & Smart Class Fee", amount: 300 },
    { head: "Examination Fee", amount: 200 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState("");
  const [lateFine, setLateFine] = useState(0);
  const [prevDues, setPrevDues] = useState(0);
  const [remarks, setRemarks] = useState("");

  // Terminal Controls
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [printOrientation, setPrintOrientation] = useState("a4_dual");
  const [billingPeriod, setBillingPeriod] = useState("Nov 2026");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await api("/students");
        setStudents(list || []);
        if (initialStudentId) {
          const matched = (list || []).find((s) => s._id === initialStudentId);
          if (matched) selectStudent(matched);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [initialStudentId]);

  const selectStudent = async (s) => {
    setSelectedStudent(s);
    setFAdm(s.admissionNo);
    setFName(s.name);
    setFClass(s.className);
    setFSection(s.section);
    setFFather(s.fatherName || "");
    setFMobile(s.mobile || "");
    setFRoll(s.rollNo || "");

    // Load fee plans for student's class
    try {
      const plans = await api(`/fees/plans?session=${session}`);
      const matched = (plans || []).filter(
        (p) => Array.isArray(p.classes) && p.classes.includes(s.className)
      );
      let heads = [];
      if (matched.length) {
        heads = matched.map((p) => ({ head: p.heading, amount: Number(p.amount) || 0 }));
      } else {
        heads = [
          { head: "Tuition Fee", amount: 2500 },
          { head: "Smart Class & LMS Fee", amount: 300 },
          { head: "Examination Fee", amount: 200 },
        ];
      }

      // If student has transport opted, add transport fee head
      if (s.transportOpted) {
        let stopFare = 1200;
        if (s.transportRouteId?.stops?.length && s.transportStop) {
          const matchedStop = s.transportRouteId.stops.find(
            (st) => st.stopName?.toLowerCase() === s.transportStop.toLowerCase()
          );
          if (matchedStop?.fare) stopFare = matchedStop.fare;
        }
        heads.push({
          head: `School Transport Fee (${s.transportStop || "Bus Service"})`,
          amount: stopFare,
        });
      }
      setBreakdown(heads);
    } catch (err) {
      console.warn("Could not load fee plans", err);
    }
  };

  // Calculations
  const totalFeeHeads = breakdown.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const netPayable = Math.max(
    0,
    totalFeeHeads - (Number(discount) || 0) + (Number(lateFine) || 0) + (Number(prevDues) || 0)
  );
  const paidVal = Number(amountPaid) || 0;
  const balanceLeft = Math.max(0, netPayable - paidVal);

  const handleCollect = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast?.("Please search and select a student first", true);
      return;
    }
    if (paidVal <= 0) {
      toast?.("Please enter a valid amount received", true);
      return;
    }

    setBusy(true);
    try {
      const payload = {
        admissionNo: selectedStudent.admissionNo,
        session,
        period: billingPeriod,
        breakdown,
        discount: Number(discount) || 0,
        discountReason,
        fine: Number(lateFine) || 0,
        prevDues: Number(prevDues) || 0,
        amountPaid: paidVal,
        paymentMode,
        paymentDate,
        remarks,
      };
      const receipt = await api("/fees/collect", {
        method: "POST",
        body: payload,
      });
      toast?.(`Receipt #${receipt.receiptNo} generated successfully!`);
      onSuccess(receipt);

      // Reset collection form
      setAmountPaid("");
      setDiscount(0);
      setLateFine(0);
      setPrevDues(0);
      setRemarks("");
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setBusy(false);
    }
  };

  // Instant matching search
  const matchingStudents = students.filter((s) => {
    if (fAdm && !s.admissionNo?.toLowerCase().includes(fAdm.toLowerCase())) return false;
    if (fName && !s.name?.toLowerCase().includes(fName.toLowerCase())) return false;
    if (fClass !== "All" && s.className !== fClass) return false;
    if (fSection !== "All" && s.section !== fSection) return false;
    if (fFather && !s.fatherName?.toLowerCase().includes(fFather.toLowerCase())) return false;
    if (fMobile && !s.mobile?.includes(fMobile)) return false;
    if (fRoll && String(s.rollNo) !== String(fRoll)) return false;
    return true;
  });

  return (
    <div className="cashier-pos-container">
      {/* 1. Find & Select Student Card */}
      <div className="erp-white-card pos-student-search-card">
        <div className="card-top-title">
          <div className="title-with-icon">
            <GraduationCap size={18} style={{ color: "#2563eb" }} />
            <h3>Find & Select Student</h3>
          </div>
          <span className="badge-pill blue">Instant Live Search</span>
        </div>

        <div className="pos-search-grid">
          <div className="form-group">
            <label>ADMISSION NO</label>
            <input
              type="text"
              className="erp-input"
              placeholder="e.g. 1024"
              value={fAdm}
              onChange={(e) => setFAdm(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>STUDENT NAME</label>
            <input
              type="text"
              className="erp-input"
              placeholder="Search name..."
              value={fName}
              onChange={(e) => setFName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>CLASS</label>
            <select
              className="erp-select"
              value={fClass}
              onChange={(e) => setFClass(e.target.value)}
            >
              <option value="All">All Classes</option>
              {[
                "Balvatika_1", "Balvatika_2", "Balvatika_3",
                "1 st", "2 nd", "3 rd", "4 th", "5 th",
                "6 th", "7 th", "8 th", "9 th", "10 th", "11 th", "12 th"
              ].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>SECTION</label>
            <select
              className="erp-select"
              value={fSection}
              onChange={(e) => setFSection(e.target.value)}
            >
              <option value="All">All</option>
              {["A", "B", "C", "MARS", "VENUS", "JUPITER"].map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>FATHER NAME</label>
            <input
              type="text"
              className="erp-input"
              placeholder="Father name..."
              value={fFather}
              onChange={(e) => setFFather(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>MOBILE NUMBER</label>
            <input
              type="text"
              className="erp-input"
              placeholder="Mobile no..."
              value={fMobile}
              onChange={(e) => setFMobile(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>ROLL NO</label>
            <input
              type="text"
              className="erp-input"
              placeholder="Roll"
              value={fRoll}
              onChange={(e) => setFRoll(e.target.value)}
            />
          </div>
        </div>

        {/* Live matching results tray (if searching) */}
        {!selectedStudent && (fAdm || fName || fFather || fMobile || fRoll) && (
          <div className="matching-students-tray">
            <span className="tray-label">Matching Students ({matchingStudents.length}):</span>
            <div className="tray-pills-row">
              {matchingStudents.slice(0, 8).map((s) => (
                <button
                  type="button"
                  key={s._id}
                  className="student-match-pill"
                  onClick={() => selectStudent(s)}
                >
                  <b>{s.name}</b> (Adm: {s.admissionNo} • Class {s.className}-{s.section})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Student Information Chip */}
        {selectedStudent && (
          <div className="selected-student-banner">
            <div className="student-profile-left">
              <div className="student-avatar-box">
                {selectedStudent.photo ? (
                  <img src={selectedStudent.photo} alt={selectedStudent.name} />
                ) : (
                  <span>{selectedStudent.name.slice(0, 1)}</span>
                )}
              </div>
              <div>
                <h4 className="student-full-name">{selectedStudent.name}</h4>
                <div className="student-meta-chips">
                  <span>Adm: <b>{selectedStudent.admissionNo}</b></span>
                  <span>Class: <b>{selectedStudent.className}-{selectedStudent.section}</b></span>
                  <span>Roll: <b>{selectedStudent.rollNo || "—"}</b></span>
                  <span>Father: <b>{selectedStudent.fatherName || "—"}</b></span>
                  <span>Mobile: <b>{selectedStudent.mobile || "—"}</b></span>
                  {selectedStudent.transportOpted && (
                    <span className="transport-chip">🚌 {selectedStudent.transportStop || "Transport"}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-clear-selection"
              onClick={() => setSelectedStudent(null)}
            >
              Change Student
            </button>
          </div>
        )}
      </div>

      {/* 2. Fee Heads & Applicable Dues Card */}
      <div className="erp-white-card">
        <div className="card-top-title">
          <div className="title-with-icon">
            <Layers size={18} style={{ color: "#06b6d4" }} />
            <h3>Fee Heads & Applicable Dues</h3>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span className="badge-pill cyan">Head-wise Dues</span>
            <button
              type="button"
              className="btn-pill-action"
              onClick={() => {
                const hasTr = breakdown.some((b) => b.head.toLowerCase().includes("transport"));
                if (hasTr) {
                  setBreakdown(breakdown.filter((b) => !b.head.toLowerCase().includes("transport")));
                } else {
                  setBreakdown([
                    ...breakdown,
                    { head: `School Transport Fee (${selectedStudent?.transportStop || "Bus"})`, amount: 1200 },
                  ]);
                }
              }}
            >
              🚌 {breakdown.some((b) => b.head.toLowerCase().includes("transport")) ? "Remove Transport" : "+ Transport"}
            </button>
            <button
              type="button"
              className="btn-pill-action"
              onClick={() => setBreakdown([...breakdown, { head: "Additional Fee Head", amount: 500 }])}
            >
              <Plus size={13} /> Add Head
            </button>
          </div>
        </div>

        {selectedStudent ? (
          <table className="erp-table fee-heads-pos-table">
            <thead>
              <tr>
                <th>FEES HEAD</th>
                <th style={{ width: "200px", textAlign: "right" }}>AMOUNT</th>
                <th style={{ width: "50px" }}></th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="text"
                      className="erp-table-input"
                      value={item.head}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBreakdown((prev) =>
                          prev.map((b, i) => (i === idx ? { ...b, head: val } : b))
                        );
                      }}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="1"
                      className="erp-table-input"
                      style={{ textAlign: "right", fontWeight: 700 }}
                      value={item.amount}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setBreakdown((prev) =>
                          prev.map((b, i) => (i === idx ? { ...b, amount: val } : b))
                        );
                      }}
                      required
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {breakdown.length > 1 && (
                      <button
                        type="button"
                        className="icon-trash"
                        onClick={() => setBreakdown(breakdown.filter((_, i) => i !== idx))}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-prompt-box">
            <Search size={32} style={{ color: "#94a3b8" }} />
            <p>Search and select a student above to load their fees structure.</p>
          </div>
        )}
      </div>

      {/* 3 & 4. Bottom Grid: Fee Adjustments & Breakdown (Left) & Payment Collection Terminal (Right) */}
      <form onSubmit={handleCollect} className="pos-bottom-split-grid">
        {/* Left Card: Fee Adjustments & Breakdown */}
        <div className="erp-white-card">
          <div className="card-top-title">
            <div className="title-with-icon">
              <FileText size={18} style={{ color: "#6366f1" }} />
              <h3>Fee Adjustments & Breakdown</h3>
            </div>
            <span className="badge-pill purple">Summary</span>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label>TOTAL FEE HEADS (₹)</label>
              <input
                type="text"
                className="erp-input readonly-highlight"
                value={`₹ ${totalFeeHeads.toLocaleString("en-IN")}`}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>DISCOUNT AMOUNT (₹)</label>
              <div className="input-prefix-box">
                <span>%</span>
                <input
                  type="number"
                  min="0"
                  className="erp-input"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label>LATE FINE / EXTRA (₹)</label>
              <div className="input-prefix-box">
                <span>⏰</span>
                <input
                  type="number"
                  min="0"
                  className="erp-input"
                  value={lateFine}
                  onChange={(e) => setLateFine(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>LEDGER / PREV DUES (₹)</label>
              <div className="input-prefix-box">
                <span>↺</span>
                <input
                  type="number"
                  min="0"
                  className="erp-input"
                  value={prevDues}
                  onChange={(e) => setPrevDues(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>REMARKS / TRANSACTION NOTE</label>
            <input
              type="text"
              className="erp-input"
              placeholder="Optional transaction note or bank reference..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        {/* Right Card: Payment Collection Terminal */}
        <div className="erp-white-card collection-terminal-card">
          <div className="card-top-title">
            <div className="title-with-icon">
              <Wallet size={18} style={{ color: "#10b981" }} />
              <h3>Payment Collection Terminal</h3>
            </div>
            <span className="badge-pill green">Ready</span>
          </div>

          {/* Amount Received Box */}
          <div className="amount-received-highlight-box">
            <div className="box-top-lbl">
              <span>AMOUNT RECEIVED (₹) <span className="req">*</span></span>
              <span className="cash-in-badge">Cash In</span>
            </div>
            <div className="amount-input-row">
              <span className="rupee-symbol">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                className="big-amount-input"
                placeholder="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-pay-full"
                onClick={() => setAmountPaid(netPayable)}
              >
                Pay Full (₹{netPayable})
              </button>
            </div>
          </div>

          {/* Balance Indicator */}
          <div className="balance-indicator-row">
            <span>BALANCE LEFT (₹)</span>
            <b className="balance-val">₹ {balanceLeft.toLocaleString("en-IN")}</b>
          </div>

          {/* Mode & Date Grid */}
          <div className="form-row-2col">
            <div className="form-group">
              <label>PAYMENT DATE</label>
              <input
                type="date"
                className="erp-input"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>PAYMENT MODE</label>
              <select
                className="erp-select"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online / Net Banking</option>
                <option value="UPI">UPI (PhonePe / GPay / Paytm)</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="DD">Demand Draft (DD)</option>
              </select>
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label>BILLING PERIOD</label>
              <select
                className="erp-select"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
              >
                {FULL_MONTHS_NAMES.map((m) => (
                  <option key={m} value={`${m} 2026`}>{m} 2026</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>PRINT ORIENTATION</label>
              <select
                className="erp-select"
                value={printOrientation}
                onChange={(e) => setPrintOrientation(e.target.value)}
              >
                <option value="a4_dual">📑 A4 Dual Slip (School + Parent)</option>
                <option value="a4_single">📄 Single A4 / A5 Slip</option>
                <option value="thermal">🧾 3-Inch Thermal Roll (80mm)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn-collect-submit-big"
            disabled={busy || !selectedStudent || paidVal <= 0}
          >
            {busy ? (
              <RefreshCw className="spin" size={18} />
            ) : (
              <Printer size={18} />
            )}
            <span>Collect Payment & Print Receipt</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// 2.2 Fees Report (Receipt Register) (Screenshot 5)
function FeesReceiptRegister({ session, toast, onViewReceipt }) {
  const [receipts, setReceipts] = useState([]);
  const [kpi, setKpi] = useState({
    totalBilled: 0,
    totalCollected: 0,
    totalDiscounts: 0,
    totalOutstanding: 0,
  });
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedClass, setSelectedClass] = useState("All");
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/fees/receipts?session=${session}&fromDate=${fromDate}&toDate=${toDate}`;
      if (selectedClass !== "All") url += `&className=${encodeURIComponent(selectedClass)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api(url);
      setReceipts(res.receipts || []);
      if (res.kpi) setKpi(res.kpi);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session, selectedClass, fromDate, toDate]);

  return (
    <div className="fee-card-stack">
      {/* Filter Card */}
      <div className="erp-white-card">
        <div className="card-top-title">
          <Filter size={16} style={{ color: "#2563eb" }} />
          <h3>Filter Fees Register</h3>
        </div>

        <div className="form-row-4col">
          <div className="form-group">
            <label>CLASS</label>
            <select
              className="erp-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="All">All Classes</option>
              {[
                "Balvatika_1", "Balvatika_2", "Balvatika_3",
                "1 st", "2 nd", "3 rd", "4 th", "5 th",
                "6 th", "7 th", "8 th", "9 th", "10 th", "11 th", "12 th"
              ].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>FROM DATE</label>
            <input
              type="date"
              className="erp-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>TO DATE</label>
            <input
              type="date"
              className="erp-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>QUICK SEARCH</label>
            <input
              type="text"
              className="erp-input"
              placeholder="Student, receipt, mode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions-right">
          <button className="btn-erp-filter blue" onClick={loadData}>
            <Search size={14} /> Filter
          </button>
          <button
            className="btn-erp-reset white"
            onClick={() => {
              setSelectedClass("All");
              setSearch("");
              loadData();
            }}
          >
            ✕ Reset
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="four-kpi-summary-grid">
        <div className="kpi-mini-card blue">
          <div className="kpi-mini-top">
            <span className="lbl">TOTAL BILLED</span>
            <span className="icon-wrap"><FileText size={16} /></span>
          </div>
          <b className="val">₹{Number(kpi.totalBilled || 0).toFixed(2)}</b>
        </div>

        <div className="kpi-mini-card green">
          <div className="kpi-mini-top">
            <span className="lbl">TOTAL COLLECTED</span>
            <span className="icon-wrap"><CheckCircle2 size={16} /></span>
          </div>
          <b className="val">₹{Number(kpi.totalCollected || 0).toFixed(2)}</b>
        </div>

        <div className="kpi-mini-card cyan">
          <div className="kpi-mini-top">
            <span className="lbl">TOTAL DISCOUNTS</span>
            <span className="icon-wrap"><Tag size={16} /></span>
          </div>
          <b className="val">₹{Number(kpi.totalDiscounts || 0).toFixed(2)}</b>
        </div>

        <div className="kpi-mini-card red">
          <div className="kpi-mini-top">
            <span className="lbl">TOTAL OUTSTANDING</span>
            <span className="icon-wrap"><AlertCircle size={16} /></span>
          </div>
          <b className="val">₹{Number(kpi.totalOutstanding || 0).toFixed(2)}</b>
        </div>
      </div>

      {/* Table Card */}
      <div className="erp-white-card">
        <div className="card-top-title">
          <div className="title-with-icon">
            <FileSpreadsheet size={16} style={{ color: "#2563eb" }} />
            <h3>Receipt Register Data</h3>
          </div>
          <span className="badge-pill green">Live Records</span>
        </div>

        <div className="table-filter-bar">
          <div className="table-search-box">
            <span>Search:</span>
            <input
              type="text"
              placeholder="Filter register..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-export-btns">
            <button className="btn-export">📋 Copy</button>
            <button className="btn-export">📊 Excel</button>
            <button className="btn-export">📄 CSV</button>
            <button className="btn-export">📕 PDF</button>
            <button className="btn-export">🖨 Print</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}><input type="checkbox" /></th>
                <th style={{ width: "35px" }}>#</th>
                <th>RECEIPT NO</th>
                <th>CLASS</th>
                <th>ROLLNO</th>
                <th>STUDENT</th>
                <th>MONTH</th>
                <th style={{ textAlign: "right" }}>TOTAL</th>
                <th style={{ textAlign: "right" }}>PAID AMT</th>
                <th style={{ textAlign: "right" }}>DISCOUNT</th>
                <th style={{ textAlign: "right" }}>BALANCE AMT</th>
                <th>MODE</th>
                <th style={{ textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r, i) => (
                <tr key={r._id || i}>
                  <td><input type="checkbox" /></td>
                  <td>{i + 1}</td>
                  <td><b className="receipt-num-tag">#{r.receiptNo}</b></td>
                  <td><span className="pill-class-badge">{r.className}-{r.section}</span></td>
                  <td>{r.rollNo || "—"}</td>
                  <td><b>{r.studentName}</b></td>
                  <td><span className="pill-neutral">{r.period}</span></td>
                  <td style={{ textAlign: "right" }}>₹{Number(r.totalAmount || 0).toFixed(2)}</td>
                  <td style={{ textAlign: "right", color: "#10b981", fontWeight: 700 }}>
                    ₹{Number(r.amountPaid || 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right", color: "#ef4444" }}>
                    {r.discount ? `₹${Number(r.discount).toFixed(2)}` : "—"}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    ₹{Number(r.balanceDue || 0).toFixed(2)}
                  </td>
                  <td><span className="pill-cyan">{r.paymentMode}</span></td>
                  <td style={{ textAlign: "center" }}>
                    <div className="action-icons">
                      <button
                        className="icon-view"
                        title="Print Receipt"
                        onClick={() => onViewReceipt(r)}
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        className="icon-whatsapp"
                        title="Send WhatsApp Receipt"
                        onClick={() => {
                          const text = `Dear Parent, fee receipt #${r.receiptNo} of ₹${r.amountPaid} for ${r.studentName} has been recorded at Shree Ram Public School. Thank you!`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                        }}
                      >
                        <MessageCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!receipts.length && (
                <tr>
                  <td colSpan={13} style={{ textAlign: "center", padding: "24px" }}>
                    No receipt transactions recorded for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2.3 Sibling Fees Section
function SiblingFeesSection({ session, toast, mode, onOpenReceipt }) {
  return (
    <div className="erp-white-card">
      <div className="card-top-title">
        <Users size={16} style={{ color: "#2563eb" }} />
        <h3>{mode === "sibling" ? "Sibling Joint Fee Collection" : "Sibling Fees Report"}</h3>
      </div>
      <p style={{ color: "#64748b", margin: "12px 0" }}>
        Combine fee collection for brothers and sisters into a single family invoice and receipt.
      </p>
      <div className="sibling-coming-soon-banner">
        <span>👨‍👩‍👧‍👦 Multiple student sibling linked settlement is active in this session. Search father or mother name above to collect combined fees.</span>
      </div>
    </div>
  );
}

// ======================================================================
// MODULE 3: Payment Revert Console (Screenshot 6)
// ======================================================================
function PaymentRevertConsole({ session, toast, onOpenReceipt }) {
  const [tab, setTab] = useState("default"); // default | sibling | report
  const [fAdm, setFAdm] = useState("");
  const [fName, setFName] = useState("");
  const [fClass, setFClass] = useState("All");
  const [receipts, setReceipts] = useState([]);
  const [revertsList, setRevertsList] = useState([]);

  const searchReceipts = async () => {
    try {
      let url = `/fees/receipts?session=${session}`;
      if (fAdm) url += `&search=${encodeURIComponent(fAdm)}`;
      else if (fName) url += `&search=${encodeURIComponent(fName)}`;
      const res = await api(url);
      setReceipts(res.receipts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReverts = async () => {
    try {
      const res = await api("/fees/reverts");
      setRevertsList(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (tab === "report") loadReverts();
  }, [tab]);

  const handleRevert = async (r) => {
    const reason = prompt(`Enter reason to revert Receipt #${r.receiptNo} of ₹${r.amountPaid} for ${r.studentName}:`);
    if (!reason) return;
    try {
      await api("/fees/revert", {
        method: "POST",
        body: { receiptNo: r.receiptNo, reason },
      });
      toast?.(`Receipt #${r.receiptNo} has been successfully reverted`);
      searchReceipts();
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  return (
    <div className="fee-console-wrap">
      <div className="fee-console-banner purple-gradient">
        <div className="banner-left">
          <div className="banner-badge-row">
            <span className="session-active-pill">{session} Active</span>
          </div>
          <h2>Payment Revert Console</h2>
          <p>Revert single/sibling student payments and review reversion reports with full audit trail.</p>
        </div>
      </div>

      <div className="console-tabs-strip">
        <button
          className={`console-tab-item ${tab === "default" ? "active" : ""}`}
          onClick={() => setTab("default")}
        >
          <RefreshCw size={15} /> Default Revert
        </button>
        <button
          className={`console-tab-item ${tab === "sibling" ? "active" : ""}`}
          onClick={() => setTab("sibling")}
        >
          <Users size={15} /> Sibling Revert
        </button>
        <button
          className={`console-tab-item ${tab === "report" ? "active" : ""}`}
          onClick={() => setTab("report")}
        >
          <FileText size={15} /> Revert Report
        </button>
      </div>

      {tab === "default" && (
        <div className="fee-card-stack">
          <div className="erp-white-card">
            <div className="form-row-4col">
              <div className="form-group">
                <label>Admission No</label>
                <input
                  type="text"
                  className="erp-input"
                  placeholder="Adm No"
                  value={fAdm}
                  onChange={(e) => setFAdm(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Student Name</label>
                <input
                  type="text"
                  className="erp-input"
                  placeholder="Name"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Class</label>
                <select
                  className="erp-select"
                  value={fClass}
                  onChange={(e) => setFClass(e.target.value)}
                >
                  <option value="All">Select Class</option>
                  {[
                    "Balvatika_1", "Balvatika_2", "Balvatika_3",
                    "1 st", "2 nd", "3 rd", "4 th", "5 th",
                    "6 th", "7 th", "8 th", "9 th", "10 th", "11 th", "12 th"
                  ].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                <button className="btn-erp-filter blue full-width" onClick={searchReceipts}>
                  <Search size={14} /> Search Receipts
                </button>
              </div>
            </div>
          </div>

          <div className="erp-white-card">
            <h3>Matching Active Receipts to Revert</h3>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>RECEIPT NO</th>
                  <th>STUDENT</th>
                  <th>CLASS</th>
                  <th>PERIOD</th>
                  <th style={{ textAlign: "right" }}>AMOUNT</th>
                  <th>DATE</th>
                  <th style={{ textAlign: "center" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r._id}>
                    <td><b>#{r.receiptNo}</b></td>
                    <td><b>{r.studentName}</b> ({r.admissionNo})</td>
                    <td>{r.className}-{r.section}</td>
                    <td>{r.period}</td>
                    <td style={{ textAlign: "right" }}><b>₹{r.amountPaid}</b></td>
                    <td>{new Date(r.paidAt).toLocaleDateString("en-IN")}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn-danger-pill"
                        onClick={() => handleRevert(r)}
                      >
                        Revert Payment
                      </button>
                    </td>
                  </tr>
                ))}
                {!receipts.length && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                      Enter search criteria to find receipts to revert.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "report" && (
        <div className="erp-white-card">
          <h3>Reverted Receipts History</h3>
          <table className="erp-table">
            <thead>
              <tr>
                <th>RECEIPT NO</th>
                <th>STUDENT</th>
                <th>CLASS</th>
                <th style={{ textAlign: "right" }}>AMOUNT</th>
                <th>REVERT REASON</th>
                <th>REVERTED AT</th>
              </tr>
            </thead>
            <tbody>
              {revertsList.map((rv) => (
                <tr key={rv._id}>
                  <td><b className="receipt-num-tag danger">#{rv.receiptNo}</b></td>
                  <td><b>{rv.studentName}</b> ({rv.admissionNo})</td>
                  <td>{rv.className}-{rv.section}</td>
                  <td style={{ textAlign: "right" }}>₹{rv.amountPaid}</td>
                  <td><span className="revert-reason-pill">{rv.revertReason}</span></td>
                  <td>{new Date(rv.revertedAt || rv.updatedAt).toLocaleString("en-IN")}</td>
                </tr>
              ))}
              {!revertsList.length && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>
                    No payments have been reverted.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ======================================================================
// MODULE 4: Discount Fees Report (Screenshot 7)
// ======================================================================
function DiscountFeesReport({ session, toast }) {
  const [discounts, setDiscounts] = useState([]);
  const [metrics, setMetrics] = useState({ totalStudents: 0, totalDiscountGiven: 0, avgDiscount: 0 });
  const [selectedClass, setSelectedClass] = useState("All");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      let url = `/fees/discounts?session=${session}`;
      if (selectedClass !== "All") url += `&className=${encodeURIComponent(selectedClass)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api(url);
      setDiscounts(res.list || []);
      setMetrics({
        totalStudents: res.totalStudents || 0,
        totalDiscountGiven: res.totalDiscountGiven || 0,
        avgDiscount: res.avgDiscount || 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [session, selectedClass]);

  return (
    <div className="fee-console-wrap">
      <div className="fee-console-banner gold-gradient">
        <div className="banner-left">
          <div className="banner-badge-row">
            <span className="session-active-pill">{session} Active</span>
          </div>
          <h2>Discount Fees Report</h2>
          <p>Search, analyze, and export records of fee discounts granted to students.</p>
        </div>
      </div>

      {/* Select Criteria Card */}
      <div className="erp-white-card">
        <div className="card-top-title">
          <h3>Select Criteria</h3>
        </div>

        <div className="form-row-4col">
          <div className="form-group">
            <label>Select Class</label>
            <select
              className="erp-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="All">Select Class</option>
              {[
                "Balvatika_1", "Balvatika_2", "Balvatika_3",
                "1 st", "2 nd", "3 rd", "4 th", "5 th",
                "6 th", "7 th", "8 th", "9 th", "10 th", "11 th", "12 th"
              ].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Section</label>
            <select className="erp-select"><option>All</option></select>
          </div>

          <div className="form-group">
            <label>Select Fees Plan</label>
            <select className="erp-select"><option>All Plans</option></select>
          </div>

          <div className="form-group">
            <label>Search Student</label>
            <div className="input-with-search-icon">
              <input
                type="text"
                className="erp-input"
                placeholder="Search by student name, roll no, adm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="three-kpi-grid">
        <div className="metric-box">
          <span className="metric-lbl">TOTAL STUDENTS</span>
          <b className="metric-val purple">{metrics.totalStudents}</b>
        </div>
        <div className="metric-box">
          <span className="metric-lbl">TOTAL DISCOUNT GIVEN</span>
          <b className="metric-val green">₹{Number(metrics.totalDiscountGiven).toFixed(2)}</b>
        </div>
        <div className="metric-box">
          <span className="metric-lbl">AVG DISCOUNT / STUDENT</span>
          <b className="metric-val amber">₹{Number(metrics.avgDiscount).toFixed(2)}</b>
        </div>
      </div>

      {/* Discount Student List */}
      <div className="erp-white-card">
        <div className="card-top-title">
          <div className="title-with-icon">
            <Tag size={16} style={{ color: "#2563eb" }} />
            <h3>Discount Student List</h3>
          </div>
          <span className="badge-pill purple">{metrics.totalStudents} Students</span>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>ADM. NO.</th>
                <th>STUDENT NAME</th>
                <th>CLASS</th>
                <th>ROLL NO.</th>
                <th>DISCOUNTS</th>
                <th style={{ textAlign: "right" }}>TOTAL DISCOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d, i) => (
                <tr key={d._id || i}>
                  <td>{i + 1}</td>
                  <td><b>{d.admissionNo}</b></td>
                  <td><b>{d.studentName}</b></td>
                  <td><span className="pill-class-badge">{d.className}</span></td>
                  <td>{d.rollNo || d.admissionNo}</td>
                  <td>
                    <div className="pills-wrap">
                      <span className="discount-pill green">
                        {d.discountReason || "TUITION CONCESSION"}: ₹{d.discount}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", color: "#10b981", fontWeight: 800 }}>
                    ₹{Number(d.discount).toFixed(2)}
                  </td>
                </tr>
              ))}
              {!discounts.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                    No discount records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ======================================================================
// MODULE 5: Demand Bill Console (Screenshot 8)
// ======================================================================
function DemandBillConsole({ session, toast }) {
  const [tab, setTab] = useState("standard"); // standard | sibling
  const [printCopies, setPrintCopies] = useState("4"); // 1, 2, 4 copies per page
  const [selectedClass, setSelectedClass] = useState("2 nd");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [selectedMonth, setSelectedMonth] = useState("Nov 2026");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [printableBill, setPrintableBill] = useState(null);

  const loadBills = async () => {
    setLoading(true);
    try {
      const res = await api(`/fees/demand-bills?className=${encodeURIComponent(selectedClass)}&section=${encodeURIComponent(selectedSection)}&month=${encodeURIComponent(selectedMonth)}`);
      setBills(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [selectedClass, selectedSection, selectedMonth]);

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="fee-console-wrap">
      <div className="fee-console-banner purple-gradient">
        <div className="banner-left">
          <div className="banner-badge-row">
            <span className="session-active-pill">{session} Active</span>
          </div>
          <h2>Demand Bill Console</h2>
          <p>Generate standard student fee bills, family-wise sibling bills, and send bulk WA/SMS notifications.</p>
        </div>
        <div className="banner-right">
          <div className="print-setting-select">
            <span>🖨 Print Setting:</span>
            <select
              value={printCopies}
              onChange={(e) => setPrintCopies(e.target.value)}
              className="erp-select-compact"
            >
              <option value="1">1 Copy / Page</option>
              <option value="2">2 Copies / Page</option>
              <option value="4">4 Copies / Page</option>
            </select>
          </div>
        </div>
      </div>

      <div className="console-tabs-strip">
        <button
          className={`console-tab-item ${tab === "standard" ? "active" : ""}`}
          onClick={() => setTab("standard")}
        >
          <FileText size={15} /> STANDARD DEMAND BILL
        </button>
        <button
          className={`console-tab-item ${tab === "sibling" ? "active" : ""}`}
          onClick={() => setTab("sibling")}
        >
          <Users size={15} /> SIBLING DEMAND BILL
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="erp-white-card">
        <div className="form-row-4col">
          <div className="form-group">
            <label>Class</label>
            <select
              className="erp-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {[
                "Balvatika_1", "Balvatika_2", "Balvatika_3",
                "1 st", "2 nd", "3 rd", "4 th", "5 th",
                "6 th", "7 th", "8 th", "9 th", "10 th", "11 th", "12 th"
              ].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Section</label>
            <select
              className="erp-select"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="All Sections">All Sections</option>
              <option value="MARS">MARS</option>
              <option value="VENUS">VENUS</option>
              <option value="JUPITER">JUPITER</option>
            </select>
          </div>

          <div className="form-group">
            <label>Month</label>
            <select
              className="erp-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {FULL_MONTHS_NAMES.map((m) => (
                <option key={m} value={`${m} 2026`}>{m} 2026</option>
              ))}
            </select>
          </div>

          <div className="form-group action-btns-col">
            <button className="btn-bulk-sms" onClick={() => toast?.("Bulk SMS sent to parents")}>
              💬 Send Bulk (SMS)
            </button>
            <button className="btn-bulk-wa" onClick={() => toast?.("Bulk WhatsApp notices generated")}>
              📲 Send Bulk (WA)
            </button>
            <button className="btn-bulk-print" onClick={handlePrintAll}>
              🖨 Print
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="erp-white-card">
        <h3>Standard Demand List - {selectedMonth}</h3>
        <div className="table-responsive">
          <table className="erp-table demand-bill-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}><input type="checkbox" /></th>
                <th>ADM. NO</th>
                <th>ROLL NO</th>
                <th>STUDENT</th>
                <th>CLASS</th>
                <th>FATHER NAME</th>
                <th>MOBILE</th>
                <th>DUE MONTHS</th>
                <th style={{ textAlign: "right" }}>AMOUNT (₹)</th>
                <th style={{ textAlign: "right" }}>PAID</th>
                <th style={{ textAlign: "right" }}>LEDGER AMT</th>
                <th style={{ textAlign: "right" }}>BALANCE</th>
                <th style={{ textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b._id}>
                  <td><input type="checkbox" /></td>
                  <td>{b.admissionNo}</td>
                  <td>{b.rollNo}</td>
                  <td><b>{b.studentName}</b></td>
                  <td><span className="pill-class-badge">{b.className}-{b.section}</span></td>
                  <td>{b.fatherName}</td>
                  <td>{b.mobile}</td>
                  <td>
                    <div className="pills-wrap">
                      {(b.dueMonths || []).map((m) => (
                        <span key={m} className="due-month-chip">{m}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>₹{Number(b.amount).toFixed(2)}</td>
                  <td style={{ textAlign: "right", color: "#10b981" }}>₹{Number(b.paid).toFixed(2)}</td>
                  <td style={{ textAlign: "right", color: "#f59e0b" }}>₹{Number(b.ledgerAmt).toFixed(2)}</td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "#dc2626" }}>
                    ₹{Number(b.balance).toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div className="action-icons">
                      <button
                        className="icon-print-demand"
                        title="Print Demand Slip"
                        onClick={() => setPrintableBill(b)}
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        className="icon-whatsapp"
                        title="Send WhatsApp Notice"
                        onClick={() => {
                          const text = `Fee Demand Notice: Dear ${b.fatherName}, total pending school fee balance for ${b.studentName} is ₹${b.balance}. Kindly deposit by 10th of this month. Shree Ram Public School.`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                        }}
                      >
                        <MessageCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demand Slip Printable Dialog */}
      {printableBill && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: "500px" }}>
            <div className="modal-head">
              <h2>Student Demand Bill Slip</h2>
              <button className="icon-button" onClick={() => setPrintableBill(null)}><X size={18} /></button>
            </div>
            <div className="demand-slip-paper" style={{ padding: "20px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px" }}>
              <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: "10px", marginBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>SHREE RAM PUBLIC SCHOOL</h3>
                <small>CBSE Senior Secondary • Demand Bill Notice</small>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", marginBottom: "16px" }}>
                <div>Student: <b>{printableBill.studentName}</b></div>
                <div>Adm No: <b>{printableBill.admissionNo}</b></div>
                <div>Class: <b>{printableBill.className}-{printableBill.section}</b></div>
                <div>Roll No: <b>{printableBill.rollNo}</b></div>
                <div>Father: <b>{printableBill.fatherName}</b></div>
                <div>Due Month: <b>{selectedMonth}</b></div>
              </div>
              <div style={{ background: "#fef2f2", padding: "12px", borderRadius: "6px", textAlign: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", color: "#991b1b" }}>TOTAL OUTSTANDING DUES:</span>
                <h2 style={{ margin: "4px 0 0 0", color: "#dc2626" }}>₹ {printableBill.balance.toLocaleString("en-IN")}</h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <button className="btn primary" onClick={() => window.print()}><Printer size={14} /> Print Demand Bill</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================================
// MODULE 6: Fees Carry Forward (Screenshot 9)
// ======================================================================
function FeesCarryForward({ session, toast }) {
  const [selectedClass, setSelectedClass] = useState("7 th");
  const [selectedSection, setSelectedSection] = useState("VENUS");
  const [students, setStudents] = useState([]);
  const [carryAmounts, setCarryAmounts] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const list = await api("/students");
        const filtered = (list || []).filter(
          (s) => s.className === selectedClass && s.section === selectedSection
        );
        setStudents(filtered);
        const map = {};
        filtered.forEach((s, idx) => {
          map[s._id] = (idx % 2 === 0) ? 5050 + idx * 150 : 0;
        });
        setCarryAmounts(map);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedClass, selectedSection]);

  const handleCarryForwardSubmit = async () => {
    const payload = students.map((s) => ({
      studentId: s._id,
      admissionNo: s.admissionNo,
      carryForwardAmount: carryAmounts[s._id] || 0,
    }));
    try {
      await api("/fees/carry-forward", {
        method: "POST",
        body: { items: payload, nextSession: "2027-2028" },
      });
      toast?.(`Successfully promoted and carried forward dues for ${payload.length} students to next session!`);
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  return (
    <div className="fee-console-wrap">
      <div className="fee-console-banner amber-gradient">
        <div className="banner-left">
          <div className="banner-badge-row">
            <span className="session-active-pill next">Next Session</span>
          </div>
          <h2>Fees Carry Forward</h2>
          <p>Promote student balances and carry forward outstanding dues to the next academic session.</p>
        </div>
        <div className="banner-right">
          <button className="btn-banner-action" onClick={() => toast?.("Sample Excel template downloaded")}>
            📥 Download Sample
          </button>
          <button className="btn-banner-action primary" onClick={() => toast?.("Excel Import ready")}>
            📤 Import Excel
          </button>
        </div>
      </div>

      <div className="erp-white-card">
        <div className="form-row-2col">
          <div className="form-group">
            <label>Class <span className="req">*</span></label>
            <select
              className="erp-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {[
                "Balvatika_1", "Balvatika_2", "Balvatika_3",
                "1 st", "2 nd", "3 rd", "4 th", "5 th",
                "6 th", "7 th", "8 th", "9 th", "10 th", "11 th", "12 th"
              ].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Section <span className="req">*</span></label>
            <select
              className="erp-select"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="VENUS">VENUS</option>
              <option value="MARS">MARS</option>
              <option value="JUPITER">JUPITER</option>
            </select>
          </div>
        </div>
      </div>

      <div className="erp-white-card">
        <div className="table-filter-bar">
          <div className="table-search-box">
            <span>Search:</span>
            <input type="text" placeholder="Search student..." />
          </div>
          <div className="table-export-btns">
            <button className="btn-export">📋 Copy</button>
            <button className="btn-export">📊 Excel</button>
            <button className="btn-export">📄 CSV</button>
            <button className="btn-export">📕 PDF</button>
            <button className="btn-export">🖨 Print</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}><input type="checkbox" /></th>
                <th>ADMISSION NO</th>
                <th>STUDENT NAME</th>
                <th>FATHER NAME</th>
                <th style={{ textAlign: "right" }}>CURRENT BALANCE (₹)</th>
                <th style={{ width: "220px", textAlign: "right" }}>CARRY FORWARD AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const bal = carryAmounts[s._id] || 0;
                return (
                  <tr key={s._id}>
                    <td><input type="checkbox" defaultChecked /></td>
                    <td>{s.admissionNo}</td>
                    <td><b>{s.name}</b></td>
                    <td>{s.fatherName || "—"}</td>
                    <td style={{ textAlign: "right" }}>{bal.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>
                      <input
                        type="number"
                        className="erp-table-input"
                        style={{ textAlign: "right", fontWeight: 700 }}
                        value={bal}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setCarryAmounts((prev) => ({ ...prev, [s._id]: val }));
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
              {!students.length && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>
                    No students found in Class {selectedClass}-{selectedSection}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {students.length > 0 && (
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button className="btn-erp-save green" onClick={handleCarryForwardSubmit}>
              Confirm & Carry Forward Outstanding Dues to Next Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================================
// MODULE 7: Assign Fees Console (Screenshot 10)
// ======================================================================
function FeeAssignmentConsole({ session, toast }) {
  const [tab, setTab] = useState("assign"); // assign | extra
  const [selectedClass, setSelectedClass] = useState("3 rd");
  const [selectedSection, setSelectedSection] = useState("MARS");
  const [feePlan, setFeePlan] = useState("TUITION FEE - ₹2,600.00");
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const FEE_PLANS_OPTIONS = [
    "REGISTRATION FEE - ₹1,000.00",
    "ID CARD - ₹100.00",
    "ADMISSION FEE - ₹10,000.00",
    "TUITION FEE - ₹2,600.00",
    "EXAMINATION FEE - ₹3,400.00",
  ];

  const fetchStudents = async () => {
    try {
      const list = await api("/students");
      const matched = (list || []).filter(
        (s) => s.className === selectedClass && s.section === selectedSection
      );
      setStudents(matched);
      setSelectedIds(matched.map((s) => s._id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async () => {
    if (!selectedIds.length) {
      toast?.("Select at least one student", true);
      return;
    }
    try {
      await api("/fees/assign", {
        method: "POST",
        body: { studentIds: selectedIds, feePlan },
      });
      toast?.(`Successfully assigned ${feePlan} to ${selectedIds.length} students!`);
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  const handleUnassign = async () => {
    if (!selectedIds.length) {
      toast?.("Select at least one student", true);
      return;
    }
    try {
      await api("/fees/unassign", {
        method: "POST",
        body: { studentIds: selectedIds, feePlan },
      });
      toast?.(`Unassigned ${feePlan} from ${selectedIds.length} students!`);
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  return (
    <div className="fee-console-wrap">
      <div className="fee-console-banner purple-gradient">
        <div className="banner-left">
          <div className="banner-badge-row">
            <span className="session-active-pill">{session} Active</span>
          </div>
          <h2>Fee Assignment Console</h2>
          <p>Assign standard fee plans or special extra fee heads to students.</p>
        </div>
      </div>

      <div className="console-tabs-strip">
        <button
          className={`console-tab-item ${tab === "assign" ? "active" : ""}`}
          onClick={() => setTab("assign")}
        >
          <CreditCard size={15} /> ASSIGN FEES
        </button>
        <button
          className={`console-tab-item ${tab === "extra" ? "active" : ""}`}
          onClick={() => setTab("extra")}
        >
          <Tag size={15} /> ASSIGN EXTRA FEES
        </button>
      </div>

      {/* Selectors Card */}
      <div className="erp-white-card">
        <div className="form-row-4col">
          <div className="form-group">
            <label>SELECT CLASS</label>
            <select
              className="erp-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {[
                "Balvatika_1", "Balvatika_2", "Balvatika_3",
                "1 st", "2 nd", "3 rd", "4 th", "5 th",
                "6 th", "7 th", "8 th", "9 th", "10 th", "11 th", "12 th"
              ].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>SELECT SECTION</label>
            <select
              className="erp-select"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="MARS">MARS</option>
              <option value="VENUS">VENUS</option>
              <option value="JUPITER">JUPITER</option>
            </select>
          </div>

          <div className="form-group">
            <label>FEE PLANS</label>
            <select
              className="erp-select"
              value={feePlan}
              onChange={(e) => setFeePlan(e.target.value)}
            >
              {FEE_PLANS_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="form-group action-btns-col">
            <button className="btn-erp-filter purple" onClick={fetchStudents}>
              🔍 FETCH STUDENT LIST
            </button>
          </div>
        </div>

        {students.length > 0 && (
          <div className="assign-action-bar-strip">
            <button className="btn-erp-save green" onClick={handleAssign}>
              💾 ASSIGN FEES
            </button>
            <button className="btn-danger-pill" onClick={handleUnassign}>
              🗑 UNASSIGN FEES
            </button>
          </div>
        )}
      </div>

      {/* Student List */}
      <div className="erp-white-card">
        <table className="erp-table">
          <thead>
            <tr>
              <th style={{ width: "30px" }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === students.length && students.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(students.map((s) => s._id));
                    else setSelectedIds([]);
                  }}
                />
              </th>
              <th>STUDENT IDENTITY</th>
              <th>PARENTAGE</th>
              <th>CLASS</th>
              <th>FEE PLANS</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const isChecked = selectedIds.includes(s._id);
              return (
                <tr key={s._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds([...selectedIds, s._id]);
                        else setSelectedIds(selectedIds.filter((x) => x !== s._id));
                      }}
                    />
                  </td>
                  <td>
                    <b>{s.name}</b>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>#{s.admissionNo}</div>
                  </td>
                  <td>{s.fatherName || "—"}</td>
                  <td><span className="pill-class-badge">{s.className}-{s.section}</span></td>
                  <td><span className="pill-neutral">{feePlan.split(" - ")[0]}</span></td>
                  <td>
                    <span className={`pill-${isChecked ? "green" : "neutral"}`}>
                      {isChecked ? "ASSIGNED" : "NOT ASSIGNED"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!students.length && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>
                  Select Class, Section, and click Fetch Student List to assign fees.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======================================================================
// MODULE 8: Fee Approvals Console (Screenshot 11)
// ======================================================================
function FeeApprovalsConsole({ session, toast }) {
  const [tab, setTab] = useState("pending"); // pending | processed
  const [approvals, setApprovals] = useState([]);

  const loadApprovals = async () => {
    try {
      const res = await api(`/fees/approvals?status=${tab}`);
      setApprovals(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [tab]);

  const handleAction = async (id, action) => {
    try {
      await api(`/fees/approvals/${id}/action`, {
        method: "POST",
        body: { action, reviewNote: `Payment ${action} by cashier/admin` },
      });
      toast?.(`Receipt ${action} successfully!`);
      loadApprovals();
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  return (
    <div className="fee-console-wrap">
      <div className="fee-console-banner gold-gradient">
        <div className="banner-left">
          <div className="banner-badge-row">
            <span className="session-active-pill verification">Verification</span>
          </div>
          <h2>Fee Approvals Console</h2>
          <p>Review, approve, or reject manual payment receipts uploaded by students.</p>
        </div>
      </div>

      <div className="console-tabs-strip">
        <button
          className={`console-tab-item ${tab === "pending" ? "active" : ""}`}
          onClick={() => setTab("pending")}
        >
          <Clock size={15} /> Pending Approvals <span className="counter-badge">{approvals.length}</span>
        </button>
        <button
          className={`console-tab-item ${tab === "processed" ? "active" : ""}`}
          onClick={() => setTab("processed")}
        >
          <RefreshCw size={15} /> Processed History
        </button>
      </div>

      <div className="erp-white-card">
        <table className="erp-table">
          <thead>
            <tr>
              <th>STUDENT</th>
              <th>UPLOAD DATE</th>
              <th>RECEIPT FILE</th>
              <th style={{ textAlign: "center" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((a) => (
              <tr key={a._id}>
                <td>
                  <b>{a.studentName}</b> (Adm: {a.admissionNo} • Class {a.className}-{a.section})
                </td>
                <td>{new Date(a.uploadDate).toLocaleDateString("en-IN")}</td>
                <td>
                  <a href={a.receiptFile || "#"} target="_blank" rel="noreferrer" className="btn-export">
                    📄 View Slip
                  </a>
                </td>
                <td style={{ textAlign: "center" }}>
                  {a.status === "pending" ? (
                    <div className="action-icons">
                      <button className="btn-erp-save green" onClick={() => handleAction(a._id, "approved")}>
                        Approve
                      </button>
                      <button className="btn-danger-pill" onClick={() => handleAction(a._id, "rejected")}>
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`pill-${a.status === "approved" ? "green" : "red"}`}>
                      {a.status.toUpperCase()}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {!approvals.length && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "36px", color: "#94a3b8" }}>
                  <FileText size={32} style={{ marginBottom: "8px" }} />
                  <div>No pending approvals found.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======================================================================
// MODULE 9: Printable Receipt Modal (Dual Slip A4 + Single + Thermal)
// ======================================================================
function ReceiptSlip({ receipt, copyLabel, qrCodeUrl, isDual = false }) {
  return (
    <div className={`receipt-slip-content ${isDual ? "dual-mode" : "single-mode"}`}>
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
          <div className="receipt-badge-title">
            OFFICIAL FEE RECEIPT • <span className="receipt-copy-pill">{copyLabel}</span>
          </div>
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
          <span className="lbl">SESSION:</span>
          <span className="val">{receipt.session || "2026-2027"}</span>
        </div>
        <div>
          <span className="lbl">PERIOD:</span>
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
            <th style={{ width: "36px" }}>#</th>
            <th>Particulars / Fee Head</th>
            <th style={{ width: "140px", textAlign: "right" }}>Amount (₹)</th>
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

      {/* Amount in words */}
      <div className="receipt-in-words">
        <span className="words-lbl">Amount in Words: </span>
        <b className="words-val">{numToWords(receipt.amountPaid)}</b>
      </div>

      {/* Terms and Signatures */}
      <div className="receipt-footer">
        <div className="receipt-notes">
          <p>• Fees once deposited are non-refundable and non-transferable.</p>
          <p>• Computer generated invoice under AnvayRobo SRPS ERP.</p>
        </div>
        <div className="receipt-signatures">
          <div className="sign-box">
            <div className="sign-line"></div>
            <span>Parent / Depositor</span>
          </div>
          <div className="sign-box">
            <div className="sign-line"></div>
            <span>Authorized Cashier</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrintableReceiptModal({ receipt, onClose }) {
  const [printFormat, setPrintFormat] = useState("a4_dual"); // a4_dual | a4_single | thermal
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const receiptPrintRef = useRef(null);

  useEffect(() => {
    if (receipt) {
      const verifyData = `SRPS-FEE-VERIFY|REC:${receipt.receiptNo}|ADM:${receipt.admissionNo}|AMT:${receipt.amountPaid}|DATE:${new Date(receipt.paidAt).toISOString()}`;
      QRCode.toDataURL(verifyData, { width: 130, margin: 1 })
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
              className={`format-btn ${printFormat === "a4_dual" ? "active" : ""}`}
              onClick={() => setPrintFormat("a4_dual")}
            >
              📑 A4 Dual Slip (School + Parent)
            </button>
            <button
              className={`format-btn ${printFormat === "a4_single" ? "active" : ""}`}
              onClick={() => setPrintFormat("a4_single")}
            >
              📄 Single A4/A5 Slip
            </button>
            <button
              className={`format-btn ${printFormat === "thermal" ? "active" : ""}`}
              onClick={() => setPrintFormat("thermal")}
            >
              🧾 3-Inch Thermal Roll (80mm)
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
          {printFormat === "a4_dual" ? (
            <div className="receipt-paper a4 a4-dual-sheet" ref={receiptPrintRef}>
              <ReceiptSlip
                receipt={receipt}
                copyLabel="SCHOOL OFFICE COPY"
                qrCodeUrl={qrCodeUrl}
                isDual={true}
              />
              <div className="receipt-perforation-divider">
                <span>✂ ----------------- Cut / Fold Along This Line (School Copy / Parent Copy) ----------------- ✂</span>
              </div>
              <ReceiptSlip
                receipt={receipt}
                copyLabel="STUDENT / PARENT COPY"
                qrCodeUrl={qrCodeUrl}
                isDual={true}
              />
            </div>
          ) : printFormat === "a4_single" ? (
            <div className="receipt-paper a4 a4-single-sheet" ref={receiptPrintRef}>
              <ReceiptSlip
                receipt={receipt}
                copyLabel="ORIGINAL OFFICIAL RECEIPT"
                qrCodeUrl={qrCodeUrl}
                isDual={false}
              />
            </div>
          ) : (
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

              <div className="thermal-in-words">
                <span>In Words:</span> <i>{numToWords(receipt.amountPaid)}</i>
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
