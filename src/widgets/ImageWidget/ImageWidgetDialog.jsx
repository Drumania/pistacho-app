import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { app } from "@/firebase/config";
import db from "@/firebase/firestore";

export default function ImageWidgetDialog({
  visible,
  onHide,
  groupId,
  widgetId,
  onImageUploaded,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const storage = getStorage(app);
      const storageRef = ref(
        storage,
        `groups/${groupId}/widgets/${widgetId}/image`
      );
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      const docRef = doc(db, "widget_data", "ImageWidget", groupId, widgetId);
      await setDoc(docRef, {
        image_url: downloadUrl,
      });

      onImageUploaded?.();
      onHide();
    } catch (err) {
      console.error("Error uploading:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog header="Upload Image" visible={visible} onHide={onHide} modal>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <hr />
      <Button
        label="Upload"
        onClick={handleUpload}
        disabled={!file || loading}
        loading={loading}
        className="btn-pistacho my-3"
      />
    </Dialog>
  );
}
