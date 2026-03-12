import { useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialPayments = [
  {
    id: 1,
    date: "2026-03-09",
    vendor: "Office Supplies Co",
    invoiceId: "FIN-INV-001",
    amount: "₹45,000",
    method: "Bank Transfer",
    status: "Completed",
  },
  {
    id: 2,
    date: "2026-03-08",
    vendor: "Services Ltd",
    invoiceId: "FIN-INV-004",
    amount: "₹85,000",
    method: "Check",
    status: "Completed",
  },
  {
    id: 3,
    date: "2026-03-07",
    vendor: "Tech Rentals Inc",
    invoiceId: "FIN-INV-002",
    amount: "₹125,000",
    method: "Credit Card",
    status: "Pending",
  },
  {
    id: 4,
    date: "2026-03-05",
    vendor: "Marketing Agency",
    invoiceId: "INV-005",
    amount: "₹75,000",
    method: "Bank Transfer",
    status: "Completed",
  },
];

function Payments() {
  const [payments, setPayments] = useState(initialPayments);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vendor: "",
    invoiceId: "",
    amount: "",
    method: "Bank Transfer",
  });

  const filtered =
    filterStatus === "All"
      ? payments
      : payments.filter((p) => p.status === filterStatus);

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (formData.vendor.trim() && formData.amount) {
      const newPayment = {
        id: payments.length + 1,
        date: new Date().toISOString().split("T")[0],
        vendor: formData.vendor,
        invoiceId: formData.invoiceId,
        amount: "₹" + formData.amount,
        method: formData.method,
        status: "Pending",
      };
      setPayments([...payments, newPayment]);
      setFormData({
        vendor: "",
        invoiceId: "",
        amount: "",
        method: "Bank Transfer",
      });
      setShowForm(false);
    }
  };

  const totalPaid = payments
    .filter((p) => p.status === "Completed")
    .reduce(
      (sum, p) => sum + parseInt(p.amount.replace("₹", "").replace(",", "")),
      0,
    );
  const totalPending = payments
    .filter((p) => p.status === "Pending")
    .reduce(
      (sum, p) => sum + parseInt(p.amount.replace("₹", "").replace(",", "")),
      0,
    );

  return (
    <div className="finance-page">
      <div className="finance-page__header">
        <div>
          <h2>Payments</h2>
          <p>Manage outgoing payments and payment history</p>
        </div>
      </div>

      <div className="finance-cards">
        <Card
          title="Total Payments"
          value={payments.length}
          helper="On record"
        />
        <Card
          title="Completed"
          value={payments.filter((p) => p.status === "Completed").length}
          helper="Executed"
        />
        <Card
          title="Amount Paid"
          value={"₹" + (totalPaid / 100000).toFixed(2) + "L"}
          helper="Sent out"
        />
        <Card
          title="Pending Payments"
          value={"₹" + (totalPending / 100000).toFixed(2) + "L"}
          helper="To be sent"
        />
      </div>

      <div className="finance-panel">
        <div className="finance-panel__toolbar">
          <h3 className="finance-panel__title">Payment Schedule</h3>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div className="finance-filter-group">
              {["All", "Completed", "Pending"].map((status) => (
                <button
                  key={status}
                  className={`finance-filter-btn ${filterStatus === status ? "finance-filter-btn--active" : ""}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <button
              className="finance-btn"
              onClick={() => setShowForm(!showForm)}
            >
              + Record Payment
            </button>
          </div>
        </div>

        {!showForm && (
          <Table
            columns={[
              "Date",
              "Vendor",
              "Invoice ID",
              "Amount",
              "Method",
              "Status",
            ]}
            rows={filtered.map((p) => [
              p.date,
              p.vendor,
              p.invoiceId,
              p.amount,
              p.method,
              p.status,
            ])}
          />
        )}

        {showForm && (
          <form onSubmit={handleAddPayment} className="finance-form__grid">
            <div className="finance-form__field">
              <label>Vendor Name</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) =>
                  setFormData({ ...formData, vendor: e.target.value })
                }
                required
              />
            </div>
            <div className="finance-form__field">
              <label>Invoice ID</label>
              <input
                type="text"
                value={formData.invoiceId}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceId: e.target.value })
                }
              />
            </div>
            <div className="finance-form__field">
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
            <div className="finance-form__field">
              <label>Payment Method</label>
              <select
                value={formData.method}
                onChange={(e) =>
                  setFormData({ ...formData, method: e.target.value })
                }
              >
                <option>Bank Transfer</option>
                <option>Check</option>
                <option>Cash</option>
                <option>Credit Card</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
              <button type="submit" className="finance-btn">
                Record
              </button>
              <button
                type="button"
                className="finance-btn"
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

export default Payments;
