import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  getStorage,
  deleteObject,
} from "firebase/storage";
import db from "@/firebase/firestore";
import app from "@/firebase/config";
import { useAuth } from "@/firebase/AuthContext";

export default function EditGroupDialog({
  groupId,
  visible,
  onHide,
  onGroupUpdated,
}) {
  const { user } = useAuth();
  const storage = getStorage(app);
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [prevImagePath, setPrevImagePath] = useState(""); // para borrar anterior
  const [members, setMembers] = useState([]);
  const [ownerUid, setOwnerUid] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const isOwner = user?.uid === ownerUid;

  useEffect(() => {
    const loadGroup = async () => {
      if (!groupId) return;
      const ref = doc(db, "groups", groupId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setPhotoURL(data.photoURL || "");
        setPrevImagePath(data.photoPath || ""); // guardá la path
        setMembers(data.members || []);
        setOwnerUid(data.owner?.uid || null);
      }
    };
    if (visible) loadGroup();
  }, [groupId, visible]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !groupId) return;

    setLoading(true);
    try {
      // Borrar imagen anterior si existe
      if (prevImagePath) {
        const oldRef = ref(storage, prevImagePath);
        await deleteObject(oldRef).catch(() => {}); // ignorar error si no existe
      }

      const path = `groups/${groupId}/${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
      setPrevImagePath(path);
    } catch (err) {
      console.error("Error al subir imagen:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !groupId) return;
    setLoading(true);
    try {
      const refGroup = doc(db, "groups", groupId);
      await updateDoc(refGroup, {
        name,
        photoURL,
        photoPath: prevImagePath,
      });
      onGroupUpdated?.();
      onHide();
    } catch (err) {
      console.error("Error updating group:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      console.log("Invitar a:", inviteEmail);
      setInviteEmail("");
    }
  };

  const renderMemberActions = (member) => {
    if (!isOwner || member.uid === user?.uid) return null;
    return (
      <div className="d-flex gap-2">
        {member.role !== "admin" && (
          <Button
            icon="pi pi-star"
            className="p-button-sm p-button-text text-warning"
            title="Hacer admin"
            onClick={() => console.log("Hacer admin:", member.uid)}
          />
        )}
        <Button
          icon="pi pi-times"
          className="p-button-sm p-button-text text-danger"
          title="Eliminar del grupo"
          onClick={() => console.log("Eliminar:", member.uid)}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Edit Group"
      style={{ width: "30rem" }}
      className="edit-group-dialog"
    >
      <div className="p-fluid">
        {/* Imagen */}
        <div className="mb-3 text-center">
          <Avatar
            image={photoURL || "/group_placeholder.png"}
            shape="circle"
            size="xlarge"
            className="mb-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-control mt-2"
          />
        </div>

        {/* Nombre */}
        <label className="mb-2">Group Name</label>
        <InputText
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        {/* Miembros */}
        <label className="mb-2 mt-4">Members</label>
        <ul className="cs-list-group mb-3">
          {members.map((m) => (
            <li
              key={m.uid}
              className="d-flex align-items-center justify-content-between px-2"
            >
              <div className="d-flex align-items-center gap-2">
                <Avatar
                  image={m.photoURL}
                  label={m.name?.[0]}
                  size="small"
                  shape="circle"
                />
                <div className="fw-semibold">{m.name}</div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-secondary text-capitalize">
                  {m.role}
                </span>
                {renderMemberActions(m)}
              </div>
            </li>
          ))}
        </ul>

        {/* Invitación */}
        <label className="mb-2">Invite user (email)</label>
        <div className="d-flex gap-2">
          <InputText
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="user@email.com"
          />
          <Button
            label="Invite"
            onClick={handleInvite}
            disabled={!inviteEmail.trim()}
          />
        </div>

        {/* Guardar */}
        <Button
          label="Save Changes"
          onClick={handleSave}
          className="mt-4 btn-pistacho"
          disabled={!name}
          loading={loading}
        />
      </div>
    </Dialog>
  );
}
