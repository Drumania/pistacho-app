// UserListItem.jsx
export default function UserListMembers({
  user,
  ownerId,
  extraContent = null,
}) {
  return (
    <li className="d-flex align-items-center justify-content-between p-2">
      <div className="d-flex align-items-center gap-2">
        <img
          src={user.photoURL || "/avatar_placeholder.png"}
          alt={user.name}
          className="rounded-circle"
          width={32}
          height={32}
        />
        <div className="fw-semibold">{user.name}</div>
      </div>

      <div className="d-flex align-items-center gap-2">
        {user.role === "admin" && (
          <span className="badge bg-warning text-dark">Admin</span>
        )}
        {user.uid === ownerId && (
          <span className="badge bg-info text-dark">Owner</span>
        )}
        {extraContent}
      </div>
    </li>
  );
}
