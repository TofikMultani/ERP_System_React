import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialExpenses = [
  {
    id: 1,
    date: "2026-03-10",
    category: "Salaries",
    description: "Monthly payroll",
    amount: "₹450,000",
    status: "Approved",
  },
  {
    id: 2,
    date: "2026-03-08",
    category: "Operations",
    description: "Office rent",
    amount: "₹125,000",
    status: "Approved",
  },
  {
    id: 3,
    date: "2026-03-07",
    category: "Marketing",
    description: "Digital ad campaign",
    amount: "₹75,000",
    status: "Pending",
  },
  {
    id: 4,
    date: "2026-03-05",
    category: "Utilities",
    description: "Electricity & water",
    amount: "₹28,000",
    status: "Approved",
  },
  {
    id: 5,
    date: "2026-03-03",
    category: "Others",
    description: "Office supplies",
    amount: "₹12,500",
    status: "Rejected",
  },
];

function Expenses() {
  const [expenses, setExpenses] = usePersistentState(
    "erp_finance_expenses",
    initialExpenses,
  );
  const [filterCategory, setFilterCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: "Salaries",
    description: "",
    amount: "",
  });

  const filtered =
    filterCategory === "All"
      ? expenses
      : expenses.filter((e) => e.category === filterCategory);

  const handleEdit = (_, rowIndex) => {
    const targetRow = filtered[rowIndex];
    if (targetRow) {
      setEditingId(targetRow.id);
      setFormData({
        category: targetRow.category || "Salaries",
        description: targetRow.description || "",
        amount: String(targetRow.amount || "").replace(/[^\d]/g, ""),
      });
      setShowForm(true);
    }
  };

  const handleDelete = (_, rowIndex) => {
    const targetRow = filtered[rowIndex];
    if (targetRow) {
      deleteRowById(setExpenses, targetRow, "expense");
    }
  };

  const handleAddExpense = (e) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    if (!validateFormWithInlineErrors(formElement)) {
      return;
    }
    if (formData.description.trim() && formData.amount) {
      if (editingId !== null) {
        setExpenses((previousRows) =>
          previousRows.map((item) =>
            String(item.id) === String(editingId)
              ? {
                  ...item,
                  category: formData.category,
                  description: formData.description,
                  amount: "₹" + formData.amount,
                }
              : item,
          ),
        );
      } else {
        const newExpense = {
          id: expenses.length + 1,
          date: new Date().toISOString().split("T")[0],
          category: formData.category,
          description: formData.description,
          amount: "₹" + formData.amount,
          status: "Pending",
        };
        setExpenses([...expenses, newExpense]);
      }
      setFormData({ category: "Salaries", description: "", amount: "" });
      setEditingId(null);
      setShowForm(false);
    }
  };

  const totalExpense = expenses.reduce(
    (sum, e) => sum + parseInt(e.amount.replace("₹", "").replace(",", "")),
    0,
  );

  return (
    <div className="finance-page">
      <div className="finance-page__header">
        <div>
          <h2>Expenses</h2>
          <p>Track and manage organizational expenses</p>
        </div>
      </div>

      <div className="finance-cards">
        <Card
          title="Total Expenses"
          value={"₹" + (totalExpense / 100000).toFixed(2) + "L"}
          helper="YTD"
        />
        <Card
          title="Approved"
          value={expenses.filter((e) => e.status === "Approved").length}
          helper="Verified"
        />
        <Card
          title="Pending"
          value={expenses.filter((e) => e.status === "Pending").length}
          helper="For review"
        />
        <Card
          title="Rejected"
          value={expenses.filter((e) => e.status === "Rejected").length}
          helper="Not approved"
        />
      </div>

      <div className="finance-panel">
        <div className="finance-panel__toolbar">
          <h3 className="finance-panel__title">Expense Log</h3>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div className="finance-filter-group">
              {[
                "All",
                "Salaries",
                "Operations",
                "Marketing",
                "Utilities",
                "Others",
              ].map((cat) => (
                <button
                  key={cat}
                  className={`finance-filter-btn ${filterCategory === cat ? "finance-filter-btn--active" : ""}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              className="finance-btn"
              onClick={() => setShowForm(!showForm)}
            >
              + Add Expense
            </button>
          </div>
        </div>

        {!showForm && (
          <Table
            columns={["Date", "Category", "Description", "Amount", "Status"]}
            rows={filtered.map((e) => [
              e.date,
              e.category,
              e.description,
              e.amount,
              e.status,
            ])}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showForm && (
          <form
            onSubmit={handleAddExpense}
            className="finance-form__grid"
            noValidate
            onChange={handleFormFieldValidation}
          >
            <div className="finance-form__field">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option>Salaries</option>
                <option>Operations</option>
                <option>Marketing</option>
                <option>Utilities</option>
                <option>Others</option>
              </select>
            </div>
            <div className="finance-form__field">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
            <div className="finance-form__field">
              <label>Amount (₹)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
              <button type="submit" className="finance-btn">
                Record Expense
              </button>
              <button
                type="button"
                className="finance-btn"
                style={{ background: "#ccc", color: "#333" }}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Expenses;
