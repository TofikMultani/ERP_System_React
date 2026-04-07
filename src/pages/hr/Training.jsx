import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialPrograms = [];

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
  { title: "Total Programs", value: "0", helper: "this quarter" },
  { title: "Ongoing", value: "0", helper: "in progress" },
  { title: "Upcoming", value: "0", helper: "scheduled" },
  { title: "Completed", value: "0", helper: "this month" },
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
  const [programs, setPrograms] = usePersistentState(
    "erp_hr_training",
    initialPrograms,
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
      setPrograms((previousRows) =>
        previousRows.map((item) =>
          String(item.id) === String(editingId) ? { ...item, ...form } : item,
        ),
      );
    } else {
      setPrograms((prev) => [
        ...prev,
        { ...form, id: prev.length + 1, status: "Upcoming" },
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
    deleteRowById(setPrograms, row, "training program");

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
        <form
          className="hr-form hr-panel"
          onSubmit={handleSubmit}
          noValidate
          onChange={handleFormFieldValidation}
        >
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
        <Table
          columns={columns}
          rows={programs}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Training;
