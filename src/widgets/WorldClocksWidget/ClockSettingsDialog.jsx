import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useState, useEffect } from "react";
import "./WorldClocksWidget.css";

export default function ClockSettingsDialog({
  visible,
  onHide,
  onSave,
  initialValue,
}) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSelected(initialValue || []);
    setSearch("");
  }, [initialValue, visible]);

  const handleToggle = (country) => {
    const already = selected.some((s) => s.code === country.code);
    if (already) {
      setSelected(selected.filter((s) => s.code !== country.code));
    } else {
      setSelected([...selected, country]);
    }
  };

  const handleSave = () => {
    onSave(selected);
    onHide();
  };

  const filtered = countryOptions.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const isSelected = (code) => selected.some((c) => c.code === code);

  return (
    <Dialog
      header="Select countries"
      visible={visible}
      onHide={onHide}
      style={{ width: "30rem" }}
      className="clock-dialog"
    >
      <input
        type="text"
        placeholder="Search country..."
        className="p-inputtext w-full mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="country-list">
        {filtered.map((country) => (
          <div
            key={country.code}
            className={`d-flex align-items-center justify-content-between mb-2 panel-in-panels ${
              isSelected(country.code) ? "bg-pistacho" : ""
            }`}
            onClick={() => handleToggle(country)}
          >
            <span>{country.label}</span>
            <span className="text-muted small">{country.utc}</span>
          </div>
        ))}
      </div>

      <div className="d-flex justify-end gap-2 mt-4">
        <Button className="btn-pistacho" label="Save" onClick={handleSave} />
      </div>
    </Dialog>
  );
}

const countryOptions = [
  { label: "Alemania", timezone: "Europe/Berlin", code: "de", utc: "UTC+2" },
  {
    label: "Arabia Saudita",
    timezone: "Asia/Riyadh",
    code: "sa",
    utc: "UTC+3",
  },
  {
    label: "Argentina",
    timezone: "America/Argentina/Buenos_Aires",
    code: "ar",
    utc: "UTC-3",
  },
  {
    label: "Australia",
    timezone: "Australia/Sydney",
    code: "au",
    utc: "UTC+10",
  },
  { label: "Bélgica", timezone: "Europe/Brussels", code: "be", utc: "UTC+2" },
  { label: "Brasil", timezone: "America/Sao_Paulo", code: "br", utc: "UTC-3" },
  { label: "Canadá", timezone: "America/Toronto", code: "ca", utc: "UTC-5" },
  { label: "Chile", timezone: "America/Santiago", code: "cl", utc: "UTC-4" },
  { label: "China", timezone: "Asia/Shanghai", code: "cn", utc: "UTC+8" },
  { label: "Colombia", timezone: "America/Bogota", code: "co", utc: "UTC-5" },
  { label: "Corea del Sur", timezone: "Asia/Seoul", code: "kr", utc: "UTC+9" },
  { label: "Egipto", timezone: "Africa/Cairo", code: "eg", utc: "UTC+2" },
  { label: "España", timezone: "Europe/Madrid", code: "es", utc: "UTC+2" },
  { label: "Francia", timezone: "Europe/Paris", code: "fr", utc: "UTC+2" },
  { label: "India", timezone: "Asia/Kolkata", code: "in", utc: "UTC+5:30" },
  { label: "Indonesia", timezone: "Asia/Jakarta", code: "id", utc: "UTC+7" },
  { label: "Italia", timezone: "Europe/Rome", code: "it", utc: "UTC+2" },
  { label: "Japón", timezone: "Asia/Tokyo", code: "jp", utc: "UTC+9" },
  {
    label: "México",
    timezone: "America/Mexico_City",
    code: "mx",
    utc: "UTC-6",
  },
  { label: "Noruega", timezone: "Europe/Oslo", code: "no", utc: "UTC+2" },
  {
    label: "Nueva Zelanda",
    timezone: "Pacific/Auckland",
    code: "nz",
    utc: "UTC+12",
  },
  {
    label: "Países Bajos",
    timezone: "Europe/Amsterdam",
    code: "nl",
    utc: "UTC+2",
  },
  { label: "Perú", timezone: "America/Lima", code: "pe", utc: "UTC-5" },
  { label: "Portugal", timezone: "Europe/Lisbon", code: "pt", utc: "UTC+1" },
  { label: "Reino Unido", timezone: "Europe/London", code: "gb", utc: "UTC+1" },
  { label: "Rusia", timezone: "Europe/Moscow", code: "ru", utc: "UTC+3" },
  { label: "Singapur", timezone: "Asia/Singapore", code: "sg", utc: "UTC+8" },
  {
    label: "Sudáfrica",
    timezone: "Africa/Johannesburg",
    code: "za",
    utc: "UTC+2",
  },
  { label: "Suecia", timezone: "Europe/Stockholm", code: "se", utc: "UTC+2" },
  { label: "Suiza", timezone: "Europe/Zurich", code: "ch", utc: "UTC+2" },
  { label: "Tailandia", timezone: "Asia/Bangkok", code: "th", utc: "UTC+7" },
  { label: "Turquía", timezone: "Europe/Istanbul", code: "tr", utc: "UTC+3" },
  { label: "Ucrania", timezone: "Europe/Kyiv", code: "ua", utc: "UTC+3" },
  {
    label: "Uruguay",
    timezone: "America/Montevideo",
    code: "uy",
    utc: "UTC-3",
  },
  {
    label: "USA (New York)",
    timezone: "America/New_York",
    code: "us",
    utc: "UTC-5",
  },
];
