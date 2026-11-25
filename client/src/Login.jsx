import React, { useState } from "react";
import Loader from "./Loader";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
  LockKeyhole,
  Search,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { api, startDemo } from "./api";
import { signInWithGoogle, signInWithFirebaseEmail } from "./firebase";
import "./login.css";
import PasswordReset from "./PasswordReset";

function GoogleIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

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
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const selected = roles.find((r) => r.id === role);
  function changeMode(value) {
    setStudentMode(value);
    setError("");
    setResult(null);
  }

  async function handleGoogleLogin() {
    if (busy || googleBusy) return;
    setError("");
    setGoogleBusy(true);
    try {
      const cred = await signInWithGoogle();
      const idToken = await cred.user.getIdToken();
      await api("/auth/firebase-login", {
        method: "POST",
        body: { idToken, role },
      });
      onLogin(await api("/auth/me"));
    } catch (err) {
      if (
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        setError("Google sign-in was cancelled.");
      } else if (err.code === "auth/popup-blocked") {
        setError(
          "Google sign-in popup was blocked by browser. Please enable popups.",
        );
      } else if (err.code === "auth/unauthorized-domain") {
        setError(
          "Domain 'report.srpskanhra.com' Firebase Console me authorized nahi hai. Firebase Console > Authentication > Settings > Authorized domains me 'report.srpskanhra.com' add karein.",
        );
      } else if (err.code === "auth/network-request-failed") {
        setError(
          "Network error connecting to Google. Please check your internet connection.",
        );
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setGoogleBusy(false);
    }
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
        try {
          await api("/auth/login", {
            method: "POST",
            body: { email, password, role },
          });
        } catch (backendErr) {
          try {
            const fbCred = await signInWithFirebaseEmail(email, password);
            const idToken = await fbCred.user.getIdToken();
            await api("/auth/firebase-login", {
              method: "POST",
              body: { idToken, role },
            });
          } catch {
            throw backendErr;
          }
        }
        onLogin(await api("/auth/me"));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className={`anv-login role-${role}`}>
      <div className="anv-ambient-grid" aria-hidden="true" />
      <div className="anv-ambient anv-ambient-one" aria-hidden="true" />
      <div className="anv-ambient anv-ambient-two" aria-hidden="true" />
      <div className="anv-ambient anv-ambient-three" aria-hidden="true" />
      <div className="anv-layout">
        <section className="anv-story">
          <h1>
            Big dreams.
            <br />
            Brighter minds.
            <br />
            <span className="anv-gradient-text">Connected.</span>
          </h1>
          <div className="anv-scene" aria-hidden="true">
            <div className="anv-orbit" />
            <div className="anv-orbit second" />
            <div className="anv-orbit-dot" />
            <div className="anv-core">
              <div className="anv-core-glow" />
              <img src="/anvayrobo-logo.jpeg" alt="" />
            </div>
            <div className="anv-float float-one">
              <div className="anv-mini-icon">
                <BookOpen size={19} />
              </div>
              <span>
                Made for educators<strong>More time to inspire</strong>
              </span>
              <CheckCircle2 size={17} className="anv-check-icon" />
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
              <Sparkles size={18} className="anv-sparkle-icon" />
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
          className={`anv-access role-${role} ${studentMode ? "is-student-mode" : ""}`}
          aria-label={studentMode ? "Student results" : "Staff sign in"}
        >
          {recovering ? (
            <PasswordReset
              token={resetToken}
              initialEmail={email}
              onBack={closeRecovery}
            />
          ) : (
            <>
              {studentMode && (
                <div className="anv-card-heading">
                  <h2>Your results, right here.</h2>
                  <p>Check your published school result securely.</p>
                </div>
              )}
              {!studentMode && (
                <div className="anv-roles" aria-label="Choose your role">
                  {roles.map(({ id, name, icon: Icon }) => (
                    <button
                      type="button"
                      key={id}
                      disabled={busy}
                      className={`anv-role-btn role-${id} ${role === id ? "selected" : ""}`}
                      aria-pressed={role === id}
                      onClick={() => {
                        setRole(id);
                        setError("");
                      }}
                    >
                      <span className="anv-role-icon">
                        <Icon size={23} />
                      </span>
                      <span className="anv-role-title">{name}</span>
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
              {!studentMode && (
                <div className="anv-social-auth">
                  <button
                    type="button"
                    className="anv-google-btn"
                    onClick={handleGoogleLogin}
                    disabled={busy || googleBusy}
                  >
                    {googleBusy ? (
                      <Loader size={18} inline />
                    ) : (
                      <GoogleIcon size={19} />
                    )}
                    <span>
                      {googleBusy
                        ? "Connecting to Google…"
                        : "Continue with Google"}
                    </span>
                  </button>
                  <div className="anv-auth-divider">
                    <span className="anv-auth-divider-line" />
                    <span className="anv-auth-divider-text">
                      or sign in with email
                    </span>
                    <span className="anv-auth-divider-line" />
                  </div>
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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
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
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                          }}
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
                    <Loader size={18} inline />
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
