import { useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialInvoices = [
  {
    id: "FIN-INV-001",
    vendor: "Office Supplies Co",
    date: "2026-03-05",
    dueDate: "2026-03-20",
    amount: "₹45,000",
    status: "Paid",
  },
  {
    id: "FIN-INV-002",
    vendor: "Tech Rentals Inc",
    date: "2026-03-08",
    dueDate: "2026-03-23",
    amount: "₹125,000",
    status: "Pending",
  },
  {
    id: "FIN-INV-003",
    vendor: "Utilities Provider",
    date: "2026-03-01",
    dueDate: "2026-03-15",
    amount: "₹35,000",
    status: "Overdue",
  },
  {
    id: "FIN-INV-004",
    vendor: "Services Ltd",
    date: "2026-03-07",
    dueDate: "2026-03-22",
    amount: "₹85,000",
    status: "Paid",
  },
];

function Invoices() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vendor: "",
    amount: "",
    dueDate: "",
  });

  const filtered =
    filterStatus === "All"
      ? invoices
      : invoices.filter((i) => i.status === filterStatus);

  const handleAddInvoice = (e) => {
    e.preventDefault();
    if (formData.vendor.trim() && formData.amount) {
      const newInvoice = {
        id: `FIN-INV-${String(invoices.length + 1).padStart(3, "0")}`,
        vendor: formData.vendor,
        date: new Date().toISOString().split("T")[0],
        dueDate: formData.dueDate,
        amount: "₹" + formData.amount,
        status: "Pending",
      };
      setInvoices([...invoices, newInvoice]);
      setFormData({ vendor: "", amount: "", dueDate: "" });
      setShowForm(false);
    }
  };

  const totalAmount = invoices.reduce(
    (sum, i) => sum + parseInt(i.amount.replace("₹", "").replace(",", "")),
    0,
  );
  const paidAmount = invoices
    .filter((i) => i.status === "Paid")
    .reduce(
      (sum, i) => sum + parseInt(i.amount.replace("₹", "").replace(",", "")),
      0,
    );

  return (
    <div className="finance-page">
      <div className="finance-page__header">
        <div>
          <h2>Vendor Invoices</h2>
          <p>Track and manage vendor payment obligations</p>
        </div>
      </div>

      <div className="finance-cards">
        <Card
          title="Total Invoices"
          value={invoices.length}
          helper="On record"
        />
        <Card
          title="Paid"
          value={invoices.filter((i) => i.status === "Paid").length}
          helper="Completed"
        />
        <Card
          title="Pending"
          value={invoices.filter((i) => i.status === "Pending").length}
          helper="Awaiting"
        />
        <Card
          title="Overdue"
          value={invoices.filter((i) => i.status === "Overdue").length}
          helper="Past due"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="finance-panel">
          <h4
            style={{
              margin: "0 0 0.5rem",
              fontSize: "0.9rem",
              color: "var(--color-text-soft)",
            }}
          >
            Total Payable
          </h4>
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "var(--color-text)",
            }}
          >
            ₹{(totalAmount / 100000).toFixed(2)}L
          </div>
        </div>
        <div className="finance-panel">
          <h4
            style={{
              margin: "0 0 0.5rem",
              fontSize: "0.9rem",
              color: "var(--color-text-soft)",
            }}
          >
            Already Paid
          </h4>
          <div
            style={{ fontSize: "1.8rem", fontWeight: "700", color: "#10b981" }}
          >
            ₹{(paidAmount / 100000).toFixed(2)}L
          </div>
        </div>
      </div>

      <div className="finance-panel">
        <div className="finance-panel__toolbar">
          <h3 className="finance-panel__title">Invoices</h3>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div className="finance-filter-group">
              {["All", "Paid", "Pending", "Overdue"].map((status) => (
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
              + New Invoice
            </button>
          </div>
        </div>

        {!showForm && (
          <Table
            columns={[
              "Invoice ID",
              "Vendor",
              "Date",
              "Due Date",
              "Amount",
              "Status",
            ]}
            rows={filtered.map((i) => [
              i.id,
              i.vendor,
              i.date,
              i.dueDate,
              i.amount,
              i.status,
            ])}
          />
        )}

        {showForm && (
          <form onSubmit={handleAddInvoice} className="finance-form__grid">
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
              <label>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
              />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
              <button type="submit" className="finance-btn">
                Add Invoice
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

export default Invoices;
