import { useEffect, useState, useRef } from "react";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import db from "@/firebase/firestore";

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import { useAuth } from "@/firebase/AuthContext";
import useNotifications from "@/hooks/useNotifications";

const TAG_COLORS = [
  { name: "Rojo", color: "#dc3545" },
  { name: "Naranja", color: "#fd7e14" },
  { name: "Amarillo", color: "#ffc107" },
  { name: "Verde", color: "#198754" },
  { name: "Azul", color: "#0d6efd" },
  { name: "Celeste", color: "#0dcaf0" },
  { name: "Violeta", color: "#6f42c1" },
  { name: "Rosa", color: "#d63384" },
  { name: "Gris", color: "#6c757d" },
  { name: "Negro", color: "#000000" },
  { name: "Menta", color: "#3ddc97" },
  { name: "Teal", color: "#20c997" },
  { name: "Dorado", color: "#daa520" },
  { name: "Coral", color: "#ff7f50" },
  { name: "Lavanda", color: "#b57edc" },
  { name: "Marrón", color: "#795548" },
];

const PRIORITY_OPTIONS = [
  { label: "Normal", value: "normal" },
  { label: "Alta prioridad", value: "high" },
];

export default function TodoForm({ onSubmit, editingTodo, groupId }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("normal");
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState(TAG_COLORS[0].color);
  const [labelList, setLabelList] = useState([]);
  const [members, setMembers] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [loading, setLoading] = useState(false);
  const titleRef = useRef(null);

  const { user } = useAuth();
  const { sendNotification } = useNotifications();

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title || "");
      setPriority(editingTodo.priority || "normal");
      setLabelName(editingTodo.label?.name || "");
      setLabelColor(editingTodo.label?.color || TAG_COLORS[0].color);
    } else {
      setTitle("");
      setPriority("normal");
      setLabelName("");
      setLabelColor(TAG_COLORS[0].color);
    }

    setTimeout(() => {
      titleRef.current?.focus();
    }, 100);
  }, [editingTodo]);

  useEffect(() => {
    if (!groupId) return;
    const fetchLabels = async () => {
      const snapshot = await getDocs(
        collection(db, `widget_data_todos/${groupId}/labels`)
      );
      const labels = snapshot.docs.map((doc) => doc.data());
      setLabelList(labels);
    };
    fetchLabels();
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    const fetchMembers = async () => {
      const snap = await getDocs(collection(db, `groups/${groupId}/members`));
      const users = await Promise.all(
        snap.docs.map(async (docRef) => {
          const { uid } = docRef.data();
          const userSnap = await getDoc(doc(db, "users", uid));
          const data = userSnap.exists() ? userSnap.data() : {};
          return {
            uid,
            name: data.name || data.displayName || "Usuario",
            photoURL: data.photoURL || "",
          };
        })
      );
      setMembers(users);
    };
    fetchMembers();
  }, [groupId]);

  const notifyMentions = async (text, todoId = null) => {
    const mentions = [...text.matchAll(/@{([^}]+)}/g)].map((m) => m[1]);
    for (const uid of mentions) {
      try {
        await sendNotification(uid, "todo_mention", {
          todoId,
          todoTitle: text,
          from: user?.name || "Alguien",
          groupId,
        });
      } catch (err) {
        console.error("❌ Error notificando a:", uid, err);
      }
    }
  };

  const saveLabelIfNew = async (name, color) => {
    if (!name || !groupId) return;
    const exists = labelList.some((l) => l.name === name);
    if (!exists) {
      await addDoc(collection(db, `widget_data_todos/${groupId}/labels`), {
        name,
        color,
      });
      setLabelList([...labelList, { name, color }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      if (labelName) await saveLabelIfNew(labelName, labelColor);

      await onSubmit({
        title: title.trim(),
        priority,
        label: labelName ? { name: labelName, color: labelColor } : null,
      });

      if (title.includes("@")) {
        await notifyMentions(title.trim());
      }
    } catch (err) {
      console.error("Error saving task", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);

    const match = value.match(/@([^\s@{]*)$/);
    if (match && match[1]) {
      setMentionQuery(match[1].toLowerCase());
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionClick = (user) => {
    const newTitle = title.replace(/@([^\s@{]*)$/, `@{${user.uid}} `);
    setTitle(newTitle);
    setShowMentions(false);
  };

  const colorTemplate = (option) => (
    <div className="d-flex align-items-center gap-2">
      <span
        style={{
          width: "1rem",
          height: "1rem",
          backgroundColor: option.color,
          borderRadius: "0.25rem",
        }}
      />
      <span>{option.name}</span>
    </div>
  );

  const filteredMentions = members.filter((m) =>
    m.name.toLowerCase().includes(mentionQuery)
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="d-flex flex-column gap-3 position-relative"
    >
      <div className="position-relative">
        <InputText
          ref={titleRef}
          value={title}
          onChange={handleTitleChange}
          placeholder="Tarea..."
          className={`w-100 ${showMentions ? "with-mentions" : ""}`}
        />
        {showMentions && filteredMentions.length > 0 && (
          <ul className="mention-list">
            {filteredMentions.map((m) => (
              <li
                key={m.uid}
                onClick={() => handleMentionClick(m)}
                className="mention-item"
              >
                {m.photoURL && (
                  <img
                    src={m.photoURL}
                    alt={m.name}
                    className="rounded-circle me-2"
                    style={{ width: 24, height: 24 }}
                  />
                )}
                @{m.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dropdown
        value={priority}
        options={PRIORITY_OPTIONS}
        onChange={(e) => setPriority(e.value)}
        className="w-50"
        placeholder="Prioridad"
      />

      <div className="d-flex gap-2">
        <InputText
          value={labelName}
          onChange={(e) => setLabelName(e.target.value)}
          placeholder="Etiqueta (opcional)"
          className="w-100"
        />

        <Dropdown
          value={labelColor}
          options={TAG_COLORS}
          onChange={(e) => setLabelColor(e.value)}
          itemTemplate={colorTemplate}
          valueTemplate={colorTemplate}
          optionLabel="name"
          optionValue="color"
          placeholder="Color"
          className="w-50"
        />
      </div>

      {labelList.length > 0 && (
        <div className="d-flex flex-wrap gap-2">
          {labelList.map((l) => (
            <span
              key={l.name}
              className="badge tag-clickable"
              style={{ backgroundColor: l.color, cursor: "pointer" }}
              onClick={() => {
                setLabelName(l.name);
                setLabelColor(l.color);
              }}
            >
              {l.name}
            </span>
          ))}
        </div>
      )}

      <Button
        type="submit"
        label={editingTodo ? "Update Task" : "Save Task"}
        className="btn-pistacho"
        loading={loading}
        disabled={loading}
      />

      <style>
        {`
          .mention-list {
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 1000;
            background: var(--panel-inside, #2c2c2c);
            list-style: none;
            margin: 0;
            padding: 0.5rem;
            border-radius: 0.5rem;
            box-shadow: var(--box-shadow);
            width: 100%;
            max-height: 150px;
            overflow-y: auto;
          }
          .mention-item {
            padding: 0.4rem 0.5rem;
            display: flex;
            align-items: center;
            cursor: pointer;
            border-radius: 0.4rem;
          }
          .mention-item:hover {
            background-color: var(--panel-hover, #394b5e);
          }
          .with-mentions {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
          }
        `}
      </style>
    </form>
  );
}
