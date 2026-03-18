import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialDepts = [
  {
    id: 1,
    name: "Engineering",
    head: "Ananya Sharma",
    employees: 74,
    budget: "₹420,000",
    location: "Floor 3",
  },
  {
    id: 2,
    name: "HR",
    head: "Rohan Mehta",
    employees: 22,
    budget: "₹110,000",
    location: "Floor 1",
  },
  {
    id: 3,
    name: "Finance",
    head: "Divya Rao",
    employees: 31,
    budget: "₹180,000",
    location: "Floor 2",
  },
  {
    id: 4,
    name: "Sales",
    head: "Arjun Patel",
    employees: 48,
    budget: "₹260,000",
    location: "Floor 2",
  },
  {
    id: 5,
    name: "IT",
    head: "Sneha Joshi",
    employees: 40,
    budget: "₹200,000",
    location: "Floor 4",
  },
  {
    id: 6,
    name: "Support",
    head: "Neha Kapoor",
    employees: 33,
    budget: "₹140,000",
    location: "Floor 1",
  },
];

const columns = [
  { header: "Department", accessor: "name" },
  { header: "Head", accessor: "head" },
  { header: "Employees", accessor: "employees" },
  { header: "Budget", accessor: "budget" },
  { header: "Location", accessor: "location" },
];

const emptyForm = {
  name: "",
  head: "",
  employees: "",
  budget: "",
  location: "",
};

function Departments() {
  const [depts, setDepts] = usePersistentState(
    "erp_hr_departments",
    initialDepts,
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
      setDepts((previousRows) =>
        previousRows.map((item) =>
          String(item.id) === String(editingId) ? { ...item, ...form } : item,
        ),
      );
    } else {
      setDepts((prev) => [...prev, { ...form, id: prev.length + 1 }]);
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
  const handleDelete = (row) => deleteRowById(setDepts, row, "department");

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Departments</h2>
          <p>Manage organisational structure and budget allocation.</p>
        </div>
        <button className="hr-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Department"}
        </button>
      </div>

      <div className="hr-cards">
        {initialDepts.map((d) => (
          <Card
            key={d.id}
            title={d.name}
            value={String(d.employees)}
            helper={`Head: ${d.head}`}
          />
        ))}
      </div>

      {showForm && (
        <form
          className="hr-form hr-panel"
          onSubmit={handleSubmit}
          noValidate
          onChange={handleFormFieldValidation}
        >
          <h3 className="hr-panel__title">New Department</h3>
          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Department Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Marketing"
              />
            </div>
            <div className="hr-form__field">
              <label>Department Head</label>
              <input
                name="head"
                value={form.head}
                onChange={handleChange}
                required
                placeholder="Full name"
              />
            </div>
            <div className="hr-form__field">
              <label>Employees</label>
              <input
                type="number"
                name="employees"
                value={form.employees}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div className="hr-form__field">
              <label>Annual Budget</label>
              <input
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="₹0"
              />
            </div>
            <div className="hr-form__field">
              <label>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Floor 2"
              />
            </div>
          </div>
          <button type="submit" className="hr-btn hr-btn--submit">
            Save Department
          </button>
        </form>
      )}

      <div className="hr-panel">
        <h3 className="hr-panel__title">All Departments</h3>
        <Table
          columns={columns}
          rows={depts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Departments;
