// src/context/GroupsContext.jsx
import {
  collectionGroup,
  getDocs,
  getDoc,
  query,
  where,
  getFirestore,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/firebase/AuthContext";

const GroupsContext = createContext();
const db = getFirestore();

export function GroupsProvider({ children }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadGroups = async () => {
    setLoading(true);
    if (!user?.uid) {
      setGroups([]);
      return;
    }

    try {
      const q = query(
        collectionGroup(db, "members"),
        where("uid", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      const groupRefs = snapshot.docs
        .map((docSnap) => docSnap.ref.parent.parent)
        .filter(Boolean);

      const groupSnaps = await Promise.all(groupRefs.map((ref) => getDoc(ref)));

      const myGroups = [];

      for (let i = 0; i < groupSnaps.length; i++) {
        const snap = groupSnaps[i];
        if (!snap.exists()) continue;

        const group = snap.data();
        if (group.status !== "active") continue;

        myGroups.push({
          id: snap.id,
          slug: group.slug,
          name: group.name,
          photoURL: group.photoURL || "/group_placeholder.png",
          order: group.order ?? 9999,
        });
      }

      myGroups.sort((a, b) => a.order - b.order);
      setGroups(myGroups);
    } catch (err) {
      console.error("Error loading groups:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [user]);

  return (
    <GroupsContext.Provider
      value={{ groups, loading, refreshGroups: loadGroups }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  return useContext(GroupsContext);
}
