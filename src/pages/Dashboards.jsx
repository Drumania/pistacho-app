import { useParams } from "react-router-dom";
import { useState } from "react";
import { DndContext, closestCenter, rectIntersection } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const initialWidgets = [
  { id: "todo", content: "To Do App A", tall: true },
  { id: "a", content: "Componente B" },
  { id: "b", content: "Componente C", tall: true },
  { id: "c", content: "Componente D" },
  { id: "d", content: "Componente E" },
  { id: "e", content: "Componente F" },
  { id: "f", content: "Componente G" },
  { id: "g", content: "Componente H" },
  { id: "h", content: "Componente I" },
  { id: "i", content: "Componente J" },
];

export default function GroupDashboard() {
  const { groupId } = useParams();
  const [widgets, setWidgets] = useState(initialWidgets);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = widgets.findIndex((w) => w.id === active.id);
    const newIndex = widgets.findIndex((w) => w.id === over.id);
    setWidgets((items) => arrayMove(items, oldIndex, newIndex));
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-8">
          <h2>Dashboard for group: {groupId}</h2>
        </div>
        <div className="col-4 text-end">
          <button className="btn-pistacho float-end">Add Widget</button>
        </div>
      </div>

      <DndContext
        collisionDetection={rectIntersection}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="widget-zone">
            {widgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                id={widget.id}
                content={widget.content}
                tall={widget.tall}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableWidget({ id, content, tall }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`widget-wrapper ${tall ? "tall" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className="widget">{content}</div>
    </div>
  );
}
