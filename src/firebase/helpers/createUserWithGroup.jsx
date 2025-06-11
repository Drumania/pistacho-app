// src/firebase/createUserWithGroup.js
import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import db from "@/firebase/firestore";

export const createUserWithGroup = async (user) => {
  if (!user?.uid) return;

  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    created_at: serverTimestamp(),
  };

  const slug = "me";

  // Crear grupo personal
  const groupRef = await addDoc(collection(db, "groups"), {
    name: "Me",
    slug,
    created_at: serverTimestamp(),
    owner: {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "",
    },
    members: [
      {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "",
        role: "admin",
      },
    ],
  });

  // Asociar grupo al usuario
  userData.groups = [
    {
      id: groupRef.id,
      slug,
      name: "Me",
      role: "admin",
    },
  ];

  // Guardar usuario completo
  await setDoc(doc(db, "users", user.uid), userData);
};
