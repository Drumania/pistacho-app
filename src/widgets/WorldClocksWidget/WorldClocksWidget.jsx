import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import ClockSettingsDialog from "./ClockSettingsDialog";
import { Button } from "primereact/button";

import "./WorldClocksWidget.css";

export default function WorldClocksWidget({ groupId }) {
  const { user } = useAuth();
  const [clocks, setClocks] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [times, setTimes] = useState({});

  useEffect(() => {
    const loadConfig = async () => {
      if (!groupId) return;
      const ref = doc(db, "world_clocks", groupId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setClocks(data.clocks || []);
      }
    };
    loadConfig();
  }, [groupId]);

  useEffect(() => {
    const updateTimes = () => {
      const newTimes = {};
      clocks.forEach((clock) => {
        const now = new Date();
        const options = {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: clock.timezone,
        };
        const formatter = new Intl.DateTimeFormat("default", options);
        newTimes[clock.code] = formatter.format(now);
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [clocks]);

  const handleSave = async (selected) => {
    setClocks(selected);
    const ref = doc(db, "world_clocks", groupId);
    try {
      await updateDoc(ref, { clocks: selected });
    } catch {
      await setDoc(ref, { clocks: selected });
    }
  };

  if (!user) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">World Clocks</h5>
        <Button
          label="+ Clocks"
          className="btn-transp-small"
          onClick={() => setShowDialog(true)}
        />
      </div>

      {clocks.map((c) => (
        <div
          key={c.code}
          className="d-flex align-items-center justify-content-between mb-2 panel-in-panels"
        >
          <div className="d-flex align-items-center gap-2">
            <img
              src={`https://flagcdn.com/w40/${c.code}.png`}
              alt={c.label}
              width={28}
              height={20}
              style={{ borderRadius: "3px", objectFit: "cover" }}
            />
            <span className="font-medium">{c.label}</span>
          </div>
          <span className="text-xl font-bold">{times[c.code] || "--:--"}</span>
        </div>
      ))}

      <ClockSettingsDialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        onSave={handleSave}
        initialValue={clocks}
      />
    </div>
  );
}
