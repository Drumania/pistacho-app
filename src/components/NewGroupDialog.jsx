import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useCreateGroup } from "@/hooks/useCreateGroup";

export default function NewGroupDialog({ visible, onHide, user, onCreate }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { createGroup } = useCreateGroup();

  const handleCreateGroup = async () => {
    if (!name || !user?.uid) return;
    setLoading(true);
    try {
      const group = await createGroup(name, user);
      if (onCreate) onCreate(group);
      resetDialog();
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setName("");
    setLoading(false);
    onHide();
  };

  return (
    <Dialog
      visible={visible}
      onHide={resetDialog}
      header="New Group"
      style={{ width: "30rem" }}
      className="new-group-dialog"
    >
      <div className="p-fluid">
        <label className="mb-2">Group Name</label>
        <InputText
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="input-text-custom mb-3"
          placeholder="Enter group name"
        />
        <Button
          label="Create Group"
          onClick={handleCreateGroup}
          className="btn-pistacho w-100"
          disabled={!name}
          loading={loading}
        />
      </div>
    </Dialog>
  );
}
