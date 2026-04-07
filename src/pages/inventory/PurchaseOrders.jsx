import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialPOs = [];

const columns = [
  { header: "PO Number", accessor: "poNumber" },
  { header: "Supplier", accessor: "supplier" },
  { header: "Items", accessor: "items" },
  { header: "Amount", accessor: "amount" },
  { header: "Date", accessor: "date" },
  { header: "Due Date", accessor: "dueDate" },
  { header: "Status", accessor: "status" },
];

const summary = [
  { title: "Total POs", value: "0", helper: "this month" },
  { title: "Pending", value: "0", helper: "awaiting confirmation" },
  { title: "In Transit", value: "0", helper: "on the way" },
  { title: "Total Value", value: "₹0", helper: "outstanding orders" },
];

const emptyForm = {
  poNumber: "",
  supplier: "",
  items: "",
  amount: "",
  date: "",
  dueDate: "",
};

function PurchaseOrders() {
  const [pos, setPos] = usePersistentState(
    "erp_inventory_purchase_orders",
    initialPOs,
  );
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const formElement = e.currentTarget;
    if (!validateFormWithInlineErrors(formElement)) {
      return;
    }
    if (editingId !== null) {
      setPos((previousRows) =>
        previousRows.map((item) =>
          String(item.id) === String(editingId) ? { ...item, ...form } : item,
        ),
      );
    } else {
      setPos((prev) => [
        ...prev,
        { ...form, id: prev.length + 1, status: "Pending" },
      ]);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  const filtered =
    filterStatus === "All" ? pos : pos.filter((p) => p.status === filterStatus);

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({ ...emptyForm, ...row });
    setShowForm(true);
  };
  const handleDelete = (row) => deleteRowById(setPos, row, "purchase order");

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h2>Purchase Orders</h2>
          <p>Manage supplier orders and delivery tracking.</p>
        </div>
        <button className="inv-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Create PO"}
        </button>
      </div>

      <div className="inv-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      {showForm && (
        <form
          className="inv-form inv-panel"
          onSubmit={handleSubmit}
          noValidate
          onChange={handleFormFieldValidation}
        >
          <h3 className="inv-panel__title">New Purchase Order</h3>
          <div className="inv-form__grid">
            <div className="inv-form__field">
              <label>PO Number</label>
              <input
                name="poNumber"
                value={form.poNumber}
                onChange={handleChange}
                required
                placeholder="PO-2026-XXX"
              />
            </div>
            <div className="inv-form__field">
              <label>Supplier</label>
              <select
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                required
              >
                <option value="">Select supplierâ€¦</option>
                {[
                  "TechSource Global",
                  "Direct Electronics Inc",
                  "Premium Office Ltd",
                  "Asian Components Co",
                  "Green Supply Partners",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="inv-form__field">
              <label>Number of Items</label>
              <input
                type="number"
                name="items"
                value={form.items}
                onChange={handleChange}
                required
                placeholder="0"
              />
            </div>
            <div className="inv-form__field">
              <label>Total Amount</label>
              <input
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="₹0.00"
              />
            </div>
            <div className="inv-form__field">
              <label>Order Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="inv-form__field">
              <label>Expected Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button type="submit" className="inv-btn inv-btn--submit">
            Create Order
          </button>
        </form>
      )}

      <div className="inv-panel">
        <div className="inv-panel__toolbar">
          <h3 className="inv-panel__title">Purchase Orders</h3>
          <div className="inv-filter-group">
            {["All", "Pending", "Confirmed", "In Transit", "Delivered"].map(
              (s) => (
                <button
                  key={s}
                  className={`inv-filter-btn${filterStatus === s ? " inv-filter-btn--active" : ""}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s}
                </button>
              ),
            )}
          </div>
        </div>
        <Table
          columns={columns}
          rows={filtered}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default PurchaseOrders;
