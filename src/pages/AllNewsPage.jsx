// src/pages/AllNewsPage.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import db from "@/firebase/firestore";

export default function AllNewsPage() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      const q = query(collection(db, "news"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNews(data);
    };
    fetchNews();
  }, []);

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <div className="widget-content">
        <h2 className="mb-4">Focuspit News</h2>

        {news.map((n) => (
          <div key={n.id} className="mb-5 border-bottom pb-4">
            {n.image && (
              <img src={n.image} alt="news" className="img-news mb-3" />
            )}

            <div className="text-muted small mb-3">
              {n.created_at?.toDate?.().toLocaleDateString()}
            </div>
            <h3>{n.title}</h3>

            <div
              className="news-content my-3"
              dangerouslySetInnerHTML={{ __html: n.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
