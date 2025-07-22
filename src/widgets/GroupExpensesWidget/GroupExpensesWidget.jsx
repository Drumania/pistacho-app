import { useEffect, useState } from "react";
import { collection, addDoc, doc, getDoc, getDocs } from "firebase/firestore";
import db from "@/firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import GroupExpensesModal from "./GroupExpensesModal";
import GroupExpensesAccordionTab from "./GroupExpensesAccordionTab";
import "./GroupExpensesWidget.css";

export default function GroupExpensesWidget({ groupId, widgetId }) {
  const { user } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

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
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setExpenses(data);
  };

  const loadMembers = async () => {
    const q = collection(db, "groups", groupId, "members");
    const snapshot = await getDocs(q);

    const data = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const uid = docSnap.id;
        try {
          const userSnap = await getDoc(doc(db, "users", uid));
          const name = userSnap.exists() ? userSnap.data().name : "Unnamed";
          return { uid, name };
        } catch (err) {
          console.warn("Error fetching user:", uid, err);
          return { uid, name: "Unnamed" };
        }
      })
    );

    setMembers(data);
  };

  const handleAddExpense = async (newExpense) => {
    const { description, amount, paid_by, shared_with, event, date } =
      newExpense;
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
        event: event || "Sin evento",
        date: date || new Date(),
        created_at: new Date(),
      }
    );

    loadExpenses();
  };

  const getNameByUid = (uid) => {
    const found = members.find((m) => m.uid === uid || m.tempId === uid);
    return found?.name || "Unnamed";
  };

  return (
    <div className="group-expenses-widget">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Split Expenses</h5>
        <Button
          label="+ Expense"
          className="btn-transp-small"
          onClick={() => setShowDialog(true)}
        />
      </div>

      {expenses.length === 0 ? (
        <p className="text-muted">No expenses added yet.</p>
      ) : (
        <Accordion activeIndex={0}>
          {expenses.map((e) => {
            const formattedDate = e.date
              ? new Date(e.date.seconds * 1000).toLocaleDateString("es-AR")
              : null;

            return (
              <AccordionTab header="Pádel 20/07">
                <GroupExpensesAccordionTab
                  participants={members}
                  total={46000}
                  onConfirm={(data) => console.log("Gasto confirmado", data)}
                />
              </AccordionTab>
            );
          })}
        </Accordion>
      )}

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
