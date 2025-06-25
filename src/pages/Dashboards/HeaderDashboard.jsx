export default function HeaderDashboard({
  groupName,
  isAdmin,
  widgetInstances,
  handleSaveTemplate,
  setShowEditDialog,
  editMode,
  setEditMode,
  setShowAddWidgetDialog,
}) {
  return (
    <div className="header-dashboard">
      <h3 className="fw-bold">{groupName}</h3>
      <div>
        {isAdmin && widgetInstances.length > 0 && (
          <button
            className="btn-pistacho-outline me-2"
            onClick={handleSaveTemplate}
          >
            <i className="bi bi-save me-1" />
            Save as Template
          </button>
        )}

        <button
          className="btn-pistacho-outline"
          onClick={() => setShowEditDialog(true)}
        >
          <i className="bi bi-gear" title="Settings Group" />
        </button>
        <button
          className="btn-pistacho-outline mx-2"
          onClick={() => setEditMode((prev) => !prev)}
        >
          {editMode ? (
            <i className="bi bi-check-lg" title="Done" />
          ) : (
            <i className="bi bi-columns-gap" title="Edit Dashboard" />
          )}
        </button>
        <button
          className="btn-pistacho position-relative btn-start-here"
          onClick={() => setShowAddWidgetDialog(true)}
        >
          Add Widget
          {widgetInstances.length === 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: "0.7rem" }}
            >
              Start here
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
