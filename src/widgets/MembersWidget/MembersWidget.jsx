import { useEffect, useState } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";

const db = getFirestore();

export default function MembersWidget({ groupId }) {
  const [members, setMembers] = useState([]);
  const [ownerId, setOwnerId] = useState(null);

  useEffect(() => {
    if (!groupId) return;

    const fetchMembers = async () => {
      console.log("⏳ Fetching members for groupId:", groupId);

      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        console.warn("❌ Group not found:", groupId);
        return;
      }

      const groupData = groupSnap.data();
      console.log("📄 groupData:", groupData);

      setOwnerId(groupData.owner?.uid || null);

      const members = Array.isArray(groupData.members) ? groupData.members : [];
      console.log("👥 members array:", members);

      const fullUsers = await Promise.all(
        members.map(async (m) => {
          if (!m?.uid) {
            console.error("❌ Member without valid uid:", m);
            return null;
          }

          try {
            const userRef = doc(db, "users", m.uid);
            const userSnap = await getDoc(userRef);

            return userSnap.exists()
              ? { id: m.uid, role: m.role, ...userSnap.data() }
              : null;
          } catch (err) {
            console.error("🔥 Error fetching user:", m.uid, err);
            return null;
          }
        })
      );

      setMembers(fullUsers.filter(Boolean));
    };

    fetchMembers();
  }, [groupId]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Group Members</h5>
      </div>

      {members.length === 0 && (
        <div className="text-muted">No members found.</div>
      )}

      <ul className="cs-list-group mb-3">
        {members.map((u) => (
          <li
            key={u.id}
            className="d-flex align-items-center justify-content-between px-2"
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="p-avatar p-component p-avatar-image p-avatar-circle"
                data-pc-name="avatar"
                data-pc-section="root"
              >
                <img
                  src={u.photoURL || "/avatar_placeholder.png"}
                  alt={u.name}
                  className="rounded-circle"
                  width={32}
                  height={32}
                />
              </div>
              <div className="fw-semibold">{u.name}</div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {u.role === "admin" && (
                <span className="badge bg-warning text-dark me-1">Admin</span>
              )}
              {u.id === ownerId && (
                <span className="badge bg-info text-dark">Owner</span>
              )}

              {/* <span class="badge bg-secondary text-capitalize">admin</span> */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
