import {
  doc,
  setDoc,
  serverTimestamp,
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
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${random}`;
};

export const useCreateGroup = () => {
  const createGroup = async (name, currentUser, template = null) => {
    if (!name || !currentUser?.uid) throw new Error("Missing data");

    const slug = await generateGroupSlug(name);
    const groupRef = doc(db, "groups", slug);
    const memberRef = doc(db, "groups", slug, "members", currentUser.uid);

    // buscar el mayor order actual
    const snapshot = await getDocs(collection(db, "groups"));
    const orders = snapshot.docs.map((doc) => doc.data().order || 0);
    const maxOrder = orders.length ? Math.max(...orders) : 0;
    const newOrder = maxOrder + 1;

    // 1. Crear grupo
    await setDoc(groupRef, {
      name,
      slug,
      status: "active",
      photoURL: "/group_placeholder.png",
      order: newOrder,
      created_at: serverTimestamp(),
    });

    // 2. Miembro con owner/admin
    await setDoc(memberRef, {
      uid: currentUser.uid,
      owner: true,
      admin: true,
    });

    // 3. Si hay un template, clonar los widgets
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

    return { slug, id: slug };
  };

  return { createGroup };
};
