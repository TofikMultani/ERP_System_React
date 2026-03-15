import { useState } from "react";
import { handleFormFieldValidation, validateFormWithInlineErrors } from "../../utils/formValidation.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialLeaves = [
  {
    id: 1,
    name: "Arjun Patel",
    dept: "Sales",
    type: "Casual",
    from: "10 Mar 2026",
    to: "14 Mar 2026",
    days: 5,
    reason: "Family function",
    status: "Approved",
  },
  {
    id: 2,
    name: "Neha Kapoor",
    dept: "Support",
    type: "Sick",
    from: "12 Mar 2026",
    to: "12 Mar 2026",
    days: 1,
    reason: "Fever",
    status: "Approved",
  },
  {
    id: 3,
    name: "Karan Verma",
    dept: "Sales",
    type: "Casual",
    from: "13 Mar 2026",
    to: "15 Mar 2026",
    days: 3,
    reason: "Personal",
    status: "Pending",
  },
  {
    id: 4,
    name: "Vikram Singh",
    dept: "Engineering",
    type: "Earned",
    from: "20 Mar 2026",
    to: "25 Mar 2026",
    days: 6,
    reason: "Vacation",
    status: "Pending",
  },
  {
    id: 5,
    name: "Divya Rao",
    dept: "Finance",
    type: "Sick",
    from: "11 Mar 2026",
    to: "11 Mar 2026",
    days: 1,
    reason: "Doctor appointment",
    status: "Approved",
  },
  {
    id: 6,
    name: "Amit Kumar",
    dept: "Engineering",
    type: "Maternity",
    from: "01 Apr 2026",
    to: "30 Jun 2026",
    days: 91,
    reason: "Maternity leave",
    status: "Approved",
  },
];

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

const summary = [
  { title: "Total Leaves", value: "6", helper: "this month" },
  { title: "Approved", value: "4", helper: "leaves approved" },
  { title: "Pending", value: "2", helper: "awaiting approval" },
  { title: "Avg Leave Days", value: "3.2", helper: "per employee" },
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
  const [leaves, setLeaves] = useState(initialLeaves);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const formElement = e.currentTarget;
    if (!validateFormWithInlineErrors(formElement)) {
      return;
    }
    setLeaves((prev) => [
      ...prev,
      { ...form, id: prev.length + 1, status: "Pending" },
    ]);
    setForm(emptyForm);
    setShowForm(false);
  }

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
        <form className="hr-form hr-panel" onSubmit={handleSubmit} noValidate onChange={handleFormFieldValidation}>
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
        <Table columns={columns} rows={leaves} />
      </div>
    </div>
  );
}

export default Leave;



