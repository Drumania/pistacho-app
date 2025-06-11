import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import Groups from "@/layout/Groups";
import EditGroup from "./EditGroup";

import TodoWidget from "@/widgets/TodoWidget/TodoWidget";
import CalendarWidget from "@/widgets/CalendarWidget/CalendarWidget";
import PomodoroWidget from "@/widgets/PomodoroWidget/PomodoroWidget";
import DateWidget from "@/widgets/DateWidget/DateWidget";
import WorldClocksWidget from "@/widgets/WorldClocksWidget/WorldClocksWidget";
import ClubWorldCupWidget from "@/widgets/ClubWorldCupWidget/ClubWorldCupWidget";

import db from "@/firebase/firestore";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const availableWidgets = {
  TodoWidget,
  CalendarWidget,
  PomodoroWidget,
  DateWidget,
  WorldClocksWidget,
  ClubWorldCupWidget,
};

const WIDGET_OPTIONS = [
  { key: "TodoWidget", label: "To-do List" },
  { key: "CalendarWidget", label: "Calendar" },
  { key: "PomodoroWidget", label: "Pomodoro" },
  { key: "DateWidget", label: "Date" },
  { key: "WorldClocksWidget", label: "World Clocks" },
  { key: "ClubWorldCupWidget", label: "Club World Cup" },
];

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
  };

  const handleLayoutChange = async (newLayout) => {
    setLayout(newLayout);
    for (const w of newLayout) {
      await updateDoc(doc(db, `groups/${groupId}/widgets/${w.i}`), {
        layout: { x: w.x, y: w.y, w: w.w, h: w.h },
      });
    }
  };

  const addNewWidget = async (key) => {
    const newWidget = {
      key,
      layout: { x: 0, y: Infinity, w: 1, h: 1 },
      settings: {},
      createdAt: serverTimestamp(),
      createdBy: "system", // reemplazá por el UID del usuario logueado
    };
    await addDoc(collection(db, `groups/${groupId}/widgets`), newWidget);
    fetchWidgets();
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
          const WidgetComponent = availableWidgets[widget?.key];
          return (
            <div key={l.i}>
              <div
                className={
                  editMode ? "widget-content wc-edit" : "widget-content"
                }
              >
                {editMode && <div className="widget-handle">≡</div>}
                {WidgetComponent ? (
                  <WidgetComponent {...widget.settings} />
                ) : (
                  <div>Not found</div>
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

      {/* <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{
          display: showAddWidgetDialog ? "block" : "none",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add a Widget</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAddWidgetDialog(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="list-group">
                {WIDGET_OPTIONS.map((widget) => (
                  <button
                    key={widget.key}
                    className="list-group-item list-group-item-action"
                    onClick={() => {
                      addNewWidget(widget.key);
                      setShowAddWidgetDialog(false);
                    }}
                  >
                    {widget.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
