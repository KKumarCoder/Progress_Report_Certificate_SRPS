import React, { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
  LockKeyhole,
  Loader2,
  Search,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { api, startDemo } from "./api";
import "./login.css";
import PasswordReset from "./PasswordReset";

const roles = [
  {
    id: "teacher",
    name: "Teacher",
    icon: BookOpen,
    description: "Your classroom. Your impact.",
    hint: "Manage marks and create meaningful student reports.",
  },
  {
    id: "admin",
    name: "Admin",
    icon: ShieldCheck,
    description: "Everything, in your control.",
    hint: "Manage your school, staff and academic workspace.",
  },
  {
    id: "principal",
    name: "Principal",
    icon: GraduationCap,
    description: "See the bigger picture.",
    hint: "Review progress and publish your school’s reports.",
  },
];
export default function Login({ onLogin }) {
  const [resetToken, setResetToken] = useState(
    () =>
      new URLSearchParams(location.hash.slice(1)).get("reset-password") || "",
  );
  const [recovering, setRecovering] = useState(() =>
    location.hash.startsWith("#reset-password="),
  );
  function closeRecovery() {
    history.replaceState(null, "", location.pathname + location.search);
    setResetToken("");
    setRecovering(false);
  }
  const [role, setRole] = useState("teacher");
  const [studentMode, setStudentMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const selected = roles.find((r) => r.id === role);
  function changeMode(value) {
    setStudentMode(value);
    setError("");
    setResult(null);
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (studentMode) {
        setResult(null);
        const fields = Object.fromEntries(new FormData(e.currentTarget));
        setResult(
          await api("/public/results", { method: "POST", body: fields }),
        );
      } else {
        await api("/auth/login", {
          method: "POST",
          body: { email, password, role },
        });
        onLogin(await api("/auth/me"));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="anv-login">
      <div className="anv-ambient anv-ambient-one" aria-hidden="true" />
      <div className="anv-ambient anv-ambient-two" aria-hidden="true" />
      <header className="anv-header">
        <a href="/" className="anv-wordmark">
          <img src="/anvayrobo-logo.jpeg" alt="" />
          <span>
            ANVAY<span>ROBO</span>
            <small>AI · ROBOTICS · STEM · AUTOMATION</small>
          </span>
        </a>
        <div className="anv-client">
          <span>BUILT FOR</span>
          <strong>
            SRPS <i>/</i> Report Studio
          </strong>
        </div>
      </header>
      <div className="anv-layout">
        <section className="anv-story">
          <div className="anv-eyebrow">
            <span /> A SMARTER SCHOOL EXPERIENCE
          </div>
          <h1>
            Big dreams.
            <br />
            Brighter minds.
            <br />
            <span>Connected.</span>
          </h1>
          <p>
            A little less paperwork. A lot more possibility.
            <br />
            Your school’s progress, beautifully connected.
          </p>
          <div className="anv-scene" aria-hidden="true">
            <div className="anv-orbit" />
            <div className="anv-orbit second" />
            <div className="anv-core">
              <img src="/anvayrobo-logo.jpeg" alt="" />
            </div>
            <div className="anv-float float-one">
              <div className="anv-mini-icon">
                <BookOpen size={19} />
              </div>
              <span>
                Made for educators<strong>More time to inspire</strong>
              </span>
              <CheckCircle2 size={17} />
            </div>
            <div className="anv-float float-two">
              <span className="anv-bars">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span>
                Every step forward<strong>Progress that matters</strong>
              </span>
            </div>
            <div className="anv-float float-three">
              <Sparkles size={18} />
              <span>Powered by possibility</span>
            </div>
          </div>
          <div className="anv-story-foot">
            <ShieldCheck size={17} />
            <span>One school. One connected workspace.</span>
            <span className="anv-foot-line" />
          </div>
        </section>
        <section
          className="anv-access"
          aria-label={studentMode ? "Student results" : "Staff sign in"}
        >
          <div className="anv-access-top">
            <span>
              <span className="anv-status-dot" />
              {studentMode ? "STUDENT PORTAL" : "STAFF PORTAL"}
            </span>
            <LockKeyhole size={16} />
          </div>
          {recovering ? (
            <PasswordReset
              token={resetToken}
              initialEmail={email}
              onBack={closeRecovery}
            />
          ) : (
            <>
              <div className="anv-card-heading">
                <span className="anv-section-number">
                  {studentMode
                    ? "YOUR NEXT CHAPTER"
                    : "LET’S MAKE GREAT THINGS HAPPEN"}
                </span>
                <h2>
                  {studentMode ? "Your results, right here." : "Welcome back."}
                </h2>
                <p>
                  {studentMode
                    ? "Check your published school result securely."
                    : "Choose your role to enter your workspace."}
                </p>
              </div>
              {!studentMode && (
                <div className="anv-roles" aria-label="Choose your role">
                  {roles.map(({ id, name, icon: Icon }) => (
                    <button
                      type="button"
                      key={id}
                      disabled={busy}
                      className={role === id ? "selected" : ""}
                      aria-pressed={role === id}
                      onClick={() => {
                        setRole(id);
                        setError("");
                      }}
                    >
                      <span className="anv-role-icon">
                        <Icon size={23} />
                      </span>
                      {name}
                      <span className="anv-role-dot" />
                    </button>
                  ))}
                </div>
              )}
              {!studentMode && (
                <div className="anv-role-intro" key={role}>
                  <strong>{selected.description}</strong>
                  <span>{selected.hint}</span>
                </div>
              )}
              <form
                key={studentMode ? "student" : "staff"}
                className="anv-form"
                onSubmit={submit}
              >
                {studentMode ? (
                  <>
                    <label>
                      Admission number
                      <input
                        name="admissionNo"
                        required
                        maxLength={60}
                        placeholder="Enter your admission number"
                        autoComplete="off"
                      />
                    </label>
                    <div className="anv-input-row">
                      <label>
                        Date of birth
                        <input name="dob" type="date" required />
                      </label>
                      <label>
                        Academic session
                        <input
                          name="session"
                          required
                          pattern="[0-9]{4}-[0-9]{2}"
                          placeholder="2026-27"
                          title="Use the format 2026-27"
                        />
                      </label>
                    </div>
                    <p className="anv-form-note">
                      Use the details registered with Shree Ram Public School.
                      Only published results are available.
                    </p>
                  </>
                ) : (
                  <>
                    <label>
                      Email address
                      <input
                        type="email"
                        autoComplete="username"
                        required
                        placeholder="you@school.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </label>
                    <label>
                      Password
                      <div className="anv-password">
                        <input
                          type={visible ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          aria-label={
                            visible ? "Hide password" : "Show password"
                          }
                          onClick={() => setVisible(!visible)}
                        >
                          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>
                    <div className="anv-form-help">
                      <span>
                        <LockKeyhole size={12} /> Secure staff access
                      </span>
                      <span>
                        <button
                          type="button"
                          className="anv-forgot"
                          disabled={busy}
                          onClick={() => setRecovering(true)}
                        >
                          Forgot password?
                        </button>
                      </span>
                    </div>
                  </>
                )}
                {error && (
                  <div className="anv-error" role="alert">
                    {error}
                  </div>
                )}
                <button className="anv-submit" disabled={busy}>
                  {busy ? (
                    <Loader2 className="spin" size={19} />
                  ) : studentMode ? (
                    <Search size={18} />
                  ) : (
                    <LockKeyhole size={17} />
                  )}{" "}
                  {busy
                    ? "Please wait…"
                    : studentMode
                      ? "Check my result"
                      : `Sign in as ${selected.name}`}{" "}
                  {!busy && <ArrowRight size={18} />}
                </button>
              </form>
              {result && (
                <div className="anv-result" role="status">
                  <div>
                    <span className="anv-eyebrow">
                      PUBLISHED RESULT · {result.session}
                    </span>
                    <h3>{result.student.name}</h3>
                    <p>
                      Class {result.student.className} ·{" "}
                      {result.student.section}
                    </p>
                  </div>
                  <div className="anv-result-score">
                    <strong>{result.summary.percentage ?? "—"}%</strong>
                    <span>{result.summary.result}</span>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Term 1</th>
                        <th>Term 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.summary.terms.term1.map((subject, i) => (
                        <tr key={subject.id}>
                          <td>{subject.name}</td>
                          <td>{subject.total ?? "—"}</td>
                          <td>{result.summary.terms.term2[i]?.total ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p>
                    Total: {result.summary.total} / {result.summary.maximum}
                  </p>
                </div>
              )}
              <div className="anv-divider" />
              <button
                className="anv-student-link"
                disabled={busy}
                onClick={() => changeMode(!studentMode)}
              >
                <span className="anv-student-icon">
                  {studentMode ? (
                    <ArrowLeft size={22} />
                  ) : (
                    <GraduationCap size={24} />
                  )}
                </span>
                <span>
                  <strong>
                    {studentMode
                      ? "Back to staff login"
                      : "Student? Check your result"}
                  </strong>
                  <small>
                    {studentMode
                      ? "Teacher, Admin & Principal access"
                      : "Your progress is just a click away"}
                  </small>
                </span>
                <ArrowRight size={18} />
              </button>
              {!studentMode && (
                <button
                  className="anv-demo"
                  disabled={busy}
                  onClick={() => onLogin(startDemo())}
                >
                  Explore sample workspace <ArrowRight size={13} />
                </button>
              )}
            </>
          )}
        </section>
      </div>
      <footer className="anv-footer">
        <span>
          © {new Date().getFullYear()} ANVAYROBO <i>·</i> Built for brighter
          futures.
        </span>
        <span>
          Shree Ram Public School <i>·</i> Charkhi Dadri, Haryana
        </span>
      </footer>
    </main>
  );
}
