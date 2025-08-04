// src/components/groups/NewGroupSteps/TemplateGroupStep.jsx
import { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { Skeleton } from "primereact/skeleton";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { useCreateGroup } from "@/hooks/useCreateGroup";

export default function TemplateGroupStep({ user, onCreate, onBack }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [error, setError] = useState("");
  const nameInputRef = useRef(null);
  const { createGroup } = useCreateGroup();

  useEffect(() => {
    const fetchTemplates = async () => {
      const snapshot = await getDocs(collection(db, "templates"));
      const options = snapshot.docs
        .filter((doc) => doc.data().ngshow === true)
        .map((doc) => ({
          label: doc.data().name,
          value: {
            id: doc.id,
            image: doc.data().image ?? null,
            widgets: doc.data().widgets || [],
          },
        }));
      setTemplates(options);
    };
    fetchTemplates();
  }, []);

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      setError("Please enter a group name.");
      nameInputRef.current?.focus();
      return;
    }

    if (!selectedTemplate) {
      setError("Please select a template.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const group = await createGroup(name, user);
      const groupId = group.id || group?.groupId || group?.ref?.id;
      if (!groupId) throw new Error("Group ID not found");

      for (const w of selectedTemplate.widgets) {
        if (!w.widgetId) continue;

        const widgetData = {
          groupId,
          key: w.widgetId,
          layout: w.layout ?? {},
          settings: w.settings ?? {},
          createdAt: serverTimestamp(),
        };

        const widgetRef = collection(
          db,
          "widget_data",
          w.widgetId,
          "groups",
          groupId,
          "items"
        );
        await addDoc(widgetRef, {
          ...widgetData,
          widgetId: w.widgetId,
        });

        const groupWidgetRef = collection(db, "groups", groupId, "widgets");
        await addDoc(groupWidgetRef, widgetData);
      }

      if (onCreate) onCreate(group);
    } catch (err) {
      console.error("❌ Error creando grupo desde template:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-fluid">
      <h3>Use a dashboard template</h3>
      <p className="text-muted small mb-3">
        Choose from a set of pre-built dashboards to start with widgets already
        added, these templates are just a starting point – you can fully
        customize them.
      </p>

      <InputText
        ref={nameInputRef}
        className="custom-input my-4"
        placeholder="Enter group name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />

      {error && <small className="text-danger d-block mb-3">{error}</small>}
      <div className="row g-2">
        {templates.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div className="col-4" key={i}>
                <div
                  className="p-3 panel-in-panels"
                  style={{ height: "300px" }}
                >
                  <div className="mb-3">
                    <Skeleton width="70%" height="1.5rem" />
                  </div>
                  <Skeleton height="180px" className="mb-3" />
                  <div className="d-flex flex-wrap gap-2">
                    <Skeleton width="40%" height="1rem" />
                    <Skeleton width="30%" height="1rem" />
                  </div>
                </div>
              </div>
            ))
          : templates.slice(0, 6).map((t, i) => {
              const isSelected =
                selectedTemplate?.id && selectedTemplate?.id === t.value?.id;

              return (
                <div className="col-4" key={i}>
                  <div
                    className={`p-3 panel-in-panels ${
                      isSelected ? "bg-pistacho" : ""
                    }`}
                    onClick={() => setSelectedTemplate(t.value)}
                    style={{ cursor: "pointer", height: "300px" }}
                  >
                    <h5>{t.label}</h5>

                    {t.value?.image && (
                      <Image
                        src={
                          t.value.image.startsWith("/")
                            ? t.value.image
                            : `/${t.value.image}`
                        }
                        alt="Preview"
                        preview
                        width="100%"
                        className="mt-2"
                        imageStyle={{
                          maxHeight: "180px",
                          objectFit: "contain",
                        }}
                      />
                    )}

                    {t.value?.widgets?.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1 mt-2 pt-2">
                        {t.value.widgets.map((w, j) => (
                          <span
                            key={j}
                            className="badge text-bg-dark"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {w.widgetId.replace("Widget", "")}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted small mt-2">No widgets</div>
                    )}
                  </div>
                </div>
              );
            })}
      </div>

      <div className="d-flex flex-column mt-4 gap-4">
        <Button
          label="Create Group"
          onClick={handleCreateGroup}
          className="btn-pistacho cw-200"
          loading={loading}
        />
        <Button
          label="⬅ Back"
          className="btn-pistacho-outline cw-100"
          onClick={onBack}
          disabled={loading}
        />
      </div>
    </div>
  );
}
