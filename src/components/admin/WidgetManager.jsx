// 👇 estos imports suman storage
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import app from "@/firebase/config";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

export default function WidgetManager() {
  const [widgets, setWidgets] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    label: "",
    icon: "",
    image: "",
    w: 1,
    h: 1,
    status: "enabled",
    categories: [],
  });
  const [prevImagePath, setPrevImagePath] = useState("");
  const [error, setError] = useState("");

  const storage = getStorage(app);

  const CATEGORIES = [
    {
      value: "productivity",
      label: "Productivity",
      description: "Tools to help you stay organized and focused.",
    },
    {
      value: "entertainment",
      label: "Entertainment",
      description: "Track movies, games, and fun content.",
    },
    {
      value: "finance",
      label: "Finance",
      description: "Manage payments, expenses, and financial info.",
    },
    {
      value: "health",
      label: "Health",
      description: "Track habits, weight, and overall well-being.",
    },
    {
      value: "utilities",
      label: "Utilities",
      description: "Useful widgets like weather, clocks, or contacts.",
    },
    {
      value: "collaboration",
      label: "Collaboration",
      description: "Work with others: group members, shared tools.",
    },
    {
      value: "personal",
      label: "Personal",
      description: "Private or self-related widgets like notes or photos.",
    },
    {
      value: "lifestyle",
      label: "Lifestyle",
      description: "Daily life tools like weather, trackers, etc.",
    },
    {
      value: "custom",
      label: "Custom",
      description: "Creative or flexible widgets like images or embeds.",
    },
  ];

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    const snapshot = await getDocs(collection(db, "widgets"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setWidgets(data);
  };

  const openEditDialog = (widget) => {
    setError("");
    setFormData({
      key: widget.id,
      label: widget.label,
      icon: widget.icon,
      image: widget.image || "",
      w: widget.defaultLayout?.w || 1,
      h: widget.defaultLayout?.h || 1,
      status: widget.enabled ? "enabled" : "disabled",
      categories: widget.categories || [],
      isEdit: true,
    });
    setPrevImagePath(widget.image || "");
    setDialogVisible(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !formData.key) return;

    const path = `widget_images/${formData.key}/${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    if (prevImagePath && prevImagePath !== path) {
      try {
        await deleteObject(ref(storage, prevImagePath));
      } catch (err) {
        console.warn("Error deleting previous image:", err);
      }
    }

    setFormData((f) => ({ ...f, image: url }));
    setPrevImagePath(path);
  };

  const handleSave = async () => {
    setError("");
    const { key, label, icon, w, h, status, isEdit } = formData;

    if (!key || !label || !icon) {
      setError("All fields are required.");
      return;
    }

    const ref = doc(db, "widgets", key);
    const existing = await getDoc(ref);

    if (!existing.exists() || isEdit) {
      await setDoc(ref, {
        label,
        icon,
        image: formData.image || "",
        enabled: status === "enabled",
        defaultLayout: { w: Number(w), h: Number(h) },
        categories: formData.categories || [],
      });
      setDialogVisible(false);
      fetchWidgets();
    } else {
      setError("This widget key already exists.");
    }
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Widget Types (Global)</h5>
        <Button
          label="Add Widget"
          icon="bi bi-plus"
          className="btn-pistacho"
          onClick={() => {
            setFormData({
              key: "",
              label: "",
              icon: "",
              image: "",
              w: 1,
              h: 1,
              status: "enabled",
              categories: [],
              isEdit: false,
            });
            setPrevImagePath("");
            setDialogVisible(true);
            setError("");
          }}
        />
      </div>

      <DataTable
        value={widgets}
        paginator
        rows={20}
        stripedRows
        className="mt-3 custom-datatable"
      >
        <Column field="label" header="Label" sortable className="fw-bold" />
        <Column field="id" header="Key" sortable className="fw-light" />
        <Column field="defaultLayout.w" header="W" sortable />
        <Column field="defaultLayout.h" header="H" sortable />
        <Column
          header="Status"
          body={(row) =>
            row.enabled === false ? (
              <span className="badge bg-danger">Disabled</span>
            ) : null
          }
          style={{ width: "100px" }}
        />
        <Column
          header="Categories"
          body={(row) =>
            Array.isArray(row.categories) && row.categories.length > 0 ? (
              <div className="d-flex flex-wrap gap-1">
                {row.categories.map((cat) => {
                  const found = CATEGORIES.find((c) => c.value === cat);
                  return (
                    <span key={cat} className="badge bg-secondary">
                      {found?.label || cat}
                    </span>
                  );
                })}
              </div>
            ) : null
          }
        />
        <Column
          header="Edit"
          body={(row) => (
            <Button
              icon="bi bi-pencil"
              className="bg-black p-button-sm p-button-text"
              onClick={() => openEditDialog(row)}
              title="Edit widget"
            />
          )}
          style={{ width: "80px" }}
        />
      </DataTable>

      <Dialog
        header={formData.isEdit ? "Edit Widget" : "Add Widget"}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: "700px" }}
      >
        <div className="row g-0">
          {!formData.isEdit && (
            <div className="col-12 mb-4">
              <label htmlFor="key">Widget Key: (Folder)</label>
              <InputText
                id="key"
                value={formData.key}
                className="w-100"
                onChange={(e) =>
                  setFormData({ ...formData, key: e.target.value })
                }
              />
            </div>
          )}

          <div className="col-12 border-bottom pe-4 ">
            <label htmlFor="label">Label:</label>
            <InputText
              id="label"
              value={formData.label}
              className="w-100 mb-3"
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
            />
          </div>

          <div className="col-6 py-4 pe-4 border-end">
            <label>Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control"
            />
            <small className="text-info d-block mt-1">
              150 x 150 px. PNG or JPG recommended.
            </small>
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="preview"
                  className="img-thumbnail"
                  style={{ maxWidth: "150px", maxHeight: "150px" }}
                />
              </div>
            )}
          </div>

          <div className="col-6 py-4 ps-4 ">
            <label htmlFor="icon">Icon: (Bootstrap class)</label>
            <InputText
              id="icon"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
            />
            <br />
            {formData.icon && (
              <div className="ps-2 text-center">
                <i className={`${formData.icon} me-2`} />
                <br />
                <code>{formData.icon}</code>
              </div>
            )}
          </div>

          <div className="col-3 py-4 border-top">
            <label>Width (w)</label>
            <br />
            <InputText
              value={formData.w}
              onChange={(e) => setFormData({ ...formData, w: e.target.value })}
              style={{ width: "80px" }}
            />
            <br />
            <br />
            <label>Height (h)</label>
            <br />
            <InputText
              value={formData.h}
              onChange={(e) => setFormData({ ...formData, h: e.target.value })}
              style={{ width: "80px" }}
            />
          </div>

          <div className="col-9 py-4 border-top border-start ps-4 ">
            <label className="mb-2 d-block">Categories</label>
            <div className="d-flex flex-column gap-1">
              {CATEGORIES.map((cat) => (
                <div className="form-check" key={cat.value}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`cat-${cat.value}`}
                    checked={formData.categories.includes(cat.value)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const updated = checked
                        ? [...formData.categories, cat.value]
                        : formData.categories.filter((c) => c !== cat.value);
                      setFormData({ ...formData, categories: updated });
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`cat-${cat.value}`}
                  >
                    {cat.label}
                    <small className="ps-4 text-white-50">
                      {cat.description}
                    </small>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error && <small className="text-danger">{error}</small>}

          <div className="col-12 ps-4 py-4 border-top border-bottom d-flex align-items-center">
            <label>Status</label>
            <select
              className="form-select ms-3"
              style={{ width: "200px" }}
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div className="col-12 mt-4 text-center">
            <Button
              label="Save"
              className="btn-pistacho px-5"
              onClick={handleSave}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
