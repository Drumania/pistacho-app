import { Skeleton } from "primereact/skeleton";

export default function UserListMembers({ user, extraContent = null }) {
  const isLoading = !user;

  return (
    <li className="d-flex align-items-center justify-content-between p-2">
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
              }}
            />
            <div className="fw-semibold">{user.name}</div>
          </>
        )}
      </div>

      <div className="d-flex align-items-center gap-2">
        {isLoading ? (
          <Skeleton width="60px" height="20px" />
        ) : (
          user.admin && (
            <span className="badge bg-warning text-dark">Admin</span>
          )
        )}
        {extraContent}
      </div>
    </li>
  );
}
