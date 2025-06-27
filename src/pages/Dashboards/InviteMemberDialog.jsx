import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import UserListMembers from "@/components/UserListMembers";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

import db from "@/firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";

export default function InviteMemberDialog({ groupId, visible, onHide }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [ownerUid, setOwnerUid] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const isOwner = user?.uid === ownerUid;

  useEffect(() => {
    const loadGroupAndMembers = async () => {
      if (!groupId) return;

      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) return;

      const groupData = groupSnap.data();
      setOwnerUid(groupData.owner?.uid || null);

      const membersRef = collection(db, "groups", groupId, "members");
      const membersSnap = await getDocs(membersRef);

      const membersData = await Promise.all(
        membersSnap.docs.map(async (docSnap) => {
          const { uid, role } = docSnap.data();
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

      setMembers(membersData);
    };

    if (visible) loadGroupAndMembers();
  }, [groupId, visible]);

  const findUserByEmail = async (email) => {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    return !snap.empty
      ? { uid: snap.docs[0].id, ...snap.docs[0].data() }
      : null;
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) return;

    setLoading(true);
    try {
      const userToAdd = await findUserByEmail(email);
      if (!userToAdd) {
        alert("Ese usuario no está registrado.");
        return;
      }

      const memberRef = doc(db, "groups", groupId, "members", userToAdd.uid);
      await setDoc(memberRef, {
        uid: userToAdd.uid,
        role: "member",
      });

      setInviteEmail("");
    } catch (err) {
      console.error("Error al invitar:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (uidToRemove) => {
    const memberRef = doc(db, "groups", groupId, "members", uidToRemove);
    await deleteDoc(memberRef);
    setMembers((prev) => prev.filter((m) => m.uid !== uidToRemove));
  };

  const renderMemberActions = (m) => {
    if (!isOwner || m.uid === user.uid) return null;
    return (
      <Button
        icon="pi pi-times"
        className="p-button-sm p-button-text text-danger"
        title="Eliminar del grupo"
        onClick={() => handleRemoveMember(m.uid)}
      />
    );
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Invite Members"
      style={{ width: "30rem" }}
    >
      <div className="p-fluid">
        {/* Lista de miembros */}
        <label className="mb-2">Members</label>
        <ul className="cs-list-group mb-3">
          {members.map((u) => (
            <UserListMembers key={u.uid} user={u} ownerId={ownerUid} />
          ))}
        </ul>

        {/* Invitación */}
        <label className="mb-2">Invite user by email</label>
        <div className="d-flex gap-2">
          <InputText
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="user@email.com"
          />
          <Button
            label="Invite"
            onClick={handleInvite}
            disabled={!inviteEmail.trim() || loading}
          />
        </div>
      </div>
    </Dialog>
  );
}
