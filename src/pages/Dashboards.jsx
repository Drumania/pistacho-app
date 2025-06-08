import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import TodoWidget from "@/widgets/TodoWidget";
import CalendarWidget from "@/widgets/CalendarWidget";

const initialWidgets = [
  {
    key: "todo",
    w: 2,
    h: 2,
    component: <TodoWidget />,
  },
  {
    key: "a",
    w: 1,
    h: 1,
    component: <CalendarWidget />,
  },
  {
    key: "b",
    w: 2,
    h: 2,
    component: <div>Componente C</div>,
  },
  { key: "ba", content: "Componente B", w: 1, h: 1 },
  { key: "bb", content: "Componente C", w: 2, h: 2 },
  { key: "bc", content: "Componente D", w: 1, h: 1 },
  { key: "bd", content: "Componente E", w: 1, h: 1 },
  { key: "be", content: "Componente F", w: 1, h: 1 },
  { key: "bf", content: "Componente G", w: 1, h: 1 },
];

export default function GroupDashboard() {
  const { groupId } = useParams();
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(1200);

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
        <div className="col-8">
          <h2>Dashboard for group: {groupId}</h2>
        </div>
        <div className="col-4 text-end">
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
        compactType={null}
      >
        {layout.map((l) => {
          const widget = initialWidgets.find((w) => w.key === l.i);
          return (
            <div key={l.i}>
              <div className="widget-content">
                <div className="widget-handle">≡</div>
                {widget?.component || <div>Componente no encontrado</div>}
              </div>
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
}
