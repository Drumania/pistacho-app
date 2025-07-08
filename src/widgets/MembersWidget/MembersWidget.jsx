import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getDatabase, ref as rtdbRef, onValue } from "firebase/database";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";

import InviteMemberDialog from "@/components/InviteMemberDialog";
import UserListMembers from "@/components/UserListMembers";
import { Button } from "primereact/button";

export default function MembersWidget({ groupId }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [ownerId, setOwnerId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineMap, setOnlineMap] = useState({});

  const isOwner = user?.uid === ownerId;

  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId) return;
      setIsLoading(true);

      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        setIsLoading(false);
        return;
      }

      const groupData = groupSnap.data();
      setOwnerId(groupData.owner?.uid || null);

      const membersRef = collection(db, "groups", groupId, "members");
      const membersSnap = await getDocs(membersRef);

      const fullUsers = await Promise.all(
        membersSnap.docs.map(async (mDoc) => {
          const { uid, role, admin = false, status = "active" } = mDoc.data();

          if (!uid || status === "disabled") return null;

          const userSnap = await getDoc(doc(db, "users", uid));
          const userData = userSnap.exists() ? userSnap.data() : {};

          return {
            uid,
            role,
            admin,
            status,
            name: userData.name || userData.displayName || "Unknown",
            photoURL: userData.photoURL || "",
          };
        })
      );

      setMembers(fullUsers.filter(Boolean));
      setIsLoading(false);
    };

    fetchMembers();
  }, [groupId, showDialog]);

  // Escuchamos el estado online en tiempo real
  useEffect(() => {
    const dbRT = getDatabase();
    const unsubscribers = [];

    members.forEach((m) => {
      const statusRef = rtdbRef(dbRT, `/status/${m.uid}`);
      const unsubscribe = onValue(statusRef, (snap) => {
        const online = snap.val()?.state === "online";
        setOnlineMap((prev) => ({ ...prev, [m.uid]: online }));
      });
      unsubscribers.push(unsubscribe);
    });

    return () => unsubscribers.forEach((u) => u?.());
  }, [members]);

  // Ordenar online arriba
  const sortedMembers = [...members].sort((a, b) => {
    const aOnline = onlineMap[a.uid] ? 1 : 0;
    const bOnline = onlineMap[b.uid] ? 1 : 0;
    return bOnline - aOnline;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Group Members</h5>
        {isOwner && (
          <Button
            label="+ Members"
            className="btn-transp-small"
            onClick={() => setShowDialog(true)}
          />
        )}
      </div>

      <ul className="cs-list-group mb-3">
        {isLoading
          ? [...Array(3)].map((_, i) => <UserListMembers key={i} user={null} />)
          : sortedMembers.map((u) => (
              <UserListMembers
                key={u.uid}
                user={u}
                isOnline={onlineMap[u.uid]}
              />
            ))}
      </ul>

      <InviteMemberDialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        groupId={groupId}
      />
    </div>
  );
}
