import { useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialCustomers = [
  {
    id: 1,
    name: "ABC Corporation",
    email: "contact@abc.com",
    phone: "+1-555-1001",
    status: "Active",
    totalOrders: 12,
    totalValue: "₹450,000",
  },
  {
    id: 2,
    name: "XYZ Ltd",
    email: "info@xyz.com",
    phone: "+1-555-1002",
    status: "Active",
    totalOrders: 8,
    totalValue: "₹320,000",
  },
  {
    id: 3,
    name: "Global Tech",
    email: "sales@globaltech.com",
    phone: "+1-555-1003",
    status: "Inactive",
    totalOrders: 5,
    totalValue: "₹180,000",
  },
  {
    id: 4,
    name: "Premier Solutions",
    email: "hello@premier.com",
    phone: "+1-555-1004",
    status: "Active",
    totalOrders: 15,
    totalValue: "₹610,000",
  },
  {
    id: 5,
    name: "Innovate Inc",
    email: "support@innovate.com",
    phone: "+1-555-1005",
    status: "Active",
    totalOrders: 9,
    totalValue: "₹290,000",
  },
  {
    id: 6,
    name: "Enterprise Plus",
    email: "contact@entplus.com",
    phone: "+1-555-1006",
    status: "Pending",
    totalOrders: 2,
    totalValue: "₹65,000",
  },
];

function Customers() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
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

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      setCustomers([
        ...customers,
        {
          id: customers.length + 1,
          ...formData,
          totalOrders: 0,
          totalValue: "₹0",
        },
      ]);
      setFormData({ name: "", email: "", phone: "", status: "Active" });
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
          value={`₹${Math.round(customers.reduce((sum, c) => sum + parseInt(c.totalValue.replace("₹", "").replace(",", "")), 0) / customers.length / 1000)}K`}
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
          />
        </div>
      )}

      {showForm && (
        <div className="sales-panel sales-form">
          <h3 className="sales-panel__title">Add Customer</h3>
          <form onSubmit={handleAddCustomer} className="sales-form__grid">
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
