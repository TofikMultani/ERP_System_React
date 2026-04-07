import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialInvoices = [];

function Invoices() {
  const [invoices, setInvoices] = usePersistentState(
    "erp_sales_invoices",
    initialInvoices,
  );
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    customer: "",
    amount: "",
    dueDate: "",
  });

  const filtered =
    filterStatus === "All"
      ? invoices
      : invoices.filter((i) => i.status === filterStatus);

  const handleEdit = (_, rowIndex) => {
    const targetRow = filtered[rowIndex];
    if (targetRow) {
      setEditingId(targetRow.id);
      setFormData({
        customer: targetRow.customer || "",
        amount: String(targetRow.amount || "").replace(/[^\d]/g, ""),
        dueDate: targetRow.dueDate || "",
      });
      setShowForm(true);
    }
  };

  const handleDelete = (_, rowIndex) => {
    const targetRow = filtered[rowIndex];
    if (targetRow) {
      deleteRowById(setInvoices, targetRow, "invoice");
    }
  };

  const handleAddInvoice = (e) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    if (!validateFormWithInlineErrors(formElement)) {
      return;
    }
    if (formData.customer.trim() && formData.amount && formData.dueDate) {
      if (editingId !== null) {
        setInvoices((previousRows) =>
          previousRows.map((item) =>
            String(item.id) === String(editingId)
              ? {
                  ...item,
                  customer: formData.customer,
                  dueDate: formData.dueDate,
                  amount: "₹" + formData.amount,
                }
              : item,
          ),
        );
      } else {
        const newInvoice = {
          id: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
          customer: formData.customer,
          date: new Date().toISOString().split("T")[0],
          dueDate: formData.dueDate,
          amount: "₹" + formData.amount,
          status: "Pending",
          paymentDate: "-",
        };
        setInvoices([...invoices, newInvoice]);
      }
      setFormData({ customer: "", amount: "", dueDate: "" });
      setEditingId(null);
      setShowForm(false);
    }
  };

  const totalAmount = invoices.reduce(
    (sum, i) => sum + parseInt(i.amount.replace("₹", "").replace(",", "")),
    0,
  );
  const paidAmount = invoices
    .filter((i) => i.status === "Paid")
    .reduce(
      (sum, i) => sum + parseInt(i.amount.replace("₹", "").replace(",", "")),
      0,
    );

  return (
    <div className="sales-page">
      <div className="sales-page__header">
        <div>
          <h2>Invoices</h2>
          <p>Manage customer invoices and payment tracking</p>
        </div>
      </div>

      <div className="sales-cards">
        <Card
          title="Total Invoices"
          value={invoices.length}
          helper="All time"
        />
        <Card
          title="Paid"
          value={invoices.filter((i) => i.status === "Paid").length}
          helper="Completed"
        />
        <Card
          title="Pending"
          value={invoices.filter((i) => i.status === "Pending").length}
          helper="Awaiting payment"
        />
        <Card
          title="Overdue"
          value={invoices.filter((i) => i.status === "Overdue").length}
          helper="Past due"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="sales-panel">
          <h4
            style={{
              margin: "0 0 0.5rem",
              fontSize: "0.9rem",
              color: "var(--color-text-soft)",
            }}
          >
            Total Invoice Value
          </h4>
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "var(--color-text)",
            }}
          >
            ₹{(totalAmount / 100000).toFixed(1)}L
          </div>
        </div>
        <div className="sales-panel">
          <h4
            style={{
              margin: "0 0 0.5rem",
              fontSize: "0.9rem",
              color: "var(--color-text-soft)",
            }}
          >
            Amount Paid
          </h4>
          <div
            style={{ fontSize: "1.8rem", fontWeight: "700", color: "#22c55e" }}
          >
            ₹{(paidAmount / 100000).toFixed(1)}L
          </div>
        </div>
      </div>

      <div className="sales-panel">
        <div className="sales-panel__toolbar">
          <h3 className="sales-panel__title">Invoices</h3>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div className="sales-filter-group">
              {["All", "Paid", "Pending", "Overdue"].map((status) => (
                <button
                  key={status}
                  className={`sales-filter-btn ${filterStatus === status ? "sales-filter-btn--active" : ""}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <button
              className="sales-btn"
              onClick={() => setShowForm(!showForm)}
            >
              + New Invoice
            </button>
          </div>
        </div>

        {!showForm && (
          <Table
            columns={[
              "Invoice ID",
              "Customer",
              "Date",
              "Due Date",
              "Amount",
              "Status",
              "Payment Date",
            ]}
            rows={filtered.map((i) => [
              i.id,
              i.customer,
              i.date,
              i.dueDate,
              i.amount,
              i.status,
              i.paymentDate,
            ])}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showForm && (
          <form
            onSubmit={handleAddInvoice}
            className="sales-form__grid"
            noValidate
            onChange={handleFormFieldValidation}
          >
            <div className="sales-form__field">
              <label>Customer</label>
              <input
                type="text"
                value={formData.customer}
                onChange={(e) =>
                  setFormData({ ...formData, customer: e.target.value })
                }
                required
              />
            </div>
            <div className="sales-form__field">
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
            <div className="sales-form__field">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
              />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
              <button type="submit" className="sales-btn">
                Create
              </button>
              <button
                type="button"
                className="sales-btn"
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

export default Invoices;
