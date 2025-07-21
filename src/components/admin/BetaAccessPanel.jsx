import { useEffect, useState } from "react";
import {
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import db from "@/firebase/firestore";

export default function BetaAccessPanel() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const snapshot = await getDocs(collection(db, "beta_requests"));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setRequests(data);
  };

  const approveRequest = async (id) => {
    await updateDoc(doc(db, "beta_requests", id), {
      approved: true,
    });
    fetchRequests();
  };

  const deleteRequest = async (id) => {
    if (confirm(`Delete beta request?`)) {
      await deleteDoc(doc(db, "beta_requests", id));
      fetchRequests();
    }
  };

  const actionsTemplate = (row) => (
    <div className="d-flex gap-2">
      {!row.approved && (
        <button
          onClick={() => approveRequest(row.id)}
          className="btn btn-sm btn-success"
        >
          ✅
        </button>
      )}
      <button
        onClick={() => deleteRequest(row.id)}
        className="btn btn-sm btn-danger"
      >
        🗑️
      </button>
    </div>
  );

  return (
    <div className="p-2">
      <h6 className="mb-3">Pending Beta Requests</h6>
      <DataTable value={requests} paginator rows={50}>
        <Column field="id" header="Email" />
        <Column
          field="createdAt"
          header="Requested"
          body={(row) =>
            row.createdAt?.toDate
              ? row.createdAt.toDate().toLocaleDateString()
              : "-"
          }
        />
        <Column
          field="approved"
          header="Approved"
          body={(row) => (row.approved ? "✅" : "❌")}
        />
        <Column header="Actions" body={actionsTemplate} />
      </DataTable>
    </div>
  );
}
