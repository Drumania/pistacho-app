import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import QuoteSettingsDialog from "./QuoteSettingsDialog";
import { Button } from "primereact/button";
import quotes from "@/data/quotes.json";

// import "./QuoteWidget.css";

export default function QuoteWidget({ groupId }) {
  const { user } = useAuth();
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [quote, setQuote] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(60); // Default: 60 seconds

  const docRef = doc(db, "widget_data", "quote_widget", groupId, "main");

  useEffect(() => {
    const loadConfig = async () => {
      if (!groupId) return;
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setSelectedAuthors(data.authors || []);
        setRefreshInterval(data.refreshInterval || 60);
      }
    };
    loadConfig();
  }, [groupId]);

  useEffect(() => {
    const fetchQuote = () => {
      if (selectedAuthors.length === 0) {
        setQuote("Please select at least one author in the settings.");
        return;
      }
      const availableQuotes = quotes.filter((q) =>
        selectedAuthors.includes(q.author)
      );

      if (availableQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableQuotes.length);
        setQuote(
          `"${availableQuotes[randomIndex].text}" - ${availableQuotes[randomIndex].author}`
        );
      } else {
        setQuote("No quotes found for the selected authors.");
      }
    };

    fetchQuote();
    const intervalId = setInterval(fetchQuote, refreshInterval * 1000);
    return () => clearInterval(intervalId);
  }, [selectedAuthors, refreshInterval]);

  const handleSave = async (authors, interval) => {
    setSelectedAuthors(authors);
    setRefreshInterval(interval);
    try {
      await setDoc(docRef, {
        authors: authors,
        refreshInterval: interval,
      });
    } catch (error) {
      console.error("Error updating quote widget settings:", error);
    }
  };

  if (!user) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Quote of the Day</h5>
        <Button
          label="Settings"
          className="btn-transp-small"
          onClick={() => setShowDialog(true)}
        />
      </div>
      <p key={quote} className="font-italic quote-text">
        {quote}
      </p>
      <QuoteSettingsDialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        onSave={handleSave}
        initialAuthors={selectedAuthors}
        initialInterval={refreshInterval}
      />
    </div>
  );
}
