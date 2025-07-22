// src/components/CustomTitleBar.jsx
export default function CustomTitleBar() {
  return (
    <div
      className="custom-title-bar d-flex justify-content-between align-items-center px-3"
      style={{
        WebkitAppRegion: "drag",
        height: "32px",
        backgroundColor: "#1b2531",
        color: "white",
        userSelect: "none",
      }}
    >
      <div className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
        <img
          src="/icon-192_v2.png"
          alt="logo"
          style={{ width: "20px", height: "20px" }}
        />
        <span style={{ fontSize: "0.9rem" }}>Focuspit</span>
      </div>

      <div
        className="window-controls d-flex align-items-center"
        style={{ WebkitAppRegion: "no-drag" }}
      >
        <button
          className="btn btn-sm btn-outline-light me-1"
          onClick={() => window.electronAPI.minimize()}
        >
          <i className="bi bi-dash" />
        </button>
        <button
          className="btn btn-sm btn-outline-light me-1"
          onClick={() => window.electronAPI.maximize()}
        >
          <i className="bi bi-square" />
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => window.electronAPI.close()}
        >
          <i className="bi bi-x" />
        </button>
      </div>
    </div>
  );
}
