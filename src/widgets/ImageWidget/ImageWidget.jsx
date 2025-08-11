import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import db from "@/firebase/firestore";
import ImageWidgetDialog from "./ImageWidgetDialog";
import "./ImageWidget.css";

export default function ImageWidget({ widgetId, groupId }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const loadImage = async () => {
    try {
      // Respeta tu convención: "widget_data", nombreColección, groupId, widgetId
      const docRef = doc(db, "widget_data", "ImageWidget", groupId, widgetId);
      const snap = await getDoc(docRef);
      if (snap.exists()) setImageUrl(snap.data().image_url || null);
      else setImageUrl(null);
    } catch (e) {
      console.error("Image load error:", e);
    }
  };

  useEffect(() => {
    loadImage();
  }, [groupId, widgetId]);

  const displayUrl = imageUrl || "/placeholder-600x400.png";

  return (
    <div
      className="image-widget-background"
      style={{ backgroundImage: `url(${displayUrl})` }}
      aria-label="image widget"
    >
      <div className="image-overlay">
        <div className="overlay-actions">
          <Button
            icon="pi pi-eye"
            className="p-button-rounded p-button-text overlay-btn"
            aria-label="Preview image"
            onClick={(e) => {
              e.stopPropagation();
              setShowPreview(true);
            }}
          />
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-text overlay-btn"
            aria-label="Edit image"
            onClick={(e) => {
              e.stopPropagation();
              setShowEditor(true);
            }}
          />
        </div>
      </div>

      {/* Dialog: editar/subir */}
      <ImageWidgetDialog
        visible={showEditor}
        onHide={() => setShowEditor(false)}
        groupId={groupId}
        widgetId={widgetId}
        onImageUploaded={loadImage}
      />

      {/* Dialog: preview grande */}
      <Dialog
        visible={showPreview}
        onHide={() => setShowPreview(false)}
        header="Preview"
        style={{ width: "70vw", maxWidth: 900 }}
        dismissableMask
        className="image-preview-dialog"
      >
        <div className="preview-wrap">
          {/* Si preferís <img>, ver nota abajo */}
          <div
            className="preview-bg"
            style={{ backgroundImage: `url(${displayUrl})` }}
            role="img"
            aria-label="Full size image"
          />
        </div>
      </Dialog>
    </div>
  );
}
