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
import BetaAccessPanel from "@/components/admin/BetaAccessPanel";
import NewsAdminPanel from "@/components/admin/NewsAdminPanel";
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
    const snap = await getDocs(collection(db, "users"));
    const data = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        createdAtMillis: d.createdAt?.toMillis?.() || 0, // 👈 sortable
      };
    });
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
    const groupsSnap = await getDocs(collection(db, "groups"));
    const usersSnap = await getDocs(collection(db, "users"));

    // Crear un mapa rápido de usuarios por ID
    const usersMap = {};
    usersSnap.forEach((doc) => {
      usersMap[doc.id] = doc.data(); // { name, email, etc. }
    });

    // Armar la lista de grupos con nombre del creador
    const data = groupsSnap.docs.map((doc) => {
      const group = doc.data();

      const createdByUser = usersMap[group.created_by];

      let created_by_name = "-";
      if (createdByUser) {
        created_by_name =
          createdByUser.name ||
          createdByUser.createdAt ||
          createdByUser.displayName ||
          createdByUser.email ||
          "-";
      }

      return {
        id: doc.id,
        ...group,
        created_by_name,
      };
    });

    setGroups(data);
    fetchMemberCounts(data);
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
    <div className="admin-panel container">
      <h4 className="mb-4 ps-2 pt-3">Admin Panel</h4>
      <TabView>
        <TabPanel header="Beta Access" className="m-3">
          <BetaAccessPanel />
        </TabPanel>

        <TabPanel header="News" className="m-3">
          <NewsAdminPanel />
        </TabPanel>

        <TabPanel header="Users" className="m-3">
          <DataTable
            value={users}
            paginator
            rows={50}
            className="mt-3 custom-datatable"
          >
            <Column field="id" header="ID" />
            <Column field="displayName" header="Name" />
            <Column
              field="createdAtMillis"
              header="Registered"
              sortable
              body={(row) =>
                row.createdAt?.toDate
                  ? row.createdAt.toDate().toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"
              }
            />
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
          <DataTable
            value={groups}
            paginator
            rows={30}
            className="mt-3 custom-datatable"
          >
            <Column field="id" header="ID" />
            <Column field="name" header="Group Name" />
            <Column field="slug" header="Slug" />
            <Column field="created_by_name" header="Created By" />
            <Column field="status" header="status" />
            <Column
              field="created_at"
              header="Created At"
              sortable
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
