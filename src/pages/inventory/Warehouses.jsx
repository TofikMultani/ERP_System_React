import { useState } from "react";
import { handleFormFieldValidation, validateFormWithInlineErrors } from "../../utils/formValidation.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialWarehouses = [
  {
    id: 1,
    name: "Main Warehouse",
    location: "New York, NY",
    capacity: 5000,
    occupied: 3240,
    manager: "David Park",
    status: "Active",
  },
  {
    id: 2,
    name: "Secondary Hub",
    location: "Los Angeles, CA",
    capacity: 3000,
    occupied: 1850,
    manager: "Emma Davis",
    status: "Active",
  },
  {
    id: 3,
    name: "Cold Storage Unit",
    location: "Chicago, IL",
    capacity: 1500,
    occupied: 980,
    manager: "Robert Brown",
    status: "Active",
  },
  {
    id: 4,
    name: "Distribution Point",
    location: "Atlanta, GA",
    capacity: 2500,
    occupied: 1200,
    manager: "Lisa Anderson",
    status: "Active",
  },
  {
    id: 5,
    name: "Archive Storage",
    location: "Houston, TX",
    capacity: 1000,
    occupied: 450,
    manager: "John Martinez",
    status: "Inactive",
  },
];

const columns = [
  { header: "Warehouse Name", accessor: "name" },
  { header: "Location", accessor: "location" },
  { header: "Capacity", accessor: "capacity" },
  { header: "Occupied", accessor: "occupied" },
  { header: "Manager", accessor: "manager" },
  { header: "Status", accessor: "status" },
];

const summary = [
  { title: "Total Warehouses", value: "5", helper: "across multiple cities" },
  { title: "Total Capacity", value: "13k units", helper: "combined" },
  { title: "Current Stock", value: "7.7k units", helper: "59% utilization" },
  { title: "Available Space", value: "5.3k units", helper: "41% available" },
];

const emptyForm = { name: "", location: "", capacity: "", manager: "" };

function Warehouses() {
  const [warehouses, setWarehouses] = useState(initialWarehouses);
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
    setWarehouses((prev) => [
      ...prev,
      { ...form, id: prev.length + 1, occupied: 0, status: "Active" },
    ]);
    setForm(emptyForm);
    setShowForm(false);
  }

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
        <form className="inv-form inv-panel" onSubmit={handleSubmit} noValidate onChange={handleFormFieldValidation}>
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
        <Table columns={columns} rows={warehouses} />
      </div>
    </div>
  );
}

export default Warehouses;



