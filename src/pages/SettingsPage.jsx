import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocTitle } from "@/hooks/useDocTitle";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collectionGroup,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/firebase/AuthContext";
import { Skeleton } from "primereact/skeleton";
import app from "@/firebase/config";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "primereact/resources/primereact.min.css";

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

function SortableGroup({ group, onLeave }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: group.id, disabled: group.order === 0 });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: group.order === 0 ? 0.6 : 1,
    cursor: group.order === 0 ? "default" : "grab",
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="d-flex align-items-center gap-3 py-2"
      {...attributes} // solo attributes, sin listeners
    >
      {/* solo acá va el drag */}
      {group.order !== 0 ? (
        <i
          className="bi bi-list text-secondary"
          {...listeners} // <- listeners solo en el ícono
          style={{ cursor: "grab" }}
        />
      ) : (
        <span className="ps-3" />
      )}

      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundImage: `url(${group.photoURL || "/group_placeholder.png"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <span
        className="text-light flex-grow-1 cursor-pointer"
        onClick={() => navigate(`/g/${group.slug}`)}
      >
        {group.name}
      </span>

      {group.order !== 0 && (
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={(e) => {
            e.stopPropagation();
            onLeave();
          }}
        >
          Leave
        </button>
      )}
    </li>
  );
}

export default function SettingsPage() {
  useDocTitle("Settings");
  const { updateUserProfile } = useAuth();
  const user = auth.currentUser;
  const [estimatedGroupCount, setEstimatedGroupCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [groups, setGroups] = useState([]);

  const loadGroups = async () => {
    if (!user?.uid) return;
    setLoadingGroups(true); // ⬅️ nuevo

    try {
      const q = collectionGroup(db, "members");
      const snap = await getDocs(q);

      const userGroups = snap.docs.filter((d) => d.data().uid === user.uid);
      setEstimatedGroupCount(userGroups.length);

      const list = [];

      for (const d of userGroups) {
        const gref = d.ref.parent.parent;
        if (!gref) continue;
        const gsnap = await getDoc(gref);
        if (!gsnap.exists()) continue;
        const g = gsnap.data();
        list.push({
          id: gref.id,
          slug: g.slug,
          name: g.name,
          photoURL: g.photoURL,
          order: g.order ?? 999,
        });
      }

      list.sort((a, b) => a.order - b.order);
      setGroups(list);
    } catch (err) {
      console.error("Error loading groups", err);
    } finally {
      setLoadingGroups(false); // ⬅️ nuevo
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        setProfile(snap.exists() ? snap.data() : { name: "", photoURL: "" });
      } catch (err) {
        console.error("Error fetching profile", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    loadGroups();
  }, [user]);

  const handleSave = async () => {
    if (!profile?.name?.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let photoURL = profile.photoURL || "";
      if (photoFile) {
        const fileRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(fileRef, photoFile);
        photoURL = await getDownloadURL(fileRef);
      }
      const updatedData = {
        uid: user.uid,
        email: user.email,
        name: profile.name.trim(),
        photoURL,
      };
      await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });
      await updateUserProfile({ displayName: updatedData.name, photoURL });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (err) {
      console.error("Save error", err);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await deleteDoc(doc(db, `groups/${groupId}/members`, user.uid));
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch (err) {
      console.error("Error leaving group", err);
    }
  };

  const confirmLeaveGroup = (group) => {
    confirmDialog({
      message: `Are you sure you want to leave "${group.name}"?`,
      header: "Leave Group",
      acceptLabel: "Yes",
      rejectLabel: "Cancel",
      acceptClassName: "btn-pistacho mt-2",
      rejectClassName: "btn-pistacho-outline mt-2",
      accept: () => handleLeaveGroup(group.id),
    });
  };

  const handleDragEnd = async (e) => {
    const { active, over } = e;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = groups.findIndex((g) => g.id === active.id);
    const newIndex = groups.findIndex((g) => g.id === over.id);

    if (groups[oldIndex].order === 0 || groups[newIndex].order === 0) return;

    const reordered = arrayMove(groups, oldIndex, newIndex);

    for (let i = 0; i < reordered.length; i++) {
      const g = reordered[i];
      if (g.order !== i) {
        await updateDoc(doc(db, "groups", g.id), { order: i });
        g.order = i;
      }
    }

    reordered.sort((a, b) => a.order - b.order);
    setGroups(reordered);
    // loadGroups(); // 🔁 recarga los grupos en la sidebar también si usan mismo orden
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <div className="widget-content">
        <h2 className="mb-4">Settings</h2>
        <>
          <div className="mb-4">
            <div className="position-relative d-inline-block">
              <input
                type="file"
                id="upload-avatar"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => setPhotoFile(e.target.files[0])}
              />
              <label
                htmlFor="upload-avatar"
                className="position-relative cursor-pointer"
              >
                <div
                  className="rounded-circle border"
                  style={{
                    width: 100,
                    height: 100,
                    backgroundImage: `url(${
                      photoFile
                        ? URL.createObjectURL(photoFile)
                        : profile.photoURL || "/default-avatar.png"
                    })`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    cursor: "pointer",
                  }}
                />
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center rounded-circle"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                    opacity: 0,
                    transition: "opacity 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                >
                  <i className="bi bi-pencil-fill text-white" />
                </div>
              </label>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Full Name</label>
            <InputText
              className="input-field mb-3 w-100"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <h4 className="text-light mb-3">Your Groups</h4>

          {loadingGroups ? (
            <ul className="cs-list-group list-unstyled">
              <li className="pt-3 text-muted">Loading groups...</li>
            </ul>
          ) : (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={groups.map((g) => g.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="cs-list-group list-unstyled">
                  {groups.map((g) => (
                    <SortableGroup
                      key={g.id}
                      group={g}
                      onLeave={() => confirmLeaveGroup(g)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}

          <hr className="my-5" />

          <div className="d-flex align-items-center gap-3">
            <button
              className="btn-pistacho"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {showSaved && <span className="color-green fade-in">Saved...</span>}
          </div>
        </>

        <ConfirmDialog />
      </div>
    </div>
  );
}
