import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function StampsAdmin() {
  const [stamps, setStamps] = useState([]);
  const [form, setForm] = useState({
    id: "",
    title: "",
    requirement: "",
    img: "",
    order: "",
  });

  const [editing, setEditing] = useState(false);

  const fetchStamps = async () => {
    const snap = await getDocs(collection(db, "stamps"));
    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStamps(data);
  };

  useEffect(() => {
    fetchStamps();
  }, []);

  const handleSave = async () => {
    if (!form.id || !form.img) return;
    const ref = doc(db, "stamps", form.id);
    await setDoc(ref, {
      title: form.title,
      requirement: form.requirement,
      img: `/stamps/${form.img}`,
      order: form.order,
      updatedAt: serverTimestamp(),
    });

    setForm({
      id: "",
      title: "",
      requirement: "",
      img: "",
      order: "",
    });
    setEditing(false);
    fetchStamps();
  };

  const handleEdit = (s) => {
    setForm({
      id: s.id,
      title: s.title || "",
      requirement: s.requirement || "",
      img: s.img?.replace("/stamps/", "") || "",
      order: s.order || 0,
    });
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete stamp " + id + "?")) {
      await deleteDoc(doc(db, "stamps", id));
      fetchStamps();
    }
  };

  return (
    <div>
      <details className="mb-4">
        <summary className="mb-3 fw-bold">Manage Stamps</summary>
        <div className="d-flex flex-wrap gap-3 align-items-end">
          <InputText
            placeholder="ID"
            value={form.id}
            onChange={(e) =>
              setForm({ ...form, id: e.target.value.toLowerCase() })
            }
            disabled={editing}
          />
          <InputText
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <InputText
            placeholder="Requirement"
            value={form.requirement}
            onChange={(e) => setForm({ ...form, requirement: e.target.value })}
          />
          <InputText
            placeholder="Filename (e.g. open-beta.png)"
            value={form.img}
            onChange={(e) => setForm({ ...form, img: e.target.value })}
          />

          <InputText
            placeholder="Order"
            type="number"
            value={form.order}
            onChange={(e) =>
              setForm({ ...form, order: parseInt(e.target.value) || 0 })
            }
          />
          <Button
            className="btn-pistacho"
            label={editing ? "Update" : "Add"}
            onClick={handleSave}
          />
          {editing && (
            <Button
              label="Cancel"
              className="btn-pistacho-outline"
              onClick={() => {
                setForm({
                  id: "",
                  title: "",
                  requirement: "",
                  img: "",
                });
                setEditing(false);
              }}
            />
          )}
        </div>
      </details>

      <div
        className="stamps-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
        }}
      >
        {[...stamps]
          .sort((a, b) => a.order - b.order)
          .map((s) => (
            <div
              key={s.id}
              className="bg-dark rounded d-flex flex-column align-items-center justify-content-center text-center p-2"
              style={{ height: "200px", position: "relative" }}
            >
              <h5>{s.title}</h5>
              <small>{s.requirement}</small>
              <img
                src={s.img}
                alt={s.id}
                style={{ maxWidth: "60%", maxHeight: "60%" }}
              />
              <div className="position-absolute bottom-0 end-0 p-1 d-flex gap-1">
                <Button
                  icon="pi pi-pencil"
                  className="p-button-text color-green p-button-sm"
                  onClick={() => handleEdit(s)}
                />
                <Button
                  icon="pi pi-trash"
                  className="button-danger color-red p-button-text p-button-sm"
                  onClick={() => handleDelete(s.id)}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
