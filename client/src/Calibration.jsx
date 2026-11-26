import React from "react";
import canonical from "../../shared/template-mapping.json";
import { validateMapping } from "../../shared/report-template.js";
export default function Calibration({
  user,
  report,
  side,
  mapping,
  setMapping,
  enabled,
  setEnabled,
  selected,
  setSelected,
  toast,
}) {
  if (user.role !== "admin" || report.status === "published") return null;
  const page = mapping.pages[side] || mapping.pages.front;
  const fields = page.fields,
    field = fields.find((f) => f.id === selected) || fields[0];
  function change(patch) {
    const next = structuredClone(mapping);
    const targetPage = next.pages[side] || next.pages.front;
    Object.assign(
      targetPage.fields.find((f) => f.id === field.id),
      patch,
    );
    next.mappingVersion = mapping.mappingVersion.endsWith("-calibrated")
      ? mapping.mappingVersion
      : mapping.mappingVersion + "-calibrated";
    try {
      validateMapping(next, canonical);
      setMapping(next);
    } catch (e) {
      toast(e.message, true);
    }
  }
  function download() {
    try {
      validateMapping(mapping, canonical);
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(mapping, null, 2) + "\n"], {
          type: "application/json",
        }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "template-mapping.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      toast(e.message, true);
    }
  }
  return (
    <div className="calibration-panel">
      <button className="btn" onClick={() => setEnabled(!enabled)}>
        {enabled ? "Close calibration" : "Calibrate template (admin)"}
      </button>
      {enabled && (
        <>
          <p>
            Preview only. Coordinates use the original{" "}
            {mapping.pages[side].width} × {mapping.pages[side].height} artwork.
            Export JSON, then replace the shared source mapping and rebuild to
            apply. PDF downloads use the installed mapping.
          </p>
          <label>
            Field{" "}
            <select
              value={field.id}
              onChange={(e) => setSelected(e.target.value)}
            >
              {fields.map((f) => (
                <option key={f.id}>{f.id}</option>
              ))}
            </select>
          </label>
          <div className="calibration-inputs">
            {["x", "y", "width", "height", "fontSize"].map((key) => (
              <label key={key}>
                {key}
                <input
                  type="number"
                  step="0.5"
                  value={field[key]}
                  onChange={(e) => change({ [key]: Number(e.target.value) })}
                />
              </label>
            ))}
            <label>
              Alignment
              <select
                value={field.alignment}
                onChange={(e) => change({ alignment: e.target.value })}
              >
                {["left", "center", "right"].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="calibration-inputs">
            {[
              ["←", -1, 0],
              ["→", 1, 0],
              ["↑", 0, -1],
              ["↓", 0, 1],
            ].map(([label, x, y]) => (
              <button
                key={label}
                className="btn"
                aria-label={`Move ${label}`}
                onClick={() => change({ x: field.x + x, y: field.y + y })}
              >
                {label}
              </button>
            ))}
            <button className="btn" onClick={download}>
              Export mapping JSON
            </button>
            <button
              className="btn"
              onClick={() => setMapping(structuredClone(canonical))}
            >
              Reset preview
            </button>
          </div>
        </>
      )}
    </div>
  );
}
