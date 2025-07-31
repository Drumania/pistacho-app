import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { Dialog } from "primereact/dialog";
import { logEvent } from "firebase/analytics";
import { analytics } from "@/firebase/config";

export default function AddWidgetDialog({
  groupId,
  visible,
  onHide,
  onWidgetAdded,
}) {
  const [widgetTypes, setWidgetTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [addedWidgets, setAddedWidgets] = useState([]);
  const [loadingWidgets, setLoadingWidgets] = useState([]);

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

      // Obtené los widgets ya agregados en el grupo
      const addedSnapshot = await getDocs(
        collection(db, `groups/${groupId}/widgets`)
      );
      const added = addedSnapshot.docs.map((doc) => doc.data().key);
      setAddedWidgets(added);
    };

    fetchAvailableWidgets();
  }, [groupId]);

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
    const widgetId = widgetMeta.id;

    // Activar loading para ese widget
    setLoadingWidgets((prev) => [...prev, widgetId]);

    try {
      logEvent(analytics, "add_widget", {
        widget_id: widgetMeta.id,
        widget_name: widgetMeta.label || "unknown",
        category: widgetMeta.categories?.[0] || "uncategorized",
      });

      const snapshot = await getDocs(
        collection(db, `groups/${groupId}/widgets`)
      );
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

      // Actualizar el estado para marcarlo como agregado
      setAddedWidgets((prev) => [...prev, widgetMeta.id]);
      onWidgetAdded?.(); // por si lo necesitás
    } catch (err) {
      console.error("Error adding widget", err);
    } finally {
      setLoadingWidgets((prev) => prev.filter((id) => id !== widgetId));
    }
  };

  const handleWidgetClick = (widget) => {
    const isAdded = addedWidgets.includes(widget.id);
    const isLoading = loadingWidgets.includes(widget.id);

    if (isLoading) return;

    if (isAdded) {
      // 🔒 Si en el futuro es premium, podrías hacer algo como:
      // if (userHasPremium) duplicateWidget(widget);
      // else showUpgradeModal();

      console.log(
        "This widget is already added. Only premium users can duplicate it."
      );

      return;
    }

    handleAdd(widget);
  };

  // const filteredWidgets =
  //   selectedCategory === "all"
  //     ? widgetTypes
  //     : widgetTypes.filter((w) => w.categories?.includes(selectedCategory));

  return (
    <Dialog
      header="Add a Widget"
      visible={visible}
      onHide={onHide}
      style={{ width: "1000px", maxWidth: "98%", height: "90%" }}
      className="p-fluid"
    >
      <div className="h-100 d-flex flex-column">
        {/* Search Input */}
        <input
          type="text"
          className="custom-input mb-4"
          placeholder="Search by name, description or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />

        {/* Badges de categorías */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button
            className={`btn btn-sm ${
              selectedCategory === "all"
                ? "btn-pistacho"
                : "btn-pistacho-outline"
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`btn btn-sm ${
                selectedCategory === cat.value
                  ? "btn-pistacho"
                  : "btn-pistacho-outline"
              }`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grilla */}
        <div
          className="flex-grow-1"
          style={{ overflowY: "auto", overflowX: "hidden" }}
        >
          <div className="row">
            {widgetTypes
              .filter((w) =>
                selectedCategory === "all"
                  ? true
                  : w.categories?.includes(selectedCategory)
              )
              .filter((w) => {
                const q = searchTerm;
                return (
                  w.label?.toLowerCase().includes(q) ||
                  w.description?.toLowerCase().includes(q) ||
                  w.categories?.some((c) => c.toLowerCase().includes(q))
                );
              })
              .sort((a, b) => a.label.localeCompare(b.label)) // 👈 ordena alfabéticamente
              .map((widget) => (
                <div className="col-6 col-md-4 mb-4" key={widget.id}>
                  <div
                    className={`widget-card h-100 ${
                      addedWidgets.includes(widget.id) ? "widget-added" : ""
                    }`}
                    onClick={() => handleWidgetClick(widget)}
                  >
                    {/* Imagen */}
                    {widget.image ? (
                      <img
                        src={widget.image}
                        alt={widget.label}
                        className="widget-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="widget-img icon-placeholder">
                        <i className={widget.icon || "bi bi-puzzle"} />
                      </div>
                    )}

                    <strong className="d-block mb-1 fs-4 px-3">
                      {widget.label}
                    </strong>
                    {/* Description */}
                    {widget.description && (
                      <p className="text-muted d-block mb-2 px-3 ">
                        {widget.description.length > 100
                          ? widget.description.slice(0, 100) + "..."
                          : widget.description}
                      </p>
                    )}
                    {/*  Categorías */}
                    {Array.isArray(widget.categories) &&
                      widget.categories.length > 0 && (
                        <small className="text-muted fst-italic d-block mb-2 px-3">
                          (
                          {widget.categories
                            .map((cat) => {
                              const match = CATEGORIES.find(
                                (c) => c.value === cat
                              );
                              return match ? match.label : cat;
                            })
                            .join(", ")}
                          )
                        </small>
                      )}

                    <div className="simil-btn">
                      {loadingWidgets.includes(widget.id) ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : addedWidgets.includes(widget.id) ? (
                        "Added"
                      ) : (
                        "+ Add"
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {!widgetTypes
            .filter((w) =>
              selectedCategory === "all"
                ? true
                : w.categories?.includes(selectedCategory)
            )
            .filter((w) => {
              const q = searchTerm;
              return (
                w.label?.toLowerCase().includes(q) ||
                w.description?.toLowerCase().includes(q) ||
                w.categories?.some((c) => c.toLowerCase().includes(q))
              );
            }).length && (
            <p className="text-muted mt-3 text-center">No widgets found.</p>
          )}
        </div>
      </div>
    </Dialog>
  );
}
