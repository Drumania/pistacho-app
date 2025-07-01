// src/widgets/WeightTrackerWidget/WeightTrackerWidget.jsx
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
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

  useEffect(() => {
    if (!user || !groupId || !widgetId) return;

    const q = query(
      collection(db, `widget_data/weight/${groupId}_${widgetId}`),
      where("user_id", "==", user.uid),
      orderBy("date", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setWeights(data);
    });

    return () => unsub();
  }, [user, groupId, widgetId]);

  const weightsOnly = weights.map((w) => w.weight);
  const minY = weightsOnly.length
    ? Math.floor(Math.min(...weightsOnly) - 10)
    : 50;
  const maxY = weightsOnly.length
    ? Math.ceil(Math.max(...weightsOnly) + 10)
    : 130;

  const chartData = {
    labels: weights.map((w) => w.date),
    datasets: [
      {
        label: "Weight (kg)",
        data: weights.map((w) => w.weight),
        fill: false,
        borderColor: "#90b083",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: minY,
        max: maxY,
        ticks: {
          stepSize: 5,
        },
      },
    },
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Weight Tracker</h5>
        <Button
          label="+ Weight"
          className="btn-transp-small"
          onClick={() => setShowDialog(true)}
        />
      </div>

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
