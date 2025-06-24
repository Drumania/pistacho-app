import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import ClockSettingsDialog from "./ClockSettingsDialog"; // el modal que hicimos
import { Button } from "primereact/button";

export default function WorldClocksWidget({ groupId, widgetId }) {
  const { user } = useAuth();
  const [clocks, setClocks] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

  // 🔄 Cargar config inicial
  useEffect(() => {
    const loadConfig = async () => {
      if (!groupId || !widgetId) return;
      const ref = doc(db, "groups", groupId, "widgets", widgetId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setClocks(data?.config?.clocks || []);
      }
    };
    loadConfig();
  }, [groupId, widgetId]);

  // 💾 Guardar config en Firestore
  const handleSave = async (selected) => {
    setClocks(selected);
    const ref = doc(db, "groups", groupId, "widgets", widgetId);
    await updateDoc(ref, {
      "config.clocks": selected,
    });
  };

  if (!user) return null;

  return (
    <div>
      <div className="flex justify-between align-items-center mb-2">
        <h5>World Clocks</h5>
        <Button
          icon="pi pi-cog"
          rounded
          text
          onClick={() => setShowDialog(true)}
        />
      </div>

      <div className="grid">
        {clocks.map((c) => (
          <div key={c.code} className="col-6 sm:col-4">
            <WorldClock label={c.label} timezone={c.timezone} code={c.code} />
          </div>
        ))}
      </div>

      <ClockSettingsDialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        onSave={handleSave}
        initialValue={clocks}
      />
    </div>
  );
}
