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

// ✅ Generar slug único
async function generateUniqueSlug(base) {
  const baseSlug = slugify(base.trim(), { lower: true, strict: true });
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

// ✅ Crear grupo personal con order 0
// ✅ grupo personal con order 0 si no existe
async function createPersonalGroup(slug, user) {
  const groupRef = doc(db, "groups", slug);
  const memberRef = doc(db, "groups", slug, "members", user.uid);

  // 🚫 Evitar duplicado
  const existing = await getDoc(groupRef);
  if (existing.exists()) {
    console.warn("⚠️ Grupo personal ya existe:", slug);
    return;
  }

  console.log("✅ Creando grupo personal con slug:", slug);

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

// ✅ Verificar y crear user y grupo si no existe
async function ensureUserData(fbUser, fallbackName = "") {
  const ref = doc(db, "users", fbUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const name = fallbackName || fbUser.displayName || "User";
    const slug = await generateUniqueSlug(name);

    await setDoc(ref, {
      uid: fbUser.uid,
      email: fbUser.email,
      name,
      slug,
      photoURL: fbUser.photoURL || "",
      createdAt: serverTimestamp(),
    });

    // 🔥 Crear grupo solo si es nuevo usuario
    await createPersonalGroup(slug, { ...fbUser, uid: fbUser.uid });
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
