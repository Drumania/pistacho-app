import { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { Avatar } from "primereact/avatar";
import { AvatarGroup } from "primereact/avatargroup";

import NewGroupDialog from "@/components/NewGroupDialog";
import { useAuth } from "@/firebase/AuthContext";

const db = getFirestore();

export default function Groups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [showArrows, setShowArrows] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [groups, setGroups] = useState([]);
  const [membersData, setMembersData] = useState({}); // uid -> userData

  const scroll = (dir) => {
    if (scrollRef.current) {
      const offset = dir === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

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

  const fetchMembersData = async (groupList) => {
    const allUids = groupList.flatMap((g) =>
      (g.members || []).map((m) => m.uid)
    );
    const uniqueUids = [...new Set(allUids)];

    if (!uniqueUids.length) return;

    const chunks = [];
    for (let i = 0; i < uniqueUids.length; i += 10) {
      chunks.push(uniqueUids.slice(i, i + 10));
    }

    const usersRef = collection(db, "users");
    const allData = {};

    for (const chunk of chunks) {
      const q = query(usersRef, where("uid", "in", chunk));
      const snap = await getDocs(q);
      snap.forEach((doc) => {
        allData[doc.id] = doc.data();
      });
    }

    setMembersData(allData);
  };

  const loadGroups = async () => {
    if (!user?.uid) {
      setGroups([]);
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        setGroups([]);
        return;
      }

      const data = userSnap.data();
      const userGroups = data.groups || [];

      const groupDocs = await Promise.all(
        userGroups.map(async (g) => {
          const groupRef = doc(db, "groups", g.id);
          const groupSnap = await getDoc(groupRef);
          if (groupSnap.exists()) {
            return { id: g.id, ...groupSnap.data() };
          }
          return null;
        })
      );

      const validGroups = groupDocs.filter(Boolean);
      setGroups(validGroups);
      fetchMembersData(validGroups);
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
    <div className="nav-scroll-wrapper">
      {showArrows && (
        <button className="scroll-arrow left" onClick={() => scroll("left")}>
          <i className="pi pi-angle-left" />
        </button>
      )}

      <div className="nav-groups-container" ref={scrollRef}>
        <div className="wrap-btn">
          <button
            className="btn-pistacho-outline"
            onClick={() => setShowDialog(true)}
          >
            + New Group
          </button>
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
        {console.log(groups)}
        {groups.map((g) => (
          <NavLink
            key={g.id}
            to={`/g/${g.slug}`}
            className={({ isActive }) =>
              `nav-groups ${isActive ? "active" : ""}`
            }
          >
            <AvatarGroup>
              {(g.members || []).slice(0, 3).map((m) => {
                const member = membersData[m.uid];

                if (!member) return null;

                return member.photoURL ? (
                  <Avatar
                    key={m.uid}
                    image={member.photoURL}
                    size="small"
                    shape="circle"
                    tooltip={member.name}
                  />
                ) : (
                  <Avatar
                    key={m.uid}
                    label={member.name?.charAt(0) || "?"}
                    size="small"
                    shape="circle"
                    tooltip={member.name}
                  />
                );
              })}
            </AvatarGroup>
            <span className="ng-name">{g.name}</span>
          </NavLink>
        ))}
      </div>

      {showArrows && (
        <button className="scroll-arrow right" onClick={() => scroll("right")}>
          <i className="pi pi-angle-right" />
        </button>
      )}
    </div>
  );
}
