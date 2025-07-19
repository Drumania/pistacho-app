import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import QuoteSettingsDialog from "./QuoteSettingsDialog";
import { Button } from "primereact/button";
import quotes from "./quotes.json";

import "./QuoteWidget.css";

export default function QuoteWidget({ groupId }) {
  const { user } = useAuth();
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [quote, setQuote] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const docRef = doc(db, "widget_data", "quote_widget", groupId, "main");

  useEffect(() => {
    const loadConfig = async () => {
      if (!groupId) return;
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const authors = data.authors || [];

        if (authors.length === 0) {
          const defaultAuthors = [
            "Steve Jobs",
            "Albert Einstein",
            "John Lennon",
          ];
          setSelectedAuthors(defaultAuthors);
          await setDoc(docRef, { authors: defaultAuthors });
        } else {
          setSelectedAuthors(authors);
        }
      } else {
        const defaultAuthors = ["Steve Jobs", "Albert Einstein", "John Lennon"];
        setSelectedAuthors(defaultAuthors);
        await setDoc(docRef, { authors: defaultAuthors });
      }
    };

    loadConfig();
  }, [groupId]);

  useEffect(() => {
    if (selectedAuthors.length === 0) {
      setQuote("Please select at least one author in the settings.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const stored = JSON.parse(localStorage.getItem("quote_of_the_day")) || {};

    if (stored.date === today && stored.quote) {
      setQuote(stored.quote);
      setLastUpdated(today);
    } else {
      getNewQuote(today);
    }
  }, [selectedAuthors]);

  const getNewQuote = (dateToSet) => {
    const availableQuotes = quotes.filter((q) =>
      selectedAuthors.includes(q.author)
    );
    if (availableQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableQuotes.length);
      const newQuote = `"${availableQuotes[randomIndex].text}" - ${availableQuotes[randomIndex].author}`;
      setQuote(newQuote);
      setLastUpdated(dateToSet);
      localStorage.setItem(
        "quote_of_the_day",
        JSON.stringify({ date: dateToSet, quote: newQuote })
      );
    } else {
      setQuote("No quotes found for the selected authors.");
    }
  };

  const handleRefresh = () => {
    getNewQuote(lastUpdated); // mantiene misma fecha
  };

  const handleSave = async (authors) => {
    setSelectedAuthors(authors);
    try {
      await setDoc(docRef, { authors });
    } catch (error) {
      console.error("Error updating quote widget settings:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="quote-widget-container position-relative p-3 rounded">
      <div className="d-flex justify-content-between align-items-center mx-auto">
        <div className="widget-controls d-flex gap-2">
          <Button
            icon="pi pi-refresh"
            className="btn-icon btn-transp-small"
            onClick={handleRefresh}
            title="Next quote"
            text
            rounded
          />
          <Button
            icon="pi pi-cog"
            className="btn-transp-small"
            onClick={() => setShowDialog(true)}
            text
            rounded
          />
        </div>
      </div>

      {quote && (
        <div className="quote-text text-center font-serif">
          <div>{quote.split('"')[1]}</div>
          <div className="small mt-2 opacity-50">
            ({quote.split('"')[2]?.replace(" - ", "")})
          </div>
        </div>
      )}

      <QuoteSettingsDialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        onSave={handleSave}
        initialAuthors={selectedAuthors}
      />
    </div>
  );
}
