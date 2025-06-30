import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import slugify from "slugify";
import db from "@/firebase/firestore";
import app from "./config";

const AuthContext = createContext();
const auth = getAuth(app);

async function generateUniqueSlug(base) {
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
}

// ✅ grupo personal con order 0
async function createPersonalGroup(slug, user) {
  const groupRef = doc(db, "groups", slug);
  const memberRef = doc(db, "groups", slug, "members", user.uid);

  await setDoc(groupRef, {
    name: "Me",
    slug,
    status: "active",
    photoURL: "/group_placeholder.png",
    order: 0,
    created_at: serverTimestamp(),
  });

  await setDoc(memberRef, {
    uid: user.uid,
    owner: true,
    admin: true,
  });
}

async function ensureUserData(fbUser, fallbackName = "") {
  const ref = doc(db, "users", fbUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const display = fbUser.displayName || fallbackName || fbUser.email;
    const slug = await generateUniqueSlug(display);

    await createPersonalGroup(slug, fbUser);

    await setDoc(ref, {
      uid: fbUser.uid,
      email: fbUser.email,
      name: display,
      slug,
      photoURL: fbUser.photoURL || "",
      createdAt: serverTimestamp(),
    });
  }

  const profileSnap = await getDoc(ref);
  return { ...fbUser, ...profileSnap.data() };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const enriched = await ensureUserData(firebaseUser);
        setUser(enriched);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user: fbUser } = await signInWithPopup(auth, provider);
    const enriched = await ensureUserData(fbUser);
    setUser(enriched);
    return enriched;
  };

  const loginWithEmail = async (email, pass) => {
    const { user: fbUser } = await signInWithEmailAndPassword(
      auth,
      email,
      pass
    );
    const enriched = await ensureUserData(fbUser);
    setUser(enriched);
    return enriched;
  };

  const registerWithEmail = async (email, pass, name) => {
    const { user: fbUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      pass
    );
    const enriched = await ensureUserData(fbUser, name);
    setUser(enriched);
    return enriched;
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = () => signOut(auth);

  const updateUserProfile = (data) =>
    updateProfile(auth.currentUser, data).then(() => {
      setUser({ ...auth.currentUser });
    });

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        updateUserProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
