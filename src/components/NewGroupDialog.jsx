import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useCreateGroup } from "@/hooks/useCreateGroup";
import {
  getDocs,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import db from "@/firebase/firestore";

export default function NewGroupDialog({ visible, onHide, user, onCreate }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { createGroup } = useCreateGroup();

  useEffect(() => {
    const fetchTemplates = async () => {
      const snapshot = await getDocs(collection(db, "templates"));
      const options = snapshot.docs.map((doc) => ({
        label: doc.data().name,
        value: {
          id: doc.id,
          widgets: doc.data().widgets || [],
        },
      }));
      setTemplates(options);
    };

    fetchTemplates();
  }, []);

  const handleCreateGroup = async () => {
    if (!name || !user?.uid) return;
    setLoading(true);
    try {
      const group = await createGroup(name, user, selectedTemplate?.data);

      const groupId = group.id || group?.groupId || group?.ref?.id;
      if (!groupId) throw new Error("Group ID not found");

      if (selectedTemplate?.widgets?.length) {
        for (const w of selectedTemplate.widgets) {
          if (!w.widgetId) {
            console.warn("⛔ widgetId missing in template widget:", w);
            continue;
          }

          await addDoc(collection(db, "widget_data"), {
            groupId,
            widgetId: w.widgetId,
            layout: w.layout ?? {},
            settings: w.settings ?? {},
            createdAt: serverTimestamp(),
          });
        }
      }

      if (onCreate) onCreate(group);
      resetDialog();
    } catch (error) {
      console.error("❌ Error creating group:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setName("");
    setSelectedTemplate(null);
    setLoading(false);
    onHide();
  };

  const allTemplates = [{ label: "Empty", value: null }, ...templates];

  return (
    <Dialog
      visible={visible}
      onHide={resetDialog}
      header="New Group"
      style={{ width: "30rem" }}
      className="new-group-dialog"
    >
      <div className="p-fluid">
        <InputText
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="input-text-custom mb-3"
          placeholder="Enter group name"
        />

        <div className="country-list">
          {allTemplates.map((t) => {
            const isSelected =
              (t.value === null && selectedTemplate === null) ||
              (t.value?.id && selectedTemplate?.id === t.value.id);

            return (
              <div
                key={t.label}
                className={`d-flex align-items-center justify-content-between mb-2 panel-in-panels ${
                  isSelected ? "bg-pistacho" : ""
                }`}
                onClick={() => setSelectedTemplate(t.value)}
              >
                <span>{t.label}</span>
                {t.value?.widgets?.length > 0 && (
                  <span className="text-opacity-50">
                    {t.value.widgets.length} widgets
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <Button
          label="Create Group"
          onClick={handleCreateGroup}
          className="btn-pistacho w-100"
          disabled={!name}
          loading={loading}
        />
      </div>
    </Dialog>
  );
}
