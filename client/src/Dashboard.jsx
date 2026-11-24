import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  BookOpen,
  CheckCircle2,
  FileText,
  TrendingUp,
  Bot,
  Sparkles,
  Clock,
  ClipboardList,
  UserCheck,
  ShieldAlert,
  Bell,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Search,
  Settings,
  Plus,
  X,
  MessageSquare,
  Check,
  ExternalLink,
  Award,
  GraduationCap,
  Flame,
  Brain,
  BookmarkCheck,
  HelpCircle,
  Briefcase,
  Play,
} from "lucide-react";
import { api, isDemo } from "./api";

// High-fidelity SVG Illustration of Teacher/Educator Character matching reference screenshot
function TeacherAvatarIllustration() {
  return (
    <svg
      viewBox="0 0 240 280"
      className="edunova-hero-avatar-svg"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="blazerGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#1f1005" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
        <linearGradient id="folderGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#3b82f6" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Background Soft Circle Glow */}
      <circle cx="120" cy="140" r="100" fill="#eff6ff" />
      <circle cx="170" cy="80" r="40" fill="#e0f2fe" opacity="0.6" />

      {/* Floating subtle educational sparkles */}
      <circle cx="45" cy="70" r="3" fill="#f59e0b" />
      <polygon points="55,45 58,52 65,55 58,58 55,65 52,58 45,55 52,52" fill="#3b82f6" opacity="0.7" />
      <polygon points="195,50 197,55 202,57 197,59 195,64 193,59 188,57 193,55" fill="#10b981" opacity="0.8" />
      <polygon points="210,130 212,135 217,137 212,139 210,144 208,139 203,137 208,135" fill="#f59e0b" opacity="0.8" />

      {/* Torso / Blazer */}
      <path
        d="M60 270 C60 215, 80 185, 120 185 C160 185, 180 215, 180 270 Z"
        fill="url(#blazerGrad)"
        filter="url(#softGlow)"
      />

      {/* Inner White Blouse Collar */}
      <path d="M102 185 L120 220 L138 185 Z" fill="#ffffff" />
      <path d="M110 185 L120 205 L130 185 Z" fill="#f1f5f9" />

      {/* Blazer Lapels */}
      <path d="M90 188 L115 240 L100 270 L72 270 Z" fill="#2563eb" />
      <path d="M150 188 L125 240 L140 270 L168 270 Z" fill="#1e40af" />

      {/* Neck */}
      <rect x="108" y="160" width="24" height="30" rx="6" fill="url(#skinGrad)" />

      {/* Head & Face */}
      <ellipse cx="120" cy="120" rx="36" ry="42" fill="url(#skinGrad)" />

      {/* Cheeks blush */}
      <circle cx="100" cy="132" r="6" fill="#f43f5e" opacity="0.25" />
      <circle cx="140" cy="132" r="6" fill="#f43f5e" opacity="0.25" />

      {/* Smile */}
      <path d="M112 138 Q120 146 128 138" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Nose */}
      <path d="M119 124 Q122 128 119 130" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Eyes & Eyebrows */}
      <ellipse cx="104" cy="118" rx="4" ry="4.5" fill="#1f2937" />
      <circle cx="106" cy="116" r="1.5" fill="#ffffff" />
      <ellipse cx="136" cy="118" rx="4" ry="4.5" fill="#1f2937" />
      <circle cx="138" cy="116" r="1.5" fill="#ffffff" />

      {/* Stylish Glasses */}
      <rect x="92" y="109" width="24" height="18" rx="6" stroke="#1e293b" strokeWidth="2.5" fill="rgba(255,255,255,0.2)" />
      <rect x="124" y="109" width="24" height="18" rx="6" stroke="#1e293b" strokeWidth="2.5" fill="rgba(255,255,255,0.2)" />
      <path d="M116 117 L124 117" stroke="#1e293b" strokeWidth="2" />
      <path d="M92 116 L84 113" stroke="#1e293b" strokeWidth="2" />
      <path d="M148 116 L156 113" stroke="#1e293b" strokeWidth="2" />

      {/* Elegant Hair */}
      <path
        d="M84 125 C80 80, 100 65, 120 65 C140 65, 160 80, 156 125 C156 145, 162 175, 162 175 C152 170, 146 150, 146 150 C140 100, 100 100, 94 150 C94 150, 88 170, 78 175 C78 175, 84 145, 84 125 Z"
        fill="url(#hairGrad)"
      />
      {/* Front Hair Bangs & Parting */}
      <path d="M95 90 Q118 78 135 92 Q125 105 110 100 Z" fill="#5c2607" />
      <path d="M125 90 Q145 88 152 105 Q135 105 125 90 Z" fill="#3b1604" />

      {/* Small pearl earrings */}
      <circle cx="83" cy="128" r="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
      <circle cx="157" cy="128" r="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />

      {/* Hand holding Binder / Tablet on Left */}
      <rect x="52" y="210" width="36" height="50" rx="4" transform="rotate(-12 52 210)" fill="url(#folderGrad)" stroke="#ffffff" strokeWidth="2" />
      <rect x="58" y="218" width="24" height="3" rx="1" transform="rotate(-12 58 218)" fill="#ffffff" opacity="0.8" />
      <rect x="56" y="226" width="18" height="3" rx="1" transform="rotate(-12 56 226)" fill="#ffffff" opacity="0.6" />
      {/* Fingers holding binder */}
      <path d="M80 230 C86 230, 88 245, 80 248 Z" fill="url(#skinGrad)" />
      <path d="M80 238 C86 238, 88 253, 80 256 Z" fill="url(#skinGrad)" />

      {/* Right Arm raised in friendly wave gesture */}
      <path
        d="M165 210 Q185 180 195 150 Q205 152 195 170 Q180 205 168 235 Z"
        fill="url(#blazerGrad)"
      />
      {/* Waving Hand */}
      <circle cx="198" cy="144" r="9" fill="url(#skinGrad)" />
      <path d="M192 138 L194 132 C194 130 197 130 197 132 L196 138" stroke="url(#skinGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M197 136 L201 129 C201 127 204 127 204 129 L200 137" stroke="url(#skinGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M201 138 L206 133 C206 131 209 131 209 133 L204 140" stroke="url(#skinGrad)" strokeWidth="3" strokeLinecap="round" />
      {/* Wave Motion Lines */}
      <path d="M212 134 Q216 138 212 142" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M216 131 Q221 138 216 145" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}

// Sparkline SVG Waves for the 4 metric cards
function MetricSparkline({ color = "#2563eb", points = [12, 18, 14, 24, 20, 28, 26, 34] }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const height = 36;
  const width = 120;
  const step = width / (points.length - 1);

  const coords = points.map((p, idx) => {
    const x = idx * step;
    const y = height - ((p - min) / (max - min || 1)) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const pathD = "M " + coords.join(" L ");

  return (
    <svg width={width} height={height} className="metric-sparkline-svg" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`sparkGrad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathD} L ${width},${height} L 0,${height} Z`}
        fill={`url(#sparkGrad-${color.replace("#", "")})`}
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Dashboard({ students = [], config = {}, open, go, user = {}, toast }) {
  // Calendar State
  const [selectedDate, setSelectedDate] = useState(20);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(4); // 4 = May
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = months[currentMonthIndex];
  const currentYear = 2026;

  // Active Modals
  const [activeModal, setActiveModal] = useState(null); // 'lessonPlan' | 'contentGen' | 'quiz' | 'timetable' | 'aiAssistant'
  const [lessonPrompt, setLessonPrompt] = useState("");
  const [lessonSubject, setLessonSubject] = useState("Physics - Class 10A");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Dynamic greetings
  const currentHour = new Date().getHours();
  let timeGreeting = "Good morning";
  if (currentHour >= 12 && currentHour < 17) timeGreeting = "Good afternoon";
  else if (currentHour >= 17) timeGreeting = "Good evening";

  // Dashboard role label
  const roleLabel =
    user.role === "admin"
      ? "Administrator Dashboard"
      : user.role === "principal"
      ? "Principal Dashboard"
      : "Teacher Dashboard";

  const firstName = user.name ? user.name.split(" ")[0] : "Educator";
  const formalGreetingName = user.gender === "female" ? `Ms. ${firstName}` : `${user.name || "Teacher"}`;

  // Unique classes count
  const groups = new Set((students || []).map((s) => s.className + "/" + s.section));
  const classCount = groups.size || 4;
  const studentTotal = (students && students.length) ? students.length : 128;

  const handleCreateLessonPlan = () => {
    setActiveModal("lessonPlan");
    setAiResult(null);
  };

  const handleGenerateContent = () => {
    setActiveModal("contentGen");
    setAiResult(null);
  };

  const runAiSimulation = (type) => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      if (type === "lesson") {
        setAiResult({
          title: `AI Lesson Plan: ${lessonSubject}`,
          objectives: [
            "Explain Newton's Laws with interactive real-world robotics analogies.",
            "Conduct hands-on friction and gravity simulation lab.",
            "Assess comprehension using 5 auto-generated check questions.",
          ],
          duration: "45 Minutes",
          materials: "Smart Whiteboard, PhET Simulation, Laboratory Worksheets",
        });
      } else if (type === "content") {
        setAiResult({
          title: "Auto-Generated Physics Worksheet: Force & Motion",
          questions: [
            "Q1. Calculate the acceleration of a 5kg mass under a net force of 20N.",
            "Q2. Contrast Static Friction vs Kinetic Friction in automated conveyor belts.",
            "Q3. Draw the free-body diagram of a drone ascending at constant speed.",
          ],
        });
      }
    }, 900);
  };

  return (
    <div className="edunova-dashboard-wrapper">
      {/* Dashboard Top Title Row */}
      <div className="edunova-top-row">
        <div className="edunova-title-block">
          <h1 className="edunova-page-title">{roleLabel}</h1>
          <span className="edunova-session-badge">
            <span className="live-dot" /> Session {config.session || "2026-2027"} Active
          </span>
        </div>
      </div>

      {/* Main 2-Column Split: Left (73%) | Right (27%) */}
      <div className="edunova-dashboard-grid">
        {/* =========================================================
            LEFT COLUMN: Main Feed, Metrics, Quick Links, Activities & Charts
            ========================================================= */}
        <div className="edunova-main-column">
          {/* 1. Hero Greeting Banner */}
          <div className="edunova-hero-banner">
            <div className="hero-banner-character-col">
              <TeacherAvatarIllustration />
            </div>

            <div className="hero-banner-content-col">
              <h2 className="hero-greeting-heading">
                {timeGreeting}, {formalGreetingName}! <span className="wave-hand">👋</span>
              </h2>
              <p className="hero-quote-text">Empower minds. Inspire futures.</p>
              <p className="hero-status-summary">
                You have <b>3 classes</b> today and <b className="highlight-tasks">12 pending tasks</b>.
              </p>
              <button
                className="btn-hero-primary"
                onClick={() => go("students")}
                title="Open Student Roster"
              >
                View My Classes <ArrowRight size={16} />
              </button>
            </div>

            {/* Right Mini AI Action Cards inside Hero */}
            <div className="hero-banner-ai-stack">
              <div
                className="hero-ai-card purple"
                onClick={handleCreateLessonPlan}
                role="button"
                tabIndex={0}
              >
                <div className="ai-card-top">
                  <div className="ai-card-icon-box purple">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="ai-card-title">AI Lesson Planner</h4>
                    <p className="ai-card-desc">Create smart lesson plans in seconds with AI.</p>
                  </div>
                </div>
                <span className="ai-card-action-link purple">
                  Create Lesson Plan <ChevronRight size={14} />
                </span>
              </div>

              <div
                className="hero-ai-card blue"
                onClick={handleGenerateContent}
                role="button"
                tabIndex={0}
              >
                <div className="ai-card-top">
                  <div className="ai-card-icon-box blue">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h4 className="ai-card-title">AI Content Generator</h4>
                    <p className="ai-card-desc">Generate worksheets, quizzes and study materials instantly.</p>
                  </div>
                </div>
                <span className="ai-card-action-link blue">
                  Generate Content <ChevronRight size={14} />
                </span>
              </div>
            </div>
          </div>

          {/* 2. Key Metrics Row (4 Cards with Sparklines) */}
          <div className="edunova-kpi-quad-grid">
            {/* KPI 1: Today's Classes */}
            <div className="edunova-stat-card blue" onClick={() => setActiveModal("timetable")}>
              <div className="stat-card-header">
                <div>
                  <span className="stat-card-label">Today's Classes</span>
                  <div className="stat-card-value">3</div>
                  <div className="stat-card-subtext">Next: Physics - 10A (09:30 AM - 10:15 AM)</div>
                </div>
                <div className="stat-card-icon blue">
                  <Calendar size={20} />
                </div>
              </div>
              <div className="stat-card-sparkline-row">
                <MetricSparkline color="#2563eb" points={[10, 14, 18, 16, 22, 28, 24, 32]} />
              </div>
            </div>

            {/* KPI 2: Student Count */}
            <div className="edunova-stat-card green" onClick={() => go("students")}>
              <div className="stat-card-header">
                <div>
                  <span className="stat-card-label">Student Count</span>
                  <div className="stat-card-value">{studentTotal}</div>
                  <div className="stat-card-subtext">Across {classCount} Classes</div>
                </div>
                <div className="stat-card-icon green">
                  <Users size={20} />
                </div>
              </div>
              <div className="stat-card-sparkline-row">
                <MetricSparkline color="#10b981" points={[12, 19, 15, 23, 20, 26, 30, 35]} />
              </div>
            </div>

            {/* KPI 3: Assignments to Grade */}
            <div className="edunova-stat-card purple" onClick={() => go("analytics")}>
              <div className="stat-card-header">
                <div>
                  <span className="stat-card-label">Assignments to Grade</span>
                  <div className="stat-card-value">12</div>
                  <div className="stat-card-subtext">Due within 3 days</div>
                </div>
                <div className="stat-card-icon purple">
                  <ClipboardList size={20} />
                </div>
              </div>
              <div className="stat-card-sparkline-row">
                <MetricSparkline color="#8b5cf6" points={[8, 12, 10, 16, 14, 22, 18, 25]} />
              </div>
            </div>

            {/* KPI 4: Pending Leave Requests */}
            <div className="edunova-stat-card amber" onClick={() => go("attendance")}>
              <div className="stat-card-header">
                <div>
                  <span className="stat-card-label">Pending Leave Requests</span>
                  <div className="stat-card-value">2</div>
                  <div className="stat-card-subtext">Requires your approval</div>
                </div>
                <div className="stat-card-icon amber">
                  <UserCheck size={20} />
                </div>
              </div>
              <div className="stat-card-sparkline-row">
                <MetricSparkline color="#f59e0b" points={[5, 9, 7, 11, 8, 14, 12, 16]} />
              </div>
            </div>
          </div>

          {/* 3. Quick Links Section */}
          <div className="edunova-white-panel quick-links-panel">
            <div className="panel-header-row">
              <h3 className="panel-title">Quick Links</h3>
              <button className="panel-text-btn" onClick={() => go("settings")}>
                Customize <Settings size={14} />
              </button>
            </div>

            <div className="quick-links-pill-grid">
              <button className="quick-link-btn" onClick={() => go("students")}>
                <div className="quick-icon-pill blue">
                  <Users size={18} />
                </div>
                <span>Class Roster</span>
              </button>

              <button className="quick-link-btn" onClick={() => setActiveModal("timetable")}>
                <div className="quick-icon-pill purple">
                  <Calendar size={18} />
                </div>
                <span>Timetable</span>
              </button>

              <button className="quick-link-btn" onClick={() => go("studio")}>
                <div className="quick-icon-pill green">
                  <BookOpen size={18} />
                </div>
                <span>Lesson Plans</span>
              </button>

              <button className="quick-link-btn" onClick={() => go("attendance")}>
                <div className="quick-icon-pill cyan">
                  <CheckCircle2 size={18} />
                </div>
                <span>Attendance</span>
              </button>

              <button className="quick-link-btn" onClick={() => go("analytics")}>
                <div className="quick-icon-pill amber">
                  <FileText size={18} />
                </div>
                <span>Assignments</span>
              </button>

              <button className="quick-link-btn" onClick={() => go("analytics")}>
                <div className="quick-icon-pill teal">
                  <TrendingUp size={18} />
                </div>
                <span>Results</span>
              </button>

              <button className="quick-link-btn" onClick={() => setActiveModal("quiz")}>
                <div className="quick-icon-pill indigo">
                  <Bot size={18} />
                </div>
                <span>AI Quiz Builder</span>
              </button>
            </div>
          </div>

          {/* 4. Middle 3-Card Row: Upcoming Activities | Homework Submissions | Performance Overview */}
          <div className="edunova-tri-grid">
            {/* Card 1: Upcoming Activities */}
            <div className="edunova-white-panel activities-panel">
              <div className="panel-header-row">
                <h3 className="panel-title">Upcoming Activities</h3>
                <button className="panel-text-link" onClick={() => setActiveModal("timetable")}>
                  View All
                </button>
              </div>

              <div className="activity-items-stack">
                <div className="activity-item-row">
                  <div className="date-badge-box blue">
                    <span className="date-month">MAY</span>
                    <span className="date-num">21</span>
                  </div>
                  <div className="activity-details">
                    <h5 className="activity-name">Physics Practical - Lab Session</h5>
                    <p className="activity-meta">Class 10A • 09:30 AM - 11:00 AM</p>
                  </div>
                </div>

                <div className="activity-item-row">
                  <div className="date-badge-box purple">
                    <span className="date-month">MAY</span>
                    <span className="date-num">22</span>
                  </div>
                  <div className="activity-details">
                    <h5 className="activity-name">Chemistry Quiz</h5>
                    <p className="activity-meta">Class 11B • 10:30 AM - 11:00 AM</p>
                  </div>
                </div>

                <div className="activity-item-row">
                  <div className="date-badge-box amber">
                    <span className="date-month">MAY</span>
                    <span className="date-num">23</span>
                  </div>
                  <div className="activity-details">
                    <h5 className="activity-name">Maths Worksheet Discussion</h5>
                    <p className="activity-meta">Class 9C • 11:15 AM - 12:00 PM</p>
                  </div>
                </div>

                <div className="activity-item-row">
                  <div className="date-badge-box green">
                    <span className="date-month">MAY</span>
                    <span className="date-num">24</span>
                  </div>
                  <div className="activity-details">
                    <h5 className="activity-name">Parent-Teacher Meeting</h5>
                    <p className="activity-meta">Virtual • 04:00 PM - 06:00 PM</p>
                  </div>
                </div>
              </div>

              <button
                className="btn-full-calendar"
                onClick={() => setActiveModal("timetable")}
              >
                <Calendar size={14} /> View Full Calendar
              </button>
            </div>

            {/* Card 2: Homework Submissions Circular Donut Chart */}
            <div className="edunova-white-panel homework-donut-panel">
              <div className="panel-header-row">
                <h3 className="panel-title">Homework Submissions</h3>
                <button className="panel-text-link" onClick={() => go("analytics")}>
                  View All
                </button>
              </div>

              <div className="donut-chart-flex-wrap">
                <div className="donut-svg-holder">
                  <svg viewBox="0 0 100 100" className="donut-ring-svg">
                    {/* Background Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="11"
                    />
                    {/* 76% Progress Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="11"
                      strokeDasharray="238.7"
                      strokeDashoffset="57.3"
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="donut-center-label">
                    <span className="donut-center-pct">76%</span>
                    <span className="donut-center-sub">Submitted</span>
                  </div>
                </div>

                <div className="donut-legend-stack">
                  <div className="donut-stat-row">
                    <span className="donut-stat-title">Total Assigned</span>
                    <strong className="donut-stat-num">34</strong>
                  </div>
                  <div className="donut-stat-row">
                    <span className="donut-stat-dot-label">
                      <span className="legend-dot blue" /> Submitted
                    </span>
                    <strong className="donut-stat-num">26</strong>
                  </div>
                  <div className="donut-stat-row">
                    <span className="donut-stat-dot-label">
                      <span className="legend-dot amber" /> Pending
                    </span>
                    <strong className="donut-stat-num">8</strong>
                  </div>
                  <div className="donut-stat-row">
                    <span className="donut-stat-dot-label">
                      <span className="legend-dot red" /> Overdue
                    </span>
                    <strong className="donut-stat-num">3</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Student Performance Overview Bar Chart */}
            <div className="edunova-white-panel performance-bar-panel">
              <div className="panel-header-row">
                <h3 className="panel-title">Student Performance Overview</h3>
                <select className="edunova-select-compact" aria-label="Select Performance Period">
                  <option>This Month</option>
                  <option>Term 1</option>
                  <option>Term 2</option>
                </select>
              </div>

              {/* Bar Chart Representation */}
              <div className="edunova-bar-chart-container">
                <div className="bar-chart-y-axis">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>

                <div className="bar-chart-bars-wrap">
                  {/* Grid Lines */}
                  <div className="bar-grid-line" style={{ bottom: "100%" }} />
                  <div className="bar-grid-line" style={{ bottom: "75%" }} />
                  <div className="bar-grid-line" style={{ bottom: "50%" }} />
                  <div className="bar-grid-line" style={{ bottom: "25%" }} />

                  {/* Classes: 10A, 10B, 11A, 11B, 12A */}
                  {[
                    { cls: "10A", avg: 68, top: 96 },
                    { cls: "10B", avg: 72, top: 92 },
                    { cls: "11A", avg: 84, top: 98 },
                    { cls: "11B", avg: 78, top: 95 },
                    { cls: "12A", avg: 86, top: 99 },
                  ].map((bar) => (
                    <div className="bar-column-group" key={bar.cls}>
                      <div className="bars-pair">
                        <div
                          className="bar-single deep-blue"
                          style={{ height: `${bar.avg}%` }}
                          title={`Class ${bar.cls} Average: ${bar.avg}%`}
                        />
                        <div
                          className="bar-single sky-blue"
                          style={{ height: `${bar.top}%` }}
                          title={`Class ${bar.cls} Top Score: ${bar.top}%`}
                        />
                      </div>
                      <span className="bar-class-label">{bar.cls}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bar-chart-legend">
                <span className="legend-item">
                  <span className="legend-sq deep-blue" /> Class Average %
                </span>
                <span className="legend-item">
                  <span className="legend-sq sky-blue" /> Top Score %
                </span>
              </div>
            </div>
          </div>

          {/* 5. Lower 2-Card Row: AI Student Risk Alerts & Notifications */}
          <div className="edunova-duo-grid">
            {/* Card 1: AI Student Risk Alerts */}
            <div className="edunova-white-panel risk-alerts-panel">
              <div className="panel-header-row">
                <h3 className="panel-title title-with-icon">
                  <ShieldAlert size={18} style={{ color: "#ef4444" }} />
                  AI Student Risk Alerts
                </h3>
                <button className="panel-text-link" onClick={() => go("students")}>
                  View All
                </button>
              </div>

              <div className="risk-students-stack">
                <div className="risk-student-row" onClick={() => go("students")}>
                  <div className="risk-avatar-box">
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=80&q=80"
                      alt="Rohan Mehta"
                      className="risk-avatar-img"
                    />
                  </div>
                  <div className="risk-student-info">
                    <div className="risk-student-name-row">
                      <strong className="risk-student-name">Rohan Mehta (10A)</strong>
                      <span className="risk-badge high">High Risk</span>
                    </div>
                    <p className="risk-student-reason">Declining in Physics & Maths</p>
                  </div>
                </div>

                <div className="risk-student-row" onClick={() => go("students")}>
                  <div className="risk-avatar-box">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                      alt="Aisha Khan"
                      className="risk-avatar-img"
                    />
                  </div>
                  <div className="risk-student-info">
                    <div className="risk-student-name-row">
                      <strong className="risk-student-name">Aisha Khan (11B)</strong>
                      <span className="risk-badge medium">Medium Risk</span>
                    </div>
                    <p className="risk-student-reason">Low assignment submission</p>
                  </div>
                </div>

                <div className="risk-student-row" onClick={() => go("students")}>
                  <div className="risk-avatar-box">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                      alt="Karan Verma"
                      className="risk-avatar-img"
                    />
                  </div>
                  <div className="risk-student-info">
                    <div className="risk-student-name-row">
                      <strong className="risk-student-name">Karan Verma (9C)</strong>
                      <span className="risk-badge low">Low Risk</span>
                    </div>
                    <p className="risk-student-reason">Needs improvement in Tests</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Notifications */}
            <div className="edunova-white-panel notifications-panel">
              <div className="panel-header-row">
                <h3 className="panel-title">Notifications</h3>
                <button className="panel-text-link" onClick={() => setActiveModal("timetable")}>
                  View All
                </button>
              </div>

              <div className="notifications-items-stack">
                <div className="notif-item-row">
                  <div className="notif-icon-box blue">
                    <FileText size={15} />
                  </div>
                  <div className="notif-text-content">
                    <p className="notif-text-primary">
                      <b>New assignment submitted</b>
                      <span className="notif-text-sub">Arjun Singh submitted Physics Worksheet</span>
                    </p>
                  </div>
                  <div className="notif-time-badge">
                    <span>10 min ago</span>
                    <span className="notif-blue-dot" />
                  </div>
                </div>

                <div className="notif-item-row">
                  <div className="notif-icon-box cyan">
                    <UserCheck size={15} />
                  </div>
                  <div className="notif-text-content">
                    <p className="notif-text-primary">
                      <b>Leave request received</b>
                      <span className="notif-text-sub">2 leave requests need your approval</span>
                    </p>
                  </div>
                  <div className="notif-time-badge">
                    <span>1 hr ago</span>
                    <span className="notif-blue-dot" />
                  </div>
                </div>

                <div className="notif-item-row">
                  <div className="notif-icon-box green">
                    <Award size={15} />
                  </div>
                  <div className="notif-text-content">
                    <p className="notif-text-primary">
                      <b>Grades are ready to publish</b>
                      <span className="notif-text-sub">Chemistry Quiz results are ready</span>
                    </p>
                  </div>
                  <div className="notif-time-badge">
                    <span>2 hr ago</span>
                    <span className="notif-blue-dot" />
                  </div>
                </div>

                <div className="notif-item-row">
                  <div className="notif-icon-box purple">
                    <Calendar size={15} />
                  </div>
                  <div className="notif-text-content">
                    <p className="notif-text-primary">
                      <b>Timetable updated</b>
                      <span className="notif-text-sub">New schedule published for Class 10A</span>
                    </p>
                  </div>
                  <div className="notif-time-badge">
                    <span>3 hr ago</span>
                    <span className="notif-blue-dot" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: Calendar, Today's Schedule, Smart Reminders
            ========================================================= */}
        <div className="edunova-side-column">
          {/* 1. Calendar Widget Card */}
          <div className="edunova-white-panel calendar-widget-panel">
            <div className="calendar-month-header">
              <span className="calendar-nav-title">
                {currentMonthName} {currentYear}
              </span>
              <div className="calendar-nav-arrows">
                <button
                  className="cal-arrow-btn"
                  onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 11))}
                  aria-label="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="cal-arrow-btn"
                  onClick={() => setCurrentMonthIndex((prev) => (prev < 11 ? prev + 1 : 0))}
                  aria-label="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="calendar-day-names-row">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* Calendar Days Matrix (May 2026 Layout) */}
            <div className="calendar-days-grid">
              {/* Previous month grey days */}
              <span className="cal-day-cell dim">26</span>
              <span className="cal-day-cell dim">27</span>
              <span className="cal-day-cell dim">28</span>
              <span className="cal-day-cell dim">29</span>
              <span className="cal-day-cell dim">30</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(1)}>1</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(2)}>2</span>

              {/* Week 2 */}
              <span className="cal-day-cell" onClick={() => setSelectedDate(3)}>3</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(4)}>4</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(5)}>5</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(6)}>6</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(7)}>7</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(8)}>8</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(9)}>9</span>

              {/* Week 3 */}
              <span className="cal-day-cell" onClick={() => setSelectedDate(10)}>10</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(11)}>11</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(12)}>12</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(13)}>13</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(14)}>14</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(15)}>15</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(16)}>16</span>

              {/* Week 4 */}
              <span className="cal-day-cell" onClick={() => setSelectedDate(17)}>17</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(18)}>18</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(19)}>19</span>
              {/* Day 20 Selected in Blue Badge */}
              <span
                className={`cal-day-cell ${selectedDate === 20 ? "active-today" : ""}`}
                onClick={() => setSelectedDate(20)}
              >
                20
              </span>
              <span
                className={`cal-day-cell has-event ${selectedDate === 21 ? "active-today" : ""}`}
                onClick={() => setSelectedDate(21)}
              >
                21
              </span>
              <span
                className={`cal-day-cell has-event ${selectedDate === 22 ? "active-today" : ""}`}
                onClick={() => setSelectedDate(22)}
              >
                22
              </span>
              <span
                className={`cal-day-cell has-event ${selectedDate === 23 ? "active-today" : ""}`}
                onClick={() => setSelectedDate(23)}
              >
                23
              </span>

              {/* Week 5 */}
              <span
                className={`cal-day-cell has-event ${selectedDate === 24 ? "active-today" : ""}`}
                onClick={() => setSelectedDate(24)}
              >
                24
              </span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(25)}>25</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(26)}>26</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(27)}>27</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(28)}>28</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(29)}>29</span>
              <span className="cal-day-cell" onClick={() => setSelectedDate(30)}>30</span>

              {/* Next Month Overflow */}
              <span className="cal-day-cell" onClick={() => setSelectedDate(31)}>31</span>
              <span className="cal-day-cell dim">1</span>
              <span className="cal-day-cell dim">2</span>
              <span className="cal-day-cell dim">3</span>
              <span className="cal-day-cell dim">4</span>
              <span className="cal-day-cell dim">5</span>
              <span className="cal-day-cell dim">6</span>
            </div>
          </div>

          {/* 2. Today's Schedule Card */}
          <div className="edunova-white-panel today-schedule-panel">
            <div className="panel-header-row">
              <h3 className="panel-title">Today's Schedule</h3>
              <button className="panel-text-link" onClick={() => setActiveModal("timetable")}>
                View Timetable
              </button>
            </div>

            <div className="schedule-timeline-stack">
              {/* Item 1 */}
              <div className="schedule-timeline-item">
                <div className="time-badge-cell">
                  <span className="time-start">08:30 AM</span>
                  <span className="time-end">09:15 AM</span>
                </div>
                <div className="timeline-connector-bar" />
                <div className="schedule-item-info">
                  <h5 className="schedule-item-title">Class 9C - Physics</h5>
                  <span className="schedule-room-tag">Room 204</span>
                </div>
              </div>

              {/* Item 2 (Active Now with Blue Pill) */}
              <div className="schedule-timeline-item active-current">
                <div className="time-badge-cell highlight">
                  <span className="time-start">09:30 AM</span>
                  <span className="time-end">10:15 AM</span>
                </div>
                <div className="timeline-connector-bar active" />
                <div className="schedule-item-info">
                  <div className="schedule-title-row">
                    <h5 className="schedule-item-title">Class 10A - Physics</h5>
                    <span className="pill-badge-now">Now</span>
                  </div>
                  <span className="schedule-room-tag">Room 205</span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="schedule-timeline-item">
                <div className="time-badge-cell">
                  <span className="time-start">11:15 AM</span>
                  <span className="time-end">12:00 PM</span>
                </div>
                <div className="timeline-connector-bar" />
                <div className="schedule-item-info">
                  <h5 className="schedule-item-title">Class 11B - Physics</h5>
                  <span className="schedule-room-tag">Lab 1</span>
                </div>
              </div>

              {/* Item 4 */}
              <div className="schedule-timeline-item">
                <div className="time-badge-cell">
                  <span className="time-start">02:00 PM</span>
                  <span className="time-end">02:45 PM</span>
                </div>
                <div className="timeline-connector-bar" />
                <div className="schedule-item-info">
                  <h5 className="schedule-item-title">Class 12A - Physics</h5>
                  <span className="schedule-room-tag">Room 206</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Smart Reminders Card */}
          <div className="edunova-white-panel smart-reminders-panel">
            <div className="panel-header-row">
              <h3 className="panel-title">Smart Reminders</h3>
            </div>

            <div className="smart-reminders-stack">
              {/* Reminder 1: Upcoming Lecture */}
              <div
                className="reminder-card-item purple"
                onClick={() => setActiveModal("timetable")}
              >
                <div className="reminder-icon-box purple">
                  <Clock size={16} />
                </div>
                <div className="reminder-text-body">
                  <h6 className="reminder-heading">Upcoming Lecture</h6>
                  <p className="reminder-desc">Class 10A - Physics in 15 mins</p>
                </div>
                <ArrowRight size={14} className="reminder-arrow" />
              </div>

              {/* Reminder 2: Pending Evaluations */}
              <div
                className="reminder-card-item amber"
                onClick={() => go("analytics")}
              >
                <div className="reminder-icon-box amber">
                  <Briefcase size={16} />
                </div>
                <div className="reminder-text-body">
                  <h6 className="reminder-heading">Pending Evaluations</h6>
                  <p className="reminder-desc">12 assignments to grade</p>
                </div>
                <ArrowRight size={14} className="reminder-arrow" />
              </div>

              {/* Reminder 3: Next Free Slot */}
              <div
                className="reminder-card-item green"
                onClick={() => setActiveModal("timetable")}
              >
                <div className="reminder-icon-box green">
                  <CheckCircle2 size={16} />
                </div>
                <div className="reminder-text-body">
                  <h6 className="reminder-heading">Next Free Slot</h6>
                  <p className="reminder-desc">Today 12:00 PM - 02:00 PM</p>
                </div>
                <ArrowRight size={14} className="reminder-arrow" />
              </div>
            </div>

            <button
              className="btn-view-all-reminders"
              onClick={() => setActiveModal("timetable")}
            >
              View All Reminders
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          INTERACTIVE AI MODALS (AI Lesson Planner, Content Gen, Timetable, Quiz)
          ========================================================= */}
      {activeModal === "lessonPlan" && (
        <div className="edunova-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="edunova-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="edunova-modal-header">
              <div className="modal-title-with-icon">
                <span className="modal-icon-pill purple">
                  <Sparkles size={20} />
                </span>
                <div>
                  <h3 className="modal-heading">AI Lesson Planner</h3>
                  <p className="modal-subtitle">Generate syllabus-aligned lesson plans in seconds.</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="edunova-modal-body">
              <div className="form-group mb-12">
                <label>Target Class & Subject</label>
                <input
                  type="text"
                  className="erp-input"
                  value={lessonSubject}
                  onChange={(e) => setLessonSubject(e.target.value)}
                  placeholder="e.g. Physics - Class 10A"
                />
              </div>

              <div className="form-group mb-16">
                <label>Lesson Topic & Key Learning Outcomes</label>
                <textarea
                  className="erp-input"
                  style={{ height: "70px", padding: "8px 12px" }}
                  value={lessonPrompt}
                  onChange={(e) => setLessonPrompt(e.target.value)}
                  placeholder="e.g. Newton's Third Law of Motion with robotic applications..."
                />
              </div>

              {aiGenerating && (
                <div className="ai-generating-loader">
                  <Sparkles size={24} className="spin text-primary" />
                  <span>Nova AI is formulating lesson plan, activities, and quiz questions...</span>
                </div>
              )}

              {aiResult && (
                <div className="ai-result-display-box">
                  <h4 className="result-title">{aiResult.title}</h4>
                  <div className="result-meta-row">
                    <span><b>Duration:</b> {aiResult.duration}</span>
                    <span><b>Materials:</b> {aiResult.materials}</span>
                  </div>
                  <div className="result-objectives">
                    <b>Core Objectives:</b>
                    <ul>
                      {aiResult.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="edunova-modal-footer">
              <button className="btn-cancel-edit" onClick={() => setActiveModal(null)}>
                Close
              </button>
              <button
                className="btn-hero-primary"
                onClick={() => runAiSimulation("lesson")}
                disabled={aiGenerating}
              >
                <Sparkles size={16} /> {aiResult ? "Regenerate Plan" : "Generate Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "contentGen" && (
        <div className="edunova-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="edunova-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="edunova-modal-header">
              <div className="modal-title-with-icon">
                <span className="modal-icon-pill blue">
                  <BookOpen size={20} />
                </span>
                <div>
                  <h3 className="modal-heading">AI Content Generator</h3>
                  <p className="modal-subtitle">Auto-generate worksheets, homework quizzes, and study notes.</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="edunova-modal-body">
              <div className="form-group mb-12">
                <label>Content Type</label>
                <select className="erp-select">
                  <option>Worksheet with Answer Keys</option>
                  <option>10-Question Multiple Choice Quiz</option>
                  <option>Revision Cheat Sheet</option>
                  <option>Homework Assignment</option>
                </select>
              </div>

              <div className="form-group mb-16">
                <label>Topic & Complexity Level</label>
                <input
                  type="text"
                  className="erp-input"
                  defaultValue="Force, Work, and Energy - Class 10"
                  placeholder="Enter topic..."
                />
              </div>

              {aiGenerating && (
                <div className="ai-generating-loader">
                  <Sparkles size={24} className="spin text-primary" />
                  <span>Synthesizing tailored questions and answer key...</span>
                </div>
              )}

              {aiResult && (
                <div className="ai-result-display-box">
                  <h4 className="result-title">{aiResult.title}</h4>
                  <div className="result-objectives">
                    <b>Questions:</b>
                    <ul>
                      {aiResult.questions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="edunova-modal-footer">
              <button className="btn-cancel-edit" onClick={() => setActiveModal(null)}>
                Close
              </button>
              <button
                className="btn-hero-primary"
                onClick={() => runAiSimulation("content")}
                disabled={aiGenerating}
              >
                <Sparkles size={16} /> Generate Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "timetable" && (
        <div className="edunova-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="edunova-modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="edunova-modal-header">
              <div className="modal-title-with-icon">
                <span className="modal-icon-pill purple">
                  <Calendar size={20} />
                </span>
                <div>
                  <h3 className="modal-heading">Weekly Class Timetable</h3>
                  <p className="modal-subtitle">Master schedule for Shree Ram Public School.</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="edunova-modal-body">
              <div className="table-responsive">
                <table className="erp-table timetable-table">
                  <thead>
                    <tr>
                      <th>Time Slot</th>
                      <th>Monday</th>
                      <th>Tuesday</th>
                      <th>Wednesday</th>
                      <th>Thursday</th>
                      <th>Friday</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>08:30 - 09:15</b></td>
                      <td><span className="tt-chip blue">Class 9C (Physics)</span></td>
                      <td><span className="tt-chip green">Class 10A (Maths)</span></td>
                      <td><span className="tt-chip blue">Class 9C (Physics)</span></td>
                      <td><span className="tt-chip purple">Class 11A (Lab)</span></td>
                      <td><span className="tt-chip blue">Class 9C (Physics)</span></td>
                    </tr>
                    <tr>
                      <td><b>09:30 - 10:15</b></td>
                      <td><span className="tt-chip active-highlight">Class 10A (Physics)</span></td>
                      <td><span className="tt-chip blue">Class 9C (Physics)</span></td>
                      <td><span className="tt-chip active-highlight">Class 10A (Physics)</span></td>
                      <td><span className="tt-chip amber">Class 12A (Elective)</span></td>
                      <td><span className="tt-chip green">Class 10A (Maths)</span></td>
                    </tr>
                    <tr>
                      <td><b>10:15 - 10:45</b></td>
                      <td colSpan={5} style={{ textAlign: "center", background: "#f8fafc", color: "#64748b", fontWeight: 700 }}>
                        ☕ Morning Break / Assembly
                      </td>
                    </tr>
                    <tr>
                      <td><b>11:15 - 12:00</b></td>
                      <td><span className="tt-chip purple">Class 11B (Lab 1)</span></td>
                      <td><span className="tt-chip amber">Class 12A (Physics)</span></td>
                      <td><span className="tt-chip purple">Class 11B (Lab 1)</span></td>
                      <td><span className="tt-chip green">Class 10B (Science)</span></td>
                      <td><span className="tt-chip purple">Class 11B (Lab 1)</span></td>
                    </tr>
                    <tr>
                      <td><b>02:00 - 02:45</b></td>
                      <td><span className="tt-chip amber">Class 12A (Room 206)</span></td>
                      <td><span className="tt-chip blue">Class 10A (Tutorial)</span></td>
                      <td><span className="tt-chip amber">Class 12A (Room 206)</span></td>
                      <td><span className="tt-chip green">Class 9B (Science)</span></td>
                      <td><span className="tt-chip amber">Class 12A (Room 206)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="edunova-modal-footer">
              <button className="btn-cancel-edit" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "quiz" && (
        <div className="edunova-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="edunova-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="edunova-modal-header">
              <div className="modal-title-with-icon">
                <span className="modal-icon-pill indigo">
                  <Bot size={20} />
                </span>
                <div>
                  <h3 className="modal-heading">AI Quiz Builder</h3>
                  <p className="modal-subtitle">Generate formative 5-question quizzes for any topic instantly.</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="edunova-modal-body">
              <div className="form-group mb-12">
                <label>Select Target Class</label>
                <select className="erp-select">
                  <option>Class 10A - Physics</option>
                  <option>Class 11B - Physics</option>
                  <option>Class 9C - Science</option>
                  <option>Class 12A - Physics</option>
                </select>
              </div>

              <div className="form-group mb-16">
                <label>Quiz Topic</label>
                <input
                  type="text"
                  className="erp-input"
                  defaultValue="Optics and Refraction"
                  placeholder="Enter topic..."
                />
              </div>

              <div className="ai-result-display-box">
                <h5 style={{ margin: "0 0 8px 0", color: "#1e40af" }}>Sample Generated MCQ #1:</h5>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>
                  What happens to the speed of light as it enters a denser optical medium?
                </p>
                <div style={{ marginTop: "8px", display: "grid", gap: "6px", fontSize: "12.5px" }}>
                  <label><input type="radio" name="opt" defaultChecked /> A) Decreases (Correct)</label>
                  <label><input type="radio" name="opt" /> B) Increases</label>
                  <label><input type="radio" name="opt" /> C) Remains identical</label>
                  <label><input type="radio" name="opt" /> D) Becomes infinite</label>
                </div>
              </div>
            </div>

            <div className="edunova-modal-footer">
              <button className="btn-cancel-edit" onClick={() => setActiveModal(null)}>
                Close
              </button>
              <button
                className="btn-hero-primary"
                onClick={() => {
                  toast && toast.success("AI Quiz published to student portal!");
                  setActiveModal(null);
                }}
              >
                <Check size={16} /> Publish Quiz to Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
