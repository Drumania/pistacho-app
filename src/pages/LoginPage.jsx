import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import slugify from "slugify";
import app from "@/firebase/config";
import db from "@/firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const generateUniqueSlug = async (base) => {
  const baseSlug = slugify(base, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  const usersRef = collection(db, "users");
  while (true) {
    const q = query(usersRef, where("slug", "==", slug));
    const snap = await getDocs(q);
    if (snap.empty) break;
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ email: "", pass: "", name: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (k, v) => setForm({ ...form, [k]: v });

  const handleSuccess = async (fbUser, fallbackName) => {
    const ref = doc(db, "users", fbUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const display = fbUser.displayName || fallbackName || fbUser.email;
      const slug = await generateUniqueSlug(display);
      const meGroup = await addDoc(collection(db, "groups"), {
        name: "Me",
        slug,
        createdAt: serverTimestamp(),
        createdBy: fbUser.uid,
        members: [fbUser.uid],
      });
      await setDoc(ref, {
        uid: fbUser.uid,
        email: fbUser.email,
        name: display,
        slug,
        photoURL: fbUser.photoURL || "",
        createdAt: serverTimestamp(),
        groups: [{ id: meGroup.id, slug, name: "Me" }],
      });
    }
    const profile = (await getDoc(ref)).data();
    setUser({ ...fbUser, ...profile });
    navigate(`/g/${profile.slug}`);
  };

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        const { user } = await signInWithEmailAndPassword(
          auth,
          form.email,
          form.pass
        );
        await handleSuccess(user);
      } else {
        const { user } = await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.pass
        );
        await handleSuccess(user, form.name);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const loginGoogle = async () => {
    setBusy(true);
    setError("");
    try {
      const { user } = await signInWithPopup(auth, provider);
      await handleSuccess(user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 px-3">
      <div
        className="bg-dark p-4 p-md-5 rounded-4 shadow w-100"
        style={{ maxWidth: 460 }}
      >
        {busy ? (
          <div className="text-center py-5">
            <ProgressSpinner style={{ width: 50, height: 50 }} />
            <p className="mt-3">Setting up your account…</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <img src="logo.png" width="80px" />
              <h3 className="fw-semibold">Welcome to FocusPit</h3>
              <p className=" mb-1">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <span
                  className="text-primary fw-medium ms-1"
                  role="button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError("");
                  }}
                >
                  {mode === "login" ? "Create today!" : "Login here!"}
                </span>
              </p>
            </div>

            <div className="mb-3">
              {mode === "register" && (
                <>
                  <label className="form-label">Full Name</label>
                  <InputText
                    className="form-control mb-3"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </>
              )}

              <label className="form-label">Email</label>
              <InputText
                className="form-control mb-3"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />

              <label className="form-label">Password</label>
              <Password
                className="form-control mb-2 w-100"
                value={form.pass}
                onChange={(e) => handleChange("pass", e.target.value)}
                toggleMask
                feedback={false}
              />

              {error && <div className="text-danger small mt-2">{error}</div>}

              <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                <div className="form-check">
                  <Checkbox
                    inputId="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.checked)}
                    className="me-2"
                  />
                  <label htmlFor="remember" className="form-check-label">
                    Remember me
                  </label>
                </div>
                {mode === "login" && (
                  <span
                    className="text-primary"
                    role="button"
                    style={{ fontSize: 14 }}
                  >
                    Forgot password?
                  </span>
                )}
              </div>

              <Button
                label={mode === "login" ? "Login" : "Create account"}
                className="btn-pistacho w-100"
                onClick={submit}
              />
            </div>

            <div className="text-center mt-4 mb-2">
              <span className="text-muted">or</span>
            </div>

            <Button
              label="Continue with Google"
              className="btn btn-outline-secondary bg-white w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={loginGoogle}
              icon={() => (
                <img
                  src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s48"
                  alt="Google"
                  style={{ width: 20, height: 20 }}
                />
              )}
            />
          </>
        )}
      </div>
    </div>
  );
}
