import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useAuth } from "@/firebase/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    user,
    initializing,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", pass: "", name: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleChange = (k, v) => setForm({ ...form, [k]: v });

  const submit = async () => {
    setError("");

    if (mode === "register" && !form.name.trim()) {
      setError("Please enter your User name");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!form.pass || form.pass.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        await loginWithEmail(form.email, form.pass);
      } else {
        await registerWithEmail(form.email, form.pass, form.name);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const loginWithGoogleClick = async () => {
    setBusy(true);
    setError("");
    try {
      await loginWithGoogle();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    if (!form.email) {
      setError("Please enter your email to reset password.");
      return;
    }
    try {
      await resetPassword(form.email);
      setShowReset(true);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!initializing && user?.slug) {
      navigate(`/g/${user.slug}`);
    }
  }, [initializing, user]);

  if (initializing) {
    return (
      <div
        className="d-flex align-items-center justify-content-center min-vh-100"
        style={{ background: "#25303d" }}
      >
        <div className="text-center text-white">
          <ProgressSpinner style={{ width: 50, height: 50 }} />
          <p className="mt-3">Creating your workspace…</p>
          <p className="text-muted small mt-2">
            Loading template...
            <br />
            Copying widgets...
            <br />
            Almost done!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 px-3"
      style={{ background: "#25303d" }}
    >
      <div
        className="p-4 p-md-5 rounded-4 shadow w-100 login-card fade-in"
        style={{
          maxWidth: 460,
          backgroundColor: "#1c1d1e",
          border: "1px solid var(--line-color)",
        }}
      >
        {busy ? (
          <div className="text-center py-5 text-white">
            <ProgressSpinner style={{ width: 50, height: 50 }} />
            <p className="mt-3">Setting up your account…</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <a href="/">
                <img
                  src="icon-192_v2.png"
                  width="100"
                  className="mb-3 mx-auto"
                  alt="FocusPit logo"
                />
              </a>
              <h4 className="fw-semibold text-white">Welcome to FocusPit</h4>
              <p className="text-light small mb-1 fs-5">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <span
                  className="color-pistacho fw-medium ms-1"
                  role="button"
                  onClick={() => {
                    const newMode = mode === "login" ? "register" : "login";
                    setMode(newMode);
                    setError("");
                    setShowReset(false);
                  }}
                >
                  {mode === "login" ? "Create one!" : "Login here!"}
                </span>
              </p>
            </div>

            <div className="py-3">
              <Button
                label="Continue with Google"
                className="btn bg-white text-dark w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                icon={() => (
                  <img
                    src="/imgs/google-icon.svg"
                    alt="Google"
                    style={{ width: 20, height: 20 }}
                  />
                )}
                // onClick={() => loginWithGoogleClick()}
                // disabled
              />
              <div className="text-center text-muted small mt-2">
                Google login will be enabled after public launch.
              </div>
            </div>

            <Divider align="center" className="py-3">
              <b>OR</b>
            </Divider>

            <div key={mode} className="d-flex flex-column fade-form">
              {mode === "register" && (
                <>
                  <label className="form-label text-light">User Name</label>
                  <InputText
                    className={`input-field mb-3 w-100 ${
                      !form.name.trim() && error ? "p-invalid" : ""
                    }`}
                    autoFocus={mode === "register"}
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </>
              )}

              <label className="form-label text-light">Email</label>
              <InputText
                autoFocus={mode === "login"}
                className={`input-field mb-3 w-100 ${
                  !form.email.trim() && error ? "p-invalid" : ""
                }`}
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />

              <label className="form-label text-light">Password</label>
              <Password
                value={form.pass}
                onChange={(e) => handleChange("pass", e.target.value)}
                toggleMask
                feedback={false}
                inputClassName="p-password-input"
                className={`mb-2 ${
                  form.pass.length < 6 && error ? "p-invalid" : ""
                }`}
              />

              {error && <div className="text-danger small mt-2">{error}</div>}

              <div className="d-flex justify-content-end align-items-center mt-3 mb-4">
                {mode === "login" && (
                  <span
                    className="color-pistacho small"
                    role="button"
                    style={{ cursor: "pointer" }}
                    onClick={handleResetPassword}
                  >
                    Forgot password?
                  </span>
                )}
              </div>

              <Button
                label={mode === "login" ? "Login" : "Create account"}
                className="btn-pistacho"
                onClick={submit}
              />

              {showReset && (
                <div className="alert alert-success mt-3 small text-center">
                  We sent a reset link to <strong>{form.email}</strong>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
