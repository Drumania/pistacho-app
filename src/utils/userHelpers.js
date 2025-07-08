import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import db from "@/firebase/firestore";

/**
 * Devuelve el username de un usuario dado su UID.
 * Si no tiene username, devuelve "usuario-desconocido"
 */
export async function getUsernameByUid(uid) {
  if (!uid) return "usuario-desconocido";

  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return (
        data.username || data.name || data.displayName || "usuario-desconocido"
      );
    }
    return "usuario-desconocido";
  } catch (error) {
    console.error("Error al obtener username:", error);
    return "usuario-desconocido";
  }
}

/**
 * Reemplaza todas las menciones @{uid} por @username en un string
 * Ej: "Hola @{abc123}" => "Hola @martin"
 */
export async function replaceMentionsWithUsernames(text) {
  if (!text) return "";

  const matches = [...text.matchAll(/@\{([^}]+)\}/g)];
  let result = text;

  for (const match of matches) {
    const uid = match[1];
    const username = await getUsernameByUid(uid);
    result = result.replace(match[0], `@${username}`);
  }

  return result;
}

/**
 * Reemplaza todas las menciones @username por @{uid} para guardar en Firestore
 * Ej: "Hola @martin" => "Hola @{abc123}"
 */
export async function replaceUsernamesWithUIDs(text, groupId) {
  if (!text || !groupId) return text;

  try {
    const snap = await getDocs(collection(db, `groups/${groupId}/members`));

    const users = await Promise.all(
      snap.docs.map(async (docRef) => {
        const { uid } = docRef.data();
        const userSnap = await getDoc(doc(db, "users", uid));
        const data = userSnap.exists() ? userSnap.data() : {};
        return {
          uid,
          username: data.username || data.name || data.displayName || "usuario",
        };
      })
    );

    let result = text;
    for (const { uid, username } of users) {
      result = result.replace(
        new RegExp(`@${username}(?![a-zA-Z0-9_{}])`, "g"),
        `@{${uid}}`
      );
    }

    return result;
  } catch (error) {
    console.error("Error reemplazando usernames por UIDs:", error);
    return text;
  }
}
