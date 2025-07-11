import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import TodoItem from "../TodoWidget/TodoItem";
import TodoForm from "../TodoWidget/TodoForm";
import { isToday, isYesterday, parseISO } from "date-fns";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";

export default function TodoAllGroupsWidget() {
  const { user } = useAuth();
  const [allTodos, setAllTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOldCompleted, setShowOldCompleted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [usersMapByGroup, setUsersMapByGroup] = useState({});
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    if (user?.uid) loadAllTodos(user.uid);
  }, [user?.uid]);

  const loadAllTodos = async (uid) => {
    setLoading(true);
    const groupsSnap = await getDocs(collection(db, "groups"));
    const todos = [];
    const usersMapGroup = {};

    for (const groupDoc of groupsSnap.docs) {
      const groupId = groupDoc.id;
      const groupName = groupDoc.data().name || groupId;

      const membersSnap = await getDocs(
        collection(db, `groups/${groupId}/members`)
      );
      const isMember = membersSnap.docs.some((doc) => doc.data().uid === uid);
      if (!isMember) continue;

      const usersMap = {};
      for (const docRef of membersSnap.docs) {
        const { uid } = docRef.data();
        const userSnap = await getDoc(doc(db, "users", uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          usersMap[uid] = {
            name: data.name || data.displayName || "Usuario",
            photoURL: data.photoURL || "",
          };
        }
      }
      usersMapGroup[groupId] = usersMap;

      const todosSnap = await getDocs(
        collection(db, `widget_data_todos/${groupId}/items`)
      );
      todosSnap.forEach((doc) => {
        todos.push({
          id: doc.id,
          groupId,
          groupName,
          ...doc.data(),
        });
      });
    }

    setAllTodos(todos);
    setUsersMapByGroup(usersMapGroup);

    const userGroups = todos
      .map((t) => ({ groupId: t.groupId, groupName: t.groupName }))
      .filter(
        (value, index, self) =>
          self.findIndex((g) => g.groupId === value.groupId) === index
      );
    setUserGroups(userGroups);

    setLoading(false);
  };

  const updateTodoInState = (updated) => {
    setAllTodos((prev) =>
      prev.map((t) =>
        t.id === updated.id && t.groupId === updated.groupId ? updated : t
      )
    );
  };

  const handleToggle = async (todo) => {
    const updatedTodo = {
      ...todo,
      completed: !todo.completed,
      completed_at: !todo.completed ? new Date().toISOString() : null,
      completed_by: !todo.completed ? user.displayName || user.email : null,
    };

    updateTodoInState(updatedTodo);

    const ref = doc(db, `widget_data_todos/${todo.groupId}/items/${todo.id}`);
    await updateDoc(ref, {
      completed: updatedTodo.completed,
      completed_at: updatedTodo.completed_at,
      completed_by: updatedTodo.completed_by,
    });
  };

  const handleDelete = async (todo) => {
    setAllTodos((prev) =>
      prev.filter((t) => !(t.id === todo.id && t.groupId === todo.groupId))
    );
    const ref = doc(db, `widget_data_todos/${todo.groupId}/items/${todo.id}`);
    await deleteDoc(ref);
  };

  const handleAddOrUpdate = async (data) => {
    if (!editingTodo) return;
    const ref = doc(
      db,
      `widget_data_todos/${editingTodo.groupId}/items/${editingTodo.id}`
    );
    await updateDoc(ref, data);
    updateTodoInState({ ...editingTodo, ...data });
    setEditingTodo(null);
    setShowDialog(false);
  };

  const matchesGroup = (todo) =>
    selectedGroup === "all" || todo.groupId === selectedGroup;

  const filteredTodos = allTodos.filter(matchesGroup);
  const incomplete = filteredTodos.filter((t) => !t.completed);
  const completedToday = filteredTodos.filter(
    (t) => t.completed && isToday(parseISO(t.completed_at))
  );
  const completedOld = filteredTodos.filter(
    (t) =>
      t.completed &&
      t.completed_at &&
      !isToday(parseISO(t.completed_at)) &&
      isYesterday(parseISO(t.completed_at))
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">To-Dos Global</h5>
      </div>

      <div className="mb-3 d-flex flex-wrap gap-2">
        <Button
          label="All"
          className={`btn-tag ${
            selectedGroup === "all" ? "btn-tag-active" : ""
          }`}
          onClick={() => setSelectedGroup("all")}
        />
        {userGroups.map((g) => (
          <Button
            key={g.groupId}
            label={g.groupName}
            className={`btn-tag ${
              selectedGroup === g.groupId ? "btn-tag-active" : ""
            }`}
            onClick={() => setSelectedGroup(g.groupId)}
          />
        ))}
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
          </>
        ) : (
          <>
            {[...incomplete, ...completedToday].map((todo) => (
              <TodoItem
                key={todo.groupId + todo.id}
                todo={todo}
                showGroupName={selectedGroup === "all"}
                usersMap={usersMapByGroup[todo.groupId] || {}}
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
                        <i className="bi bi-caret-up-fill"></i> Ocultar
                        completadas
                      </>
                    ) : (
                      <>
                        <i className="bi bi-caret-down-fill"></i> Mostrar
                        completadas
                      </>
                    )
                  }
                />

                {showOldCompleted &&
                  completedOld.map((todo) => (
                    <TodoItem
                      key={todo.groupId + todo.id}
                      todo={todo}
                      showGroupName={selectedGroup === "all"}
                      usersMap={usersMapByGroup[todo.groupId] || {}}
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
          groupId={editingTodo?.groupId}
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
