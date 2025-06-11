import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import Groups from "@/layout/Groups";
import EditGroup from "./EditGroup";
import AddWidgetDialog from "./AddWidgetDialog";

import db from "@/firebase/firestore";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Dashboards() {
  const { groupId } = useParams();
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(1200);
  const [editMode, setEditMode] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddWidgetDialog, setShowAddWidgetDialog] = useState(false);
  const [groupData, setGroupData] = useState({
    slug: groupId,
    name: "My Group",
  });
  const [layout, setLayout] = useState([]);
  const [widgetInstances, setWidgetInstances] = useState([]);
  const [components, setComponents] = useState({});

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 20);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchWidgets();
  }, [groupId]);

  const fetchWidgets = async () => {
    const snapshot = await getDocs(collection(db, `groups/${groupId}/widgets`));
    const widgets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setWidgetInstances(widgets);

    setLayout(
      widgets.map((w) => ({
        i: w.id,
        x: w.layout.x,
        y: w.layout.y,
        w: w.layout.w,
        h: w.layout.h,
      }))
    );

    const componentsMap = {};
    for (const widget of widgets) {
      try {
        const mod = await import(
          /* @vite-ignore */ `/src/widgets/${widget.key}/${widget.key}.jsx`
        );
        componentsMap[widget.id] = mod.default;
      } catch (err) {
        console.error("Error importing widget:", widget.key, err);
      }
    }
    setComponents(componentsMap);
  };

  const handleLayoutChange = async (newLayout) => {
    setLayout(newLayout);
    for (const w of newLayout) {
      await updateDoc(doc(db, `groups/${groupId}/widgets/${w.i}`), {
        layout: { x: w.x, y: w.y, w: w.w, h: w.h },
      });
    }
  };

  return (
    <div className="container-fluid" ref={containerRef}>
      <Groups />

      <div className="row my-3">
        <h5 className="col-6 ps-4">
          Dashboard for: <strong>{groupId}</strong>
        </h5>
        <div className="col-6 text-end">
          <button
            className="btn-pistacho-outline"
            onClick={() => setShowEditDialog(true)}
          >
            <i className="bi bi-gear" title="Settings Group" />
          </button>
          <button
            className="btn-pistacho-outline mx-2"
            onClick={() => setEditMode((prev) => !prev)}
          >
            {editMode ? (
              <i className="bi bi-check-lg" title="Done" />
            ) : (
              <i className="bi bi-columns-gap" title="Edit Dashboard" />
            )}
          </button>
          <button
            className="btn-pistacho"
            onClick={() => setShowAddWidgetDialog(true)}
          >
            Add Widget
          </button>
        </div>
      </div>

      <GridLayout
        className="layout"
        layout={layout}
        cols={4}
        rowHeight={250}
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".widget-handle"
        isDraggable={editMode}
        isResizable={editMode}
        compactType={null}
        preventCollision={true}
      >
        {layout.map((l) => {
          const widget = widgetInstances.find((w) => w.id === l.i);
          const WidgetComponent = components[widget?.id];

          const handleDelete = async () => {
            await deleteDoc(doc(db, `groups/${groupId}/widgets/${widget.id}`));
            fetchWidgets();
          };

          const handleSettings = () => {
            console.log("Settings for", widget.id);
          };

          return (
            <div key={l.i}>
              <div
                className={
                  editMode ? "widget-content wc-edit" : "widget-content"
                }
              >
                {editMode && (
                  <div className="d-flex justify-content-between align-items-center px-2 pb-1">
                    <div className="widget-handle">≡</div>
                    <div>
                      <button
                        className="btn btn-sm btn-light me-2"
                        onClick={handleSettings}
                        title="Edit settings"
                      >
                        <i className="bi bi-gear" />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={handleDelete}
                        title="Delete widget"
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                )}
                {WidgetComponent ? (
                  <WidgetComponent {...widget.settings} />
                ) : (
                  <div className="p-2 text-muted">Widget not found</div>
                )}
              </div>
            </div>
          );
        })}
      </GridLayout>

      <EditGroup
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        groupData={groupData}
        onSave={(updated) => {
          setGroupData(updated);
        }}
      />

      <AddWidgetDialog
        visible={showAddWidgetDialog}
        onHide={() => setShowAddWidgetDialog(false)}
        groupId={groupId}
        onWidgetAdded={fetchWidgets}
      />
    </div>
  );
}
