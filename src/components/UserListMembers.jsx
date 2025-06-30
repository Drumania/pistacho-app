// UserListItem.jsx
export default function UserListMembers({
  user,
  ownerId,
  extraContent = null,
}) {
  return (
    <li className="d-flex align-items-center justify-content-between p-2">
      <div className="d-flex align-items-center gap-2">
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundImage: `url(${
              user.photoURL || "/avatar_placeholder.png"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
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
