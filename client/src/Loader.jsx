import React from "react";

/**
 * Concentric Arc 3-Color Dynamic Gyro Loader
 * Features neon green (#38ff8e), amber gold (#ffbe0b), and hot pink (#ff086e) concentric arcs.
 */
export default function Loader({
  size = 120,
  text = "",
  inline = false,
  className = "",
  style = {},
}) {
  const isInline = inline || (typeof size === "number" && size <= 28);
  const sizeValue = typeof size === "number" ? `${size}px` : size;

  if (isInline) {
    return (
      <span
        className={`app-loader-inline ${className}`.trim()}
        style={{ "--loader-size": sizeValue, ...style }}
        role="status"
        aria-label={text || "Loading…"}
      >
        <span className="loader" />
        {text ? <span className="app-loader-text">{text}</span> : null}
      </span>
    );
  }

  return (
    <div
      className={`app-loader-container ${className}`.trim()}
      style={{ "--loader-size": sizeValue, ...style }}
      role="status"
      aria-label={text || "Loading…"}
    >
      <div className="loader" />
      {text ? <p className="app-loader-text">{text}</p> : null}
    </div>
  );
}
