import { useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";

export default function NewsDialog({ visible, onHide, news }) {
  const latest = news?.[0];
  const cachedImage = useRef(null);

  useEffect(() => {
    if (latest?.image && !cachedImage.current) {
      cachedImage.current = latest.image;
    }
  }, [latest]);

  return (
    <Dialog
      header="Focuspit Updates"
      visible={visible}
      onHide={onHide}
      style={{ width: "700px", maxWidth: "95vw" }}
      modal
      className="long-content-dialog"
    >
      <div className="p-2">
        {latest ? (
          <>
            {cachedImage.current && (
              <img
                src={cachedImage.current}
                alt="news"
                className="img-news mb-3"
                loading="lazy"
              />
            )}
            <div className="text-muted small mb-3">
              {latest.created_at?.toDate?.().toLocaleDateString()}
            </div>
            <h3>{latest.title}</h3>

            <div
              className="news-content my-3"
              dangerouslySetInnerHTML={{ __html: latest.content }}
            />

            <div className="mt-4 text-end">
              <a href="/news" className="btn btn-outline-light btn-sm">
                View All News
              </a>
            </div>
          </>
        ) : (
          <div className="text-muted">No news yet.</div>
        )}
      </div>
    </Dialog>
  );
}
