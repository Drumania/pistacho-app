import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { doc, getDoc, getFirestore } from "firebase/firestore";

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
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) return setGroups([]);

      const userGroups = userSnap.data().groups || [];
      const groupDocs = await Promise.all(
        userGroups.map(async (g) => {
          const groupRef = doc(db, "groups", g.id);
          const groupSnap = await getDoc(groupRef);
          return groupSnap.exists() ? { id: g.id, ...groupSnap.data() } : null;
        })
      );

      setGroups(groupDocs.filter(Boolean));
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
      {groups.map((g) => (
        <NavLink
          key={g.id}
          to={`/g/${g.slug}`}
          className={({ isActive }) =>
            `group-btn tooltip-wrapper ${isActive ? "active" : ""}`
          }
        >
          <div className="tooltip">{g.name}</div>
          <img src={g.photoURL || "/group_placeholder.png"} />
        </NavLink>
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
