import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import ImageWidgetDialog from "./ImageWidgetDialog";
import "./ImageWidget.css";

export default function ImageWidget({ widgetId, groupId }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const loadImage = async () => {
    const docRef = doc(db, "widget_data", "ImageWidget", groupId, widgetId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      setImageUrl(snap.data().image_url || null);
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
      onClick={() => !showDialog && setShowDialog(true)}
    >
      <div className="image-overlay">
        <i className="pi pi-pencil" />
      </div>

      <ImageWidgetDialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        groupId={groupId}
        widgetId={widgetId}
        onImageUploaded={loadImage}
      />
    </div>
  );
}
