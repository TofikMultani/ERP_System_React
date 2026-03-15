import { useState } from "react";
import { handleFormFieldValidation, validateFormWithInlineErrors } from "../../utils/formValidation.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialSuppliers = [
  {
    id: 1,
    name: "TechSource Global",
    contact: "Mike Johnson",
    email: "mike@techsource.io",
    phone: "+1-415-789-2345",
    city: "San Francisco",
    status: "Active",
  },
  {
    id: 2,
    name: "Direct Electronics Inc",
    contact: "Sarah Chen",
    email: "sales@directelec.com",
    phone: "+1-206-555-0123",
    city: "Seattle",
    status: "Active",
  },
  {
    id: 3,
    name: "Premium Office Ltd",
    contact: "James Wilson",
    email: "procurement@premoff.co.uk",
    phone: "+44-20-7946-0958",
    city: "London",
    status: "Active",
  },
  {
    id: 4,
    name: "Asian Components Co",
    contact: "Li Wei",
    email: "export@asiancomp.cn",
    phone: "+86-10-6849-1234",
    city: "Beijing",
    status: "Active",
  },
  {
    id: 5,
    name: "Furniture Plus Group",
    contact: "Maria Garcia",
    email: "ventas@furniplus.es",
    phone: "+34-91-123-4567",
    city: "Madrid",
    status: "Inactive",
  },
  {
    id: 6,
    name: "Green Supply Partners",
    contact: "Alex Kumar",
    email: "contact@greensupply.in",
    phone: "+91-11-4060-1234",
    city: "Delhi",
    status: "Active",
  },
];

const columns = [
  { header: "Supplier Name", accessor: "name" },
  { header: "Contact Person", accessor: "contact" },
  { header: "Email", accessor: "email" },
  { header: "Phone", accessor: "phone" },
  { header: "City", accessor: "city" },
  { header: "Status", accessor: "status" },
];

const summary = [
  { title: "Total Suppliers", value: "6", helper: "active + inactive" },
  { title: "Active", value: "5", helper: "suppliers" },
  { title: "Countries", value: "5", helper: "global reach" },
  { title: "Avg Lead Time", value: "14 days", helper: "delivery" },
];

const emptyForm = { name: "", contact: "", email: "", phone: "", city: "" };

function Suppliers() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
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
    setSuppliers((prev) => [
      ...prev,
      { ...form, id: prev.length + 1, status: "Active" },
    ]);
    setForm(emptyForm);
    setShowForm(false);
  }

  const filtered = suppliers.filter((s) =>
    `${s.name} ${s.contact} ${s.city}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

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
        <form className="inv-form inv-panel" onSubmit={handleSubmit} noValidate onChange={handleFormFieldValidation}>
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
        <Table columns={columns} rows={filtered} />
      </div>
    </div>
  );
}

export default Suppliers;



