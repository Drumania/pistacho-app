// src/firebase/createUserWithGroup.js
import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { generateUniqueSlug } from "./generateUniqueSlug";

export const createUserWithGroup = async (user) => {
  if (!user?.uid || !user?.email) {
    throw new Error("Usuario inválido: falta UID o email.");
  }

  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    created_at: serverTimestamp(),
  };

  // Generar slug único basado en el nombre del usuario (o "me" como fallback)
  const slug = await generateUniqueSlug(user.displayName || "me");

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

  // Guardar usuario completo en Firestore
  await setDoc(doc(db, "users", user.uid), userData);
};
