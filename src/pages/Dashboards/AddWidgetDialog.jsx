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

    let minY = Math.min(...columnHeights);
    let col = columnHeights.indexOf(minY);

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

  return (
    <Dialog
      header="Add a Widget"
      visible={visible}
      onHide={onHide}
      style={{ width: "800px" }}
      className="p-fluid"
    >
      <div className="row">
        {widgetTypes.map((widget) => (
          <div className="col-6 col-md-4 col-lg-3 mb-3" key={widget.id}>
            <div
              className="card h-100 d-flex flex-column justify-content-between text-center p-2"
              style={{ height: "200px", width: "100%" }}
            >
              <div>
                {widget.image ? (
                  <img
                    src={widget.image}
                    alt={widget.label}
                    className="img-fluid mb-2"
                    style={{ maxHeight: "80px", objectFit: "contain" }}
                  />
                ) : (
                  <div className="text-muted mb-2" style={{ fontSize: "2rem" }}>
                    <i className={widget.icon || "bi bi-puzzle"} />
                  </div>
                )}
                <h6>{widget.label}</h6>
              </div>
              <Button
                icon="bi bi-plus-circle"
                label="Add"
                className="btn-sm mt-2"
                onClick={() => handleAdd(widget)}
              />
            </div>
          </div>
        ))}
      </div>

      {!widgetTypes.length && (
        <p className="text-muted mt-3">No widgets available.</p>
      )}
    </Dialog>
  );
}
