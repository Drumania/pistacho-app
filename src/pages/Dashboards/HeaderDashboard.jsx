export default function HeaderDashboard({
  groupName,
  isAdmin,
  widgetInstances,
  handleSaveTemplate,
  setShowInviteDialog,
  setShowEditDialog,
  editMode,
  setEditMode,
  setShowAddWidgetDialog,
}) {
  return (
    <div className="header-dashboard">
      <h3 className="fw-bold">{groupName}</h3>

      {isAdmin && (
        <div>
          {/* Si querés volver a usar el botón de plantilla */}
          {/* {widgetInstances.length > 0 && (
            <button
              className="btn-pistacho-outline me-2"
              onClick={handleSaveTemplate}
              id="save-as-template"
            >
              <i className="bi bi-save me-1" />
              Save as Template
            </button>
          )} */}

          <button
            className="btn-pistacho-outline me-2"
            onClick={() => setShowInviteDialog(true)}
            id="invite-members"
          >
            <i className="bi bi-person-plus" title="Invite Members" />
          </button>

          <button
            className="btn-pistacho-outline"
            onClick={() => setShowEditDialog(true)}
            id="setting-group"
          >
            <i className="bi bi-gear" title="Settings Group" />
          </button>

          <button
            className={
              editMode ? "btn-pistacho shine mx-2" : "btn-pistacho-outline mx-2"
            }
            onClick={() => setEditMode((prev) => !prev)}
            id="edit-dashboard"
          >
            {editMode ? (
              <i className="bi bi-check-lg" title="Done" />
            ) : (
              <i className="bi bi-columns-gap" title="Edit Dashboard" />
            )}
          </button>

          <button
            className={`btn-pistacho position-relative btn-start-here ${
              widgetInstances.length === 0 ? "shine" : ""
            }`}
            onClick={() => setShowAddWidgetDialog(true)}
            id="add-widget"
          >
            Add Widget
          </button>
        </div>
      )}
    </div>
  );
}
