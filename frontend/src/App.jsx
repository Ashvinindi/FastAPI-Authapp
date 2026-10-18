import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const initialForm = {
  username: "",
  email: "",
  password: "",
  role: "user",
};

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("auth_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [protectedMessage, setProtectedMessage] = useState("");
  const [protectedStatus, setProtectedStatus] = useState({ type: "", message: "" });

  const isSignup = mode === "signup";

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    setProtectedMessage("");
    setProtectedStatus({ type: "", message: "" });
    setMode("login");
    setForm(initialForm);
  }

  async function fetchProtectedData() {
    setProtectedStatus({ type: "", message: "" });
    try {
      const response = await fetch(`${API_URL}/protected`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Protected request failed.");
      }
      setProtectedMessage(data.message);
      setProtectedStatus({ type: "success", message: "Authenticated request succeeded." });
    } catch (error) {
      setProtectedStatus({
        type: "error",
        message: error instanceof TypeError ? "Unable to reach the server." : error.message,
      });
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setForm(initialForm);
    setStatus({ type: "", message: "" });
    setShowPassword(false);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      const request = isSignup
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          }
        : {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              username: form.username,
              password: form.password,
            }),
          };

      const response = await fetch(`${API_URL}${isSignup ? "/signup" : "/login"}`, request);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong. Please try again.");
      }

      if (isSignup) {
        setMode("login");
        setForm({ ...initialForm, username: form.username });
        setStatus({ type: "success", message: "Account created. You can now sign in." });
      } else {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("auth_user", JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof TypeError
            ? "Unable to reach the server. Please try again shortly."
            : error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (user) {
    return (
      <main className="home-shell">
        <header className="home-header">
          <div className="home-brand">
            <div className="brand-mark" aria-hidden="true"><span /><span /></div>
            <span>FastAPI workspace</span>
          </div>
          <button className="logout-button" type="button" onClick={logout}>Log out</button>
        </header>

        <section className="home-content">
          <div className="welcome-banner">
            <p className="eyebrow">Your workspace</p>
            <h1>Welcome back, {user.username}.</h1>
            <p>Your account is active and your session is securely connected.</p>
          </div>

          <div className="home-grid">
            <section className="details-card">
              <div className="card-heading">
                <div>
                  <p className="eyebrow">Account overview</p>
                  <h2>Your details</h2>
                </div>
                <span className="status-dot">Active</span>
              </div>
              <dl className="user-details">
                <div><dt>User ID</dt><dd>#{user.id}</dd></div>
                <div><dt>Username</dt><dd>{user.username}</dd></div>
                <div><dt>Email</dt><dd>{user.email}</dd></div>
                <div><dt>Role</dt><dd className="role-badge">{user.role}</dd></div>
                <div><dt>Login time</dt><dd>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</dd></div>
              </dl>
            </section>

            <section className="action-card">
              <p className="eyebrow">Session check</p>
              <h2>Test your access</h2>
              <p>Make an authenticated request to confirm your bearer token is working.</p>
              <button className="protected-button" type="button" onClick={fetchProtectedData}>
                Fetch secret data <span aria-hidden="true">→</span>
              </button>
              {protectedStatus.message && (
                <p className={`form-status ${protectedStatus.type}`} role="status">{protectedStatus.message}</p>
              )}
              {protectedMessage && <p className="protected-message">{protectedMessage}</p>}
            </section>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="intro-panel">
        <div className="brand-mark" aria-hidden="true">
          <span />
          <span />
        </div>
        <p className="eyebrow">FastAPI workspace</p>
        <h1>Build something<br />worth sharing.</h1>
        <p className="intro-copy">
          A simple, secure place to access your account and keep moving forward.
        </p>
        <div className="accent-line" />
      </section>

      <section className="auth-panel" aria-labelledby="auth-heading">
        <div className="auth-card">
          <div className="mode-switcher" role="tablist" aria-label="Account access mode">
            <button
              className={!isSignup ? "active" : ""}
              onClick={() => switchMode("login")}
              role="tab"
              aria-selected={!isSignup}
              type="button"
            >
              Sign in
            </button>
            <button
              className={isSignup ? "active" : ""}
              onClick={() => switchMode("signup")}
              role="tab"
              aria-selected={isSignup}
              type="button"
            >
              Sign up
            </button>
          </div>

          <div className="heading-block">
            <p className="eyebrow">{isSignup ? "Get started" : "Welcome back"}</p>
            <h2 id="auth-heading">{isSignup ? "Create your account" : "Sign in to continue"}</h2>
            <p>{isSignup ? "It only takes a minute to get set up." : "Enter your details below to access your account."}</p>
          </div>

          <form onSubmit={submitForm}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={updateField}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />

            {isSignup && (
              <>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />

                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={form.role} onChange={updateField}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </>
            )}

            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField}
                placeholder="Enter your password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength="8"
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.3A10.7 10.7 0 0 1 12 4c5 0 8.5 4 9.5 6a11.9 11.9 0 0 1-3 3.6M6.2 6.2A12.5 12.5 0 0 0 2.5 10c1 2 4.5 6 9.5 6 1 0 1.9-.2 2.7-.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                )}
              </button>
            </div>

            {status.message && (
              <p className={`form-status ${status.type}`} role="alert">
                {status.message}
              </p>
            )}

            <button className="submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : isSignup ? "Sign up" : "Sign in"}
              {!isSubmitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="switch-prompt">
            {isSignup ? "Already have an account?" : "New to the workspace?"}{" "}
            <button type="button" onClick={() => switchMode(isSignup ? "login" : "signup")}>
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
