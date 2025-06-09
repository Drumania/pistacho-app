import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import TodoWidget from "@/widgets/TodoWidget/TodoWidget";
import CalendarWidget from "@/widgets/CalendarWidget/CalendarWidget";
import PomodoroWidget from "@/widgets/PomodoroWidget/PomodoroWidget";
import DateWidget from "@/widgets/DateWidget/DateWidget";
import WorldClocksWidget from "@/widgets/WorldClocksWidget/WorldClocksWidget";
import ClubWorldCupWidget from "../widgets/ClubWorldCupWidget/ClubWorldCupWidget ";

const initialWidgets = [
  { key: "TodoWidget", w: 2, h: 2, component: <TodoWidget /> },
  { key: "CalendarWidget", w: 1, h: 1, component: <CalendarWidget /> },
  { key: "DateWidget", w: 2, h: 1, component: <DateWidget /> },
  { key: "PomodoroWidget", w: 2, h: 2, component: <PomodoroWidget /> },
  { key: "worldclocks", w: 2, h: 1, component: <WorldClocksWidget /> },
  { key: "ClubWorldCupWidget", w: 1, h: 2, component: <ClubWorldCupWidget /> },
];

export default function GroupDashboard() {
  const { groupId } = useParams();
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(1200);
  const [editMode, setEditMode] = useState(false);

  const [layout, setLayout] = useState(
    initialWidgets.map((w, i) => ({
      i: w.key,
      x: i % 4,
      y: Math.floor(i / 4) * w.h,
      w: w.w,
      h: w.h,
    }))
  );

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

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    // Acá podés guardar en Firebase si querés
  };

  return (
    <div className="container-fluid" ref={containerRef}>
      <div className="row mb-3">
        <div className="col-8 ps-4">
          <h5>
            Dashboard for: <strong>{groupId}</strong>
          </h5>
        </div>
        <div className="col-4 text-end">
          <button
            className="btn-pistacho-outline me-2"
            onClick={() => setEditMode((prev) => !prev)}
          >
            {editMode ? "Done" : "Edit Dashboard"}
          </button>
          <button className="btn-pistacho">Add Widget</button>
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
        compactType={null} // desactiva autoajuste vertical
        preventCollision={true} // evita que se empujen los demás widgets
      >
        {layout.map((l) => {
          const widget = initialWidgets.find((w) => w.key === l.i);
          return (
            <div key={l.i}>
              <div
                className={
                  editMode ? "widget-content wc-edit" : "widget-content"
                }
              >
                {editMode && <div className="widget-handle">≡</div>}
                {widget?.component || <div>Componente no encontrado</div>}
              </div>
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
}
