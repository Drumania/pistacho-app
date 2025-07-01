import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collectionGroup,
  getDocs,
  getDoc,
  doc,
  getFirestore,
} from "firebase/firestore";

import NewGroupDialog from "@/components/NewGroupDialog";
import { useAuth } from "@/firebase/AuthContext";
import { Skeleton } from "primereact/skeleton";

const db = getFirestore();

export default function Groups() {
  const { user } = useAuth();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadGroups = async () => {
    setLoading(true);
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
      setLoading(false);
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
      {loading
        ? [...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              shape="circle"
              width="40px"
              height="40px"
              className="mb-1"
            />
          ))
        : groups.map((group) => (
            <button
              key={group.id}
              className={`group-btn tooltip-wrapper position-relative ${
                group.slug === groupId ? "active" : ""
              }`}
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
