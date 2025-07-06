import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import ImportantDatesModal from "./ImportantDatesModal";
import "./ImportantDatesWidget.css";

// Helper para calcular los días restantes
const calculateDaysLeft = (targetDate) => {
  if (!targetDate) return null;
  // Aseguramos que la comparación se haga sin tener en cuenta la hora
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const difference = +new Date(targetDate) - +today;
  if (difference < 0) return 0;
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
};

// Helper para formatear la fecha
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("es-ES", options);
};

export default function ImportantDatesWidget({ instance, editMode, groupId }) {
  const [config, setConfig] = useState({
    title: "Fechas Importantes",
    dates: [],
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const widgetDataRef = doc(
      db,
      "widget_data",
      "important_dates",
      groupId,
      instance.id
    );

    const unsubscribe = onSnapshot(widgetDataRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Ordenar fechas cronológicamente
        const sortedDates = (data.dates || []).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setConfig({
          title: data.title || "Fechas Importantes",
          dates: sortedDates,
        });
      } else {
        setConfig({ title: "Fechas Importantes", dates: [] });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId, instance.id]);

  const handleOpenModal = (date = null) => {
    setEditingDate(date);
    setModalVisible(true);
  };

  const handleSave = (newDates) => {
    const sortedDates = newDates.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    setConfig((prevConfig) => ({ ...prevConfig, dates: sortedDates }));
    setModalVisible(false);
    setEditingDate(null);
  };

  const handleDelete = async (dateId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta fecha?"))
      return;

    const widgetDataRef = doc(
      db,
      "widget_data",
      "important_dates",
      groupId,
      instance.id
    );
    const newDates = config.dates.filter((d) => d.id !== dateId);
    try {
      await updateDoc(widgetDataRef, { dates: newDates });
    } catch (error) {
      console.error("Error al eliminar la fecha:", error);
      alert("No se pudo eliminar la fecha.");
    }
  };

  if (loading) {
    return <div className="widget-placeholder">Cargando Fechas...</div>;
  }

  return (
    <div className="important-dates-widget widget-container">
      <div className="widget-header">
        <h5 className="widget-title">{config.title}</h5>
        {editMode && (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleOpenModal()}
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        )}
      </div>
      <div className="important-dates-list">
        {config.dates.length > 0 ? (
          <ul>
            {config.dates.map((item) => {
              const daysLeft = calculateDaysLeft(item.date);
              const isPast =
                new Date(item.date) < new Date().setHours(0, 0, 0, 0);
              return (
                <li key={item.id} className={isPast ? "past-date" : ""}>
                  <div className="date-info">
                    <span className="date-day">{formatDate(item.date)}</span>
                    <span className="date-text">{item.text}</span>
                  </div>
                  <div className="date-actions">
                    {item.showCountdown && !isPast && (
                      <span className="countdown-badge">
                        {daysLeft} {daysLeft === 1 ? "día" : "días"}
                      </span>
                    )}
                    {editMode && (
                      <>
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="btn btn-sm btn-light py-0 px-1 mx-1"
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-sm btn-light py-0 px-1"
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted text-center p-3">
            {editMode
              ? "Haz clic en '+' para añadir una fecha."
              : "No hay fechas importantes."}
          </p>
        )}
      </div>
      <ImportantDatesModal
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        groupId={groupId}
        widgetId={instance.id}
        currentDates={config.dates}
        editingDate={editingDate}
        onSave={handleSave}
      />
    </div>
  );
}
