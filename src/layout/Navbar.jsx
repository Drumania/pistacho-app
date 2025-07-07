import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  collectionGroup,
  getDocs,
  getDoc,
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

        if (group.status !== "active") continue; // ✅ mover esta línea acá

        myGroups.push({
          id: groupRef.id,
          slug: group.slug,
          name: group.name,
          photoURL: group.photoURL || "/group_placeholder.png",
          order: group.order ?? 9999,
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
    <nav className="v-navbar">
      <div>
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 wrap-logo"
        >
          <img src="/icon-192.png" width="60px" height="60px" />
        </Link>

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
                <div
                  key={group.id}
                  className="tooltip-wrapper position-relative d-flex justify-content-center"
                >
                  <button
                    className={`group-btn ${
                      group.slug === groupId ? "active" : ""
                    }`}
                    onClick={() => navigate(`/g/${group.slug}`)}
                    style={{
                      backgroundImage: `url(${group.photoURL})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="tooltip">{group.name}</div>
                </div>
              ))}
        </div>
      </div>

      <div className="tooltip-wrapper mb-3 d-flex justify-content-center">
        <div
          className="group-btn group-btn-new"
          onClick={() => setShowDialog(true)}
        >
          <i className="bi bi-plus-lg"></i>
        </div>
        <div className="tooltip">New Group</div>
      </div>

      <NewGroupDialog
        visible={showDialog}
        user={user}
        onHide={() => setShowDialog(false)}
        onCreate={(group, widgets) => {
          loadGroups();
          navigate(`/g/${group.slug}`);
        }}
      />
    </nav>
  );
}
