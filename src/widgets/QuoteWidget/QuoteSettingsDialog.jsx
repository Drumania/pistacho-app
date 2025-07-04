import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useState, useEffect } from "react";
import quotes from "./quotes.json";
import "./QuoteWidget.css";

export default function QuoteSettingsDialog({
  visible,
  onHide,
  onSave,
  initialAuthors,
}) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSelected(initialAuthors || []);
    setSearch("");
  }, [initialAuthors, visible]);

  const handleToggle = (author) => {
    const already = selected.includes(author);
    if (already) {
      setSelected(selected.filter((a) => a !== author));
    } else {
      setSelected([...selected, author]);
    }
  };

  const handleSave = () => {
    onSave(selected);
    onHide();
  };

  const authorOptions = Array.from(new Set(quotes.map((q) => q.author)));

  const filtered = authorOptions.filter((a) =>
    a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog
      header="Quote Widget Settings"
      visible={visible}
      onHide={onHide}
      style={{ width: "30rem" }}
      className="quote-dialog"
    >
      <input
        type="text"
        placeholder="Search author..."
        className="p-inputtext w-full mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="author-list">
        {filtered.map((author) => (
          <div
            key={author}
            className={`d-flex align-items-center justify-content-between mb-2 panel-in-panels ${
              selected.includes(author) ? "bg-pistacho" : ""
            }`}
            onClick={() => handleToggle(author)}
          >
            <span>{author}</span>
          </div>
        ))}
      </div>

      <div className="d-flex justify-end gap-2 mt-4">
        <Button className="btn-pistacho" label="Save" onClick={handleSave} />
      </div>
    </Dialog>
  );
}
