import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Button } from "primereact/button";
import InviteMemberDialog from "@/pages/Dashboards/InviteMemberDialog";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import UserListMembers from "@/components/UserListMembers";

export default function MembersWidget({ groupId }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [ownerId, setOwnerId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const isOwner = user?.uid === ownerId;

  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId) return;

      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) return;

      const groupData = groupSnap.data();
      setOwnerId(groupData.owner?.uid || null);

      const membersRef = collection(db, "groups", groupId, "members");
      const membersSnap = await getDocs(membersRef);

      const fullUsers = await Promise.all(
        membersSnap.docs.map(async (mDoc) => {
          const { uid, role } = mDoc.data();
          const userSnap = await getDoc(doc(db, "users", uid));
          const userData = userSnap.exists() ? userSnap.data() : {};
          return {
            uid,
            role,
            name: userData.name || userData.displayName || "Unknown",
            photoURL: userData.photoURL || "",
          };
        })
      );

      setMembers(fullUsers);
    };

    fetchMembers();
  }, [groupId, showDialog]); // recarga al cerrar el modal

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Group Members</h5>
        {isOwner && (
          <Button
            label="Invite"
            icon="pi pi-user-plus"
            className="p-button-sm"
            onClick={() => setShowDialog(true)}
          />
        )}
      </div>

      {members.length === 0 && (
        <div className="text-muted">No members found.</div>
      )}

      <ul className="cs-list-group mb-3">
        {members.map((u) => (
          <UserListMembers key={u.uid} user={u} ownerId={ownerId} />
        ))}
      </ul>

      {/* Invite Dialog */}
      <InviteMemberDialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        groupId={groupId}
      />
    </div>
  );
}
