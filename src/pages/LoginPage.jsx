import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useAuth } from "@/firebase/AuthContext";
import CustomCheckbox from "@/components/CustomCheckbox";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } =
    useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ email: "", pass: "", name: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleChange = (k, v) => setForm({ ...form, [k]: v });

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      const profile =
        mode === "login"
          ? await loginWithEmail(form.email, form.pass)
          : await registerWithEmail(form.email, form.pass, form.name);

      navigate(`/g/${profile.slug}`);
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
      const profile = await loginWithGoogle();
      navigate(`/g/${profile.slug}`);
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

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 px-3"
      style={{ background: "#25303d" }}
    >
      <div
        className="p-4 p-md-5 rounded-4 shadow w-100 login-card"
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
              <img src="icon-192.png" width="100" className="mb-3 mx-auto" />
              <h4 className="fw-semibold text-white">Welcome to FocusPit</h4>
              <p className="text-light small mb-1">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <span
                  className="color-pistacho fw-medium ms-1"
                  role="button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
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
                onClick={loginWithGoogleClick}
                icon={() => (
                  <img
                    src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s48"
                    alt="Google"
                    style={{ width: 20, height: 20 }}
                  />
                )}
              />
            </div>

            <Divider
              align="center"
              className="py-3"
              style={{
                background: "#1c1d1e",
                position: "relative",
                display: "block",
                zIndex: 1000,
                width: "40px",
                height: "24px",
                textAlign: "center",
              }}
            >
              <b>OR</b>
            </Divider>

            <div className="d-flex flex-column">
              {mode === "register" && (
                <>
                  <label className="form-label text-light">Full Name</label>
                  <InputText
                    className="input-field mb-3 w-100"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </>
              )}

              <label className="form-label text-light">Email</label>
              <InputText
                autoFocus
                className="input-field mb-3 w-100"
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
                className="mb-2"
              />

              {error && <div className="text-danger small mt-2">{error}</div>}

              <div className="d-flex justify-content-between align-items-center mt-3 mb-4">
                <div className="d-flex align-items-center">
                  <CustomCheckbox
                    customId="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.checked)}
                    style={{ paddingLeft: 0 }}
                  />
                  <label
                    htmlFor="remember"
                    className="text-light small ps-2 mb-0"
                  >
                    Remember me
                  </label>
                </div>
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
