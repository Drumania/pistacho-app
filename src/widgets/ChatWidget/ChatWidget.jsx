import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import "./ChatWidget.css";

export default function ChatWidget({ groupId, widgetId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const messagesRef = collection(
    db,
    `widget_data_chat/${groupId}_${widgetId}/messages`
  );
  const typingRef = collection(
    db,
    `widget_data_chat/${groupId}_${widgetId}/typing`
  );

  useEffect(() => {
    if (!groupId || !widgetId) return;

    const q = query(messagesRef, orderBy("created_at", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });

    return () => unsub();
  }, [groupId, widgetId]);

  useEffect(() => {
    if (!groupId || !widgetId) return;

    const unsub = onSnapshot(typingRef, (snap) => {
      const usersTyping = snap.docs
        .map((doc) => doc.data())
        .filter((d) => d.user_id !== user.uid);
      setTypingUsers(usersTyping);
    });

    return () => unsub();
  }, [groupId, widgetId]);

  const handleTyping = async (e) => {
    const value = e.target.value;
    setText(value);

    const typingDoc = doc(
      db,
      `widget_data_chat/${groupId}_${widgetId}/typing/${user.uid}`
    );
    await setDoc(typingDoc, {
      user_id: user.uid,
      name: user.displayName || user.email,
      updated_at: serverTimestamp(),
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(async () => {
      await deleteDoc(typingDoc);
    }, 3000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    await addDoc(messagesRef, {
      text: text.trim(),
      created_at: serverTimestamp(),
      user_id: user.uid,
      name: user.displayName || user.email,
      photoURL: user.photoURL || "",
    });

    const typingDoc = doc(
      db,
      `widget_data_chat/${groupId}_${widgetId}/typing/${user.uid}`
    );
    await deleteDoc(typingDoc);

    setText("");
  };

  const formatDateToLabel = (dateObj) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const d = new Date(dateObj?.toDate?.() || dateObj);
    const dDate = d.toDateString();

    if (dDate === today.toDateString()) return "Hoy";
    if (dDate === yesterday.toDateString()) return "Ayer";

    return d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="chat-widget h-100 d-flex flex-column bg-panel-inside rounded ">
      <div className="chat-messages flex-grow-1 overflow-auto p-2 ">
        {messages.map((m, i) => {
          const prevMsg = i > 0 ? messages[i - 1] : null;
          const isFirstOfGroup = !prevMsg || prevMsg.user_id !== m.user_id;
          const currDate = new Date(
            m.created_at?.toDate?.() || m.created_at
          ).toDateString();
          const prevDate = prevMsg
            ? new Date(
                prevMsg.created_at?.toDate?.() || prevMsg.created_at
              ).toDateString()
            : null;
          const showDateDivider = currDate !== prevDate;

          const isCurrentUser = m.user_id === user.uid;

          return (
            <div key={m.id}>
              {showDateDivider && (
                <div className="text-center text-muted small my-3">
                  {formatDateToLabel(m.created_at)}
                </div>
              )}

              <div
                className={`chat-message-block d-flex flex-column ${
                  isCurrentUser ? "align-items-end" : "align-items-start"
                } ${isFirstOfGroup ? "mt-4" : "mt-1"}`}
              >
                {isFirstOfGroup && (
                  <div className="d-flex align-items-center gap-2 mb-1">
                    {!isCurrentUser && (
                      <img
                        src={m.photoURL || "/avatar_placeholder.png"}
                        alt={m.name}
                        className="chat-avatar"
                      />
                    )}
                    <div className="chat-name small text-muted">
                      {m.name} ·{" "}
                      {new Date(
                        m.created_at?.toDate?.() || m.created_at
                      ).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}

                <div
                  className={`chat-bubble p-2 rounded-3 mb-1 ${
                    isCurrentUser
                      ? "bg-pistacho text-black"
                      : "bg-dark text-white"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="typing-indicator small text-muted px-3 pb-2">
          {typingUsers.map((u) => u.name).join(", ")} está escribiendo...
        </div>
      )}

      <form
        onSubmit={sendMessage}
        className="d-flex border-top border-dark pt-2 gap-2"
      >
        <input
          value={text}
          onChange={handleTyping}
          placeholder="Escribí un mensaje..."
          className="chat-input border-0"
        />
        <button className="btn btn-outline-light" type="submit">
          Enviar
        </button>
      </form>
    </div>
  );
}
