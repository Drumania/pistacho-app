import { Skeleton } from "primereact/skeleton";

export default function UserListMembers({ user, right = null, isOnline }) {
  const isLoading = !user;

  return (
    <li
      className="d-flex align-items-center justify-content-between p-2"
      title={user?.email || ""}
    >
      {/* Avatar + nombre */}
      <div className="d-flex align-items-center gap-2">
        {isLoading ? (
          <>
            <Skeleton shape="circle" size="32px" />
            <Skeleton width="100px" height="16px" />
          </>
        ) : (
          <>
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
                backgroundColor: "#333333",
              }}
            />
            {isOnline !== undefined && (
              <span
                className="rounded-circle"
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: isOnline ? "limegreen" : "#888",
                  display: "inline-block",
                }}
                title={isOnline ? "Online" : "Offline"}
              />
            )}

            <div
              className={`fs-cs-09 ${
                user.status === "pending" ? "fst-italic opacity-50" : ""
              }`}
            >
              {user.name}
            </div>

            {/* Circulito de presencia */}
          </>
        )}
      </div>

      {/* Badges + right slot */}
      <div className="d-flex align-items-center gap-2">
        {right}
        {!isLoading && (
          <>
            {user.status === "pending" && (
              <span className="badge bg-secondary">Pending</span>
            )}
            {user.owner && (
              <span className="badge bg-info text-dark">Owner</span>
            )}
            {user.admin && (
              <span className="badge bg-warning text-dark">Admin</span>
            )}
          </>
        )}
        {isLoading && <Skeleton width="60px" height="20px" />}
      </div>
    </li>
  );
}
