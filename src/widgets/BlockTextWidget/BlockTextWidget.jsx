import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
} from "firebase/firestore";
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
      const ref = doc(db, "widget_data", "block_text", groupId, widgetId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setText(data.text || "");
        setDraft(data.text || "");
        setLastEditedBy(data.user_display_name || "");
        setLastEditedAt(data.updated_at?.toDate() || null);
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

    const ref = doc(db, "widget_data", "block_text", groupId, widgetId);
    const payload = {
      text: draft,
      user_id: user.uid,
      user_display_name:
        user.displayName?.trim() || user.email?.split("@")[0] || "Anonymous",
      updated_at: serverTimestamp(),
    };

    await setDoc(ref, payload, { merge: true });

    setText(draft);
    setEdited(false);
    setLastEditedBy(payload.user_display_name);
    setLastEditedAt(new Date());
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="">
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
        <div
          className="text-right text-opacity-50 mt-2"
          style={{ fontSize: "11px" }}
        >
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
