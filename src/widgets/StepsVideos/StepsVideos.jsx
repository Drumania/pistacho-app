import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import { Button } from "primereact/button";
import CustomCheckbox from "@/components/CustomCheckbox";
import StepsVideosModal from "./StepsVideosModal";
import "./StepsVideos.css";

export default function StepsVideos({ groupId, widgetId, editMode }) {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("Steps Videos");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const ref = doc(
    db,
    "widget_data",
    "stepvideos",
    `${groupId}_${widgetId}`,
    "config"
  );

  useEffect(() => {
    if (!groupId || !widgetId) return;

    const unsubscribe = onSnapshot(ref, async (docSnap) => {
      if (!docSnap.exists()) {
        await setDoc(ref, {
          contenido: { title: "Steps Videos", videos: [] },
        });
        setTitle("Steps Videos");
        setVideos([]);
      } else {
        const data = docSnap.data();
        const contenido = data.contenido || {};
        setTitle(contenido.title || "Steps Videos");

        const vids = contenido.videos || [];
        setVideos(vids);

        const firstUnseenIndex = vids.findIndex((v) => !v.seen);
        setCurrentIndex(firstUnseenIndex !== -1 ? firstUnseenIndex : 0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId, widgetId]);

  const toggleSeen = async (index) => {
    const updated = [...videos];

    const now = new Date();
    const timestamp = updated[index].seen
      ? null
      : now.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

    updated[index] = {
      ...updated[index],
      seen: !updated[index].seen,
      seenAt: timestamp,
    };

    setVideos(updated);
    await updateDoc(ref, {
      "contenido.videos": updated,
    });
  };

  if (!widgetId)
    return <div className="widget-placeholder">Missing widget ID</div>;
  if (loading)
    return <div className="widget-placeholder">Loading videos...</div>;

  return (
    <div className="widget-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">{title}</h5>
        <Button
          label="+ Video"
          className="btn-transp-small"
          onClick={() => setModalVisible(true)}
        />
      </div>

      {videos.length > 0 ? (
        <>
          <iframe
            key={videos[currentIndex].id}
            src={videos[currentIndex].url}
            title={videos[currentIndex].title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: "12px",
              border: "none",
            }}
          />
        </>
      ) : (
        <div className="text-muted">No videos yet. Add one to start.</div>
      )}

      <ul className="cs-list-group mb-3">
        {videos.map((v, i) => (
          <li
            key={v.id}
            className={`d-flex align-items-center justify-content-between p-2 ${
              i === currentIndex ? "bg-dark" : ""
            }`}
          >
            <div
              className="d-flex flex-column align-items-start gap-0 flex-grow-1"
              style={{ cursor: "pointer" }}
              onClick={() => setCurrentIndex(i)}
            >
              <strong className={i === currentIndex ? "color-pistacho" : ""}>
                {i + 1}. {v.title}
              </strong>
              <small className="fst-italic text-muted">
                {v.seen
                  ? `Seen  ${"on " + v.seenAt || "unknown date"}`
                  : "Not seen yet"}
              </small>
            </div>

            {/* esta parte maneja solo el checkbox */}
            <div className="d-flex align-items-center gap-2">
              <CustomCheckbox
                checked={v.seen}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSeen(i);
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <StepsVideosModal
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        groupId={groupId}
        widgetId={widgetId}
        currentVideos={videos}
        currentTitle={title}
      />
    </div>
  );
}
