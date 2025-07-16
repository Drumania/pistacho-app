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
  getDocs,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";
import { isToday, isYesterday, parseISO } from "date-fns";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";

import "./TodoWidget.css";

export default function TodoWidget({ groupId }) {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [usersMap, setUsersMap] = useState({});
  const [showOldCompleted, setShowOldCompleted] = useState(false);

  if (!user || !user.uid || !groupId) return null;

  const colRef = collection(db, `widget_data_todos/${groupId}/items`);

  useEffect(() => {
    // 🔄 Escucha en tiempo real
    const q = query(colRef, orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTodos(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    const fetchMembers = async () => {
      const snap = await getDocs(collection(db, `groups/${groupId}/members`));
      const map = {};

      for (const docRef of snap.docs) {
        const { uid } = docRef.data();
        const userSnap = await getDoc(doc(db, "users", uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          map[uid] = {
            name: data.name || data.displayName || "Usuario",
            photoURL: data.photoURL || "",
          };
        }
      }

      setUsersMap(map);
    };

    fetchMembers();
  }, [groupId]);

  const incompleteTodos = todos.filter((t) => !t.completed);

  const completedToday = todos.filter(
    (t) => t.completed && isToday(parseISO(t.completed_at))
  );

  const completedOld = todos.filter(
    (t) =>
      t.completed &&
      t.completed_at &&
      !isToday(parseISO(t.completed_at)) &&
      !isYesterday(parseISO(t.completed_at)) === false // incluye solo ayer
  );

  const handleAddOrUpdate = async (data) => {
    if (editingTodo) {
      await updateDoc(doc(colRef, editingTodo.id), data);
      setEditingTodo(null);
    } else {
      await addDoc(colRef, {
        ...data,
        completed: false,
        user_id: user.uid,
        created_at: serverTimestamp(),
      });
    }
    setShowDialog(false);
  };

  const handleToggle = async (todo) => {
    await updateDoc(doc(colRef, todo.id), {
      completed: !todo.completed,
      completed_at: !todo.completed ? new Date().toISOString() : null,
      completed_by: !todo.completed ? user.displayName || user.email : null,
    });
  };

  const handleDelete = async (todo) => {
    await deleteDoc(doc(colRef, todo.id));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">To-Do List</h5>
        <Button
          label="+ To do"
          className="btn-transp-small"
          onClick={() => {
            setEditingTodo(null);
            setShowDialog(true);
          }}
        />
      </div>

      <ul className="list-unstyled small mt-2">
        {loading ? (
          <>
            <li className="mb-2">
              <Skeleton width="100%" height="2rem" />
            </li>
            <li className="mb-2">
              <Skeleton width="100%" height="2rem" />
            </li>
            <li className="mb-2">
              <Skeleton width="100%" height="2rem" />
            </li>
          </>
        ) : (
          <>
            {incompleteTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                usersMap={usersMap}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={() => {
                  setEditingTodo(todo);
                  setShowDialog(true);
                }}
              />
            ))}

            {completedToday.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                usersMap={usersMap}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={() => {
                  setEditingTodo(todo);
                  setShowDialog(true);
                }}
              />
            ))}

            {completedOld.length > 0 && (
              <>
                <Button
                  className="btn-transp-small mt-3"
                  onClick={() => setShowOldCompleted((prev) => !prev)}
                  label={
                    showOldCompleted ? (
                      <>
                        <i className="bi bi-caret-up-fill"></i> Hide completed
                        tasks
                      </>
                    ) : (
                      <>
                        <i className="bi bi-caret-down-fill"></i> Show completed
                        tasks
                      </>
                    )
                  }
                />

                {showOldCompleted && (
                  <>
                    {completedOld.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        usersMap={usersMap}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onEdit={() => {
                          setEditingTodo(todo);
                          setShowDialog(true);
                        }}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}
      </ul>

      <Dialog
        header={editingTodo ? "Edit Task" : "New Task"}
        visible={showDialog}
        onHide={() => {
          setShowDialog(false);
          setEditingTodo(null);
        }}
        style={{ width: "90%", height: "400px", maxWidth: "500px" }}
        modal
      >
        <TodoForm
          groupId={groupId}
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
