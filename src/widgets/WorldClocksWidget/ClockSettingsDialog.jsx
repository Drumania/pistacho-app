import { Dialog } from "primereact/dialog";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { useState } from "react";

export default function ClockSettingsDialog({
  visible,
  onHide,
  onSave,
  initialValue,
}) {
  const [selected, setSelected] = useState(initialValue || []);

  const handleSave = () => {
    onSave(selected);
    onHide();
  };

  return (
    <Dialog
      header="Select countries"
      visible={visible}
      onHide={onHide}
      style={{ width: "30rem" }}
    >
      <MultiSelect
        value={selected}
        options={countryOptions}
        optionLabel="label"
        display="chip"
        onChange={(e) => setSelected(e.value)}
        placeholder="Select countries"
        className="w-full"
      />
      <div className="flex justify-end gap-2 mt-4">
        <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={onHide}
          severity="secondary"
        />
        <Button label="Save" icon="pi pi-check" onClick={handleSave} />
      </div>
    </Dialog>
  );
}

const countryOptions = [
  {
    label: "Argentina",
    timezone: "America/Argentina/Buenos_Aires",
    code: "ar",
  },
  { label: "Uruguay", timezone: "America/Montevideo", code: "uy" },
  { label: "USA (New York)", timezone: "America/New_York", code: "us" },
  { label: "Brasil", timezone: "America/Sao_Paulo", code: "br" },
  { label: "Canadá", timezone: "America/Toronto", code: "ca" },
  { label: "México", timezone: "America/Mexico_City", code: "mx" },
  { label: "Reino Unido", timezone: "Europe/London", code: "gb" },
  { label: "España", timezone: "Europe/Madrid", code: "es" },
  { label: "Francia", timezone: "Europe/Paris", code: "fr" },
  { label: "Alemania", timezone: "Europe/Berlin", code: "de" },
  { label: "Italia", timezone: "Europe/Rome", code: "it" },
  { label: "Australia", timezone: "Australia/Sydney", code: "au" },
  { label: "India", timezone: "Asia/Kolkata", code: "in" },
  { label: "China", timezone: "Asia/Shanghai", code: "cn" },
  { label: "Japón", timezone: "Asia/Tokyo", code: "jp" },
  { label: "Corea del Sur", timezone: "Asia/Seoul", code: "kr" },
  { label: "Sudáfrica", timezone: "Africa/Johannesburg", code: "za" },
  { label: "Rusia", timezone: "Europe/Moscow", code: "ru" },
  { label: "Chile", timezone: "America/Santiago", code: "cl" },
  { label: "Colombia", timezone: "America/Bogota", code: "co" },
];
