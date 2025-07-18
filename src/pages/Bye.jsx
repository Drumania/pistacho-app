import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Bye() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      window.location.href = "https://focuspit.com";
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center vh-100"
      style={{ backgroundColor: "#1b2531", color: "#d4d4d4" }}
    >
      <div
        className="rounded-4 p-4"
        style={{
          backgroundColor: "#212529",
          boxShadow: "0 0 40px rgba(0,0,0,0.3)",
          maxWidth: 400,
          width: "90%",
        }}
      >
        <div
          className="mb-4"
          style={{
            width: 200,
            height: 200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src="/exit.png" />
        </div>

        <h3 className="mb-3">See you soon!</h3>
        <p className="text-muted">
          Your account has been successfully deleted.
          <br />
          You’ll be redirected in <strong>{countdown}</strong> seconds...
        </p>

        <button
          className="btn btn-outline-light mt-3"
          onClick={() => (window.location.href = "https://focuspit.com")}
        >
          Go back now
        </button>
      </div>
    </div>
  );
}
