import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ConfirmDialog } from "primereact/confirmdialog";
import { confirmDialog } from "primereact/confirmdialog";

import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import {
  ref,
  listAll,
  deleteObject,
  getStorage,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import db from "@/firebase/firestore";
import app from "@/firebase/config";
import { useAuth } from "@/firebase/AuthContext";

export default function EditGroupDialog({ groupId, visible, onHide }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const storage = getStorage(app);

  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [prevImagePath, setPrevImagePath] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!groupId || !visible || !user?.uid) return;

    const loadData = async () => {
      const refGroup = doc(db, "groups", groupId);
      const snap = await getDoc(refGroup);
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setPhotoURL(data.photoURL || "");
        setPrevImagePath(data.photoPath || "");
      }

      const memberRef = doc(db, "groups", groupId, "members", user.uid);
      const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        const memberData = memberSnap.data();
        setIsOwner(!!memberData.owner);
      }
    };

    loadData();
  }, [groupId, visible, user]);

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

  const handleDelete = () => {
    confirmDialog({
      message:
        "Are you sure you want to delete this group and all related data?",
      header: "Delete Confirmation",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClassName: "btn btn-danger mt-3",
      rejectClassName: "btn btn-dark mt-3 me-3",
      accept: async () => {
        setLoading(true);
        try {
          // 🔥 1. Borrar archivos del storage
          const folderRef = ref(storage, `groups/${groupId}`);
          const fileList = await listAll(folderRef);
          await Promise.all(fileList.items.map((item) => deleteObject(item)));

          // 🔥 2. Borrar subcolecciones relacionadas
          const subcollections = [
            "members",
            "transactions",
            "widgets",
            "templates",
            "itembags",
            "special_rewards",
            "item_bag_templates",
            "events", // por si hay eventos asociados al grupo
          ];

          for (const sub of subcollections) {
            const snap = await getDocs(collection(db, "groups", groupId, sub));
            await Promise.all(
              snap.docs.map((docu) =>
                deleteDoc(doc(db, "groups", groupId, sub, docu.id))
              )
            );
          }

          // 🔥 3. Borrar grupo
          await deleteDoc(doc(db, "groups", groupId));

          // 🔁 4. Redirigir
          navigate("/home");
        } catch (err) {
          console.error("❌ Error deleting group and related data:", err);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Edit Group Info"
      style={{ width: "90%", maxWidth: "500px" }}
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

        {isOwner && (
          <div className="d-flex justify-content-end mt-4 pt-4 ">
            <ConfirmDialog />
            <div
              className="text-danger cursor-pointer text-end"
              onClick={handleDelete}
            >
              Delete Group
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
