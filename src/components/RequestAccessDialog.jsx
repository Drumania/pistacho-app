// src/components/RequestAccessDialog.jsx
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useState } from "react";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import db from "@/firebase/firestore";

export default function RequestAccessDialog({ visible, onHide }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    try {
      await setDoc(doc(collection(db, "beta_requests"), email), {
        email,
        createdAt: serverTimestamp(),
        approved: false,
      });
      setSent(true);
    } catch (err) {
      setError("Something went wrong. Try again later.");
      console.error(err);
    }
  };

  return (
    <Dialog
      header="Request Beta Access"
      visible={visible}
      onHide={onHide}
      style={{ width: "90vw", maxWidth: 500 }}
      className="bg-dark text-white"
    >
      {sent ? (
        <div className="text-center">
          <p>✅ Your request was submitted.</p>
          <p>We’ll contact you once your spot is approved.</p>
        </div>
      ) : (
        <>
          <p className="mb-3 small">
            Enter your email and we’ll let you know once your beta access is
            approved.
          </p>
          <InputText
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-100 mb-2"
          />
          {error && <p className="text-danger small">{error}</p>}
          <Button
            label="Request Access"
            className="btn-pistacho mt-2 w-100"
            onClick={handleSubmit}
          />
        </>
      )}
    </Dialog>
  );
}
