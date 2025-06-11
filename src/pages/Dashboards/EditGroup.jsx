import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function EditGroup({ visible, onHide, groupData, onSave }) {
  const [groupName, setGroupName] = useState(groupData?.name || "");

  const handleSave = () => {
    if (!groupName.trim()) return;
    onSave({ ...groupData, name: groupName });
    onHide();
  };

  return (
    <Dialog
      header="Edit Group"
      visible={visible}
      style={{ width: "400px" }}
      onHide={onHide}
      footer={
        <div className="d-flex justify-content-end gap-2">
          <Button label="Cancel" severity="secondary" onClick={onHide} />
          <Button label="Save" onClick={handleSave} />
        </div>
      }
    >
      <div className="mb-3">
        <label htmlFor="groupName" className="form-label">
          Group name
        </label>
        <InputText
          id="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-100"
          autoFocus
        />
      </div>
    </Dialog>
  );
}
