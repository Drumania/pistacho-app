// src/pages/LoginPage.jsx
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
import { TabView, TabPanel } from "primereact/tabview";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
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
  const [activeTab, setActiveTab] = useState(0); // 0-login / 1-register
  const [form, setForm] = useState({ email: "", pass: "", name: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (k, v) => setForm({ ...form, [k]: v });

  /* ------------ Lógica de éxito común ------------- */
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

  /* ------------ Submit email/pass ------------- */
  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      if (activeTab === 0) {
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

  /* ------------ Google ------------- */
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

  /* --------------- UI ---------------- */
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="surface-card p-4 shadow-2 border-round w-25 min-w-min"
        style={{ background: "var(--panel)" }}
      >
        {busy ? (
          <div className="text-center text-light py-5">
            <ProgressSpinner style={{ width: 50, height: 50 }} />
            <p className="mt-3">Setting up your account…</p>
          </div>
        ) : (
          <>
            <TabView
              activeIndex={activeTab}
              onTabChange={(e) => {
                setActiveTab(e.index);
                setError("");
              }}
            >
              <TabPanel header="Login">
                <div className="p-fluid">
                  <label className="text-light mb-2">Email</label>
                  <InputText
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="mb-3"
                  />

                  <label className="text-light mb-2">Password</label>
                  <Password
                    value={form.pass}
                    onChange={(e) => handleChange("pass", e.target.value)}
                    feedback={false}
                    toggleMask
                    className="mb-3 w-full"
                  />

                  {error && <small className="text-danger">{error}</small>}

                  <Button
                    label="Login"
                    className="w-full mt-3 btn-pistacho"
                    onClick={submit}
                  />
                </div>
              </TabPanel>

              <TabPanel header="Register">
                <div className="p-fluid">
                  <label className="text-light mb-2">Full name</label>
                  <InputText
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="mb-3"
                  />

                  <label className="text-light mb-2">Email</label>
                  <InputText
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="mb-3"
                  />

                  <label className="text-light mb-2">Password</label>
                  <Password
                    value={form.pass}
                    onChange={(e) => handleChange("pass", e.target.value)}
                    feedback={false}
                    toggleMask
                    className="mb-3 w-full"
                  />

                  {error && <small className="text-danger">{error}</small>}

                  <Button
                    label="Create account"
                    className="w-full mt-3 btn-pistacho"
                    onClick={submit}
                  />
                </div>
              </TabPanel>
            </TabView>

            <Divider className="my-4" />

            <Button
              label="Continue with Google"
              className="btn-google w-100 d-flex align-items-center gap-2"
              onClick={loginGoogle}
              icon={() => (
                <img
                  src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s48-fcrop64=1,00000000ffffffff-rw"
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
