import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import { Button } from "primereact/button";
import IframeWidgetModal from "./IframeWidgetModal";

export default function IframeWidget({ groupId, widgetId }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("Embedded Frame");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const ref = doc(
    db,
    "widget_data",
    "iframewidget",
    `${groupId}_${widgetId}`,
    "config"
  );

  useEffect(() => {
    if (!groupId || !widgetId) return;

    const unsubscribe = onSnapshot(ref, async (docSnap) => {
      if (!docSnap.exists()) {
        await setDoc(ref, {
          contenido: { url: "", title: "Embedded Frame" },
        });
        setUrl("");
        setTitle("Embedded Frame");
      } else {
        const data = docSnap.data().contenido || {};
        setUrl(data.url || "");
        setTitle(data.title || "Embedded Frame");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId, widgetId]);

  if (loading) return <div className="widget-placeholder">Loading...</div>;

  return (
    <div style={{ height: "100%" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">{title}</h5>
        <Button
          label="+ iframe"
          className="btn-transp-small"
          onClick={() => setModalVisible(true)}
        />
      </div>

      {url ? (
        <div className="widget-full-height">
          <iframe
            src={url}
            title={title}
            allowFullScreen
            style={{
              width: "100%",
              height: "100%",
              aspectRatio: "16 / 9",
              border: "none",
              borderRadius: "12px",
            }}
          />
        </div>
      ) : (
        <div className="text-muted">No URL loaded</div>
      )}

      <IframeWidgetModal
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        groupId={groupId}
        widgetId={widgetId}
        currentUrl={url}
        currentTitle={title}
      />
    </div>
  );
}
