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
  addDoc,
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
let DEFAULT_TEMPLATE_ID = "VY2jRf154aPCkbBWmBxf";

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

  const groupSnap = await getDoc(groupRef);
  if (groupSnap.exists()) {
    return;
  }

  // Obtener template
  const templateSnap = await getDoc(doc(db, "templates", DEFAULT_TEMPLATE_ID));

  if (!templateSnap.exists()) {
    return;
  }

  const template = templateSnap.data();
  const templateId = templateSnap.id;

  // Crear grupo

  await setDoc(groupRef, {
    name: "Me",
    slug,
    status: "active",
    photoURL: user.photoURL || "/group_placeholder.png",
    order: 0,
    created_at: serverTimestamp(),
    template_used: templateId,
  });

  // Crear widgets del template
  if (Array.isArray(template.widgets) && template.widgets.length) {
    for (const w of template.widgets) {
      if (!w.widgetId) {
        continue;
      }

      const widgetData = {
        groupId: slug,
        key: w.widgetId,
        layout: w.layout ?? {},
        settings: w.settings ?? {},
        createdAt: serverTimestamp(),
      };

      try {
        // 1. Guardar en widget_data/{widgetId}/groups/{slug}/items
        const widgetRef = collection(
          db,
          "widget_data",
          w.widgetId,
          "groups",
          slug,
          "items"
        );
        await addDoc(widgetRef, {
          ...widgetData,
          widgetId: w.widgetId,
        });

        // 2. Guardar en groups/{slug}/widgets
        const groupWidgetRef = collection(db, "groups", slug, "widgets");
        await addDoc(groupWidgetRef, widgetData);
      } catch (err) {
        console.error("❌ Error copying widget", w.widgetId, err);
      }
    }
  } else {
    console.warn("⚠️ Template has no widgets.");
  }

  // Crear miembro del grupo
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
    const storedName = localStorage.getItem("pendingName");
    const name = storedName || fallbackName || fbUser.displayName || "User";

    const slug = await generateUniqueSlug(name);

    await setDoc(refUser, {
      uid: fbUser.uid,
      email: fbUser.email,
      name, // ✅ guarda el nombre correcto en Firestore
      slug,
      photoURL: fbUser.photoURL || "",
      createdAt: serverTimestamp(),
    });

    await createPersonalGroup(slug, fbUser);

    localStorage.removeItem("pendingName"); // 🧹 limpiar
  }

  const profile = (await getDoc(refUser)).data();
  return { ...fbUser, ...profile };
}

// 🔐 Auth Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setInitializing(true); // 👈 empieza el setup
        const enriched = await ensureUserData(firebaseUser);
        setUser(enriched);
        setupPresence(firebaseUser.uid);
        setInitializing(false); // 👈 termina el setup
      } else {
        setUser(null);
        setInitializing(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user: fbUser, _tokenResponse } = await signInWithPopup(
      auth,
      provider
    );

    const isNewUser = _tokenResponse?.isNewUser;

    if (isNewUser) {
      // 🔐 Verificamos si está aprobado
      const betaRef = doc(db, "beta_requests", fbUser.email);
      const betaSnap = await getDoc(betaRef);

      if (!betaSnap.exists() || betaSnap.data().approved !== true) {
        // Eliminamos el usuario recién creado de Firebase Auth
        await fbUser.delete();
        throw new Error("You are not approved for the beta yet.");
      }
    }

    setupPresence(fbUser.uid);
    return fbUser;
  };

  function getFriendlyFirebaseError(code) {
    switch (code) {
      case "auth/user-not-found":
        return "User not found";
      case "auth/wrong-password":
        return "Wrong password";
      case "auth/invalid-email":
        return "Invalid email";
      case "auth/too-many-requests":
        return "Too many requests";
      case "auth/invalid-credential":
        return "Invalid credential";
      default:
        return "Unexpected error when logging in, try again later...";
    }
  }

  const loginWithEmail = async (email, pass) => {
    try {
      const { user: fbUser } = await signInWithEmailAndPassword(
        auth,
        email,
        pass
      );
      setupPresence(fbUser.uid);
      return fbUser;
    } catch (err) {
      console.error("Login error:", err.code);
      throw new Error(getFriendlyFirebaseError(err.code));
    }
  };

  const registerWithEmail = async (email, pass, name) => {
    // 🔓 Para beta pública, simplemente comentá esta sección
    // 🔐 Verificamos si el email fue aprobado
    const betaRef = doc(db, "beta_requests", email);
    const betaSnap = await getDoc(betaRef);

    if (!betaSnap.exists() || betaSnap.data().approved !== true) {
      throw new Error("You are not approved for the beta yet.");
    }
    // -----------

    // ⚠️ Guardar nombre para usar luego en ensureUserData
    localStorage.setItem("pendingName", name);

    // Crear usuario
    const { user: fbUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      pass
    );

    setupPresence(fbUser.uid);
    return fbUser;
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
        initializing,
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
