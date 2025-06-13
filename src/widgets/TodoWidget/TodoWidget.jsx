import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

import "./TodoWidget.css";

export default function TodoWidget({ groupId }) {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  if (!user || !user.uid || !groupId) return null;

  // 🔄 Leer tareas del usuario en el grupo actual
  useEffect(() => {
    const q = query(
      collection(db, "todos"),
      where("user_id", "==", user.uid),
      where("group_id", "==", groupId),
      orderBy("created_at", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((todo) => {
          if (!todo.completed) return true;
          if (!todo.completed_at) return true;

          const completedAt = new Date(todo.completed_at);
          const diffInDays =
            (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24);

          return diffInDays <= 1;
        });

      const sorted = data.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (a.due_date || "") > (b.due_date || "") ? 1 : -1;
      });

      setTodos(sorted);
    });

    return () => unsub();
  }, [user.uid, groupId]);

  // ➕ Crear o actualizar
  const handleAddOrUpdate = async (data) => {
    if (editingTodo) {
      await updateDoc(doc(db, "todos", editingTodo.id), data);
      setEditingTodo(null);
    } else {
      await addDoc(collection(db, "todos"), {
        ...data,
        completed: false,
        user_id: user.uid,
        group_id: groupId,
        created_at: serverTimestamp(),
      });
    }
    setShowDialog(false);
  };

  const handleToggle = async (todo) => {
    await updateDoc(doc(db, "todos", todo.id), {
      completed: !todo.completed,
      completed_at: !todo.completed ? new Date().toISOString() : null,
    });
  };

  const handleDelete = async (todo) => {
    await deleteDoc(doc(db, "todos", todo.id));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">To-Do List</h5>
        <Button
          label="+ Add Task"
          className="btn-transp-small"
          onClick={() => {
            setEditingTodo(null);
            setShowDialog(true);
          }}
        />
      </div>

      <ul className="list-unstyled small mt-2">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={() => {
              setEditingTodo(todo);
              setShowDialog(true);
            }}
          />
        ))}
      </ul>

      <Dialog
        header={editingTodo ? "Edit Task" : "New Task"}
        visible={showDialog}
        onHide={() => {
          setShowDialog(false);
          setEditingTodo(null);
        }}
        style={{ width: "90%", height: "320px", maxWidth: "500px" }}
        modal
      >
        <TodoForm
          onSubmit={handleAddOrUpdate}
          editingTodo={editingTodo}
          onCancelEdit={() => {
            setShowDialog(false);
            setEditingTodo(null);
          }}
        />
      </Dialog>
    </div>
  );
}
