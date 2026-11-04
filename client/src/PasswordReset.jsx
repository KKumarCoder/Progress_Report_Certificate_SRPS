import React, { useState } from "react";
import {
  ArrowLeft,
  Mail,
  LockKeyhole,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { api } from "./api";
import { PASSWORD_MIN, PASSWORD_MAX } from "../../shared/password-policy.js";
export default function PasswordReset({ token, initialEmail, onBack }) {
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (token && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const data = await api(
        token ? "/auth/reset-password" : "/auth/forgot-password",
        { method: "POST", body: token ? { token, password } : { email } },
      );
      setMessage(data.message);
      setDone(true);
      setPassword("");
      setConfirm("");
      if (token)
        history.replaceState(null, "", location.pathname + location.search);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="anv-recovery">
      <div className="anv-card-heading">
        <span className="anv-section-number">SECURE ACCOUNT RECOVERY</span>
        <h2>{token ? "Create a new password." : "Forgot your password?"}</h2>
        <p>
          {token
            ? "Choose a new password for your staff account."
            : "We’ll email you a link to reset your password."}
        </p>
      </div>
      {message && (
        <div className="anv-recovery-success" role="status">
          {message}
        </div>
      )}
      {!done && (
        <form className="anv-form" onSubmit={submit}>
          {token ? (
            <>
              <label>
                New password
                <div className="anv-password">
                  <input
                    type={visible ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={PASSWORD_MIN}
                    maxLength={PASSWORD_MAX}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={visible ? "Hide password" : "Show password"}
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
              <label>
                Confirm new password
                <input
                  type={visible ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={PASSWORD_MIN}
                  maxLength={PASSWORD_MAX}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </label>
              <p className="anv-form-note">
                Use {PASSWORD_MIN}–{PASSWORD_MAX} characters. Resetting your
                password signs out existing sessions.
              </p>
            </>
          ) : (
            <label>
              Registered staff email
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          )}
          {error && (
            <div className="anv-error" role="alert">
              {error}
            </div>
          )}
          <button className="anv-submit" disabled={busy}>
            {busy ? (
              <Loader2 size={18} className="spin" />
            ) : token ? (
              <LockKeyhole size={18} />
            ) : (
              <Mail size={18} />
            )}{" "}
            {busy
              ? "Please wait…"
              : token
                ? "Update password"
                : "Send reset link"}
          </button>
          {!token && (
            <p className="anv-form-note">
              The link expires in 15 minutes and works once. Teacher, Admin and
              Principal accounts are supported.
            </p>
          )}
        </form>
      )}
      <button className="anv-demo" disabled={busy} onClick={onBack}>
        <ArrowLeft size={15} /> Back to sign in
      </button>
    </div>
  );
}
