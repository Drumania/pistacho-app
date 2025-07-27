import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";

export function useGroupAccessGuard(groupId) {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [groupData, setGroupData] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.uid || !groupId) return;

      setLoading(true);
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        showToast("Group not found", "error");
        navigate("/");
        return;
      }

      const group = groupSnap.data();
      setGroupData(group);

      if (group.isPublic) {
        setHasAccess(true);
      } else {
        const memberRef = doc(db, "groups", groupId, "members", user.uid);
        const memberSnap = await getDoc(memberRef);

        if (memberSnap.exists()) {
          setHasAccess(true);
        } else {
          navigate("/");
        }
      }

      setLoading(false);
    };

    checkAccess();
  }, [user?.uid, groupId]);

  return { loading, hasAccess, groupData };
}
