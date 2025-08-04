import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useCreateGroup } from "@/hooks/useCreateGroup";

export default function EmptyGroupStep({ user, onCreate, onBack }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { createGroup } = useCreateGroup();

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      setError("Please enter a group name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const group = await createGroup(name, user);
      if (onCreate) onCreate(group, []);
    } catch (err) {
      console.error("❌ Error creando grupo vacío:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-fluid">
      <h3>Create empty dashboard</h3>
      <p className="text-muted small mb-3">
        Create a blank group with no widgets. You'll be able to customize it
        freely later.
      </p>

      <InputText
        className="custom-input mt-2 mb-2"
        placeholder="Enter group name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />

      {error && <small className="text-danger d-block mb-3">{error}</small>}

      <div className="d-flex flex-column gap-4">
        <Button
          label="Create Empty Group"
          onClick={handleCreateGroup}
          className="btn-pistacho cw-200"
          loading={loading}
        />
        <Button
          label="⬅ Back"
          className="btn-pistacho-outline cw-100"
          onClick={onBack}
          disabled={loading}
        />
      </div>
    </div>
  );
}
