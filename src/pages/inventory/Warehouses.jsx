import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialWarehouses = [];

const columns = [
  { header: "Warehouse Name", accessor: "name" },
  { header: "Location", accessor: "location" },
  { header: "Capacity", accessor: "capacity" },
  { header: "Occupied", accessor: "occupied" },
  { header: "Manager", accessor: "manager" },
  { header: "Status", accessor: "status" },
];

const summary = [
  { title: "Total Warehouses", value: "0", helper: "across multiple cities" },
  { title: "Total Capacity", value: "0 units", helper: "combined" },
  { title: "Current Stock", value: "0 units", helper: "0% utilization" },
  { title: "Available Space", value: "0 units", helper: "0% available" },
];

const emptyForm = { name: "", location: "", capacity: "", manager: "" };

function Warehouses() {
  const [warehouses, setWarehouses] = usePersistentState(
    "erp_inventory_warehouses",
    initialWarehouses,
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
      setWarehouses((previousRows) =>
        previousRows.map((item) =>
          String(item.id) === String(editingId) ? { ...item, ...form } : item,
        ),
      );
    } else {
      setWarehouses((prev) => [
        ...prev,
        { ...form, id: prev.length + 1, occupied: 0, status: "Active" },
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
  const handleDelete = (row) => deleteRowById(setWarehouses, row, "warehouse");

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h2>Warehouses</h2>
          <p>Physical storage locations and capacity management.</p>
        </div>
        <button className="inv-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New Warehouse"}
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
          <h3 className="inv-panel__title">New Warehouse</h3>
          <div className="inv-form__grid">
            <div className="inv-form__field">
              <label>Warehouse Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. West Coast Hub"
              />
            </div>
            <div className="inv-form__field">
              <label>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="City, State"
              />
            </div>
            <div className="inv-form__field">
              <label>Capacity (units)</label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                required
                placeholder="5000"
              />
            </div>
            <div className="inv-form__field">
              <label>Manager</label>
              <input
                name="manager"
                value={form.manager}
                onChange={handleChange}
                placeholder="Manager name"
              />
            </div>
          </div>
          <button type="submit" className="inv-btn inv-btn--submit">
            Create Warehouse
          </button>
        </form>
      )}

      <div className="inv-panel">
        <h3 className="inv-panel__title">Warehouse Locations</h3>
        <Table
          columns={columns}
          rows={warehouses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Warehouses;
