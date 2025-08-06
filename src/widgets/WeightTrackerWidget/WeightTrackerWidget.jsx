import { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import WeightTrackerDialog from "./WeightTrackerDialog";
import db from "@/firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";

export default function WeightTrackerWidget({ groupId, widgetId }) {
  const { user } = useAuth();
  const [weights, setWeights] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (!user || !groupId || !widgetId) return;

    const q = query(
      collection(db, "widget_data", "weight_tracker", "entries"),
      where("user_id", "==", user.uid),
      where("group_id", "==", groupId),
      where("widget_id", "==", widgetId),
      orderBy("date", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setWeights(data);

      if (data.length > 0) {
        const last = data[data.length - 1];
        const lastDate = last.date?.toDate?.() || new Date(last.date);
        const diff = (new Date() - lastDate) / (1000 * 60 * 60 * 24);
        setShowReminder(diff > 3);
      } else {
        setShowReminder(false);
      }
    });

    return () => unsub();
  }, [user, groupId, widgetId]);

  const weightsOnly = useMemo(() => weights.map((w) => w.weight), [weights]);

  const chartData = useMemo(
    () => ({
      labels: weights.map(
        (w) => w.date?.toDate?.().toLocaleDateString?.() || w.date
      ),
      datasets: [
        {
          label: "Weight (kg)",
          data: weightsOnly,
          fill: false,
          borderColor: "#90b083",
          tension: 0.3,
        },
      ],
    }),
    [weights, weightsOnly]
  );

  const chartOptions = useMemo(
    () => ({
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: false,
          min: weightsOnly.length
            ? Math.floor(Math.min(...weightsOnly) - 5)
            : 50,
          max: weightsOnly.length
            ? Math.ceil(Math.max(...weightsOnly) + 5)
            : 130,
          ticks: { stepSize: 5 },
        },
      },
    }),
    [weightsOnly]
  );

  return (
    <div
      className={
        showReminder ? "widget-content-atention" : "widget-content-focus"
      }
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Weight Tracker</h5>
        <Button
          label="+ Weight"
          className="btn-transp-small"
          onClick={() => setShowDialog(true)}
        />
      </div>

      {showReminder && (
        <small className="showReminder">
          You haven't updated your weight in a few days.
        </small>
      )}

      <Chart type="line" data={chartData} options={chartOptions} />

      <WeightTrackerDialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        groupId={groupId}
        widgetId={widgetId}
      />
    </div>
  );
}
