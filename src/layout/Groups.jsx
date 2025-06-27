import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
      const memberSnap = await getDocs(collectionGroup(db, "members"));

      const userMemberships = memberSnap.docs.filter(
        (doc) => doc.id === user.uid
      );

      const groupDocs = await Promise.all(
        userMemberships.map(async (memberDoc) => {
          const groupId = memberDoc.ref.parent.parent.id;
          const groupRef = doc(db, "groups", groupId);
          const groupSnap = await getDoc(groupRef);
          return groupSnap.exists()
            ? { id: groupId, ...groupSnap.data() }
            : null;
        })
      );

      setGroups(groupDocs.filter(Boolean));
    } catch (err) {
      console.error("Error al cargar grupos desde members:", err);
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
            `group-btn tooltip-wrapper position-relative ${
              isActive ? "active" : ""
            }`
          }
        >
          <img src={g.photoURL || "/group_placeholder.png"} />
          <div className="tooltip">{g.name}</div>
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
