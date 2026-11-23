import React, { useState, useEffect, useRef } from "react";
import {
  Bus,
  Navigation,
  Users,
  Clock,
  Plus,
  Trash2,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  Phone,
  ShieldCheck,
  RefreshCw,
  X,
  MapPin,
  Calendar,
  FileText,
  UserCheck,
  Layers,
  ArrowRight,
} from "lucide-react";
import { api } from "./api";

export default function Transport({ user, toast, initialTab = "routes" }) {
  const [tab, setTab] = useState(initialTab); // routes | vehicles | roster

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all transport data
  const loadTransportData = async () => {
    setLoading(true);
    try {
      const [rList, vList, rosList] = await Promise.all([
        api("/transport/routes"),
        api("/transport/vehicles"),
        api("/transport/roster"),
      ]);
      setRoutes(rList || []);
      setVehicles(vList || []);
      setRoster(rosList || []);
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransportData();
  }, []);

  const totalCapacity = vehicles.reduce((sum, v) => sum + (v.capacity || 0), 0);
  const enrolledStudents = roster.length;
  const capacityPct = totalCapacity > 0 ? Math.round((enrolledStudents / totalCapacity) * 100) : 0;

  return (
    <div className="transport-module">
      <div className="page-title">
        <div>
          <div className="eyebrow">FLEET & LOGISTICS</div>
          <h1>Transport & Bus Operations</h1>
          <p>Sequenced pickup routes, vehicle fleet compliance, driver contacts, and student manifests.</p>
        </div>
      </div>

      {/* KPI Cards Header */}
      <div className="fee-stats-grid">
        <div className="fee-kpi-card purple">
          <div className="fee-kpi-header">
            <span className="fee-kpi-label">ACTIVE ROUTES</span>
            <span className="fee-kpi-icon"><Navigation size={18} /></span>
          </div>
          <div className="fee-kpi-value">{routes.length}</div>
          <div className="fee-kpi-sub">
            <span className="fee-kpi-badge">Covering All Sectors</span>
          </div>
        </div>

        <div className="fee-kpi-card green">
          <div className="fee-kpi-header">
            <span className="fee-kpi-label">FLEET VEHICLES</span>
            <span className="fee-kpi-icon"><Bus size={18} /></span>
          </div>
          <div className="fee-kpi-value">{vehicles.length}</div>
          <div className="fee-kpi-sub">
            <span>Total Capacity: <b>{totalCapacity} Seats</b></span>
          </div>
        </div>

        <div className="fee-kpi-card orange">
          <div className="fee-kpi-header">
            <span className="fee-kpi-label">ENROLLED PASSENGERS</span>
            <span className="fee-kpi-icon"><Users size={18} /></span>
          </div>
          <div className="fee-kpi-value">{enrolledStudents}</div>
          <div className="fee-kpi-sub">
            <span>Fleet Utilization: <b>{capacityPct}%</b></span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="attendance-tabs-bar">
        <button
          className={`att-tab-btn ${tab === "routes" ? "active" : ""}`}
          onClick={() => setTab("routes")}
        >
          <Navigation size={17} /> Route Master & Stops
        </button>
        <button
          className={`att-tab-btn ${tab === "vehicles" ? "active" : ""}`}
          onClick={() => setTab("vehicles")}
        >
          <Bus size={17} /> Fleet & Vehicles
        </button>
        <button
          className={`att-tab-btn ${tab === "roster" ? "active" : ""}`}
          onClick={() => setTab("roster")}
        >
          <Users size={17} /> Passenger Roster & Manifest
        </button>
      </div>

      {/* Tab 1: Route Master */}
      {tab === "routes" && (
        <RouteMasterTab
          routes={routes}
          vehicles={vehicles}
          toast={toast}
          reload={loadTransportData}
        />
      )}

      {/* Tab 2: Fleet & Vehicles */}
      {tab === "vehicles" && (
        <FleetVehiclesTab
          vehicles={vehicles}
          toast={toast}
          reload={loadTransportData}
        />
      )}

      {/* Tab 3: Passenger Roster */}
      {tab === "roster" && (
        <PassengerRosterTab
          roster={roster}
          routes={routes}
          toast={toast}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Subcomponent 1: Route Master & Stops
// ----------------------------------------------------------------------
function RouteMasterTab({ routes, vehicles, toast, reload }) {
  const [showModal, setShowModal] = useState(false);
  const [routeNo, setRouteNo] = useState("");
  const [name, setName] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [stops, setStops] = useState([
    { stopName: "Main Chowk", pickupTime: "07:15 AM", dropTime: "02:30 PM", fare: 800, order: 1 },
    { stopName: "Civil Lines", pickupTime: "07:30 AM", dropTime: "02:15 PM", fare: 1000, order: 2 },
  ]);
  const [saving, setSaving] = useState(false);

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      {
        stopName: "",
        pickupTime: "07:45 AM",
        dropTime: "02:00 PM",
        fare: 1000,
        order: prev.length + 1,
      },
    ]);
  };

  const removeStop = (idx) => {
    setStops((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateStop = (idx, field, val) => {
    setStops((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );
  };

  const handleSaveRoute = async (e) => {
    e.preventDefault();
    if (!routeNo.trim() || !name.trim()) {
      return toast?.("Route number and name are required", true);
    }
    if (!stops.length) {
      return toast?.("Add at least one pickup stop", true);
    }

    setSaving(true);
    try {
      await api("/transport/routes", {
        method: "POST",
        body: {
          routeNo,
          name,
          vehicleId: vehicleId || null,
          stops: stops.map((s, idx) => ({
            ...s,
            fare: Number(s.fare) || 0,
            order: idx + 1,
          })),
        },
      });
      toast?.(`Route ${routeNo} saved successfully!`);
      setShowModal(false);
      setRouteNo("");
      setName("");
      setVehicleId("");
      reload();
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoute = async (id, rNo) => {
    if (!window.confirm(`Are you sure you want to deactivate Route ${rNo}?`)) return;
    try {
      await api(`/transport/routes/${id}`, { method: "DELETE" });
      toast?.(`Route ${rNo} deactivated`);
      reload();
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  return (
    <div className="transport-routes-page">
      <div className="att-controls-bar">
        <div>
          <b>Transport Route Directory</b>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
            Sequenced pickup stops with arrival & departure timings.
          </p>
        </div>
        <button className="btn primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add New Route
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="att-empty">
          <Navigation size={36} />
          <h3>No Transport Routes Created</h3>
          <p>Create routes and assign pickup stops to manage bus logistics.</p>
          <button className="btn primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create First Route
          </button>
        </div>
      ) : (
        <div className="routes-card-grid">
          {routes.map((r) => {
            const v = r.vehicle;
            return (
              <div key={r._id} className="route-detail-card">
                <div className="route-card-header">
                  <div>
                    <span className="route-no-badge">{r.routeNo}</span>
                    <h3 className="route-title">{r.name}</h3>
                  </div>
                  <button
                    className="btn-trash-head"
                    title="Delete Route"
                    onClick={() => handleDeleteRoute(r._id, r.routeNo)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="route-vehicle-info">
                  <div className="route-v-badge">
                    <Bus size={15} />
                    <span>{v ? `${v.vehicleNo} (${v.model || "Bus"})` : "Vehicle Unassigned"}</span>
                  </div>
                  {v?.driverName && (
                    <div className="route-driver-tag">
                      <Phone size={13} />
                      <span>{v.driverName}: <b>{v.driverPhone || "—"}</b></span>
                    </div>
                  )}
                </div>

                <div className="route-stops-timeline">
                  <span className="timeline-title">
                    <MapPin size={13} /> Sequenced Stops ({r.stops?.length || 0})
                  </span>
                  <div className="stops-sequence-list">
                    {r.stops?.map((s, idx) => (
                      <div key={idx} className="stop-sequence-item">
                        <div className="stop-marker">{idx + 1}</div>
                        <div className="stop-details">
                          <b className="stop-name">{s.stopName}</b>
                          <div className="stop-times">
                            <span className="pickup">Pick: {s.pickupTime || "—"}</span>
                            <span className="drop">Drop: {s.dropTime || "—"}</span>
                            <span className="fare">₹{s.fare}/mo</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Route Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content medium">
            <div className="modal-header">
              <h3>Create Bus Route</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveRoute} className="modal-body">
              <div className="field-row">
                <div className="field-group">
                  <label>Route Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. BUS-01 or ROUTE-NORTH"
                    value={routeNo}
                    onChange={(e) => setRouteNo(e.target.value)}
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Assign Vehicle</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                  >
                    <option value="">Select bus / vehicle…</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.vehicleNo} ({v.model || "Bus"} - {v.capacity} Seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field-group">
                <label>Route Description / Path *</label>
                <input
                  type="text"
                  placeholder="e.g. Main Market to School via Civil Lines Bypass"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <div className="fee-heads-header">
                  <label>Sequenced Pickup Stops & Timings</label>
                  <button type="button" className="btn-add-head" onClick={addStop}>
                    <Plus size={14} /> Add Stop
                  </button>
                </div>

                <div className="stops-edit-table-wrap">
                  <table className="fee-heads-table">
                    <thead>
                      <tr>
                        <th>Stop Name</th>
                        <th style={{ width: "110px" }}>Pickup Time</th>
                        <th style={{ width: "110px" }}>Drop Time</th>
                        <th style={{ width: "100px" }}>Monthly Fare</th>
                        <th style={{ width: "40px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {stops.map((s, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              type="text"
                              placeholder="Stop location..."
                              value={s.stopName}
                              onChange={(e) => updateStop(idx, "stopName", e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              placeholder="07:15 AM"
                              value={s.pickupTime}
                              onChange={(e) => updateStop(idx, "pickupTime", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              placeholder="02:30 PM"
                              value={s.dropTime}
                              onChange={(e) => updateStop(idx, "dropTime", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              placeholder="800"
                              value={s.fare}
                              onChange={(e) => updateStop(idx, "fare", e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {stops.length > 1 && (
                              <button
                                type="button"
                                className="btn-trash-head"
                                onClick={() => removeStop(idx)}
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
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary" disabled={saving}>
                  {saving ? "Saving…" : "Save Route"}
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
// Subcomponent 2: Fleet Vehicles Management
// ----------------------------------------------------------------------
function FleetVehiclesTab({ vehicles, toast, reload }) {
  const [showModal, setShowModal] = useState(false);
  const [vehicleNo, setVehicleNo] = useState("");
  const [model, setModel] = useState("Tata Starbus 40-Seater");
  const [capacity, setCapacity] = useState(32);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [conductorName, setConductorName] = useState("");
  const [conductorPhone, setConductorPhone] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [fitnessExpiry, setFitnessExpiry] = useState("");
  const [pucExpiry, setPucExpiry] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleNo.trim()) return toast?.("Vehicle registration number is required", true);

    setSaving(true);
    try {
      await api("/transport/vehicles", {
        method: "POST",
        body: {
          vehicleNo,
          model,
          capacity: Number(capacity) || 30,
          driverName,
          driverPhone,
          conductorName,
          conductorPhone,
          insuranceExpiry,
          fitnessExpiry,
          pucExpiry,
        },
      });
      toast?.(`Vehicle ${vehicleNo} saved successfully!`);
      setShowModal(false);
      setVehicleNo("");
      setDriverName("");
      setDriverPhone("");
      reload();
    } catch (err) {
      toast?.(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVehicle = async (id, vNo) => {
    if (!window.confirm(`Deactivate vehicle ${vNo}?`)) return;
    try {
      await api(`/transport/vehicles/${id}`, { method: "DELETE" });
      toast?.(`Vehicle ${vNo} deactivated`);
      reload();
    } catch (err) {
      toast?.(err.message, true);
    }
  };

  return (
    <div className="transport-fleet-page">
      <div className="att-controls-bar">
        <div>
          <b>School Fleet & Bus Inventory</b>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
            Vehicle capacity, drivers, conductors, and document expiry compliance.
          </p>
        </div>
        <button className="btn primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle Registration</th>
              <th>Make & Model</th>
              <th>Capacity</th>
              <th>Driver Details</th>
              <th>Conductor</th>
              <th>Insurance Expiry</th>
              <th>Fitness Expiry</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  No vehicles registered in fleet yet.
                </td>
              </tr>
            ) : (
              vehicles.map((v) => {
                const isInsExpiring = v.insuranceExpiry && new Date(v.insuranceExpiry) < new Date(Date.now() + 30 * 86400000);
                return (
                  <tr key={v._id}>
                    <td>
                      <div className="vehicle-reg-box">
                        <Bus size={16} />
                        <b>{v.vehicleNo}</b>
                      </div>
                    </td>
                    <td>{v.model || "School Bus"}</td>
                    <td>
                      <span className="capacity-pill">{v.capacity} Seats</span>
                    </td>
                    <td>
                      <div>
                        <b>{v.driverName || "Not assigned"}</b>
                        {v.driverPhone && (
                          <div className="fee-row-sub">
                            <Phone size={12} /> {v.driverPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{v.conductorName || "—"}</span>
                        {v.conductorPhone && (
                          <div className="fee-row-sub">
                            <Phone size={12} /> {v.conductorPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`expiry-pill ${isInsExpiring ? "expiring" : ""}`}>
                        {v.insuranceExpiry || "Not set"}
                      </span>
                    </td>
                    <td>
                      <span className="expiry-pill">{v.fitnessExpiry || "Not set"}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn-trash-head"
                        title="Deactivate Vehicle"
                        onClick={() => handleDeleteVehicle(v._id, v.vehicleNo)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content medium">
            <div className="modal-header">
              <h3>Register School Bus / Van</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveVehicle} className="modal-body">
              <div className="field-row">
                <div className="field-group">
                  <label>Registration Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. UP-14-BT-9821"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Seating Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Bus Model / Make</label>
                <input
                  type="text"
                  placeholder="e.g. Tata Starbus 40-Seater AC"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Driver Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Driver Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Conductor / Helper Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sunil Sharma"
                    value={conductorName}
                    onChange={(e) => setConductorName(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Conductor Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9812345678"
                    value={conductorPhone}
                    onChange={(e) => setConductorPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Insurance Expiry Date</label>
                  <input
                    type="date"
                    value={insuranceExpiry}
                    onChange={(e) => setInsuranceExpiry(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Fitness Expiry Date</label>
                  <input
                    type="date"
                    value={fitnessExpiry}
                    onChange={(e) => setFitnessExpiry(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary" disabled={saving}>
                  {saving ? "Saving…" : "Save Vehicle"}
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
// Subcomponent 3: Passenger Roster & Printable Driver Trip Manifest
// ----------------------------------------------------------------------
function PassengerRosterTab({ roster, routes, toast }) {
  const [selectedRoute, setSelectedRoute] = useState("all");
  const [search, setSearch] = useState("");
  const [showManifest, setShowManifest] = useState(false);

  const filteredRoster = roster.filter((s) => {
    const matchRoute =
      selectedRoute === "all" ||
      (s.transportRouteId?._id === selectedRoute || s.transportRouteId?.routeNo === selectedRoute);
    const matchSearch =
      !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo?.toLowerCase().includes(search.toLowerCase()) ||
      s.transportStop?.toLowerCase().includes(search.toLowerCase());
    return matchRoute && matchSearch;
  });

  const handlePrintManifest = () => {
    window.print();
  };

  return (
    <div className="transport-roster-page">
      <div className="att-controls-bar no-print">
        <div className="att-filter-group">
          <label>FILTER BY ROUTE</label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
          >
            <option value="all">All Routes ({roster.length} Passengers)</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.routeNo} - {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="fee-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search student or stop…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="btn primary"
          onClick={() => setShowManifest(true)}
          disabled={!filteredRoster.length}
        >
          <Printer size={16} /> Driver Trip Manifest
        </button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "50px" }}>#</th>
              <th>Student Details</th>
              <th>Admission No</th>
              <th>Class & Section</th>
              <th>Assigned Route</th>
              <th>Boarding / Drop Stop</th>
              <th>Parent Contact</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoster.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                  No transport passenger records match current filters.
                </td>
              </tr>
            ) : (
              filteredRoster.map((s, idx) => (
                <tr key={s._id}>
                  <td>{idx + 1}</td>
                  <td>
                    <b>{s.name}</b>
                  </td>
                  <td>
                    <span className="att-adm-code">{s.admissionNo}</span>
                  </td>
                  <td>
                    Class {s.className}-{s.section}
                  </td>
                  <td>
                    <span className="route-no-badge">
                      {s.transportRouteId?.routeNo || "Assigned"}
                    </span>
                  </td>
                  <td>
                    <span className="stop-loc-tag">
                      <MapPin size={12} /> {s.transportStop || "School Bus"}
                    </span>
                  </td>
                  <td>
                    {s.mobile ? (
                      <span className="phone-tag">
                        <Phone size={12} /> {s.mobile}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Driver Manifest Modal */}
      {showManifest && (
        <div className="modal-backdrop receipt-modal-backdrop">
          <div className="receipt-modal-dialog a4">
            <div className="receipt-toolbar no-print">
              <b>Driver Trip & Attendance Manifest</b>
              <div className="receipt-toolbar-actions">
                <button className="btn primary" onClick={handlePrintManifest}>
                  <Printer size={16} /> Print Trip Sheet
                </button>
                <button
                  className="btn-close-receipt"
                  onClick={() => setShowManifest(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="receipt-paper a4 manifest-sheet">
              <div className="manifest-header">
                <h2>SHREE RAM PUBLIC SCHOOL</h2>
                <h3>DAILY TRANSPORT TRIP SHEET & PASSENGER MANIFEST</h3>
                <div className="manifest-meta-box">
                  <div>
                    <span>Date:</span> <b>{new Date().toLocaleDateString("en-IN")}</b>
                  </div>
                  <div>
                    <span>Total Students:</span> <b>{filteredRoster.length}</b>
                  </div>
                  <div>
                    <span>Route:</span>{" "}
                    <b>
                      {selectedRoute === "all"
                        ? "Consolidated Fleet"
                        : routes.find((r) => r._id === selectedRoute)?.name || selectedRoute}
                    </b>
                  </div>
                </div>
              </div>

              <table className="manifest-table">
                <thead>
                  <tr>
                    <th style={{ width: "35px" }}>#</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Boarding Stop</th>
                    <th>Emergency Phone</th>
                    <th style={{ width: "70px", textAlign: "center" }}>Morning In</th>
                    <th style={{ width: "70px", textAlign: "center" }}>Drop Out</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoster.map((s, idx) => (
                    <tr key={s._id}>
                      <td>{idx + 1}</td>
                      <td><b>{s.name}</b></td>
                      <td>{s.className}-{s.section}</td>
                      <td>{s.transportStop || "Main Stop"}</td>
                      <td>{s.mobile || "—"}</td>
                      <td style={{ textAlign: "center" }}>[ &nbsp; ]</td>
                      <td style={{ textAlign: "center" }}>[ &nbsp; ]</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="manifest-footer">
                <div>
                  <div className="sign-line" />
                  <span>Driver Signature</span>
                </div>
                <div>
                  <div className="sign-line" />
                  <span>Conductor / Escort Signature</span>
                </div>
                <div>
                  <div className="sign-line" />
                  <span>Transport Supervisor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
