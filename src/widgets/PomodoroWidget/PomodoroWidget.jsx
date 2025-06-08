// src/widgets/PomodoroWidget/PomodoroWidget.jsx
import { useEffect, useRef, useState } from "react";
// import "./PomodoroWidget.css";

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
    <div className="pomodoro-widget">
      <div className="time">{formatTime(timeLeft)}</div>
      <div className="mode">{mode === "work" ? "Trabajo" : "Descanso"}</div>
      <div className="controls">
        <button className="btn btn-sm btn-primary" onClick={toggle}>
          {isRunning ? "Pausar" : "Iniciar"}
        </button>
        <button className="btn btn-sm btn-outline-secondary" onClick={reset}>
          Reset
        </button>
      </div>
      <div className="cycles">Ciclos: {cycleCount}</div>
    </div>
  );
}
