import { useEffect, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import db from "@/firebase/firestore";
import { Button } from "primereact/button";
import { useAuth } from "@/firebase/AuthContext";
import GroupExpensesModal from "./GroupExpensesModal";
import "./GroupExpensesWidget.css";

export default function GroupExpensesWidget({ groupId, widgetId }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (groupId && widgetId) {
      loadExpenses();
      loadMembers();
    }
  }, [groupId, widgetId]);

  const loadExpenses = async () => {
    const q = collection(
      db,
      "widget_data",
      "GroupExpensesWidget",
      groupId,
      widgetId,
      "expenses"
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setExpenses(data);
  };

  const loadMembers = async () => {
    const q = collection(db, "groups", groupId, "members");
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      uid: doc.id, // importante
      ...doc.data(), // debe incluir name
    }));
    setMembers(data);
  };

  const handleAddExpense = async (newExpense) => {
    const { description, amount, paid_by, shared_with } = newExpense;
    if (!description || !amount || shared_with.length === 0) return;

    await addDoc(
      collection(
        db,
        "widget_data",
        "GroupExpensesWidget",
        groupId,
        widgetId,
        "expenses"
      ),
      {
        description,
        amount: parseFloat(amount),
        paid_by,
        shared_with,
        created_at: new Date(),
      }
    );

    loadExpenses();
  };

  const calculateBalance = () => {
    const balances = {};
    expenses.forEach((exp) => {
      const share = exp.amount / exp.shared_with.length;
      exp.shared_with.forEach((uid) => {
        if (uid !== exp.paid_by) {
          balances[uid] = (balances[uid] || 0) - share;
          balances[exp.paid_by] = (balances[exp.paid_by] || 0) + share;
        }
      });
    });
    return balances;
  };

  const getNameByUid = (uid) => {
    const m = members.find((m) => m.uid === uid);
    return m?.name || uid;
  };

  const balance = calculateBalance();

  return (
    <div className="group-expenses-widget">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Group Expenses</h5>
        <Button
          label="+ Expense"
          className="btn-transp-small"
          onClick={() => setShowDialog(true)}
        />
      </div>

      <ul className="list-group mb-3">
        {expenses.map((e) => (
          <li
            key={e.id}
            className="list-group-item d-flex justify-content-between"
          >
            <span>{e.description}</span>
            <span>${e.amount}</span>
          </li>
        ))}
      </ul>

      <h6>Balance</h6>
      <ul className="list-group">
        {Object.entries(balance).map(([uid, val]) => (
          <li key={uid} className="list-group-item">
            <strong>{getNameByUid(uid)}</strong>:{" "}
            {val > 0
              ? `debe recibir $${val.toFixed(2)}`
              : `debe pagar $${Math.abs(val).toFixed(2)}`}
          </li>
        ))}
      </ul>

      <GroupExpensesModal
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        onAdd={handleAddExpense}
        members={members}
        currentUser={user}
      />
    </div>
  );
}
