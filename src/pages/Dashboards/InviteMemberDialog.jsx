import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import UserListMembers from "@/components/UserListMembers";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import {
  doc,
  getDoc,
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
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showInviteByEmail, setShowInviteByEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [memberUids, setMemberUids] = useState([]);

  const isOwner = user?.uid === ownerUid;

  // 🔹 Cargar grupo y miembros
  useEffect(() => {
    const loadGroupAndMembers = async () => {
      if (!groupId) return;
      setIsLoadingMembers(true);

      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        setIsLoadingMembers(false);
        return;
      }

      const groupData = groupSnap.data();
      setGroupName(groupData.name || "");
      setOwnerUid(groupData.owner?.uid || null);

      const membersRef = collection(db, "groups", groupId, "members");
      const membersSnap = await getDocs(membersRef);
      setMemberUids(membersSnap.docs.map((d) => d.id));

      const membersData = await Promise.all(
        membersSnap.docs.map(async (docSnap) => {
          const { uid, role, admin = false } = docSnap.data();
          const userSnap = await getDoc(doc(db, "users", uid));
          const userData = userSnap.exists() ? userSnap.data() : {};
          return {
            uid,
            role,
            admin,
            name: userData.name || userData.displayName || "Unknown",
            photoURL: userData.photoURL || "",
          };
        })
      );

      setMembers(membersData);
      setIsLoadingMembers(false);
    };

    if (visible) loadGroupAndMembers();
  }, [groupId, visible]);

  // 🔹 Buscar usuarios con debounce
  useEffect(() => {
    const delay = setTimeout(async () => {
      const val = searchValue.trim().toLowerCase();
      if (val.length < 3) {
        setSearchResults([]);
        setShowInviteByEmail(false);
        return;
      }

      // buscar por email exacto
      const qEmail = query(collection(db, "users"), where("email", "==", val));
      const snapEmail = await getDocs(qEmail);

      if (!snapEmail.empty) {
        const docUser = snapEmail.docs[0];
        setSearchResults([{ uid: docUser.id, ...docUser.data() }]);
        setShowInviteByEmail(false);
        return;
      }

      // buscar por coincidencia parcial en name
      const qAll = query(collection(db, "users"));
      const snapAll = await getDocs(qAll);

      const filtered = snapAll.docs
        .map((d) => ({ uid: d.id, ...d.data() }))
        .filter(
          (u) =>
            !memberUids.includes(u.uid) &&
            (u.name?.toLowerCase().includes(val) ||
              u.email?.toLowerCase().includes(val))
        )
        .slice(0, 10);
      setSearchResults(filtered);
      setShowInviteByEmail(filtered.length === 0);
    }, 400);

    return () => clearTimeout(delay);
  }, [searchValue]);

  // 🔹 Invitar usuario registrado
  const handleInvite = async (userToAdd) => {
    setLoading(true);
    try {
      const memberRef = doc(db, "groups", groupId, "members", userToAdd.uid);
      const inviteRef = doc(db, "invites", `${groupId}_${userToAdd.uid}`);

      const inviteSnap = await getDoc(inviteRef);
      if (inviteSnap.exists()) {
        alert("This user has already been invited.");
        setLoading(false);
        return;
      }

      await setDoc(memberRef, {
        uid: userToAdd.uid,
        role: "member",
        admin: false,
        owner: false,
        status: "pending",
      });

      await setDoc(inviteRef, {
        groupId,
        groupName,
        fromUid: user.uid,
        fromName: user.name || user.displayName || "Unknown",
        toUid: userToAdd.uid,
        toEmail: userToAdd.email,
        status: "pending",
        createdAt: new Date(),
      });

      setMembers((prev) => [
        ...prev,
        {
          uid: userToAdd.uid,
          role: "member",
          admin: false,
          owner: false,
          status: "pending",
          name: userToAdd.name || userToAdd.displayName || "Unknown",
          photoURL: userToAdd.photoURL || "",
        },
      ]);

      setMemberUids((prev) => [...prev, userToAdd.uid]);
      setSearchValue("");
      setSearchResults([]);
      setShowInviteByEmail(false);
    } catch (err) {
      console.error("Error al invitar:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Invitar por email (usuario no registrado)
  const handleInviteByEmail = async (email) => {
    setLoading(true);
    try {
      // 🔔 TODO: guardar en colección "invites"
      alert(`Invitación pendiente creada para ${email} (a implementar)`);

      setSearchValue("");
      setShowInviteByEmail(false);
    } catch (err) {
      console.error("Error al invitar por email:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (uidToRemove) => {
    const memberRef = doc(db, "groups", groupId, "members", uidToRemove);
    await deleteDoc(memberRef);
    setMembers((prev) => prev.filter((m) => m.uid !== uidToRemove));
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Invite Members"
      style={{ width: "90%", maxWidth: "500px" }}
    >
      <div className="p-fluid">
        {/* 🔸 Miembros actuales */}
        <label className="mb-2">Members</label>
        <ul className="cs-list-group mb-4">
          {isLoadingMembers
            ? [...Array(4)].map((_, i) => (
                <UserListMembers key={i} user={null} />
              ))
            : members.map((u) => (
                <UserListMembers
                  key={u.uid}
                  user={u}
                  right={
                    isOwner &&
                    u.uid !== user.uid && (
                      <Button
                        icon="pi pi-times"
                        className="p-button-sm p-button-text text-danger"
                        title="Remove from group"
                        onClick={() => handleRemoveMember(u.uid)}
                      />
                    )
                  }
                />
              ))}
        </ul>

        {/* 🔸 Buscar usuario */}
        <label className="mb-2">Search user to invite</label>
        <InputText
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="name or email"
          className="mb-3"
        />

        {/* 🔸 Resultados */}
        {searchResults.length > 0 && (
          <ul className="list-group mb-2">
            {searchResults.map((u) => (
              <li
                key={u.uid}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={u.photoURL || "/avatar_placeholder.png"}
                    alt={u.name}
                    className="rounded-circle"
                    width={32}
                    height={32}
                  />
                  <div>{u.name}</div>
                </div>
                <Button
                  label="Invite"
                  onClick={() => handleInvite(u)}
                  disabled={loading}
                  loading={loading}
                />
              </li>
            ))}
          </ul>
        )}

        {/* 🔸 Invitación por email */}
        {showInviteByEmail && (
          <div className="mt-2">
            <div className="mb-1 text-muted small">
              No user found. Do you want to send an invite by email?
            </div>
            <Button
              label="Invite by email"
              onClick={() => handleInviteByEmail(searchValue)}
              disabled={loading}
              loading={loading}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
