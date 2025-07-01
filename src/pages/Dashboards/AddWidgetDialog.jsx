import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

export default function AddWidgetDialog({
  groupId,
  visible,
  onHide,
  onWidgetAdded,
}) {
  const [widgetTypes, setWidgetTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const CATEGORIES = [
    { value: "productivity", label: "Productivity" },
    { value: "entertainment", label: "Entertainment" },
    { value: "finance", label: "Finance" },
    { value: "health", label: "Health" },
    { value: "utilities", label: "Utilities" },
    { value: "collaboration", label: "Collaboration" },
    { value: "personal", label: "Personal" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "custom", label: "Custom" },
  ];

  useEffect(() => {
    const fetchAvailableWidgets = async () => {
      const snapshot = await getDocs(collection(db, "widgets"));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((w) => w.enabled);
      setWidgetTypes(data);
    };
    fetchAvailableWidgets();
  }, []);

  const getNextAvailablePosition = (layout, cols = 4) => {
    const columnHeights = new Array(cols).fill(0);
    layout.forEach(({ x, y, w, h }) => {
      for (let i = x; i < x + w; i++) {
        columnHeights[i] = Math.max(columnHeights[i], y + h);
      }
    });

    const minY = Math.min(...columnHeights);
    const col = columnHeights.indexOf(minY);
    return { x: col, y: minY };
  };

  const handleAdd = async (widgetMeta) => {
    const snapshot = await getDocs(collection(db, `groups/${groupId}/widgets`));
    const layout = snapshot.docs.map(
      (doc) => doc.data().layout || { x: 0, y: 0, w: 1, h: 1 }
    );

    const pos = getNextAvailablePosition(layout, 4);

    const newWidget = {
      key: widgetMeta.id,
      layout: {
        x: pos.x,
        y: pos.y,
        w: widgetMeta.defaultLayout?.w || 1,
        h: widgetMeta.defaultLayout?.h || 1,
      },
      settings: {},
      createdAt: serverTimestamp(),
      createdBy: "system",
    };

    await addDoc(collection(db, `groups/${groupId}/widgets`), newWidget);
    onWidgetAdded();
    onHide();
  };

  const filteredWidgets =
    selectedCategory === "all"
      ? widgetTypes
      : widgetTypes.filter((w) => w.categories?.includes(selectedCategory));

  return (
    <Dialog
      header="Add a Widget"
      visible={visible}
      onHide={onHide}
      style={{ width: "1000px", maxWidth: "100%", height: "600px" }}
      className="p-fluid"
    >
      <div style={{ height: "100%", overflow: "hidden" }}>
        <div className="d-flex flex-row h-100">
          {/* Sidebar */}
          <div
            className="border-end p-3"
            style={{
              width: "180px",
              flexShrink: 0,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <div className="d-flex flex-column gap-2">
              <button
                className={`text-start cs-border-bottom pb-2 fs-5 ${
                  selectedCategory === "all" ? "color-pistacho" : "text-white"
                }`}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  className={`text-start ${
                    selectedCategory === cat.value
                      ? "color-pistacho"
                      : "text-white"
                  }`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div
            className="flex-grow-1 p-3"
            style={{
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <div className="row">
              {filteredWidgets.map((widget) => (
                <div className="col-6 col-md-4  mb-3" key={widget.id}>
                  <div className="widget-card">
                    {widget.label}

                    {widget.image ? (
                      <img
                        src={widget.image}
                        alt={widget.label}
                        className="img-fluid mb-2"
                        style={{ maxHeight: "80px", objectFit: "contain" }}
                      />
                    ) : (
                      <div className="icon-placeholder mb-2">
                        <i className={widget.icon || "bi bi-puzzle"} />
                      </div>
                    )}

                    <Button
                      label="Add"
                      className="btn-pistacho-small"
                      onClick={() => handleAdd(widget)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {!filteredWidgets.length && (
              <p className="text-muted mt-3">No widgets in this category.</p>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
