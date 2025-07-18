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
import { getAuth, updatePassword, deleteUser, signOut } from "firebase/auth";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/firebase/AuthContext";

import { CSS } from "@dnd-kit/utilities";
import app from "@/firebase/config";
import { Skeleton } from "primereact/skeleton";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

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
      {...attributes}
    >
      {group.order !== 0 ? (
        <i
          className="bi bi-list text-secondary"
          {...listeners}
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
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [groups, setGroups] = useState([]);
  const [pw, setPw] = useState({ pass: "", confirm: "" });
  const [pwError, setPwError] = useState("");

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

    const loadGroups = async () => {
      setLoadingGroups(true);
      try {
        const q = collectionGroup(db, "members");
        const snap = await getDocs(q);
        const userGroups = snap.docs.filter((d) => d.data().uid === user.uid);
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
        setLoadingGroups(false);
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

  const handleChangePassword = async () => {
    if (pw.pass.length < 6) return setPwError("Password too short");
    if (pw.pass !== pw.confirm) return setPwError("Passwords don't match");
    try {
      await updatePassword(user, pw.pass);
      setPw({ pass: "", confirm: "" });
      setPwError("Password updated ✔");
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        setPwError("Re-log and try again");
      } else {
        setPwError("Couldn't update password");
      }
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

  const handleDeleteAccount = async () => {
    try {
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      navigate("/bye");
    } catch (err) {
      console.error("Delete account", err);
      confirmDialog({
        message: "Failed to delete. Try again.",
        header: "Error",
        acceptLabel: "Ok",
        acceptClassName: "btn-pistacho mt-2",
      });
    }
  };

  const confirmDeleteAccount = () => {
    confirmDialog({
      message: "This action is irreversible. Delete your account?",
      header: "Delete account",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClassName: "btn btn-danger",
      rejectClassName: "btn btn-dark",
      accept: handleDeleteAccount,
    });
  };

  const handleDragEnd = async ({ active, over }) => {
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
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <div className="widget-content">
        <h2 className="mb-4">Settings</h2>

        {/* Avatar */}
        <div className="row">
          <div className="col-3">
            <div className="position-relative d-inline-block">
              <input
                type="file"
                id="upload-avatar"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => setPhotoFile(e.target.files[0])}
              />
              <label htmlFor="upload-avatar" className="cursor-pointer">
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
          {/* Email */}
          <div className=" col-7 mb-3">
            <label className="form-label text-light">E-mail</label>
            <InputText
              className="input-field mb-3 w-100"
              value={user.email || ""}
              disabled
            />
          </div>

          {/* Name */}
          <div className="offset-3 col-7 mb-3">
            <label className="form-label text-light">Full Name</label>
            <InputText
              className="input-field mb-3 w-100"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="offset-3 col-7 mb-3">
            <div className="mb-2">
              <label className="form-label text-light">New password</label>
              <Password
                className="w-100"
                inputClassName="w-100"
                value={pw.pass}
                onChange={(e) => setPw({ ...pw, pass: e.target.value })}
                toggleMask
                feedback={false}
                placeholder="New password"
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-light">Repeat password</label>
              <Password
                className="w-100"
                inputClassName="w-100"
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                toggleMask
                feedback={false}
                placeholder="Repeat password"
              />
            </div>

            {pwError && (
              <div className="alert alert-danger py-1">{pwError}</div>
            )}

            <button
              className="btn btn-sm btn-outline-light"
              onClick={handleChangePassword}
            >
              Update password
            </button>
          </div>
        </div>

        <hr className="my-5" />

        {/* Groups */}
        <label className="form-label text-light">Your Groups</label>
        {loadingGroups ? (
          <ul className="cs-list-group list-unstyled">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="d-flex align-items-center gap-3 py-2">
                <Skeleton shape="circle" size="2rem" className="me-2" />
                <Skeleton width="40%" height="1.2rem" />
              </li>
            ))}
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

        {/* Save + Delete */}
        <div className="d-flex justify-content-between align-items-center gap-3">
          <button
            className="btn-pistacho"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>

          <div className="d-flex gap-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => signOut(auth)}
            >
              Logout
            </button>

            <button
              className="btn btn-outline-danger ms-auto"
              onClick={confirmDeleteAccount}
            >
              Delete account
            </button>
          </div>
          {showSaved && <span className="color-green fade-in">Saved...</span>}
          {error && <div className="alert alert-danger">{error}</div>}
        </div>

        <ConfirmDialog />
      </div>
    </div>
  );
}
