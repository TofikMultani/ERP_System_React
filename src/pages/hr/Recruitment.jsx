import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialCandidates = [];

const columns = [
  { header: "Candidate", accessor: "name" },
  { header: "Role", accessor: "role" },
  { header: "Department", accessor: "dept" },
  { header: "Applied", accessor: "applied" },
  { header: "Stage", accessor: "stage" },
  { header: "Status", accessor: "status" },
];

const summary = [
  { title: "Total Applicants", value: "0", helper: "active pipeline" },
  { title: "Selected", value: "0", helper: "offers extended" },
  { title: "In Progress", value: "0", helper: "across stages" },
  { title: "Open Positions", value: "0", helper: "to be filled" },
];

const emptyForm = {
  name: "",
  role: "",
  dept: "",
  applied: "",
  stage: "Screening",
};

function Recruitment() {
  const [candidates, setCandidates] = usePersistentState(
    "erp_hr_recruitment",
    initialCandidates,
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
      setCandidates((previousRows) =>
        previousRows.map((item) =>
          String(item.id) === String(editingId) ? { ...item, ...form } : item,
        ),
      );
    } else {
      setCandidates((prev) => [
        ...prev,
        { ...form, id: prev.length + 1, status: "In Progress" },
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
  const handleDelete = (row) => deleteRowById(setCandidates, row, "candidate");

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Recruitment</h2>
          <p>Manage applicants and hiring pipeline.</p>
        </div>
        <button className="hr-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Candidate"}
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
          <h3 className="hr-panel__title">New Candidate</h3>
          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Candidate Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Full name"
              />
            </div>
            <div className="hr-form__field">
              <label>Applied Role</label>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                placeholder="e.g. Backend Developer"
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
              <label>Application Date</label>
              <input
                type="date"
                name="applied"
                value={form.applied}
                onChange={handleChange}
                required
              />
            </div>
            <div className="hr-form__field">
              <label>Current Stage</label>
              <select name="stage" value={form.stage} onChange={handleChange}>
                <option>Screening</option>
                <option>Technical</option>
                <option>HR Round</option>
                <option>Offer</option>
              </select>
            </div>
          </div>
          <button type="submit" className="hr-btn hr-btn--submit">
            Add Candidate
          </button>
        </form>
      )}

      <div className="hr-panel">
        <h3 className="hr-panel__title">Candidate Pipeline</h3>
        <Table
          columns={columns}
          rows={candidates}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Recruitment;
