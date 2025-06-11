// LoginPage.jsx
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
    const snapshot = await getDocs(q);
    if (snapshot.empty) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [preparing, setPreparing] = useState(false);

  const handleAuthSuccess = async (firebaseUser, fallbackName) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      setUser({ ...firebaseUser, ...userData });
      navigate(`/g/${userData.slug}`);
      return;
    }

    const displayName =
      firebaseUser.displayName || fallbackName || firebaseUser.email;
    const photoURL = firebaseUser.photoURL || "";
    const slug = await generateUniqueSlug(displayName);

    const groupDoc = await addDoc(collection(db, "groups"), {
      name: "Me",
      slug,
      created_at: serverTimestamp(),
      owner: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: displayName,
        photoURL,
      },
      members: [
        {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: displayName,
          photoURL,
          role: "admin",
        },
      ],
    });

    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: displayName,
      slug,
      photoURL,
      created_at: serverTimestamp(),
      groups: [
        {
          id: groupDoc.id,
          slug,
          name: "Me",
          role: "admin",
        },
      ],
    };

    await setDoc(userRef, userData);
    setUser({ ...firebaseUser, ...userData });
    navigate(`/g/${slug}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPreparing(true);

    try {
      if (tab === "login") {
        const res = await signInWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess(res.user);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = name || email;
        await handleAuthSuccess(res.user, displayName);
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
      await handleAuthSuccess(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setPreparing(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
      <div className="auth-card" style={{ width: "100%", maxWidth: 400 }}>
        {preparing ? (
          <div className="text-center py-5 text-light">
            <div className="spinner-border text-success" role="status" />
            <p className="mt-3">Setting up your account...</p>
          </div>
        ) : (
          <>
            <ul className="nav nav-tabs mb-4 border-bottom border-secondary">
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
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-0"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                  />
                  <label htmlFor="name">Full Name</label>
                </div>
              )}

              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control bg-dark text-light border-0"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
                <label htmlFor="email">Email</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control bg-dark text-light border-0"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <label htmlFor="password">Password</label>
              </div>

              {error && <div className="alert alert-danger small">{error}</div>}

              <button type="submit" className="btn btn-pistacho w-100 mb-2">
                {tab === "login" ? "Login" : "Register"}
              </button>

              <button
                type="button"
                className="btn btn-outline-light w-100"
                onClick={handleGoogle}
              >
                Continue with Google
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
