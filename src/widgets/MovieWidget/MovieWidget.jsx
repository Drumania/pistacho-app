import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import { Button } from "primereact/button";
import MovieWidgetModal from "./MovieWidgetModal";

import "./MovieWidget.css";

export default function MovieWidget({ groupId, widgetId }) {
  const [movies, setMovies] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!groupId || !widgetId) return;

    const fetch = async () => {
      const ref = doc(db, "widget_data", "movies", groupId, widgetId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setMovies(snap.data().movies || []);
      }
    };

    fetch();
  }, [groupId, widgetId]);

  if (!groupId || !widgetId) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="m-0">Movies</h5>
        <Button
          label="+ Movie"
          className="btn-transp-small"
          onClick={() => setShowModal(true)}
        />
      </div>

      {movies.length === 0 ? (
        <p>No movies yet.</p>
      ) : (
        <ul className="movie-widget-grid">
          {movies.map((movie, i) => (
            <li key={i}>
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
                  alt={movie.title}
                  style={{ borderRadius: 4, marginBottom: 8 }}
                />
              )}
              <small>{movie.title}</small>
            </li>
          ))}
        </ul>
      )}

      <MovieWidgetModal
        visible={showModal}
        onHide={() => setShowModal(false)}
        groupId={groupId}
        widgetId={widgetId}
        initialMovies={movies}
        onSave={setMovies}
      />
    </div>
  );
}
