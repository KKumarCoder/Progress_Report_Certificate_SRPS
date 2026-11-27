import React, { useState, useEffect } from "react";
import {
  Users,
  School,
  BookOpen,
  Clock,
  Play,
  Pause,
  Zap,
  Sparkles,
} from "lucide-react";

// Vibrant RGB colors matching authentic physical LED message signs (as in user reference photo)
const RGB_COLORS = [
  { name: "red", class: "led-glow-red", hex: "#ff2a4b" },
  { name: "green", class: "led-glow-green", hex: "#00ff66" },
  { name: "yellow", class: "led-glow-yellow", hex: "#ffea00" },
  { name: "cyan", class: "led-glow-cyan", hex: "#00e5ff" },
  { name: "blue", class: "led-glow-blue", hex: "#2979ff" },
  { name: "magenta", class: "led-glow-magenta", hex: "#d500f9" },
  { name: "orange", class: "led-glow-orange", hex: "#ff9100" },
];

/**
 * Splits text into individual characters with alternating vibrant RGB colors
 * matching the authentic "LIAMS PRODUCT RGB COLOUR" multi-color LED display style.
 */
function renderRgbLetters(text, startOffset = 0) {
  return text.split("").map((char, idx) => {
    if (char === " ") {
      return (
        <span key={idx} className="led-space">
          &nbsp;
        </span>
      );
    }
    const color = RGB_COLORS[(idx + startOffset) % RGB_COLORS.length];
    return (
      <span key={idx} className={`led-char ${color.class}`}>
        {char}
      </span>
    );
  });
}

export default function LedDisplayBoard({
  students = [],
  config = {},
  user = {},
  go = () => {},
}) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState("normal"); // "slow" | "normal" | "fast"
  const [blinkColon, setBlinkColon] = useState(true);

  // Live real-time clock updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setBlinkColon((prev) => !prev);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live current data
  const studentsCount = students.length;
  const groups = new Set(
    students.map((s) => (s.className || "Class") + "/" + (s.section || "A"))
  );
  const sectionsCount = groups.size || 1;
  const session = config.session || "2026-27";
  const schoolName = config.schoolName || "SHREE RAM PUBLIC SCHOOL";

  // Format classes preview e.g. "CLASS 3 - VENUS"
  const classList = Array.from(groups)
    .map((g) => "CLASS " + g.replace("/", " - "))
    .join(" • ");

  const operatorName =
    (user.name || "FACULTY") +
    (user.role ? ` [${user.role.toUpperCase()}]` : "");

  // Format digital time and date
  const hours = currentTime.getHours();
  const minutes = String(currentTime.getMinutes()).padStart(2, "0");
  const seconds = String(currentTime.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = String(hours % 12 || 12).padStart(2, "0");
  const dateStr = currentTime
    .toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

  // Speed durations for smooth CSS marquee
  const speedDurations = {
    slow: "48s",
    normal: "30s",
    fast: "18s",
  };

  // Scrolling Ticker Segments with real & current data
  const tickerItems = [
    {
      badge: "SCHOOL",
      badgeColor: "led-glow-amber",
      text: `★ ${schoolName.toUpperCase()} ★`,
      colored: true,
      offset: 0,
    },
    {
      badge: "AFFILIATION",
      badgeColor: "led-glow-cyan",
      text: "CBSE AFFILIATED (532046) • KANHRA (CH. DADRI)",
      colored: false,
      textColor: "led-glow-cyan",
    },
    {
      badge: "SESSION",
      badgeColor: "led-glow-magenta",
      text: `ACADEMIC SESSION: ${session}`,
      colored: false,
      textColor: "led-glow-magenta",
    },
    {
      badge: "STUDENTS",
      badgeColor: "led-glow-green",
      text: `TOTAL ENROLLED: ${studentsCount} ACTIVE LEARNERS`,
      colored: false,
      textColor: "led-glow-green",
    },
    {
      badge: "SECTIONS",
      badgeColor: "led-glow-yellow",
      text: `ACTIVE SECTIONS: ${sectionsCount} (${classList || "N/A"})`,
      colored: false,
      textColor: "led-glow-yellow",
    },
    {
      badge: "OPERATOR",
      badgeColor: "led-glow-blue",
      text: `LOGGED IN: ${operatorName.toUpperCase()}`,
      colored: false,
      textColor: "led-glow-blue",
    },
    {
      badge: "LIVE CLOCK",
      badgeColor: "led-glow-orange",
      text: `TIME: ${formattedHours}:${minutes}:${seconds} ${ampm} • ${dateStr}`,
      colored: false,
      textColor: "led-glow-orange",
    },
    {
      badge: "STATUS",
      badgeColor: "led-glow-green",
      text: "ALL REPORT SYSTEMS ONLINE & SYNCHRONIZED",
      colored: true,
      offset: 4,
    },
    {
      badge: "EVALUATION",
      badgeColor: "led-glow-cyan",
      text: "READY FOR TERM I & TERM II MARKS ENTRY",
      colored: false,
      textColor: "led-glow-cyan",
    },
  ];

  return (
    <div className="led-board-cabinet">
      {/* 4 Corner Chassis Hex Screws */}
      <div className="led-screw top-left" />
      <div className="led-screw top-right" />
      <div className="led-screw bottom-left" />
      <div className="led-screw bottom-right" />

      {/* Top Hardware Telemetry Header */}
      <div className="led-board-header">
        <div className="led-telemetry-left">
          <div className="led-indicator">
            <span className="led-dot pulse-green" />
            <span className="led-tag">PWR: ON</span>
          </div>
          <div className="led-indicator">
            <span className="led-dot pulse-cyan" />
            <span className="led-tag">RGB P10</span>
          </div>
          <div className="led-indicator">
            <span className="led-dot pulse-amber" />
            <span className="led-tag">SYNC: LIVE</span>
          </div>
        </div>

        <div className="led-telemetry-center led-font">
          <Sparkles size={14} className="led-glow-yellow" />
          <span className="led-header-title">
            {renderRgbLetters("SRPS DIGITAL RGB SIGN BOARD", 1)}
          </span>
          <Sparkles size={14} className="led-glow-cyan" />
        </div>

        <div className="led-telemetry-right">
          {/* Digital Clock */}
          <div className="led-clock-box led-font">
            <Clock size={13} className="led-glow-cyan" />
            <span className="led-glow-cyan">
              {formattedHours}
              <span style={{ opacity: blinkColon ? 1 : 0.2 }}>:</span>
              {minutes}
              <span style={{ opacity: blinkColon ? 1 : 0.2 }}>:</span>
              {seconds}
            </span>
            <span className="led-glow-yellow led-clock-ampm">{ampm}</span>
          </div>

          {/* Controls: Speed & Pause */}
          <div className="led-controls">
            <button
              className={`led-ctrl-btn ${isPaused ? "active" : ""}`}
              onClick={() => setIsPaused((p) => !p)}
              title={isPaused ? "Resume Scrolling" : "Pause Scrolling"}
              type="button"
            >
              {isPaused ? <Play size={11} /> : <Pause size={11} />}
              <span>{isPaused ? "RESUME" : "PAUSE"}</span>
            </button>
            <button
              className="led-ctrl-btn speed-btn"
              onClick={() =>
                setSpeed((s) =>
                  s === "normal" ? "fast" : s === "fast" ? "slow" : "normal"
                )
              }
              title="Change scroll speed"
              type="button"
            >
              <Zap size={11} />
              <span>{speed.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Color Scrolling Digital Message Sign Strip */}
      <div
        className="led-ticker-viewport"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="led-matrix-mesh-overlay" />
        <div
          className={`led-ticker-track ${isPaused ? "paused" : ""}`}
          style={{ animationDuration: speedDurations[speed] || "30s" }}
        >
          {/* Render twice for continuous seamless infinite loop */}
          {[0, 1].map((copyIndex) => (
            <div className="led-ticker-group" key={copyIndex}>
              {tickerItems.map((item, idx) => (
                <div className="led-ticker-item led-font" key={idx}>
                  <span className={`led-badge ${item.badgeColor}`}>
                    [{item.badge}]
                  </span>
                  <span className="led-item-text">
                    {item.colored ? (
                      renderRgbLetters(item.text, item.offset || 0)
                    ) : (
                      <span className={item.textColor}>{item.text}</span>
                    )}
                  </span>
                  <span className="led-separator">★</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 3 Real-time Metric Display Panels (Redesigned Stat Cards) */}
      <div className="led-metrics-grid">
        {/* Metric 1: STUDENTS */}
        <div
          className="led-metric-card led-card-students"
          onClick={() => go("students")}
          role="button"
          tabIndex={0}
          title="Click to view Students Directory"
        >
          <div className="led-matrix-mesh-overlay" />
          <div className="led-card-header">
            <span className="led-card-tag led-font led-glow-green">
              [ 01 // STUDENTS ]
            </span>
            <span className="led-icon-badge green">
              <Users size={17} />
            </span>
          </div>

          <div className="led-card-body">
            <div className="led-digital-value led-font led-glow-green">
              {studentsCount < 10 && studentsCount > 0
                ? `0${studentsCount}`
                : studentsCount}
            </div>
            <div className="led-card-label led-font led-glow-yellow">
              ENROLLED STUDENTS
            </div>
            <div className="led-card-subtext led-font">
              <span className="led-dot-mini green" /> IN YOUR ACCESSIBLE CLASSES
            </div>
          </div>

          {/* Dynamic LED VU-Meter / Equalizer Bar */}
          <div className="led-meter-row">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className={`led-meter-dot ${i < 8 ? "lit green" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Metric 2: CLASS SECTIONS */}
        <div
          className="led-metric-card led-card-sections"
          onClick={() => go("students")}
          role="button"
          tabIndex={0}
          title="Click to view Class Sections"
        >
          <div className="led-matrix-mesh-overlay" />
          <div className="led-card-header">
            <span className="led-card-tag led-font led-glow-cyan">
              [ 02 // CLASS SECTIONS ]
            </span>
            <span className="led-icon-badge cyan">
              <School size={17} />
            </span>
          </div>

          <div className="led-card-body">
            <div className="led-digital-value led-font led-glow-cyan">
              {sectionsCount < 10 ? `0${sectionsCount}` : sectionsCount}
            </div>
            <div className="led-card-label led-font led-glow-cyan">
              ACTIVE SECTIONS
            </div>
            <div className="led-card-subtext led-font">
              <span className="led-dot-mini cyan" />{" "}
              {classList || "ACTIVE SECTION ASSIGNED"}
            </div>
          </div>

          {/* Dynamic LED VU-Meter / Equalizer Bar */}
          <div className="led-meter-row">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className={`led-meter-dot ${i < 6 ? "lit cyan" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Metric 3: ACADEMIC SESSION */}
        <div
          className="led-metric-card led-card-session"
          onClick={() => (user.role === "admin" ? go("settings") : null)}
          role="button"
          tabIndex={0}
          title={
            user.role === "admin"
              ? "Click to view Settings"
              : "Current Academic Session"
          }
        >
          <div className="led-matrix-mesh-overlay" />
          <div className="led-card-header">
            <span className="led-card-tag led-font led-glow-magenta">
              [ 03 // ACADEMIC SESSION ]
            </span>
            <span className="led-icon-badge magenta">
              <BookOpen size={17} />
            </span>
          </div>

          <div className="led-card-body">
            <div className="led-digital-value led-font led-glow-magenta">
              {session}
            </div>
            <div className="led-card-label led-font led-glow-magenta">
              ANNUAL PROGRESS REPORT
            </div>
            <div className="led-card-subtext led-font">
              <span className="led-dot-mini magenta" /> TWO TERMS • COMPLETE REPORT
            </div>
          </div>

          {/* Dynamic LED VU-Meter / Equalizer Bar */}
          <div className="led-meter-row">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className={`led-meter-dot ${i < 9 ? "lit magenta" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
