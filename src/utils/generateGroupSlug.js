import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import slugify from "slugify";

export const generateGroupSlug = async (baseName) => {
  const db = getFirestore();
  let baseSlug = slugify(baseName, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  const groupsRef = collection(db, "groups");

  while (true) {
    const q = query(groupsRef, where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
