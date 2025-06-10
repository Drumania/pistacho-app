import { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { collection, getDocs, getFirestore } from "firebase/firestore";

import { Avatar } from "primereact/avatar";
import { AvatarGroup } from "primereact/avatargroup";

import NewGroupDialog from "@/components/NewGroupDialog";
import { getUserAvatar } from "@/utils/getUserAvatar";
import { useAuth } from "@/firebase/AuthContext";

const db = getFirestore();

export default function Groups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [showArrows, setShowArrows] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [groups, setGroups] = useState([]);
  console.log("user: ", user);
  // Scroll arrows
  const scroll = (dir) => {
    if (scrollRef.current) {
      const offset = dir === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Verifica overflow horizontal
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setShowArrows(el.scrollWidth > el.clientWidth);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  // Cargar grupos del usuario
  useEffect(() => {
    const loadGroups = async () => {
      if (!user?.uid) return;

      const ref = collection(db, "user_groups", user.uid, "groups");
      const snap = await getDocs(ref);

      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGroups(list);
    };

    loadGroups();
  }, [user]);

  if (!user) return null;

  return (
    <section className="container-fluid my-1">
      <div className="nav-scroll-wrapper">
        {showArrows && (
          <button className="scroll-arrow left" onClick={() => scroll("left")}>
            <i className="pi pi-angle-left" />
          </button>
        )}

        <div className="nav-groups-container" ref={scrollRef}>
          {/* Botón para crear nuevo grupo */}
          <div className="wrap-btn">
            <button
              className="btn-pistacho-outline"
              onClick={() => setShowDialog(true)}
            >
              + New Group
            </button>
          </div>

          {/* Diálogo de creación */}
          <NewGroupDialog
            visible={showDialog}
            user={user}
            onHide={() => setShowDialog(false)}
            onCreate={(data) => navigate(`/g/${data.slug}`)}
          />

          {/* Grupo personal "Me" */}
          <NavLink
            to="/g/me"
            className={({ isActive }) =>
              `nav-groups ${isActive ? "active" : ""}`
            }
          >
            <AvatarGroup>
              <Avatar image={getUserAvatar(user)} size="small" shape="circle" />
            </AvatarGroup>
            <span className="ng-name">Me</span>
          </NavLink>

          {/* Grupos del usuario */}
          {groups.map((g) => (
            <NavLink
              key={g.groupId}
              to={`/g/${g.slug}`}
              className={({ isActive }) =>
                `nav-groups ${isActive ? "active" : ""}`
              }
            >
              <AvatarGroup>
                <Avatar label={g.name.charAt(0)} size="small" shape="circle" />
              </AvatarGroup>
              <span className="ng-name">{g.name}</span>
            </NavLink>
          ))}
        </div>

        {showArrows && (
          <button
            className="scroll-arrow right"
            onClick={() => scroll("right")}
          >
            <i className="pi pi-angle-right" />
          </button>
        )}
      </div>
    </section>
  );
}
