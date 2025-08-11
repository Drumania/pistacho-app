// src/widgets/ColorPaletteWidget/ColorPaletteWidget.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import "./ColorPaletteWidget.css";

const MAX_COLORS = 8;

export default function ColorPaletteWidget({ groupId, widgetId }) {
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]); // ["#0C0F0A", ...]
  const [dlgOpen, setDlgOpen] = useState(false);
  const [copiedHex, setCopiedHex] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const copiedTimer = useRef(null);

  // ---------- Firestore ----------
  const docRef = useMemo(
    () => doc(db, "widget_data", "color_palette", groupId, widgetId),
    [groupId, widgetId]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, { colors: [] });
        setColors([]);
      } else {
        setColors(Array.isArray(snap.data().colors) ? snap.data().colors : []);
      }
      setLoading(false);
    };
    if (groupId && widgetId) load();
  }, [docRef, groupId, widgetId]);

  const handleSave = async (next) => {
    setColors(next);
    await updateDoc(docRef, { colors: next });
  };

  // ---------- UI ----------
  if (loading) {
    return <div className="p-3 text-muted">Loading palette…</div>;
  }

  return (
    <div className="h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Color Palette</h5>
        <span
          className={`copied-badge ${copiedHex ? "show" : ""}`}
          aria-live="polite"
        >
          <i className="pi pi-check-circle me-1" /> Copied
        </span>
        <Button
          label="+ Colors"
          className="btn-transp-small"
          onClick={() => {
            setDlgOpen(true);
          }}
        />
      </div>
      <div className="flex-grow-1 d-flex" style={{ minHeight: 140 }}>
        {colors.length === 0 ? (
          <div className="w-100 d-flex align-items-center justify-content-center text-muted">
            No colors yet. Click “Edit”.
          </div>
        ) : (
          colors.map((hex, i) => (
            <div
              key={`${hex}-${i}`}
              className={`swatch d-flex align-items-end justify-content-center ${
                copiedIdx === i ? "copied" : ""
              }`}
              style={{
                flex: 1,
                background: hex,
                borderRight:
                  i < colors.length - 1 ? "6px solid transparent" : "none",
              }}
              title={hex}
              // en cada franja, reemplazá el onClick por:
              onClick={async () => {
                try {
                  await navigator.clipboard?.writeText(hex);
                  // feedback visual en la franja (que ya agregamos)…
                  setCopiedIdx(i);
                  setTimeout(() => setCopiedIdx(null), 600);

                  // …y badge en el título:
                  if (copiedTimer.current) clearTimeout(copiedTimer.current);
                  setCopiedHex(hex);
                  copiedTimer.current = setTimeout(
                    () => setCopiedHex(null),
                    1200
                  );
                } catch (e) {
                  console.error("Copy failed", e);
                }
              }}
            >
              <span
                className="fw-bold mb-2"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  color: getReadableText(hex),
                  letterSpacing: "1px",
                  opacity: 0.9,
                  userSelect: "none",
                }}
              >
                {hex.toUpperCase()}
              </span>
            </div>
          ))
        )}
      </div>

      <EditPaletteDialog
        open={dlgOpen}
        onHide={() => setDlgOpen(false)}
        value={colors}
        onSave={handleSave}
      />
    </div>
  );
}

// ---------- Dialog ----------
function EditPaletteDialog({ open, onHide, value, onSave }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open) {
      setItems((value || []).slice(0, MAX_COLORS));
    }
  }, [open, value]);

  const addColor = () => {
    if (items.length >= MAX_COLORS) return;
    setItems([...items, "#FFFFFF"]);
  };

  const setItem = (idx, next) => {
    const normalized = normalizeHex(next);
    const copy = [...items];
    copy[idx] = normalized;
    setItems(copy);
  };

  const removeItem = (idx) => {
    const copy = items.slice();
    copy.splice(idx, 1);
    setItems(copy);
  };

  const swap = (from, to) => {
    if (to < 0 || to >= items.length) return;
    const copy = [...items];
    [copy[from], copy[to]] = [copy[to], copy[from]];
    setItems(copy);
  };

  const save = () => {
    const clean = dedupeAndValidate(items).slice(0, MAX_COLORS);
    onSave(clean);
    onHide();
  };

  return (
    <Dialog
      header="Edit colors"
      visible={open}
      onHide={onHide}
      style={{ width: 520 }}
    >
      <div className="mb-3 small text-muted">
        Up to {MAX_COLORS} colors. Click a swatch to pick, type to paste HEX,
        drag arrows to reorder.
      </div>

      <div className="d-grid gap-2">
        {items.map((hex, idx) => (
          <div key={idx} className="d-flex align-items-center gap-2">
            {/* Color input */}
            <input
              type="color"
              className="form-control form-control-color"
              value={safeColor(hex)}
              onChange={(e) => setItem(idx, e.target.value)}
              title="Pick color"
              style={{ width: 48, height: 40, padding: 0 }}
            />
            {/* Hex input */}
            <InputText
              value={hex}
              onChange={(e) => setItem(idx, e.target.value)}
              placeholder="#RRGGBB"
              className="flex-grow-1"
              maxLength={7}
            />
            {/* Move */}
            <Button
              icon="pi pi-arrow-up"
              text
              onClick={() => swap(idx, idx - 1)}
            />
            <Button
              icon="pi pi-arrow-down"
              text
              onClick={() => swap(idx, idx + 1)}
            />
            <Button
              icon="pi pi-times"
              text
              severity="danger"
              onClick={() => removeItem(idx)}
            />
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button
          label="+ Add color"
          onClick={addColor}
          disabled={items.length >= MAX_COLORS}
          className="btn-transp-small"
        />
        <div className="d-flex gap-2">
          <Button label="Save" onClick={save} className="btn-pistacho" />
        </div>
      </div>
    </Dialog>
  );
}

// ---------- Helpers ----------
function normalizeHex(s) {
  if (!s) return "";
  let v = s.trim().toUpperCase();
  if (!v.startsWith("#")) v = "#" + v;
  if (/^#[0-9A-F]{3}$/.test(v)) {
    // expand #ABC -> #AABBCC
    v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
  }
  return v.slice(0, 7);
}

function dedupeAndValidate(arr) {
  const out = [];
  const seen = new Set();
  arr.forEach((x) => {
    const v = normalizeHex(x);
    if (/^#[0-9A-F]{6}$/.test(v) && !seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  });
  return out;
}

function safeColor(hex) {
  return /^#[0-9A-F]{6}$/i.test(hex) ? hex : "#FFFFFF";
}

function getReadableText(bg) {
  // contraste simple (luma)
  if (!/^#[0-9A-F]{6}$/i.test(bg)) return "#000";
  const r = parseInt(bg.slice(1, 3), 16);
  const g = parseInt(bg.slice(3, 5), 16);
  const b = parseInt(bg.slice(5, 7), 16);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma > 150 ? "#000000" : "#FFFFFF";
}
