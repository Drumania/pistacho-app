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
import useNotifications from "@/hooks/useNotifications";

export default function InviteMemberDialog({ groupId, visible, onHide }) {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();

  const [members, setMembers] = useState([]);
  const [ownerUid, setOwnerUid] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [memberUids, setMemberUids] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const isOwner = user?.uid === ownerUid;

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
        const { uid, role, admin = false, status } = docSnap.data();
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

    setMembers(membersData);
    setIsLoadingMembers(false);
  };

  useEffect(() => {
    if (visible) loadGroupAndMembers();
  }, [groupId, visible]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      const val = searchValue.trim().toLowerCase();
      if (val.length < 3) {
        setSearchResults([]);
        return;
      }

      const qEmail = query(collection(db, "users"), where("email", "==", val));
      const snapEmail = await getDocs(qEmail);

      if (!snapEmail.empty) {
        const docUser = snapEmail.docs[0];
        setSearchResults([{ uid: docUser.id, ...docUser.data() }]);
        return;
      }

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
    }, 400);

    return () => clearTimeout(delay);
  }, [searchValue]);

  const handleInvite = async (userToAdd) => {
    setLoading(true);
    try {
      const memberRef = doc(db, "groups", groupId, "members", userToAdd.uid);
      await setDoc(memberRef, {
        uid: userToAdd.uid,
        role: "member",
        status: "pending",
      });

      await sendNotification(userToAdd.uid, "group_invite", {
        groupId,
        groupName,
      });

      setSearchValue("");
      setSearchResults([]);
      await loadGroupAndMembers(); // 👈 actualiza después de invitar
    } catch (err) {
      console.error("Error al invitar:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (uidToRemove) => {
    try {
      await deleteDoc(doc(db, "groups", groupId, "members", uidToRemove));
      setMembers((prev) => prev.filter((m) => m.uid !== uidToRemove));

      await sendNotification(uidToRemove, "group_removed", {
        groupId,
        groupName,
      });
    } catch (err) {
      console.error("Error al remover miembro:", err);
    }
  };

  const handleToggleAdmin = async (uidToToggle, isCurrentlyAdmin) => {
    try {
      const memberRef = doc(db, "groups", groupId, "members", uidToToggle);
      await setDoc(memberRef, { admin: !isCurrentlyAdmin }, { merge: true });

      setMembers((prev) =>
        prev.map((m) =>
          m.uid === uidToToggle ? { ...m, admin: !isCurrentlyAdmin } : m
        )
      );

      await sendNotification(
        uidToToggle,
        isCurrentlyAdmin ? "admin_revoked" : "admin_granted",
        { groupId, groupName }
      );
    } catch (err) {
      console.error("Error al cambiar admin:", err);
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Invite Members"
      style={{ width: "90%", maxWidth: "500px" }}
    >
      <div className="p-fluid">
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
                    user?.admin &&
                    u.uid !== user.uid && (
                      <div className="admin-actions d-flex align-items-center gap-1">
                        <Button
                          label="Remove from group"
                          className="small text-danger"
                          title="Remove from group"
                          onClick={() => handleRemoveMember(u.uid)}
                        />
                        <Button
                          label={u.admin ? "Remove admin" : "Make admin"}
                          className="small text-info"
                          title={u.admin ? "Remove admin" : "Make admin"}
                          onClick={() => handleToggleAdmin(u.uid, u.admin)}
                        />
                      </div>
                    )
                  }
                />
              ))}
        </ul>

        <label className="mb-2">Search user to invite</label>
        <InputText
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="name or email"
          className="mb-3"
        />

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
      </div>
    </Dialog>
  );
}
