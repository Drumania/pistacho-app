import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import { fetchMetadata } from "@/utils/fetchMetadata";

export default function BookmarksModal({
  visible,
  onHide,
  groupId,
  widgetId,
  currentBookmarks,
  editingBookmark,
  onSave,
}) {
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    setTimeout(() => inputRef.current?.focus(), 100);
    resetForm();
  }, [visible]);

  const resetForm = () => {
    if (editingBookmark) {
      setUrl(editingBookmark.url || "");
      setEditingId(editingBookmark.id);
    } else {
      setUrl("");
      setEditingId(null);
    }
  };

  const handleEdit = (rowData) => {
    setUrl(rowData.url);
    setEditingId(rowData.id);
    inputRef.current?.focus();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this bookmark?")) return;

    const updated = currentBookmarks.filter((b) => b.id !== id);

    try {
      await updateDoc(
        doc(db, "widget_data", "bookmarks", `${groupId}_${widgetId}`, "config"),
        { bookmarks: updated }
      );
      onSave(updated);
    } catch (err) {
      console.error("Error deleting bookmark:", err);
      alert("Could not delete the bookmark.");
    }
  };

  const handleSave = async () => {
    if (!url.trim() || !url.startsWith("http")) {
      alert("Please enter a valid URL (starting with http or https)");
      return;
    }

    setSaving(true);
    const meta = await fetchMetadata(url.trim());

    const ref = doc(
      db,
      "widget_data",
      "bookmarks",
      `${groupId}_${widgetId}`,
      "config"
    );

    const newItem = {
      id:
        editingId ||
        Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      url: url.trim(),
      title: meta.title || url.trim(),
      description: meta.description || "",
      image: meta.image || "",
    };

    const updated = editingId
      ? currentBookmarks.map((b) => (b.id === editingId ? newItem : b))
      : [...currentBookmarks, newItem];

    try {
      const snap = await getDoc(ref);
      const currentData = snap.exists() ? snap.data() : {};
      await setDoc(ref, {
        title: currentData.title || "Bookmarks",
        bookmarks: updated,
      });
      onSave(updated);
      resetForm();
    } catch (err) {
      console.error("Error saving:", err);
      alert("Could not save the bookmark.");
    } finally {
      setSaving(false);
    }
  };

  const imageTemplate = (item) =>
    item.image ? (
      <img src={item.image} alt="preview" style={{ width: 60 }} />
    ) : null;

  const actionTemplate = (rowData) => (
    <div className="d-flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-sm p-button-text"
        onClick={() => handleEdit(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-sm p-button-text"
        onClick={() => handleDelete(rowData.id)}
      />
    </div>
  );

  return (
    <Dialog
      header="Manage Bookmarks"
      visible={visible}
      style={{ width: "70%", maxWidth: "700px" }}
      onHide={() => {
        onHide();
        resetForm();
      }}
    >
      <h6 className="mb-3">
        {editingId ? "Edit bookmark" : "Add new bookmark"}
      </h6>

      <div className="container">
        <div className="row align-items-end">
          <div className="col-10">
            <label htmlFor="url" className="form-label">
              URL
            </label>
            <InputText
              id="url"
              ref={inputRef}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-100"
            />
          </div>
          <div className="col-2 d-flex gap-2">
            <Button
              icon="pi pi-check"
              onClick={handleSave}
              loading={saving}
              className="btn-pistacho"
              tooltip={editingId ? "Update" : "Add"}
            />
          </div>
        </div>
      </div>

      <div className="my-4">
        <DataTable
          value={currentBookmarks}
          showGridlines
          size="small"
          stripedRows
          emptyMessage="No bookmarks yet"
        >
          <Column
            body={imageTemplate}
            header="Image"
            style={{ width: "5rem" }}
          />
          <Column field="title" header="Title" />
          <Column field="url" header="URL" />
          <Column
            header="Actions"
            body={actionTemplate}
            style={{ width: "6rem" }}
          />
        </DataTable>
      </div>
    </Dialog>
  );
}
