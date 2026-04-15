import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialLeaves = [];

const columns = [
  { header: "Employee", accessor: "name" },
  { header: "Department", accessor: "dept" },
  { header: "Type", accessor: "type" },
  { header: "From", accessor: "from" },
  { header: "To", accessor: "to" },
  { header: "Days", accessor: "days" },
  { header: "Reason", accessor: "reason" },
  { header: "Status", accessor: "status" },
];

const emptyForm = {
  name: "",
  dept: "",
  type: "Casual",
  from: "",
  to: "",
  days: "",
  reason: "",
};

function Leave() {
  const [leaves, setLeaves] = usePersistentState("erp_hr_leave", initialLeaves);
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
      setLeaves((previousRows) =>
        previousRows.map((item) =>
          String(item.id) === String(editingId) ? { ...item, ...form } : item,
        ),
      );
    } else {
      setLeaves((prev) => [
        ...prev,
        { ...form, id: prev.length + 1, status: "Pending" },
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
  const handleDelete = (row) => deleteRowById(setLeaves, row, "leave request");

  const approvedCount = leaves.filter((leave) => leave.status === "Approved").length;
  const pendingCount = leaves.filter((leave) => leave.status === "Pending").length;
  const avgLeaveDays = leaves.length
    ? (
        leaves.reduce((sum, leave) => sum + (Number(leave.days) || 0), 0) /
        leaves.length
      ).toFixed(1)
    : "0.0";

  const summary = [
    { title: "Total Leaves", value: leaves.length, helper: "this month" },
    { title: "Approved", value: approvedCount, helper: "leaves approved" },
    { title: "Pending", value: pendingCount, helper: "awaiting approval" },
    { title: "Avg Leave Days", value: avgLeaveDays, helper: "per employee" },
  ];

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Leave Management</h2>
          <p>Apply and track employee leave requests.</p>
        </div>
        <button className="hr-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Apply Leave"}
        </button>
      </div>

      <div className="hr-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      {showForm && (
        <form
          className="hr-form hr-panel"
          onSubmit={handleSubmit}
          noValidate
          onChange={handleFormFieldValidation}
        >
          <h3 className="hr-panel__title">Leave Application</h3>
          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Employee Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Full name"
              />
            </div>
            <div className="hr-form__field">
              <label>Department</label>
              <select
                name="dept"
                value={form.dept}
                onChange={handleChange}
                required
              >
                <option value="">Select…</option>
                {["Engineering", "HR", "Finance", "Sales", "IT", "Support"].map(
                  (d) => (
                    <option key={d}>{d}</option>
                  ),
                )}
              </select>
            </div>
            <div className="hr-form__field">
              <label>Leave Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Casual</option>
                <option>Sick</option>
                <option>Earned</option>
                <option>Maternity</option>
                <option>Paternity</option>
              </select>
            </div>
            <div className="hr-form__field">
              <label>From</label>
              <input
                type="date"
                name="from"
                value={form.from}
                onChange={handleChange}
                required
              />
            </div>
            <div className="hr-form__field">
              <label>To</label>
              <input
                type="date"
                name="to"
                value={form.to}
                onChange={handleChange}
                required
              />
            </div>
            <div className="hr-form__field">
              <label>Number of Days</label>
              <input
                type="number"
                name="days"
                value={form.days}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
            <div className="hr-form__field hr-form__field--full">
              <label>Reason</label>
              <input
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Brief reason…"
              />
            </div>
          </div>
          <button type="submit" className="hr-btn hr-btn--submit">
            Submit Application
          </button>
        </form>
      )}

      <div className="hr-panel">
        <h3 className="hr-panel__title">Leave Records</h3>
        <Table
          columns={columns}
          rows={leaves}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Leave;
