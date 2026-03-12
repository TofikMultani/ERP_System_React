import { useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialPrograms = [
  {
    id: 1,
    title: "React Fundamentals",
    dept: "Engineering",
    trainer: "Amit Kumar",
    startDate: "15 Mar 2026",
    endDate: "20 Mar 2026",
    seats: 20,
    enrolled: 18,
    status: "Upcoming",
  },
  {
    id: 2,
    title: "Leadership Skills",
    dept: "All",
    trainer: "Rohan Mehta",
    startDate: "10 Mar 2026",
    endDate: "12 Mar 2026",
    seats: 30,
    enrolled: 28,
    status: "Ongoing",
  },
  {
    id: 3,
    title: "Advanced Excel",
    dept: "Finance",
    trainer: "Divya Rao",
    startDate: "01 Mar 2026",
    endDate: "05 Mar 2026",
    seats: 15,
    enrolled: 15,
    status: "Completed",
  },
  {
    id: 4,
    title: "Customer Handling",
    dept: "Support",
    trainer: "Neha Kapoor",
    startDate: "22 Mar 2026",
    endDate: "24 Mar 2026",
    seats: 25,
    enrolled: 10,
    status: "Upcoming",
  },
  {
    id: 5,
    title: "Cybersecurity Basics",
    dept: "IT",
    trainer: "Sneha Joshi",
    startDate: "25 Mar 2026",
    endDate: "26 Mar 2026",
    seats: 20,
    enrolled: 14,
    status: "Upcoming",
  },
  {
    id: 6,
    title: "Sales Negotiation",
    dept: "Sales",
    trainer: "Arjun Patel",
    startDate: "05 Mar 2026",
    endDate: "06 Mar 2026",
    seats: 20,
    enrolled: 20,
    status: "Completed",
  },
];

const columns = [
  { header: "Program", accessor: "title" },
  { header: "Department", accessor: "dept" },
  { header: "Trainer", accessor: "trainer" },
  { header: "Start", accessor: "startDate" },
  { header: "End", accessor: "endDate" },
  { header: "Seats", accessor: "seats" },
  { header: "Enrolled", accessor: "enrolled" },
  { header: "Status", accessor: "status" },
];

const summary = [
  { title: "Total Programs", value: "6", helper: "this quarter" },
  { title: "Ongoing", value: "1", helper: "in progress" },
  { title: "Upcoming", value: "3", helper: "scheduled" },
  { title: "Completed", value: "2", helper: "this month" },
];

const emptyForm = {
  title: "",
  dept: "",
  trainer: "",
  startDate: "",
  endDate: "",
  seats: "",
  enrolled: "0",
};

function Training() {
  const [programs, setPrograms] = useState(initialPrograms);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setPrograms((prev) => [
      ...prev,
      { ...form, id: prev.length + 1, status: "Upcoming" },
    ]);
    setForm(emptyForm);
    setShowForm(false);
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Training</h2>
          <p>Corporate training programs and employee skill development.</p>
        </div>
        <button className="hr-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Schedule Training"}
        </button>
      </div>

      <div className="hr-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      {showForm && (
        <form className="hr-form hr-panel" onSubmit={handleSubmit}>
          <h3 className="hr-panel__title">New Training Program</h3>
          <div className="hr-form__grid">
            <div className="hr-form__field hr-form__field--full">
              <label>Program Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Project Management Basics"
              />
            </div>
            <div className="hr-form__field">
              <label>Target Department</label>
              <select
                name="dept"
                value={form.dept}
                onChange={handleChange}
                required
              >
                <option value="">Select…</option>
                <option>All</option>
                {["Engineering", "HR", "Finance", "Sales", "IT", "Support"].map(
                  (d) => (
                    <option key={d}>{d}</option>
                  ),
                )}
              </select>
            </div>
            <div className="hr-form__field">
              <label>Trainer</label>
              <input
                name="trainer"
                value={form.trainer}
                onChange={handleChange}
                required
                placeholder="Trainer name"
              />
            </div>
            <div className="hr-form__field">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="hr-form__field">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="hr-form__field">
              <label>Total Seats</label>
              <input
                type="number"
                name="seats"
                value={form.seats}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
          </div>
          <button type="submit" className="hr-btn hr-btn--submit">
            Schedule Program
          </button>
        </form>
      )}

      <div className="hr-panel">
        <h3 className="hr-panel__title">Training Programs</h3>
        <Table columns={columns} rows={programs} />
      </div>
    </div>
  );
}

export default Training;
