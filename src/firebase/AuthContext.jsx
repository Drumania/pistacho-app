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
import {
  getDatabase,
  ref,
  set,
  onDisconnect,
  onValue,
} from "firebase/database";
import slugify from "slugify";
import db from "@/firebase/firestore";
import app from "./config";

const AuthContext = createContext();
const auth = getAuth(app);
const rtdb = getDatabase(app);

// ✅ Slug único
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

// ✅ Grupo personal
async function createPersonalGroup(slug, user) {
  const groupRef = doc(db, "groups", slug);
  const memberRef = doc(db, "groups", slug, "members", user.uid);

  if ((await getDoc(groupRef)).exists()) return;

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

// ✅ Presencia online
function setupPresence(uid) {
  const userStatusRef = ref(rtdb, `/status/${uid}`);
  const connectedRef = ref(rtdb, ".info/connected");

  onValue(connectedRef, (snap) => {
    if (!snap.val()) return;

    onDisconnect(userStatusRef).set({
      state: "offline",
      last_changed: Date.now(),
    });

    set(userStatusRef, {
      state: "online",
      last_changed: Date.now(),
    });
  });
}

// ✅ Datos de usuario + grupo
async function ensureUserData(fbUser, fallbackName = "") {
  const refUser = doc(db, "users", fbUser.uid);
  const snap = await getDoc(refUser);

  if (!snap.exists()) {
    const name = fallbackName || fbUser.displayName || "User";
    const slug = await generateUniqueSlug(name);

    await setDoc(refUser, {
      uid: fbUser.uid,
      email: fbUser.email,
      name,
      slug,
      photoURL: fbUser.photoURL || "",
      createdAt: serverTimestamp(),
    });

    await createPersonalGroup(slug, fbUser);
  }

  const profile = (await getDoc(refUser)).data();
  return { ...fbUser, ...profile };
}

// 🔐 Auth Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const enriched = await ensureUserData(firebaseUser);
        setUser(enriched);
        setupPresence(firebaseUser.uid);
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
    setupPresence(fbUser.uid);
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
    setupPresence(fbUser.uid);
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
    setupPresence(fbUser.uid);
    return enriched;
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const db = getDatabase();
      const userRef = ref(db, `/status/${uid}`);
      await set(userRef, {
        state: "offline",
        last_changed: Date.now(),
      });
    }

    await signOut(auth);
  };

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
