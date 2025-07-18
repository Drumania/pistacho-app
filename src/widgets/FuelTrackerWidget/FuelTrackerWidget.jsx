import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import DialogFuelEntry from "./DialogFuelEntry";
import db from "@/firebase/firestore";
import { format } from "date-fns";

export default function FuelTrackerWidget({ groupId, widgetId }) {
  const [entries, setEntries] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (groupId && widgetId) fetchEntries();
  }, [groupId, widgetId]);

  const fetchEntries = async () => {
    const ref = collection(
      db,
      "widget_data",
      "FuelTrackerWidget",
      `${groupId}_${widgetId}`
    );
    const q = query(ref, orderBy("date", "desc"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setEntries(data);
  };

  const withDifferences = entries.map((entry, i) => {
    const next = entries[i + 1];
    const diff = next ? entry.odometer - next.odometer : null;
    return {
      ...entry,
      kmDiff: diff && diff > 0 ? diff : null,
    };
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Fuel Tracker</h5>
        <Button
          label="+ Fuel"
          className="btn-transp-small"
          onClick={() => setVisible(true)}
        />
      </div>

      <DataTable
        value={withDifferences}
        className="p-datatable-sm"
        emptyMessage="No entries yet"
        scrollable
        scrollHeight="100%"
        stripedRows
        rowClassName={() => "fuel-table-row"}
      >
        <Column
          field="date"
          header="Date"
          body={(row) => format(new Date(row.date), "dd/MM/yyyy")}
        />
        <Column field="odometer" header="Odometer" />
        <Column
          field="kmDiff"
          header="Km Recorridos"
          body={(row) => (row.kmDiff != null ? row.kmDiff : "—")}
        />
        <Column field="liters" header="Liters" />
      </DataTable>

      <DialogFuelEntry
        visible={visible}
        onHide={() => setVisible(false)}
        onSave={fetchEntries}
        groupId={groupId}
        widgetId={widgetId}
      />
    </div>
  );
}
