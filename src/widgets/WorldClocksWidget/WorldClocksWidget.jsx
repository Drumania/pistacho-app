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

  const docRef = doc(db, "widget_data", "world_clocks", groupId, "main");

  useEffect(() => {
    const loadConfig = async () => {
      if (!groupId) return;
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setClocks(data.clocks || []);
        // Initialize times with default values based on loaded clocks
        const initialTimes = {};
        data.clocks?.forEach((clock) => {
          initialTimes[clock.code] = "--:--";
        });
        setTimes(initialTimes);
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
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      try {
        await updateDoc(docRef, { clocks: selected });
      } catch (error) {
        console.error("Error updating clocks:", error);
      }
    } else {
      try {
        await setDoc(docRef, { clocks: selected });
      } catch (error) {
        console.error("Error creating clocks:", error);
      }
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
      <ul className="cs-list-group">
        {clocks.map((c) => (
          <li
            key={c.code}
            className="d-flex align-items-center justify-content-between p-2"
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
            <span className="text-xl font-bold">
              {times[c.code] || "--:--"}
            </span>
          </li>
        ))}
      </ul>
      <ClockSettingsDialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        onSave={handleSave}
        initialValue={clocks}
      />
    </div>
  );
}
