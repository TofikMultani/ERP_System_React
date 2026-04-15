import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialAdjustments = [
  {
    id: 1,
    date: "13 Mar 2026",
    product: "Wireless Mouse",
    warehouse: "Main",
    type: "Damage",
    quantity: -5,
    reason: "Water damage in storage",
    approvedBy: "David Park",
  },
  {
    id: 2,
    date: "12 Mar 2026",
    product: "USB-C Cable",
    warehouse: "Main",
    type: "Recount",
    quantity: 12,
    reason: "Stock count correction",
    approvedBy: "David Park",
  },
  {
    id: 3,
    date: "11 Mar 2026",
    product: 'Monitor 27" 4K',
    warehouse: "Secondary",
    type: "Transfer",
    quantity: -3,
    reason: "Moved to main warehouse",
    approvedBy: "Emma Davis",
  },
  {
    id: 4,
    date: "10 Mar 2026",
    product: "Office Chair Mesh",
    warehouse: "Main",
    type: "Return",
    quantity: 2,
    reason: "Customer return received",
    approvedBy: "David Park",
  },
  {
    id: 5,
    date: "09 Mar 2026",
    product: "Desk Lamp LED",
    warehouse: "Main",
    type: "Shrinkage",
    quantity: -1,
    reason: "Inventory write-off",
    approvedBy: "David Park",
  },
  {
    id: 6,
    date: "08 Mar 2026",
    product: "Mechanical Keyboard",
    warehouse: "Secondary",
    type: "Recount",
    quantity: -3,
    reason: "Count adjustment",
    approvedBy: "Emma Davis",
  },
];

const columns = [
  { header: "Date", accessor: "date" },
  { header: "Product", accessor: "product" },
  { header: "Warehouse", accessor: "warehouse" },
  { header: "Type", accessor: "type" },
  { header: "Quantity", accessor: "quantity" },
  { header: "Reason", accessor: "reason" },
  { header: "Approved By", accessor: "approvedBy" },
];

const emptyForm = {
  date: "",
  product: "",
  warehouse: "",
  type: "Recount",
  quantity: "",
  reason: "",
};

function Adjustments() {
  const [adjustments, setAdjustments] = usePersistentState(
    "erp_inventory_adjustments",
    initialAdjustments,
  );
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
      setAdjustments((previousRows) =>
        previousRows.map((item) =>
          String(item.id) === String(editingId) ? { ...item, ...form } : item,
        ),
      );
    } else {
      setAdjustments((prev) => [
        ...prev,
        { ...form, id: prev.length + 1, approvedBy: "Admin" },
      ]);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({ ...emptyForm, ...row });
    setShowForm(true);
  };
  const handleDelete = (row) =>
    deleteRowById(setAdjustments, row, "adjustment");

  const unitsAdded = adjustments
    .filter((adjustment) => Number(adjustment.quantity) > 0)
    .reduce((sum, adjustment) => sum + Number(adjustment.quantity || 0), 0);
  const unitsRemoved = Math.abs(
    adjustments
      .filter((adjustment) => Number(adjustment.quantity) < 0)
      .reduce((sum, adjustment) => sum + Number(adjustment.quantity || 0), 0),
  );
  const netChange = unitsAdded - unitsRemoved;

  const summary = [
    {
      title: "Total Adjustments",
      value: adjustments.length,
      helper: "this month",
    },
    {
      title: "Units Added",
      value: unitsAdded,
      helper: "positive adjustments",
    },
    {
      title: "Units Removed",
      value: unitsRemoved,
      helper: "negative adjustments",
    },
    {
      title: "Net Change",
      value: `${netChange >= 0 ? "+" : ""}${netChange}`,
      helper: "this month",
    },
  ];

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h2>Stock Adjustments</h2>
          <p>Inventory corrections, transfers, and reconciliations.</p>
        </div>
        <button className="inv-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New Adjustment"}
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
          <h3 className="inv-panel__title">Stock Adjustment</h3>
          <div className="inv-form__grid">
            <div className="inv-form__field">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="inv-form__field">
              <label>Product</label>
              <select
                name="product"
                value={form.product}
                onChange={handleChange}
                required
              >
                <option value="">Select product…</option>
                {[
                  "Laptop Pro 15",
                  "USB-C Cable",
                  "Wireless Mouse",
                  'Monitor 27" 4K',
                  "Mechanical Keyboard",
                  "Desk Lamp LED",
                  "Office Chair Mesh",
                  "Standing Desk",
                ].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="inv-form__field">
              <label>Warehouse</label>
              <select
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                required
              >
                <option value="">Select…</option>
                {["Main", "Secondary"].map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </div>
            <div className="inv-form__field">
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Recount</option>
                <option>Damage</option>
                <option>Transfer</option>
                <option>Return</option>
                <option>Shrinkage</option>
              </select>
            </div>
            <div className="inv-form__field">
              <label>Quantity (+ or -)</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                placeholder="Enter quantity"
              />
            </div>
            <div className="inv-form__field inv-form__field--full">
              <label>Reason</label>
              <input
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Brief explanation…"
              />
            </div>
          </div>
          <button type="submit" className="inv-btn inv-btn--submit">
            Record Adjustment
          </button>
        </form>
      )}

      <div className="inv-panel">
        <h3 className="inv-panel__title">Adjustment Log</h3>
        <Table
          columns={columns}
          rows={adjustments}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Adjustments;
