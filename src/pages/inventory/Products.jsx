import { useState } from "react";
import { handleFormFieldValidation, validateFormWithInlineErrors } from "../../utils/formValidation.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialProducts = [
  {
    id: 1,
    name: "Laptop Pro 15",
    category: "Electronics",
    sku: "LP-001",
    price: "$1,299",
    stock: 24,
    status: "Active",
  },
  {
    id: 2,
    name: "USB-C Cable",
    category: "Accessories",
    sku: "USB-002",
    price: "$12",
    stock: 450,
    status: "Active",
  },
  {
    id: 3,
    name: "Wireless Mouse",
    category: "Accessories",
    sku: "MOU-003",
    price: "$45",
    stock: 78,
    status: "Active",
  },
  {
    id: 4,
    name: 'Monitor 27" 4K',
    category: "Electronics",
    sku: "MON-004",
    price: "$499",
    stock: 12,
    status: "Low Stock",
  },
  {
    id: 5,
    name: "Mechanical Keyboard",
    category: "Accessories",
    sku: "KEY-005",
    price: "$129",
    stock: 5,
    status: "Low Stock",
  },
  {
    id: 6,
    name: "Desk Lamp LED",
    category: "Lighting",
    sku: "LAMP-006",
    price: "$35",
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: 7,
    name: "Office Chair Mesh",
    category: "Furniture",
    sku: "CHAIR-007",
    price: "$250",
    stock: 8,
    status: "Low Stock",
  },
  {
    id: 8,
    name: "Standing Desk",
    category: "Furniture",
    sku: "DESK-008",
    price: "$650",
    stock: 3,
    status: "Low Stock",
  },
];

const columns = [
  { header: "Product Name", accessor: "name" },
  { header: "Category", accessor: "category" },
  { header: "SKU", accessor: "sku" },
  { header: "Price", accessor: "price" },
  { header: "Stock", accessor: "stock" },
  { header: "Status", accessor: "status" },
];

const summary = [
  { title: "Total Products", value: "8", helper: "active products" },
  { title: "Total Value", value: "$3.8M", helper: "inventory value" },
  { title: "Low Stock", value: "4", helper: "items need reorder" },
  { title: "Out of Stock", value: "1", helper: "discontinued items" },
];

const emptyForm = { name: "", category: "", sku: "", price: "", stock: "" };

function Products() {
  const [products, setProducts] = useState(initialProducts);
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
    setProducts((prev) => [
      ...prev,
      { ...form, id: prev.length + 1, status: "Active" },
    ]);
    setForm(emptyForm);
    setShowForm(false);
  }

  const filtered = products.filter((p) =>
    `${p.name} ${p.category} ${p.sku}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h2>Products</h2>
          <p>Central product catalog with pricing and availability.</p>
        </div>
        <button className="inv-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      <div className="inv-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      {showForm && (
        <form className="inv-form inv-panel" onSubmit={handleSubmit} noValidate onChange={handleFormFieldValidation}>
          <h3 className="inv-panel__title">New Product</h3>
          <div className="inv-form__grid">
            <div className="inv-form__field">
              <label>Product Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Desktop PC"
              />
            </div>
            <div className="inv-form__field">
              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select…</option>
                {[
                  "Electronics",
                  "Accessories",
                  "Furniture",
                  "Lighting",
                  "Software",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="inv-form__field">
              <label>SKU</label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
                placeholder="e.g. PROD-001"
              />
            </div>
            <div className="inv-form__field">
              <label>Price</label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="$0.00"
              />
            </div>
            <div className="inv-form__field">
              <label>Initial Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>
          <button type="submit" className="inv-btn inv-btn--submit">
            Save Product
          </button>
        </form>
      )}

      <div className="inv-panel">
        <div className="inv-panel__toolbar">
          <h3 className="inv-panel__title">
            Product Catalog ({filtered.length})
          </h3>
          <input
            className="inv-search"
            placeholder="Search name / category / SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Table columns={columns} rows={filtered} />
      </div>
    </div>
  );
}

export default Products;



