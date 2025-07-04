import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useState, useEffect } from "react";
import { MultiSelect } from "primereact/multiselect";
import { InputNumber } from "primereact/inputnumber";

export default function QuoteSettingsDialog({
  visible,
  onHide,
  onSave,
  initialAuthors,
  initialInterval,
}) {
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(60);

  useEffect(() => {
    setSelectedAuthors(initialAuthors || []);
    setRefreshInterval(initialInterval || 60);
  }, [initialAuthors, initialInterval, visible]);

  const handleSave = () => {
    onSave(selectedAuthors, refreshInterval);
    onHide();
  };

  const authorOptions = Array.from(new Set(quotes.map((q) => q.author))).map(
    (author) => ({
      label: author,
      value: author,
    })
  );

  return (
    <Dialog
      header="Quote Widget Settings"
      visible={visible}
      onHide={onHide}
      style={{ width: "30rem" }}
    >
      <div className="mb-3">
        <label htmlFor="authors" className="form-label">
          Select Authors:
        </label>
        <MultiSelect
          id="authors"
          value={selectedAuthors}
          onChange={(e) => setSelectedAuthors(e.value)}
          options={authorOptions}
          placeholder="Select authors"
          display="chip"
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="refreshInterval" className="form-label">
          Refresh Interval (seconds):
        </label>
        <InputNumber
          id="refreshInterval"
          value={refreshInterval}
          onValueChange={(e) => setRefreshInterval(e.value)}
          min={10}
          max={3600}
          suffix=" seconds"
          className="w-full"
        />
      </div>

      <div className="d-flex justify-end gap-2 mt-4">
        <Button className="btn-pistacho" label="Save" onClick={handleSave} />
      </div>
    </Dialog>
  );
}

const quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Strive not to be a success, but rather to be of value.",
    author: "Albert Einstein",
  },
  {
    text: "Two roads diverged in a wood, and I—I took the one less traveled by, And that has made all the difference.",
    author: "Robert Frost",
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
  },
  // Add more quotes here...
];
