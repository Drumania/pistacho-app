import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collectionGroup,
  getDocs,
  getDoc,
  doc,
  getFirestore,
} from "firebase/firestore";

import NewGroupDialog from "@/components/NewGroupDialog";
import { useAuth } from "@/firebase/AuthContext";

const db = getFirestore();

export default function Groups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [groups, setGroups] = useState([]);

  const loadGroups = async () => {
    if (!user?.uid) return setGroups([]);

    try {
      const q = collectionGroup(db, "members");
      const snapshot = await getDocs(q);

      const myGroups = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.uid !== user.uid) continue;

        const groupRef = docSnap.ref.parent.parent;
        if (!groupRef) continue;

        const groupSnap = await getDoc(groupRef);
        if (!groupSnap.exists()) continue;

        const group = groupSnap.data();
        if (group.status !== "active") continue;

        myGroups.push({
          id: groupRef.id,
          slug: group.slug,
          name: group.name,
          photoURL: group.photoURL || "/group_placeholder.png",
          order: group.order ?? 9999, // ✅ si no tiene order va al final
        });
      }

      // ✅ Ordenamos por el campo `order`
      myGroups.sort((a, b) => a.order - b.order);
      setGroups(myGroups);
    } catch (err) {
      console.error("Error al cargar grupos:", err);
      setGroups([]);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [user]);

  if (!user) return null;

  return (
    <div className="sidebar-groups">
      {groups.map((group) => (
        <button
          key={group.id}
          className="group-btn tooltip-wrapper position-relative"
          onClick={() => navigate(`/g/${group.slug}`)}
          style={{
            backgroundImage: `url(${group.photoURL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="tooltip">{group.name}</div>
        </button>
      ))}

      <div
        className="group-btn group-btn-new tooltip-wrapper"
        onClick={() => setShowDialog(true)}
      >
        <div className="tooltip">New Group</div>
        <i className="bi bi-plus-lg"></i>
      </div>

      <NewGroupDialog
        visible={showDialog}
        user={user}
        onHide={() => setShowDialog(false)}
        onCreate={(data) => {
          loadGroups();
          navigate(`/g/${data.slug}`);
        }}
      />
    </div>
  );
}
