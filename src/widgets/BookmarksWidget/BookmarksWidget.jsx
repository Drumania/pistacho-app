import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import BookmarksModal from "./BookmarksModal";
import { Button } from "primereact/button";
import "./BookmarksWidget.css";

export default function BookmarksWidget({ groupId, widgetId, editMode }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !widgetId) return;

    const ref = doc(
      db,
      "widget_data",
      "bookmarks",
      `${groupId}_${widgetId}`,
      "config"
    );

    const unsubscribe = onSnapshot(ref, async (docSnap) => {
      if (!docSnap.exists()) {
        await setDoc(ref, { bookmarks: [], title: "Bookmarks" });
        setBookmarks([]);
      } else {
        const data = docSnap.data();
        setBookmarks(data.bookmarks || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId, widgetId]);

  const handleOpenModal = (bookmark = null) => {
    setEditingBookmark(bookmark);
    setModalVisible(true);
  };

  const handleSave = (newBookmarks) => {
    setBookmarks(newBookmarks);
    setModalVisible(false);
    setEditingBookmark(null);
  };

  if (!widgetId)
    return <div className="widget-placeholder">Missing widget ID</div>;
  if (loading)
    return <div className="widget-placeholder">Loading bookmarks...</div>;

  return (
    <div className="bookmarks-widget widget-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Bookmarks</h5>
        <Button
          label="+ Bookmark"
          className="btn-transp-small"
          onClick={() => handleOpenModal()}
        />
      </div>

      <ul className="cs-list-group mb-3">
        {bookmarks.map((b) => (
          <li className="col-12" key={b.id}>
            <div className="bookmark-preview-box">
              <div className="bookmark-content">
                <div className="bookmark-header">
                  <span className="bookmark-title fw-bold">{b.title}</span>
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bookmark-link"
                  >
                    {b.url}
                  </a>
                </div>
                {/* <div className="bookmark-description">{b.description}</div> */}
              </div>

              {b.image && (
                <div className="bookmark-image-box">
                  <img src={b.image} alt="favicon" className="bookmark-image" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <BookmarksModal
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        groupId={groupId}
        widgetId={widgetId}
        currentBookmarks={bookmarks}
        editingBookmark={editingBookmark}
        onSave={handleSave}
      />
    </div>
  );
}
