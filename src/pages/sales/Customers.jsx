import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialCustomers = [];

function Customers() {
  const [customers, setCustomers] = usePersistentState(
    "erp_sales_customers",
    initialCustomers,
  );
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
  });

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (_, rowIndex) => {
    const targetRow = filtered[rowIndex];
    if (targetRow) {
      setEditingId(targetRow.id);
      setFormData({
        name: targetRow.name || "",
        email: targetRow.email || "",
        phone: targetRow.phone || "",
        status: targetRow.status || "Active",
      });
      setShowForm(true);
    }
  };

  const handleDelete = (_, rowIndex) => {
    const targetRow = filtered[rowIndex];
    if (targetRow) {
      deleteRowById(setCustomers, targetRow, "customer");
    }
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    if (!validateFormWithInlineErrors(formElement)) {
      return;
    }
    if (formData.name.trim()) {
      if (editingId !== null) {
        setCustomers((previousRows) =>
          previousRows.map((item) =>
            String(item.id) === String(editingId)
              ? {
                  ...item,
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  status: formData.status,
                }
              : item,
          ),
        );
      } else {
        setCustomers([
          ...customers,
          {
            id: customers.length + 1,
            ...formData,
            totalOrders: 0,
            totalValue: "₹0",
          },
        ]);
      }
      setFormData({ name: "", email: "", phone: "", status: "Active" });
      setEditingId(null);
      setShowForm(false);
    }
  };

  return (
    <div className="sales-page">
      <div className="sales-page__header">
        <div>
          <h2>Customers</h2>
          <p>Manage your customer database and relationships</p>
        </div>
      </div>

      <div className="sales-cards">
        <Card
          title="Total Customers"
          value={customers.length}
          helper="All time"
        />
        <Card
          title="Active Customers"
          value={customers.filter((c) => c.status === "Active").length}
          helper="Live accounts"
        />
        <Card
          title="Total Revenue"
          value={`₹${(customers.reduce((sum, c) => sum + parseInt(c.totalValue.replace("₹", "").replace(",", "")), 0) / 100000).toFixed(1)}L`}
          helper="All time"
        />
        <Card
          title="Avg Order Value"
          value={`₹${Math.round(customers.reduce((sum, c) => sum + parseInt(c.totalValue.replace("₹", "").replace(",", "")), 0) / Math.max(customers.length, 1) / 1000)}K`}
          helper="Per customer"
        />
      </div>

      {!showForm && (
        <div className="sales-panel">
          <div className="sales-panel__toolbar">
            <h3 className="sales-panel__title">Customer List</h3>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input
                type="text"
                className="sales-search"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="sales-btn" onClick={() => setShowForm(true)}>
                + Add Customer
              </button>
            </div>
          </div>
          <Table
            columns={[
              "Name",
              "Email",
              "Phone",
              "Status",
              "Orders",
              "Total Value",
            ]}
            rows={filtered.map((c) => [
              c.name,
              c.email,
              c.phone,
              c.status,
              c.totalOrders,
              c.totalValue,
            ])}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {showForm && (
        <div className="sales-panel sales-form">
          <h3 className="sales-panel__title">Add Customer</h3>
          <form
            onSubmit={handleAddCustomer}
            className="sales-form__grid"
            noValidate
            onChange={handleFormFieldValidation}
          >
            <div className="sales-form__field">
              <label>Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="sales-form__field">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="sales-form__field">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="sales-form__field">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
              <button type="submit" className="sales-btn">
                Save
              </button>
              <button
                type="button"
                className="sales-btn"
                style={{ background: "#ccc", color: "#333" }}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Customers;
