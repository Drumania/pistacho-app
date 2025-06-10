import { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import {
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import db from "@/firebase/firestore";

export default function AdminTools() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setUsers(data);
  };

  const fetchGroups = async () => {
    const snapshot = await getDocs(collection(db, "groups"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setGroups(data);
  };

  const toggleAdmin = async (user) => {
    const ref = doc(db, "users", user.id);
    await updateDoc(ref, { admin: !user.admin });
    fetchUsers();
  };

  const deleteUser = async (user) => {
    if (confirm(`Delete user ${user.displayName || user.email}?`)) {
      await deleteDoc(doc(db, "users", user.id));
      fetchUsers();
    }
  };

  const deleteGroup = async (group) => {
    if (confirm(`Delete group "${group.name}"?`)) {
      await deleteDoc(doc(db, "groups", group.id));
      fetchGroups();
    }
  };

  const userActionsTemplate = (row) => (
    <div className="d-flex gap-2">
      <Button
        icon={row.admin ? "bi bi-person-dash" : "bi bi-shield-check"}
        className="p-button-sm p-button-text"
        onClick={() => toggleAdmin(row)}
        title={row.admin ? "Remove admin" : "Make admin"}
      />
      <Button
        icon="bi bi-trash"
        className="p-button-sm p-button-text text-danger"
        onClick={() => deleteUser(row)}
        title="Delete user"
      />
    </div>
  );

  const groupActionsTemplate = (row) => (
    <Button
      icon="bi bi-trash"
      className="p-button-sm p-button-text text-danger"
      onClick={() => deleteGroup(row)}
      title="Delete group"
    />
  );

  return (
    <div className="admin-panel">
      <h2 className="mb-3">Admin Tools</h2>
      <TabView>
        <TabPanel header="Users" className="p-3">
          <div className="p-3">
            <DataTable value={users} paginator rows={10} className="mt-3">
              <Column field="id" header="ID" />
              <Column field="displayName" header="Name" />
              <Column field="email" header="Email" />
              <Column
                field="admin"
                header="Admin"
                body={(row) => (row.admin ? "✅" : "")}
              />
              <Column
                header="Actions"
                body={userActionsTemplate}
                style={{ width: "120px" }}
              />
            </DataTable>
          </div>
        </TabPanel>

        <TabPanel header="Groups" className="p-3">
          <div className="p-3">
            <DataTable value={groups} paginator rows={10} className="mt-3">
              <Column field="id" header="ID" />
              <Column field="name" header="Group Name" />
              <Column field="created_by" header="Created By" />
              <Column
                header="Actions"
                body={groupActionsTemplate}
                style={{ width: "80px" }}
              />
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    </div>
  );
}
