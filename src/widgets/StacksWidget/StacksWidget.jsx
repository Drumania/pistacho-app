import { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import db from "@/firebase/firestore"; // tu instancia
import { TECH_STACKS } from "./techStacksCatalog";
import StackIcon from "tech-stack-icons";
import "./StacksWidget.css";

export default function StacksWidget({ groupId, widgetId, iconsMap }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const stacksDocRef = doc(
    collection(db, "widget_data", groupId, "stacks"),
    widgetId
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      const snap = await getDoc(stacksDocRef);
      if (!mounted) return;

      if (snap.exists()) {
        const data = snap.data();
        setSelectedIds(
          Array.isArray(data.selectedTags) ? data.selectedTags : []
        );
      } else {
        await setDoc(stacksDocRef, {
          groupId,
          widgetId,
          selectedTags: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [groupId, widgetId]);

  const selected = useMemo(
    () => TECH_STACKS.filter((t) => selectedIds.includes(t.id)),
    [selectedIds]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TECH_STACKS;
    return TECH_STACKS.filter(
      (t) => t.label.toLowerCase().includes(q) || t.id.includes(q)
    );
  }, [query]);

  const toggle = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSave = async () => {
    await setDoc(
      stacksDocRef,
      { selectedTags: selectedIds, updatedAt: serverTimestamp() },
      { merge: true }
    );
    setOpen(false);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Tech Stacks</h5>
        <Button
          label="+ Stacks"
          className="btn-transp-small"
          onClick={() => {
            setOpen(true);
          }}
        />
      </div>

      {selected.length === 0 ? (
        <div className="text-muted small">
          No tags selected. Click <b>Edit</b> to choose your stack.
        </div>
      ) : (
        <div className="stacks-cloud">
          {selected.map((tag, index) => (
            <span key={tag.id + index} className={`stack-tag`}>
              {/* <StackIcon name={tag.label} /> */}
              <div style={{ width: 30, height: 30 }}>
                <StackIcon name={tag.id} variant="dark" />
              </div>

              <span className="label">{tag.label}</span>
            </span>
          ))}
        </div>
      )}

      <Dialog
        header="Select stacks"
        visible={open}
        onHide={() => setOpen(false)}
        style={{ width: "50vw", height: "80vh" }}
        className="clock-dialog"
      >
        <input
          type="text"
          placeholder="Search stack..."
          className="p-inputtext w-full mb-3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="stacks-list">
          {filtered.map((tag) => {
            const selected = selectedIds.includes(tag.id);
            return (
              <div
                key={tag.id}
                className={`d-flex align-items-center justify-content-between mb-2 panel-in-panels ${
                  selected ? "bg-pistacho" : ""
                }`}
                onClick={() => toggle(tag.id)}
              >
                <div className="d-flex align-items-center gap-2">
                  <StackIcon name={tag.id} style={{ width: "20px" }} />
                  {tag.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="d-flex justify-end gap-2 mt-4">
          <Button className="btn-pistacho" label="Save" onClick={handleSave} />
        </div>
      </Dialog>
    </div>
  );
}
