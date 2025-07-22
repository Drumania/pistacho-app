import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { doc, updateDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export default function StepsVideosModal({
  visible,
  onHide,
  groupId,
  widgetId,
  currentVideos,
  currentTitle,
}) {
  const [title, setTitle] = useState(currentTitle || "");
  const [url, setUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const ref = doc(
    db,
    "widget_data",
    "stepvideos",
    `${groupId}_${widgetId}`,
    "config"
  );

  // 🔁 Reiniciar el modal al abrirlo
  useEffect(() => {
    if (visible) {
      setTitle(currentTitle || "");
      setVideoTitle("");
      setUrl("");
      setEditingId(null);
      setError("");
    }
  }, [visible]);

  // ✅ Convierte links de YouTube a formato embed
  const convertToEmbedUrl = (url) => {
    const match = url.match(/(?:\?v=|\.be\/)([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const handleSaveVideo = async () => {
    if (!videoTitle || !url) return setError("Complete both fields");
    if (!editingId && currentVideos.length >= 10)
      return setError("Max 10 videos allowed");

    const embedUrl = convertToEmbedUrl(url);
    let updated;

    if (editingId) {
      updated = currentVideos.map((v) =>
        v.id === editingId ? { ...v, title: videoTitle, url: embedUrl } : v
      );
    } else {
      updated = [
        ...currentVideos,
        { id: uuidv4(), title: videoTitle, url: embedUrl, seen: false },
      ];
    }

    await updateDoc(ref, {
      "contenido.videos": updated,
    });

    setVideoTitle("");
    setUrl("");
    setEditingId(null);
    setError("");
  };

  const handleEdit = (video) => {
    setVideoTitle(video.title);
    setUrl(video.url);
    setEditingId(video.id);
  };

  const handleDelete = async (id) => {
    const updated = currentVideos.filter((v) => v.id !== id);
    await updateDoc(ref, {
      "contenido.videos": updated,
    });
  };

  const handleSaveTitle = async () => {
    await updateDoc(ref, {
      "contenido.title": title,
    });
  };

  return (
    <Dialog
      header="Edit Steps Videos"
      visible={visible}
      onHide={onHide}
      style={{ width: "40rem" }}
      className="p-fluid"
    >
      {error && <Message severity="error" text={error} />}

      <div className="p-field mt-3">
        <label>Widget Title</label>
        <div className="d-flex gap-2">
          <InputText value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button
            label="Save"
            className="btn-pistacho cw-100"
            onClick={handleSaveTitle}
          />
        </div>
      </div>

      <hr className="my-3" />

      <div className="p-field mt-3">
        <label>Video Title</label>
        <InputText
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
        />
      </div>

      <div className="p-field mt-2">
        <label>YouTube Video URL</label>
        <small className="d-block text-muted mb-1">
          Ej:{" "}
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noreferrer"
            className="ml-1"
          >
            https://www.youtube.com/watch?v=dQw4w9WgXcQ
          </a>
        </small>
        <InputText value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>

      <Button
        label={editingId ? "Update Video" : "Add Video"}
        className="btn-pistacho mt-3"
        onClick={handleSaveVideo}
        disabled={!editingId && currentVideos.length >= 10}
      />

      <ul className="list-group mt-4">
        {currentVideos.map((v) => (
          <li
            key={v.id}
            className="d-flex justify-content-between align-items-center mb-2"
          >
            <div className="flex-grow-1">
              <span className="fw-bold">{v.title}</span>
              <br />
              <a
                href={v.url}
                target="_blank"
                rel="noreferrer"
                className="small text-muted"
              >
                {v.url}
              </a>
            </div>
            <div className="d-flex gap-2">
              <Button
                icon="pi pi-pencil"
                className="p-button-text"
                onClick={() => handleEdit(v)}
              />
              <Button
                icon="pi pi-trash"
                className="p-button-text p-button-danger"
                onClick={() => handleDelete(v.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
