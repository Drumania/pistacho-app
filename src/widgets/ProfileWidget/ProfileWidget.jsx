import { useEffect, useState } from "react";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { format } from "date-fns";
import { Skeleton } from "primereact/skeleton";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import "./ProfileWidget.css";

export default function ProfileWidget() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stamps, setStamps] = useState([]);

  useEffect(() => {
    const fetchStamps = async () => {
      const snap = await getDocs(collection(db, "stamps"));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // ordenados por order
      data.sort((a, b) => a.order - b.order);
      setStamps(data);
    };

    fetchStamps();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setProfile(snap.data());
    });
  }, [user]);

  if (!profile) {
    return (
      <div className="widget-box text-center">
        <Skeleton shape="circle" size="80px" className="mb-3 mx-auto" />
        <Skeleton width="60%" height="1.5rem" className="mb-2 mx-auto" />
        <Skeleton width="80%" height="1rem" className="mb-3 mx-auto" />
      </div>
    );
  }

  const { photoURL, name, createdAt, bio } = profile;

  return (
    <div className="profile-user">
      <div className="d-flex">
        <img
          src={photoURL || "/default-avatar.png"}
          alt={name || ""}
          className="rounded-circle"
          style={{
            width: "80px",
            height: "80px",
            objectFit: "cover",
          }}
        />

        <div className="ps-3">
          <div className="d-flex justify-content-between align-items-center gap-2">
            <h4 className="mb-1 text-light">{name}</h4>
            <a
              href="/settings"
              className="btn-transp-small"
              style={{ fontSize: "0.85rem" }}
            >
              Edit profile
            </a>
          </div>
          <p className="text-muted small m-0">
            {bio}
            <br />
            {createdAt?.toDate && (
              <span className="text-muted fst-italic small">
                Joined: {format(createdAt.toDate(), "d MMM yyyy")}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="cs-stamps">
        {[...stamps]
          .sort((a, b) => a.order - b.order)
          .map((s, i) => {
            const unlocked = profile?.stamps?.includes(s.id);
            return (
              <div
                key={s.id || i}
                className="stamp text-center"
                title={
                  unlocked ? s.title : `${s.requirement || "Not unlocked"}`
                }
              >
                {unlocked ? (
                  <img src={s.img} className="w-75" alt={s.title} />
                ) : (
                  <img
                    src={s.img}
                    className="w-75 locked-badge"
                    alt={s.title}
                  />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
