import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
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

export default function EditGroupDialog({ groupId, visible, onHide }) {
  const { user } = useAuth();
  const storage = getStorage(app);

  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [prevImagePath, setPrevImagePath] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!groupId || !visible) return;

    const loadGroup = async () => {
      const refGroup = doc(db, "groups", groupId);
      const snap = await getDoc(refGroup);
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setPhotoURL(data.photoURL || "");
        setPrevImagePath(data.photoPath || "");
      }
    };

    loadGroup();
  }, [groupId, visible]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !groupId) return;

    setLoading(true);
    try {
      if (prevImagePath) {
        await deleteObject(ref(storage, prevImagePath)).catch(() => {});
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
      onHide();
    } catch (err) {
      console.error("Error updating group:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Edit Group Info"
      style={{ width: "30rem" }}
      className="edit-group-dialog"
    >
      <div className="p-fluid">
        <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
          <div className="flex-grow-1">
            <label className="mb-2">Group Name</label>
            <InputText
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-100"
            />
          </div>
          <div className="text-end">
            <input
              type="file"
              id="group-image-upload"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <label htmlFor="group-image-upload" className="group-image-label">
              <img
                src={photoURL || "/group_placeholder.png"}
                alt="Group"
                className="group-image-avatar"
              />
              <div className="group-image-overlay">
                <i className="bi bi-pencil-fill" />
              </div>
            </label>
          </div>
        </div>

        <Button
          label="Save Changes"
          onClick={handleSave}
          className="mt-3 btn-pistacho"
          disabled={!name}
          loading={loading}
        />
      </div>
    </Dialog>
  );
}
