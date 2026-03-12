import { useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialOrders = [
  {
    id: "ORD-001",
    customer: "ABC Corporation",
    date: "2026-03-10",
    amount: "₹85,000",
    status: "Delivered",
    items: 5,
  },
  {
    id: "ORD-002",
    customer: "XYZ Ltd",
    date: "2026-03-09",
    amount: "₹42,500",
    status: "Processing",
    items: 3,
  },
  {
    id: "ORD-003",
    customer: "Global Tech",
    date: "2026-03-08",
    amount: "₹128,000",
    status: "Shipped",
    items: 8,
  },
  {
    id: "ORD-004",
    customer: "Premier Solutions",
    date: "2026-03-07",
    amount: "₹95,000",
    status: "Delivered",
    items: 6,
  },
  {
    id: "ORD-005",
    customer: "ABC Corporation",
    date: "2026-03-06",
    amount: "₹72,500",
    status: "Processing",
    items: 4,
  },
];

function Orders() {
  const [orders, setOrders] = useState(initialOrders);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    amount: "",
    status: "Processing",
    items: "",
  });

  const filtered =
    filterStatus === "All"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const handleAddOrder = (e) => {
    e.preventDefault();
    if (formData.customer.trim() && formData.amount) {
      const newOrder = {
        id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
        customer: formData.customer,
        date: new Date().toISOString().split("T")[0],
        amount: "₹" + formData.amount,
        status: formData.status,
        items: parseInt(formData.items) || 0,
      };
      setOrders([...orders, newOrder]);
      setFormData({
        customer: "",
        amount: "",
        status: "Processing",
        items: "",
      });
      setShowForm(false);
    }
  };

  return (
    <div className="sales-page">
      <div className="sales-page__header">
        <div>
          <h2>Orders</h2>
          <p>Track and manage customer orders</p>
        </div>
      </div>

      <div className="sales-cards">
        <Card title="Total Orders" value={orders.length} helper="All time" />
        <Card
          title="Pending"
          value={orders.filter((o) => o.status === "Processing").length}
          helper="In progress"
        />
        <Card
          title="Shipped"
          value={orders.filter((o) => o.status === "Shipped").length}
          helper="On the way"
        />
        <Card
          title="Total Revenue"
          value={`₹${(orders.reduce((sum, o) => sum + parseInt(o.amount.replace("₹", "").replace(",", "")), 0) / 100000).toFixed(1)}L`}
          helper="All orders"
        />
      </div>

      <div className="sales-panel">
        <div className="sales-panel__toolbar">
          <h3 className="sales-panel__title">Orders</h3>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div className="sales-filter-group">
              {["All", "Processing", "Shipped", "Delivered"].map((status) => (
                <button
                  key={status}
                  className={`sales-filter-btn ${filterStatus === status ? "sales-filter-btn--active" : ""}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <button
              className="sales-btn"
              onClick={() => setShowForm(!showForm)}
            >
              + New Order
            </button>
          </div>
        </div>

        {!showForm && (
          <Table
            columns={[
              "Order ID",
              "Customer",
              "Date",
              "Amount",
              "Status",
              "Items",
            ]}
            rows={filtered.map((o) => [
              o.id,
              o.customer,
              o.date,
              o.amount,
              o.status,
              o.items,
            ])}
          />
        )}

        {showForm && (
          <form onSubmit={handleAddOrder} className="sales-form__grid">
            <div className="sales-form__field">
              <label>Customer</label>
              <input
                type="text"
                value={formData.customer}
                onChange={(e) =>
                  setFormData({ ...formData, customer: e.target.value })
                }
                required
              />
            </div>
            <div className="sales-form__field">
              <label>Amount (₹)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
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
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </select>
            </div>
            <div className="sales-form__field">
              <label>Items</label>
              <input
                type="number"
                value={formData.items}
                onChange={(e) =>
                  setFormData({ ...formData, items: e.target.value })
                }
              />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
              <button type="submit" className="sales-btn">
                Create
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
        )}
      </div>
    </div>
  );
}

export default Orders;
