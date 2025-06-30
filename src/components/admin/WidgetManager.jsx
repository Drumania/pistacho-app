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
    w: 1,
    h: 1,
  });
  const [error, setError] = useState("");

  const fetchWidgets = async () => {
    const snapshot = await getDocs(collection(db, "widgets"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setWidgets(data);
  };

  useEffect(() => {
    fetchWidgets();
  }, []);

  const toggleWidgetEnabled = async (widget) => {
    const ref = doc(db, "widgets", widget.id);
    await updateDoc(ref, { enabled: !widget.enabled });
    fetchWidgets();
  };

  const openEditDialog = (widget) => {
    setError("");
    setFormData({
      key: widget.id,
      label: widget.label,
      icon: widget.icon,
      w: widget.defaultLayout?.w || 1,
      h: widget.defaultLayout?.h || 1,
      isEdit: true,
    });
    setDialogVisible(true);
  };

  const handleSave = async () => {
    setError("");
    const { key, label, icon, w, h, isEdit } = formData;

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
        enabled: true,
        defaultLayout: { w: Number(w), h: Number(h) },
      });
      setDialogVisible(false);
      fetchWidgets();
    } else {
      setError("This widget key already exists.");
    }
  };

  const widgetActionsTemplate = (row) => (
    <div className="d-flex gap-2">
      <Button
        icon={row.enabled ? "bi bi-toggle-on" : "bi bi-toggle-off"}
        className="p-button-sm p-button-text"
        onClick={() => toggleWidgetEnabled(row)}
        title={row.enabled ? "Disable widget" : "Enable widget"}
      />
      <Button
        icon="bi bi-pencil"
        className="p-button-sm p-button-text"
        onClick={() => openEditDialog(row)}
        title="Edit widget"
      />
    </div>
  );

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Widget Types (Global)</h5>
        <Button
          label="Add Widget"
          icon="bi bi-plus"
          className="btn-pistacho"
          onClick={() => {
            setFormData({ key: "", label: "", icon: "", w: 1, h: 1 });
            setDialogVisible(true);
            setError("");
          }}
        />
      </div>

      <DataTable value={widgets} paginator rows={20} className="mt-3">
        <Column field="id" header="Key" />
        <Column field="label" header="Label" />
        <Column field="defaultLayout.w" header="W" />
        <Column field="defaultLayout.h" header="H" />
        <Column
          field="enabled"
          header="Enabled"
          body={(row) => (row.enabled ? "✅" : "—")}
        />
        <Column
          header="Actions"
          body={widgetActionsTemplate}
          style={{ width: "120px" }}
        />
      </DataTable>

      <Dialog
        header={formData.isEdit ? "Edit Widget" : "Add Widget"}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        className="p-fluid"
      >
        {!formData.isEdit && (
          <div className="field">
            <label htmlFor="key">Widget Key</label>
            <InputText
              id="key"
              value={formData.key}
              onChange={(e) =>
                setFormData({ ...formData, key: e.target.value })
              }
            />
          </div>
        )}

        <div className="field mt-2">
          <label htmlFor="label">Label</label>
          <InputText
            id="label"
            value={formData.label}
            onChange={(e) =>
              setFormData({ ...formData, label: e.target.value })
            }
          />
        </div>

        <div className="field mt-2">
          <label htmlFor="icon">Icon (Bootstrap class)</label>
          <InputText
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          />
          {formData.icon && (
            <div className="mt-2">
              <i className={`${formData.icon} me-2`} />{" "}
              <code>{formData.icon}</code>
            </div>
          )}
        </div>

        <div className="field mt-2 d-flex gap-3">
          <div className="w-50">
            <label>Width (w)</label>
            <InputText
              value={formData.w}
              onChange={(e) => setFormData({ ...formData, w: e.target.value })}
            />
          </div>
          <div className="w-50">
            <label>Height (h)</label>
            <InputText
              value={formData.h}
              onChange={(e) => setFormData({ ...formData, h: e.target.value })}
            />
          </div>
        </div>

        {error && <small className="text-danger">{error}</small>}

        <div className="mt-4 text-end">
          <Button
            label="Save"
            icon="bi bi-save"
            className="btn-pistacho"
            onClick={handleSave}
          />
        </div>
      </Dialog>
    </div>
  );
}
