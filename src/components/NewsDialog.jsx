import { Dialog } from "primereact/dialog";

export default function NewsDialog({ visible, onHide }) {
  return (
    <Dialog
      header="Focuspit Updates"
      visible={visible}
      onHide={onHide}
      style={{ width: "700px", maxWidth: "95vw" }}
      modal
      className="long-content-dialog"
    >
      <div className="p-2" style={{ maxHeight: "60vh", overflowY: "auto" }}>
        <h4>🚀 July 2025 – Beta Improvements</h4>
        <ul>
          <li>Added "News" button to dashboard header.</li>
          <li>New notification system with grouped counts per group.</li>
          <li>
            Improved group editor: now you can rename, change image, and manage
            roles.
          </li>
          <li>
            Widget permissions! Owners can now lock widgets to prevent changes.
          </li>
        </ul>

        <h4 className="mt-4">📦 Coming Soon</h4>
        <ul>
          <li>Offline mode for the desktop app (Electron).</li>
          <li>Public dashboards to share with friends and teams.</li>
          <li>Rewards system and customizable gardens 🌱.</li>
        </ul>

        <h4 className="mt-4">💡 Tips</h4>
        <ul>
          <li>
            Use the "Save as Template" feature to reuse dashboards across
            groups.
          </li>
          <li>
            Click the bell icon to see pending notifications like invites or
            tasks.
          </li>
          <li>
            You can press <kbd>Ctrl</kbd> + <kbd>K</kbd> to search across
            widgets.
          </li>
        </ul>

        <div className="mt-5 text-end small text-muted">
          Last updated: July 22, 2025
        </div>
      </div>
    </Dialog>
  );
}
