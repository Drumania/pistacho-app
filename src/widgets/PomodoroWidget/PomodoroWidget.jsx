// src/widgets/PomodoroWidget/PomodoroWidget.jsx
import { useEffect, useRef, useState } from "react";
import "./PomodoroWidget.css"; // Activá tu estilo propio

const WORK_DURATION = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

export default function PomodoroWidget() {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("work");
  const [cycleCount, setCycleCount] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(timerRef.current);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const getStatusClass = () => {
    if (!isRunning) return "stand-by";
    return mode === "work" ? "work" : "break";
  };

  const handleFinish = () => {
    if (mode === "work") {
      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);
      setMode("break");
      setTimeLeft(nextCycle % 4 === 0 ? LONG_BREAK : SHORT_BREAK);
    } else {
      setMode("work");
      setTimeLeft(WORK_DURATION);
    }
    setIsRunning(false);
  };

  const toggle = () => setIsRunning((prev) => !prev);
  const reset = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTimeLeft(mode === "work" ? WORK_DURATION : SHORT_BREAK);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      className={`pomodoro-widget panel-in-panels text-center ${getStatusClass()}`}
    >
      <h5 className="mb-0">Pomodoro</h5>

      <div className={`mode-label mb-2 ${mode}`}>
        {mode === "work" ? "Working time" : "Relax"}
      </div>
      <div className="time-display my-2">{formatTime(timeLeft)}</div>

      <div className="d-flex justify-content-center gap-2 ">
        <button
          className={`btn btn-sm ${isRunning ? "btn-danger" : "btn-success"}`}
          onClick={toggle}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button className="btn btn-sm btn-outline-secondary" onClick={reset}>
          Reboot
        </button>
      </div>

      <div className="cycles small text-muted">
        Completed cycles: {cycleCount}
      </div>
    </div>
  );
}
