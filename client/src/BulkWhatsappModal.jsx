import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Search,
  Power,
  Check,
  AlertTriangle,
  CheckCheck,
} from "lucide-react";
import { api } from "./api";

export default function BulkWhatsappModal({
  isOpen,
  onClose,
  records,
  cls,
  sec,
  session,
  toast,
  onRecordUpdated,
}) {
  if (!isOpen) return null;

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [dispatching, setDispatching] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, studentName: "" });
  const [rowStatus, setRowStatus] = useState({});
  const abortRef = useRef(false);

  // Analyze records
  const analyzed = records.map((r) => {
    const rawMobile = String(r.student.mobile || "").replace(/\D/g, "");
    const hasValidMobile = /^\d{10,15}$/.test(rawMobile);
    const sentAt = r.report?.whatsappSentAt;
    return {
      record: r,
      student: r.student,
      report: r.report,
      rawMobile,
      hasValidMobile,
      sentAt,
    };
  });

  const validCount = analyzed.filter((a) => a.hasValidMobile).length;
  const missingCount = analyzed.filter((a) => !a.hasValidMobile).length;
  const alreadySentCount = analyzed.filter((a) => a.sentAt).length;

  // Initial selection: select unsent with valid mobile by default, or all valid if all unsent
  useEffect(() => {
    const defaultIds = new Set();
    const unsentValid = analyzed.filter((a) => a.hasValidMobile && !a.sentAt);
    if (unsentValid.length > 0) {
      unsentValid.forEach((a) => defaultIds.add(String(a.student._id)));
    } else {
      analyzed.filter((a) => a.hasValidMobile).forEach((a) => defaultIds.add(String(a.student._id)));
    }
    setSelectedIds(defaultIds);
    setRowStatus({});
    setDispatching(false);
    setProgress({ current: 0, total: 0, studentName: "" });
    abortRef.current = false;
  }, [records]);

  const selectFilter = (type) => {
    if (dispatching) return;
    const newSet = new Set();
    if (type === "unsent") {
      analyzed.filter((a) => a.hasValidMobile && !a.sentAt).forEach((a) => newSet.add(String(a.student._id)));
    } else if (type === "all") {
      analyzed.filter((a) => a.hasValidMobile).forEach((a) => newSet.add(String(a.student._id)));
    } else if (type === "none") {
      // empty
    }
    setSelectedIds(newSet);
  };

  const toggleSelect = (id) => {
    if (dispatching) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startDispatch = async () => {
    if (selectedIds.size === 0 || dispatching) return;
    if (
      !confirm(
        `Send password-locked report cards to ${selectedIds.size} parent(s) in Class ${cls} - ${sec} via WhatsApp?`,
      )
    )
      return;

    setDispatching(true);
    abortRef.current = false;

    const targetList = analyzed.filter((a) => selectedIds.has(String(a.student._id)) && a.hasValidMobile);
    setProgress({ current: 0, total: targetList.length, studentName: "" });

    let sentSuccess = 0;
    let failedCount = 0;

    for (let i = 0; i < targetList.length; i++) {
      if (abortRef.current) {
        toast("WhatsApp dispatch paused / stopped by user.", true);
        break;
      }

      const item = targetList[i];
      const sid = String(item.student._id);

      setProgress({
        current: i + 1,
        total: targetList.length,
        studentName: item.student.name,
      });

      setRowStatus((prev) => ({
        ...prev,
        [sid]: { state: "sending" },
      }));

      try {
        const result = await api(`/reports/${item.student._id}/${session}/whatsapp`, {
          method: "POST",
          body: {},
        });

        sentSuccess++;
        setRowStatus((prev) => ({
          ...prev,
          [sid]: { state: "sent", sentAt: result.sentAt, recipient: result.recipient },
        }));

        if (onRecordUpdated) {
          onRecordUpdated(item.student._id, result.sentAt);
        }
      } catch (err) {
        failedCount++;
        setRowStatus((prev) => ({
          ...prev,
          [sid]: { state: "failed", error: err.message },
        }));
      }

      // Safe throttling between messages (850ms)
      if (i < targetList.length - 1 && !abortRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 850));
      }
    }

    setDispatching(false);
    if (!abortRef.current) {
      toast(`WhatsApp dispatch complete: ${sentSuccess} sent successfully, ${failedCount} failed.`);
    }
  };

  const stopDispatch = () => {
    abortRef.current = true;
  };

  // Filter list by search
  const filtered = analyzed.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.student.name.toLowerCase().includes(q) ||
      String(a.student.admissionNo || "").toLowerCase().includes(q) ||
      String(a.student.mobile || "").includes(q)
    );
  });

  const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="modal-backdrop">
      <div className="modal bulk-modal-xl">
        <div className="modal-head">
          <div>
            <h2>Bulk WhatsApp Dispatcher</h2>
            <span style={{ fontSize: 12, color: "#6d858e" }}>
              Class {cls} - Section {sec} · Session {session}
            </span>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            disabled={dispatching}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="bulk-metrics-bar">
          <div className="bulk-metric-item">
            <span>Published Reports</span>
            <b>{records.length}</b>
          </div>
          <div className="bulk-metric-item ready">
            <span>Valid WhatsApp No.</span>
            <b>{validCount}</b>
          </div>
          <div className="bulk-metric-item missing">
            <span>Missing Number</span>
            <b>{missingCount}</b>
          </div>
          <div className="bulk-metric-item sent">
            <span>Already Sent</span>
            <b>{alreadySentCount}</b>
          </div>
        </div>

        {/* Selection Options & Search Bar */}
        <div className="bulk-options-bar">
          <div className="bulk-filter-toggles">
            <button
              type="button"
              className="bulk-filter-pill"
              onClick={() => selectFilter("unsent")}
              disabled={dispatching}
            >
              Select Unsent ({analyzed.filter((a) => a.hasValidMobile && !a.sentAt).length})
            </button>
            <button
              type="button"
              className="bulk-filter-pill"
              onClick={() => selectFilter("all")}
              disabled={dispatching}
            >
              Select All Valid ({validCount})
            </button>
            <button
              type="button"
              className="bulk-filter-pill"
              onClick={() => selectFilter("none")}
              disabled={dispatching}
            >
              Deselect All
            </button>
          </div>
          <input
            type="search"
            className="bulk-modal-search"
            placeholder="Search student or adm no…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={dispatching}
          />
        </div>

        {/* Live Progress Panel */}
        {(dispatching || progress.current > 0) && (
          <div className="bulk-progress-panel">
            <div className="bulk-progress-header">
              <span>
                {dispatching ? "Sending WhatsApp reports in progress…" : "Dispatch process completed"}
              </span>
              <span>
                {progress.current} / {progress.total} ({percent}%)
              </span>
            </div>
            <div className="bulk-progress-track">
              <div className="bulk-progress-fill" style={{ width: `${percent}%` }} />
            </div>
            {dispatching && progress.studentName && (
              <div className="bulk-progress-current">
                Now sending to: <b>{progress.studentName}</b>…
              </div>
            )}
          </div>
        )}

        {/* Table List */}
        <div className="bulk-table-container">
          <table className="bulk-dispatch-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size > 0 &&
                      filtered.filter((f) => f.hasValidMobile).every((f) => selectedIds.has(String(f.student._id)))
                    }
                    onChange={(e) => {
                      if (e.target.checked) selectFilter("all");
                      else selectFilter("none");
                    }}
                    disabled={dispatching}
                  />
                </th>
                <th>Student</th>
                <th>Adm No</th>
                <th>WhatsApp Number</th>
                <th>Prior Delivery</th>
                <th>Dispatch Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const sid = String(item.student._id);
                const isSelected = selectedIds.has(sid);
                const cur = rowStatus[sid];

                let statusBadge;
                if (cur?.state === "sending") {
                  statusBadge = (
                    <span className="bulk-status-pill sending">
                      <Loader2 size={12} className="spin" /> Sending…
                    </span>
                  );
                } else if (cur?.state === "sent") {
                  statusBadge = (
                    <span className="bulk-status-pill sent">
                      <CheckCircle2 size={12} /> Delivered
                    </span>
                  );
                } else if (cur?.state === "failed") {
                  statusBadge = (
                    <span className="bulk-status-pill failed" title={cur.error}>
                      <AlertCircle size={12} /> Failed
                    </span>
                  );
                } else if (!item.hasValidMobile) {
                  statusBadge = (
                    <span className="bulk-status-pill missing">
                      <AlertTriangle size={12} /> Missing No.
                    </span>
                  );
                } else if (isSelected) {
                  statusBadge = (
                    <span className="bulk-status-pill ready">
                      <Check size={12} /> Ready
                    </span>
                  );
                } else {
                  statusBadge = <span style={{ color: "#94a3b8", fontSize: 11 }}>Excluded</span>;
                }

                return (
                  <tr key={sid} style={{ opacity: item.hasValidMobile ? 1 : 0.65 }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(sid)}
                        disabled={!item.hasValidMobile || dispatching}
                      />
                    </td>
                    <td>
                      <b>{item.student.name}</b>
                    </td>
                    <td>{item.student.admissionNo}</td>
                    <td>
                      {item.hasValidMobile ? (
                        <span>{item.student.mobile}</span>
                      ) : (
                        <span style={{ color: "#dc2626", fontStyle: "italic" }}>Not provided</span>
                      )}
                    </td>
                    <td>
                      {item.report?.whatsappDeliveryStatus === "read" ? (
                        <span className="wa-status-badge read" title={item.report.whatsappReadAt ? `Read ${new Date(item.report.whatsappReadAt).toLocaleString()}` : ""}>
                          <CheckCheck size={13} className="blue-tick" /> Read
                        </span>
                      ) : item.report?.whatsappDeliveryStatus === "delivered" ? (
                        <span className="wa-status-badge delivered" title={item.report.whatsappDeliveredAt ? `Delivered ${new Date(item.report.whatsappDeliveredAt).toLocaleString()}` : ""}>
                          <CheckCheck size={13} /> Delivered
                        </span>
                      ) : item.report?.whatsappDeliveryStatus === "failed" ? (
                        <span className="wa-status-badge failed" title={item.report.whatsappFailureReason || "Failed"}>
                          <AlertCircle size={13} /> Failed
                        </span>
                      ) : item.sentAt ? (
                        <span className="wa-status-badge sent" title={new Date(item.sentAt).toLocaleString()}>
                          <Clock size={12} /> Sent
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: 11 }}>Unsent</span>
                      )}
                    </td>
                    <td>{statusBadge}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "24px 0", color: "#64748b" }}>
                    No students matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="bulk-modal-footer">
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Selected: <b>{selectedIds.size}</b> / {validCount} valid students
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {dispatching ? (
              <button type="button" className="btn bulk-stop-btn" onClick={stopDispatch}>
                <Power size={16} /> Stop Dispatch
              </button>
            ) : (
              <>
                <button type="button" className="btn" onClick={onClose}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn bulk-start-btn"
                  onClick={startDispatch}
                  disabled={selectedIds.size === 0}
                >
                  <Send size={16} /> Start WhatsApp Dispatch ({selectedIds.size})
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

