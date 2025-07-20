import { useState, useEffect } from "react";
import { useCreateGroup } from "@/hooks/useCreateGroup";
import {
  getDocs,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Image } from "primereact/image";

const WIDGET_TYPES = [
  "BlockTextWidget",
  "FuelTrackerWidget",
  "ImageWidget",
  "ImportantDatesWidget",
  "TodoWidget",
  "UsefulContactsWidget",
];

export default function NewGroupDialog({ visible, onHide, user, onCreate }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
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

  const getWidgetsForGroup = async (groupId) => {
    const widgets = [];

    for (const widgetId of WIDGET_TYPES) {
      const ref = collection(
        db,
        "widget_data",
        widgetId,
        "groups",
        groupId,
        "items"
      );
      const snap = await getDocs(ref);

      snap.forEach((doc) => {
        widgets.push({
          ...doc.data(),
          widgetId,
          docId: doc.id,
        });
      });
    }

    return widgets;
  };

  const handleCreateGroup = async () => {
    if (!name || !user?.uid) return;
    setLoading(true);

    try {
      const group = await createGroup(name, user);
      const groupId = group.id || group?.groupId || group?.ref?.id;
      if (!groupId) throw new Error("Group ID not found");

      if (selectedTemplate?.widgets?.length) {
        for (const w of selectedTemplate.widgets) {
          if (!w.widgetId) continue;

          const widgetData = {
            groupId,
            key: w.widgetId,
            layout: w.layout ?? {},
            settings: w.settings ?? {},
            createdAt: serverTimestamp(),
          };

          // 1. Guardar en widget_data/{widgetId}/groups/{groupId}/items
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
            widgetId: w.widgetId, // solo en widget_data
          });

          // 2. Guardar también en groups/{groupId}/widgets
          const groupWidgetRef = collection(db, "groups", groupId, "widgets");
          await addDoc(groupWidgetRef, widgetData);
        }
      }

      const widgets = await getWidgetsForGroup(groupId);
      if (onCreate) onCreate(group, widgets);
      resetDialog();
    } catch (error) {
      console.error("❌ Error creando grupo o copiando widgets:", error);
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

  return (
    <Dialog
      visible={visible}
      onHide={resetDialog}
      header="New Group"
      style={{ width: "70%", maxWidth: "1000px" }}
      className="new-group-dialog"
    >
      {loading ? (
        <div className="text-center py-5">
          <i className="pi pi-spinner pi-spin" style={{ fontSize: "2rem" }} />
          <p className="mt-3">Creating group, please wait...</p>
        </div>
      ) : (
        <div className="p-fluid">
          <div className="row">
            <div className="col-12 mb-3">
              <InputText
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="input-text-custom w-100"
                placeholder="Enter group name"
              />
            </div>

            <div className="col-12">
              <div className="row g-2 mb-4">
                <div className="col-4">
                  <div
                    className={`p-3 panel-in-panels ${
                      selectedTemplate === null ? "bg-pistacho" : ""
                    }`}
                    onClick={() => setSelectedTemplate(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <h5>Empty</h5>
                    <div className="text-muted small mt-2">No widgets</div>
                  </div>
                </div>
              </div>

              <p className="text-muted small mb-2">
                These templates are just a starting point – you can fully
                customize them.
              </p>

              <div className="row g-2">
                {templates.slice(0, 6).map((t, i) => {
                  const isSelected =
                    selectedTemplate?.id &&
                    selectedTemplate?.id === t.value?.id;

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
                          <div className="text-muted small mt-2">
                            No widgets
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="col-12 mt-4">
              <Button
                label="Create Group"
                onClick={handleCreateGroup}
                className="btn-pistacho w-100"
                disabled={!name}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
