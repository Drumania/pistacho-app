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
  addDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import WidgetManager from "@/components/admin/WidgetManager";
import GlobalHabitsAdmin from "@/components/admin/GlobalHabitsAdmin";
import { getAuth } from "firebase/auth";

export default function AdminTools() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [memberCounts, setMemberCounts] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setUsers(data);
  };

  const fetchMemberCounts = async (groupsList) => {
    const counts = {};

    for (const group of groupsList) {
      const membersSnap = await getDocs(
        collection(db, "groups", group.id, "members")
      );
      counts[group.id] = membersSnap.size;
    }

    setMemberCounts(counts);
  };

  const fetchGroups = async () => {
    const snapshot = await getDocs(collection(db, "groups"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setGroups(data);
    fetchMemberCounts(data); // 👈 agregá esto
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
    <div className="admin-panel container-fluid">
      <h4 className="mb-4 ps-2 pt-3">Admin Panel</h4>
      <TabView>
        {/* <TabPanel header="Groups" className="m-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="m-0">Migrar List</h6>
            <Button
              label="Migrar Members"
              icon="pi pi-refresh"
              className="btn-pistacho"
              onClick={handleMigrateMembers}
            />
          </div>
        </TabPanel> */}

        <TabPanel header="Users" className="m-3">
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
        </TabPanel>

        <TabPanel header="Groups" className="m-3">
          <DataTable value={groups} paginator rows={30} className="mt-3">
            <Column field="id" header="ID" />
            <Column field="name" header="Group Name" />
            <Column field="slug" header="Slug" />
            <Column field="created_by" header="Created By" />
            <Column field="status" header="status" />
            <Column
              field="created_at"
              header="Created At"
              body={(row) =>
                row.created_at?.toDate
                  ? row.created_at.toDate().toLocaleDateString()
                  : "-"
              }
            />
            <Column
              header="Members"
              body={(row) => memberCounts[row.id] ?? "–"}
            />
            <Column
              header="Actions"
              body={groupActionsTemplate}
              style={{ width: "80px" }}
            />
          </DataTable>
        </TabPanel>

        <TabPanel header="Widgets" className="m-3">
          <WidgetManager />
        </TabPanel>

        <TabPanel header="Habits" className="m-3">
          <GlobalHabitsAdmin />
        </TabPanel>
      </TabView>
    </div>
  );
}
