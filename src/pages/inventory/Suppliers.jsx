import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialSuppliers = [];

const columns = [
  { header: "Supplier Name", accessor: "name" },
  { header: "Contact Person", accessor: "contact" },
  { header: "Email", accessor: "email" },
  { header: "Phone", accessor: "phone" },
  { header: "City", accessor: "city" },
  { header: "Status", accessor: "status" },
];

const summary = [
  { title: "Total Suppliers", value: "0", helper: "active + inactive" },
  { title: "Active", value: "0", helper: "suppliers" },
  { title: "Countries", value: "0", helper: "global reach" },
  { title: "Avg Lead Time", value: "0 days", helper: "delivery" },
];

const emptyForm = { name: "", contact: "", email: "", phone: "", city: "" };

function Suppliers() {
  const [suppliers, setSuppliers] = usePersistentState(
    "erp_inventory_suppliers",
    initialSuppliers,
  );
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

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
      setSuppliers((previousRows) =>
        previousRows.map((item) =>
          String(item.id) === String(editingId) ? { ...item, ...form } : item,
        ),
      );
    } else {
      setSuppliers((prev) => [
        ...prev,
        { ...form, id: prev.length + 1, status: "Active" },
      ]);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  const filtered = suppliers.filter((s) =>
    `${s.name} ${s.contact} ${s.city}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({ ...emptyForm, ...row });
    setShowForm(true);
  };
  const handleDelete = (row) => deleteRowById(setSuppliers, row, "supplier");

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h2>Suppliers</h2>
          <p>Vendor management and supplier contact directory.</p>
        </div>
        <button className="inv-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New Supplier"}
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
          <h3 className="inv-panel__title">New Supplier</h3>
          <div className="inv-form__grid">
            <div className="inv-form__field inv-form__field--full">
              <label>Company Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Supplier company name"
              />
            </div>
            <div className="inv-form__field">
              <label>Contact Person</label>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                required
                placeholder="Full name"
              />
            </div>
            <div className="inv-form__field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="contact@supplier.com"
              />
            </div>
            <div className="inv-form__field">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1-XXX-XXX-XXXX"
              />
            </div>
            <div className="inv-form__field">
              <label>City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City name"
              />
            </div>
          </div>
          <button type="submit" className="inv-btn inv-btn--submit">
            Save Supplier
          </button>
        </form>
      )}

      <div className="inv-panel">
        <div className="inv-panel__toolbar">
          <h3 className="inv-panel__title">
            Supplier Directory ({filtered.length})
          </h3>
          <input
            className="inv-search"
            placeholder="Search name / contact / city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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

export default Suppliers;
