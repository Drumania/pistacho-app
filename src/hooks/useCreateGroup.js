// src/hooks/useCreateGroup.js
import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  collection,
  addDoc,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import slugify from "slugify";

/**
 * Genera un slug único para el grupo
 */
const generateGroupSlug = async (name) => {
  const base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 5) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    slug = `${base}-${suffix}`;
    const groupDoc = await getDoc(doc(db, "groups", slug));
    exists = groupDoc.exists();
    attempts++;
  }

  if (exists) throw new Error("Could not generate unique slug");

  return slug;
};

export const useCreateGroup = () => {
  const createGroup = async (name, currentUser, template = null) => {
    if (!name || !currentUser?.uid) throw new Error("Missing data");

    const slug = await generateGroupSlug(name);
    const groupRef = doc(db, "groups", slug);
    const memberRef = doc(db, "groups", slug, "members", currentUser.uid);

    // calcular nuevo order (⚠️ trae todos los grupos)
    const snapshot = await getDocs(collection(db, "groups"));
    const orders = snapshot.docs.map((doc) => doc.data().order || 0);
    const maxOrder = orders.length ? Math.max(...orders) : 0;
    const newOrder = maxOrder + 1;

    // crear grupo
    await setDoc(groupRef, {
      name,
      slug,
      status: "active",
      photoURL: "/group_placeholder.png",
      order: newOrder,
      created_at: serverTimestamp(),
    });

    // asignar miembro owner/admin
    await setDoc(memberRef, {
      uid: currentUser.uid,
      owner: true,
      admin: true,
    });

    // ⚠️ (deprecated) clonado de widgets desde template → ya se hace en los componentes
    if (template?.widgets?.length) {
      for (const w of template.widgets) {
        if (!w.widgetId) continue;
        await addDoc(collection(db, "widget_data"), {
          groupId: slug,
          widgetId: w.widgetId,
          layout: w.layout ?? {},
          settings: w.settings ?? {},
          createdAt: serverTimestamp(),
        });
      }
    }

    return { slug, id: slug, ref: groupRef };
  };

  return { createGroup };
};
