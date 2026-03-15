import { useState } from "react";
import { handleFormFieldValidation, validateFormWithInlineErrors } from "../../utils/formValidation.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialCategories = [
  {
    id: 1,
    name: "Electronics",
    description: "Computers, tablets, smartphones",
    productCount: 3,
    status: "Active",
  },
  {
    id: 2,
    name: "Accessories",
    description: "Cables, adapters, peripherals",
    productCount: 3,
    status: "Active",
  },
  {
    id: 3,
    name: "Furniture",
    description: "Desks, chairs, tables",
    productCount: 2,
    status: "Active",
  },
  {
    id: 4,
    name: "Lighting",
    description: "Lamps, bulbs, fixtures",
    productCount: 1,
    status: "Active",
  },
  {
    id: 5,
    name: "Software",
    description: "Operating systems, applications",
    productCount: 0,
    status: "Active",
  },
  {
    id: 6,
    name: "Consumables",
    description: "Paper, ink, cleaning supplies",
    productCount: 0,
    status: "Inactive",
  },
];

const columns = [
  { header: "Category", accessor: "name" },
  { header: "Description", accessor: "description" },
  { header: "Product Count", accessor: "productCount" },
  { header: "Status", accessor: "status" },
];

const summary = [
  { title: "Total Categories", value: "6", helper: "active + inactive" },
  { title: "Active", value: "5", helper: "categories" },
  { title: "Total Products", value: "9", helper: "across all categories" },
  { title: "Avg per Category", value: "1.5", helper: "products" },
];

const emptyForm = { name: "", description: "" };

function Categories() {
  const [categories, setCategories] = useState(initialCategories);
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
    setCategories((prev) => [
      ...prev,
      { ...form, id: prev.length + 1, productCount: 0, status: "Active" },
    ]);
    setForm(emptyForm);
    setShowForm(false);
  }

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h2>Categories</h2>
          <p>Product classification and taxonomy management.</p>
        </div>
        <button className="inv-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New Category"}
        </button>
      </div>

      <div className="inv-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      {showForm && (
        <form className="inv-form inv-panel" onSubmit={handleSubmit} noValidate onChange={handleFormFieldValidation}>
          <h3 className="inv-panel__title">New Category</h3>
          <div className="inv-form__grid">
            <div className="inv-form__field inv-form__field--full">
              <label>Category Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Office Supplies"
              />
            </div>
            <div className="inv-form__field inv-form__field--full">
              <label>Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief description…"
              />
            </div>
          </div>
          <button type="submit" className="inv-btn inv-btn--submit">
            Create Category
          </button>
        </form>
      )}

      <div className="inv-panel">
        <h3 className="inv-panel__title">All Categories</h3>
        <Table columns={columns} rows={categories} />
      </div>
    </div>
  );
}

export default Categories;



