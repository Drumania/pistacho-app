import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { doc, setDoc } from "firebase/firestore";
import db from "@/firebase/firestore";

import "./MovieWidget.css";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function MovieWidgetModal({
  visible,
  onHide,
  groupId,
  widgetId,
  initialMovies,
  onSave,
}) {
  const [movies, setMovies] = useState(initialMovies || []);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMovies(initialMovies || []);
  }, [initialMovies]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const fetch = setTimeout(async () => {
      try {
        const res = await axios.get(
          "https://api.themoviedb.org/3/search/movie",
          {
            params: {
              api_key: TMDB_API_KEY,
              query,
            },
          }
        );
        setResults(res.data.results);
      } catch (err) {
        console.error("TMDB Search Error:", err);
      }
    }, 400);

    return () => clearTimeout(fetch);
  }, [query]);

  const saveToFirestore = async (updatedMovies) => {
    setLoading(true);
    const ref = doc(db, "widget_data", "movies", groupId, widgetId);
    await setDoc(ref, { movies: updatedMovies }, { merge: true });
    setLoading(false);
    onSave(updatedMovies);
  };

  const addMovie = (movie) => {
    if (movies.some((m) => m.id === movie.id)) return;
    const newMovie = {
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      overview: movie.overview,
      language: movie.original_language,
    };
    const updated = [...movies, newMovie];
    setMovies(updated);
    saveToFirestore(updated);
  };

  const removeMovie = (index) => {
    const updated = movies.filter((_, i) => i !== index);
    setMovies(updated);
    saveToFirestore(updated);
  };

  return (
    <Dialog
      header="Manage Movies"
      visible={visible}
      onHide={onHide}
      style={{ width: "960px" }}
    >
      <div className="container position-relative">
        {loading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
            style={{ zIndex: 10 }}
          >
            <ProgressSpinner
              style={{ width: "40px", height: "40px" }}
              strokeWidth="4"
            />
          </div>
        )}

        <div className="dialog-scroll-container">
          {/* Columna de películas guardadas */}
          <div className="scroll-column pe-2">
            <h6 className="mb-3">Selected Movies</h6>
            {movies.length === 0 && (
              <p className="text-muted">No movies selected.</p>
            )}
            <ul className="cs-list-group movie-widget">
              {movies.map((movie, i) => (
                <li
                  key={i}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div className="fw-semibold">{movie.title}</div>
                    <small>{movie.release_date?.slice(0, 4)}</small>
                  </div>
                  <Button
                    icon="pi pi-times"
                    className="p-button-text p-button-danger"
                    onClick={() => removeMovie(i)}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Columna de búsqueda TMDB */}
          <div className="scroll-column">
            <h6 className="mb-3">Search TMDB</h6>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Search movie..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <ul className="cs-list-group movie-widget">
              {results.map((movie) => (
                <li
                  key={movie.id}
                  className="list-group-item d-flex align-items-center justify-content-between"
                >
                  <div className="d-flex align-items-center">
                    {movie.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="me-2 rounded"
                      />
                    )}
                    <div>
                      <div>
                        <strong>{movie.title}</strong> (
                        {movie.release_date?.slice(0, 4)})
                      </div>
                      <p className="movie-overview">{movie.overview}</p>
                    </div>
                  </div>
                  <Button
                    icon="pi pi-plus"
                    className="btn-pistacho-outline"
                    onClick={() => addMovie(movie)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
