// AuthPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
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
import slugify from "slugify";
import app from "@/firebase/config";

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const generateUniqueSlug = async (base) => {
  const baseSlug = slugify(base, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  const usersRef = collection(db, "users");

  while (true) {
    const q = query(usersRef, where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

const createPersonalGroup = async (user, name, slug) => {
  const groupRef = await addDoc(collection(db, "groups"), {
    name,
    slug,
    created_at: serverTimestamp(),
    owner: user.uid,
    members: [
      {
        uid: user.uid,
        email: user.email,
        name,
        role: "owner",
      },
    ],
  });
  return groupRef.id;
};

const addUserToGroupRelation = async (uid, groupId, data) => {
  await setDoc(doc(db, `user_groups/${uid}/groups`, groupId), data);
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [preparing, setPreparing] = useState(false);

  const handleAuth = async (user, displayName) => {
    const slug = await generateUniqueSlug(displayName);

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name: displayName,
      slug,
      photoURL: user.photoURL || "",
    });

    const groupId = await createPersonalGroup(user, displayName, slug);
    await addUserToGroupRelation(user.uid, groupId, {
      name: displayName,
      slug,
    });
    navigate(`/g/${slug}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPreparing(true);

    try {
      if (tab === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = name || email;
        await handleAuth(res.user, displayName);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPreparing(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setPreparing(true);
    try {
      const res = await signInWithPopup(auth, provider);
      const userRef = doc(db, "users", res.user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        const displayName = res.user.displayName || res.user.email;
        await handleAuth(res.user, displayName);
      } else {
        const userData = snap.data();
        navigate(`/g/${userData.slug}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPreparing(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 400 }}>
      {preparing ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-3">Setting up your account...</p>
        </div>
      ) : (
        <>
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button
                className={`nav-link ${tab === "login" ? "active" : ""}`}
                onClick={() => setTab("login")}
              >
                Login
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${tab === "register" ? "active" : ""}`}
                onClick={() => setTab("register")}
              >
                Register
              </button>
            </li>
          </ul>

          <form onSubmit={handleSubmit}>
            {tab === "register" && (
              <div className="mb-3">
                <label>Full Name</label>
                <input
                  className="form-control"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="mb-3">
              <label>Email</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label>Password</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button type="submit" className="btn btn-primary w-100 mb-2">
              {tab === "login" ? "Login" : "Register"}
            </button>

            <button
              type="button"
              className="btn btn-outline-dark w-100"
              onClick={handleGoogle}
            >
              Continue with Google
            </button>
          </form>
        </>
      )}
    </div>
  );
}
