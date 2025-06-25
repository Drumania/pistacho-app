import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

export default function BlockTextWidget({ groupId, widgetId }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [draft, setDraft] = useState("");
  const [edited, setEdited] = useState(false);
  const [lastEditedBy, setLastEditedBy] = useState("");
  const [lastEditedAt, setLastEditedAt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadText = async () => {
      if (!groupId || !widgetId) return;
      const ref = doc(db, "block_text", groupId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const entry = data?.[widgetId];
        if (entry) {
          setText(entry.text || "");
          setDraft(entry.text || "");
          setLastEditedBy(entry.user_display_name || "");
          setLastEditedAt(entry.updated_at?.toDate() || null);
        }
      }
    };
    loadText();
  }, [groupId, widgetId]);

  const handleChange = (e) => {
    setDraft(e.target.value);
    setEdited(e.target.value !== text);
  };

  const handleSave = async () => {
    if (!groupId || !widgetId || !user) return;
    setLoading(true);

    const ref = doc(db, "block_text", groupId);
    const payload = {
      text: draft,
      user_id: user.uid,
      user_display_name:
        user.displayName?.trim() || user.email?.split("@")[0] || "Anonymous",
      updated_at: serverTimestamp(),
    };

    await setDoc(ref, { [widgetId]: payload }, { merge: true });

    setText(draft);
    setEdited(false);
    setLastEditedBy(payload.user_display_name);
    setLastEditedAt(new Date());
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="p-3 surface-card shadow-2 border-round">
      <InputTextarea
        value={draft}
        onChange={handleChange}
        rows={6}
        className="w-100 mb-2"
        autoResize
        placeholder="Write something..."
      />
      {edited && (
        <div className="text-right mb-2">
          <Button
            label="Save"
            icon="pi pi-check"
            className="btn-pistacho"
            onClick={handleSave}
            loading={loading}
            disabled={loading}
          />
        </div>
      )}
      {lastEditedBy && (
        <div className="text-sm text-right text-opacity-50 mt-2">
          Last edited by <strong>{lastEditedBy}</strong>
          {lastEditedAt && (
            <>
              {" "}
              on {lastEditedAt.toLocaleDateString()} at{" "}
              {lastEditedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
