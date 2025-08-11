import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import db from "@/firebase/firestore";
import ImageWidgetDialog from "./ImageWidgetDialog";
import "./ImageWidget.css";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

export default function ImageWidget({ widgetId, groupId }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);

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

  useEffect(() => {
    if (showPreview) setPreviewLoading(true);
  }, [displayUrl, showPreview]);

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
      {showPreview && (
        <Dialog
          visible
          onHide={() => setShowPreview(false)}
          onShow={() => setPreviewLoading(true)}
          header="Preview"
          style={{ width: "70vw", maxWidth: 900 }}
          dismissableMask
          className="image-preview-dialog"
        >
          <div className="preview-wrap">
            {previewLoading && (
              <div className="preview-loader">
                <ProgressSpinner strokeWidth="4" />
              </div>
            )}
            <img
              key={displayUrl}
              src={displayUrl}
              alt="Full size"
              className="w-100 h-auto"
              onLoad={() => setPreviewLoading(false)}
              onError={() => setPreviewLoading(false)}
              style={{
                display: "block",
                maxHeight: "80vh",
                objectFit: "contain",
                background: "#111",
                margin: "0 auto",
              }}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}
