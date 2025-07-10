import { useEffect, useRef, useState } from "react";
import {
  getDatabase,
  ref,
  onChildAdded,
  push,
  set,
  onValue,
  remove,
  serverTimestamp as rtdbTimestamp,
} from "firebase/database";
import { useAuth } from "@/firebase/AuthContext";
import "./ChatWidget.css";

export default function ChatWidget({ groupId, widgetId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const db = getDatabase();

  const messagesRef = ref(db, `chat/${groupId}_${widgetId}/messages`);
  const typingRef = ref(db, `chat/${groupId}_${widgetId}/typing`);

  useEffect(() => {
    const msgs = [];

    const unsubscribe = onChildAdded(messagesRef, (snap) => {
      msgs.push({ id: snap.key, ...snap.val() });
      setMessages([...msgs]);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });

    return () => unsubscribe();
  }, [groupId, widgetId]);

  useEffect(() => {
    const unsubscribe = onValue(typingRef, (snap) => {
      const data = snap.val() || {};
      const active = Object.values(data).filter((u) => u.user_id !== user.uid);
      setTypingUsers(active);
    });

    return () => unsubscribe();
  }, [groupId, widgetId]);

  const handleTyping = (e) => {
    const value = e.target.value;
    setText(value);

    const userTypingRef = ref(
      db,
      `chat/${groupId}_${widgetId}/typing/${user.uid}`
    );
    set(userTypingRef, {
      user_id: user.uid,
      name: user.displayName || user.email,
      updated_at: Date.now(),
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      remove(userTypingRef);
    }, 3000);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!text.trim()) return;

    const newMsg = {
      text: text.trim(),
      created_at: Date.now(),
      user_id: user.uid,
      name: user.displayName || user.email,
      photoURL: user.photoURL || "",
    };

    push(messagesRef, newMsg);
    remove(ref(db, `chat/${groupId}_${widgetId}/typing/${user.uid}`));
    setText("");
  };

  const formatDateToLabel = (timestamp) => {
    const d = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const dStr = d.toDateString();
    if (dStr === today.toDateString()) return "Hoy";
    if (dStr === yesterday.toDateString()) return "Ayer";

    return d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="chat-widget h-100 d-flex flex-column bg-panel-inside rounded">
      <div className="chat-messages flex-grow-1 overflow-auto p-2">
        {messages.map((m, i) => {
          const prev = i > 0 ? messages[i - 1] : null;
          const showDate =
            !prev ||
            new Date(prev.created_at).toDateString() !==
              new Date(m.created_at).toDateString();
          const isMine = m.user_id === user.uid;
          const isFirst = !prev || prev.user_id !== m.user_id;

          return (
            <div key={m.id}>
              {showDate && (
                <div className="text-center text-muted small my-3">
                  {formatDateToLabel(m.created_at)}
                </div>
              )}

              <div className="chat-message-block d-flex flex-column">
                {isFirst && (
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={m.photoURL || "/avatar_placeholder.png"}
                      alt={m.name}
                      className="chat-avatar"
                    />
                    <div
                      className={`chat-name ${
                        isMine ? "mine color-pistacho" : "other"
                      }`}
                    >
                      {m.name} &middot;{" "}
                      {new Date(m.created_at).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}

                <div
                  className={`chat-bubble ${
                    isMine ? "mine color-pistacho" : "other"
                  } mb-2`}
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
        autoComplete="off"
      >
        <textarea
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
          placeholder="Escribí un mensaje..."
          className="chat-input border-0 flex-grow-1"
          rows={1}
        />
        <button className="btn btn-outline-light" type="submit">
          Enviar
        </button>
      </form>
    </div>
  );
}
