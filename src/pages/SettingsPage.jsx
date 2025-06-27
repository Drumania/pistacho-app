import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/firebase/AuthContext";
import app from "@/firebase/config";

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export default function SettingsPage() {
  const { updateUserProfile } = useAuth();
  const user = auth.currentUser;

  const [profile, setProfile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      // Actualizar también Auth
      await updateUserProfile({
        displayName: updatedData.name,
        photoURL: updatedData.photoURL,
      });

      alert("Profile updated.");
    } catch (err) {
      console.error("Save error", err);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">Settings</h2>

      <div className="mb-3">
        <label>Avatar</label>
        <div className="d-flex align-items-center gap-3">
          <img
            src={
              photoFile
                ? URL.createObjectURL(photoFile)
                : profile.photoURL || "/default-avatar.png"
            }
            alt="avatar"
            width={64}
            height={64}
            className="rounded-circle border"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files[0])}
          />
        </div>
      </div>

      <div className="mb-3">
        <label>Full Name</label>
        <input
          className="form-control"
          type="text"
          value={profile.name || ""}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          required
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <button
        className="btn btn-success"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}
