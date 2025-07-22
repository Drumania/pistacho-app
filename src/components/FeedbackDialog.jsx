import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import db from "@/firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";

export default function FeedbackDialog({ visible, onHide }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "beta_feedback"), {
        userId: user?.uid || "anonymous",
        email: user?.email || null,
        feedback: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
      setSubmitted(true); // activa mensaje de gracias
    } catch (error) {
      console.error("Error submitting feedback", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (submitted) {
      timer = setTimeout(() => {
        setSubmitted(false);
        onHide();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [submitted, onHide]);

  return (
    <Dialog
      header="Send us your feedback"
      visible={visible}
      onHide={() => {
        setSubmitted(false);
        onHide();
      }}
      style={{ width: "500px" }}
    >
      <div
        className={`transition-opacity ${
          submitted ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="mb-3">
          We're in beta – help us improve Focuspit by sharing your thoughts,
          bugs, or suggestions. Thank you!
        </p>
        <InputTextarea
          rows={6}
          autoFocus
          className="w-100 mb-3"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell us what you think or report a bug..."
          disabled={loading}
        />
        <div className="d-flex justify-content-end">
          <Button
            label="Send"
            className="btn-pistacho px-5"
            disabled={loading || !text.trim()}
            onClick={handleSubmit}
          />
        </div>
      </div>

      {submitted && (
        <div
          className="text-center fade-in"
          style={{ height: "270px", overflow: "hidden" }}
        >
          <h5 className="mt-4">Thank you!</h5>
          <p className="text-muted">
            Your feedback helps us improve Focuspit. We appreciate your time!
          </p>
        </div>
      )}
    </Dialog>
  );
}
