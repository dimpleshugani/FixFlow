import { useState } from "react";
import { api } from "./api";

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const signingUp = mode === "signup";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await api(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(signingUp ? { name, room, email, password } : { email, password }),
      });
      onAuthenticated(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="FixFlow">
        <a className="auth-brand" href="#top" aria-label="FixFlow home">
          <span className="brand-mark">F</span>
          <span>fixflow<span className="brand-period">.</span></span>
        </a>
        <div className="story-copy">
          <p className="eyebrow">CAMPUS CARE, IN MOTION</p>
          <h1>Small fixes.<br />Better days.</h1>
          <p>One clear place to report, follow, and resolve the things that keep your campus running.</p>
        </div>
        <div className="story-foot">
          <span className="status-light" /> Your campus, in good hands
        </div>
        <div className="story-lines" aria-hidden="true" />
      </section>

      <section className="auth-form-side" id="top">
        <div className="auth-form-wrap">
          <div className="auth-heading">
            <p className="eyebrow">{signingUp ? "GET STARTED" : "WELCOME BACK"}</p>
            <h2>{signingUp ? "Create your account" : "Sign in to FixFlow"}</h2>
            <p>{signingUp ? "Set up your campus profile to get started." : "Your campus requests are right where you left them."}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {signingUp && (
              <>
                <label>
                  Full name
                  <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} placeholder="Your name" />
                </label>
                <label>
                  Room <span className="optional-label">Optional</span>
                  <input autoComplete="off" value={room} onChange={(event) => setRoom(event.target.value)} maxLength={40} placeholder="e.g. A-204" />
                </label>
              </>
            )}
            <label>
              Email address
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@campus.edu" />
            </label>
            <label>
              Password
              <input type="password" autoComplete={signingUp ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={signingUp ? 8 : undefined} placeholder={signingUp ? "At least 8 characters" : "Enter your password"} />
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? "Please wait..." : signingUp ? "Create account" : "Sign in"}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="auth-switch">
            {signingUp ? "Already have an account?" : "New to FixFlow?"}{" "}
            <button type="button" onClick={() => { setMode(signingUp ? "login" : "signup"); setError(""); }}>
              {signingUp ? "Sign in" : "Create an account"}
            </button>
          </p>
          <p className="auth-note">Your account keeps your requests private and tied to your campus profile.</p>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;