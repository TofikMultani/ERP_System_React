import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialQuotations = [
  {
    id: "QT-001",
    customer: "ABC Corporation",
    date: "2026-03-08",
    expiryDate: "2026-04-08",
    amount: "₹120,000",
    status: "Approved",
    conversion: "Converted",
  },
  {
    id: "QT-002",
    customer: "Global Tech",
    date: "2026-03-07",
    expiryDate: "2026-04-07",
    amount: "₹85,000",
    status: "Pending",
    conversion: "-",
  },
  {
    id: "QT-003",
    customer: "New Client Inc",
    date: "2026-03-05",
    expiryDate: "2026-04-05",
    amount: "₹200,000",
    status: "Sent",
    conversion: "-",
  },
  {
    id: "QT-004",
    customer: "XYZ Ltd",
    date: "2026-02-28",
    expiryDate: "2026-03-28",
    amount: "₹65,000",
    status: "Expired",
    conversion: "-",
  },
  {
    id: "QT-005",
    customer: "Premier Solutions",
    date: "2026-03-06",
    expiryDate: "2026-04-06",
    amount: "₹150,000",
    status: "Approved",
    conversion: "Pending",
  },
];

function Quotations() {
  const [quotations, setQuotations] = usePersistentState(
    "erp_sales_quotations",
    initialQuotations,
  );
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    customer: "",
    amount: "",
    days: "30",
  });

  const filtered =
    filterStatus === "All"
      ? quotations
      : quotations.filter((q) => q.status === filterStatus);

  const handleEdit = (_, rowIndex) => {
    const targetRow = filtered[rowIndex];
    if (targetRow) {
      const createdDate = new Date(targetRow.date || new Date());
      const expiryDate = new Date(targetRow.expiryDate || createdDate);
      const days = Math.max(
        1,
        Math.round((expiryDate - createdDate) / (1000 * 60 * 60 * 24)),
      );

      setEditingId(targetRow.id);
      setFormData({
        customer: targetRow.customer || "",
        amount: String(targetRow.amount || "").replace(/[^\d]/g, ""),
        days: String(days || 30),
      });
      setShowForm(true);
    }
  };

  const handleDelete = (_, rowIndex) => {
    const targetRow = filtered[rowIndex];
    if (targetRow) {
      deleteRowById(setQuotations, targetRow, "quotation");
    }
  };

  const handleAddQuotation = (e) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    if (!validateFormWithInlineErrors(formElement)) {
      return;
    }
    if (formData.customer.trim() && formData.amount) {
      const dayCount = parseInt(formData.days, 10) || 30;

      if (editingId !== null) {
        setQuotations((previousRows) =>
          previousRows.map((item) => {
            if (String(item.id) !== String(editingId)) {
              return item;
            }

            const baseDate = new Date(item.date || new Date());
            const nextExpiryDate = new Date(baseDate);
            nextExpiryDate.setDate(nextExpiryDate.getDate() + dayCount);

            return {
              ...item,
              customer: formData.customer,
              amount: "₹" + formData.amount,
              expiryDate: nextExpiryDate.toISOString().split("T")[0],
            };
          }),
        );
      } else {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + dayCount);
        const newQuote = {
          id: `QT-${String(quotations.length + 1).padStart(3, "0")}`,
          customer: formData.customer,
          date: new Date().toISOString().split("T")[0],
          expiryDate: expiryDate.toISOString().split("T")[0],
          amount: "₹" + formData.amount,
          status: "Sent",
          conversion: "-",
        };
        setQuotations([...quotations, newQuote]);
      }

      setFormData({ customer: "", amount: "", days: "30" });
      setEditingId(null);
      setShowForm(false);
    }
  };

  return (
    <div className="sales-page">
      <div className="sales-page__header">
        <div>
          <h2>Quotations</h2>
          <p>Manage sales quotes and conversions</p>
        </div>
      </div>

      <div className="sales-cards">
        <Card
          title="Total Quotations"
          value={quotations.length}
          helper="All time"
        />
        <Card
          title="Pending Review"
          value={quotations.filter((q) => q.status === "Pending").length}
          helper="Awaiting approval"
        />
        <Card
          title="Approved"
          value={quotations.filter((q) => q.status === "Approved").length}
          helper="Ready to convert"
        />
        <Card
          title="Converted"
          value={quotations.filter((q) => q.conversion === "Converted").length}
          helper="Orders created"
        />
      </div>

      <div className="sales-panel">
        <div className="sales-panel__toolbar">
          <h3 className="sales-panel__title">Quotations</h3>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div className="sales-filter-group">
              {["All", "Sent", "Pending", "Approved", "Expired"].map(
                (status) => (
                  <button
                    key={status}
                    className={`sales-filter-btn ${filterStatus === status ? "sales-filter-btn--active" : ""}`}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status}
                  </button>
                ),
              )}
            </div>
            <button
              className="sales-btn"
              onClick={() => setShowForm(!showForm)}
            >
              + New Quote
            </button>
          </div>
        </div>

        {!showForm && (
          <Table
            columns={[
              "Quote ID",
              "Customer",
              "Date",
              "Expiry Date",
              "Amount",
              "Status",
              "Conversion",
            ]}
            rows={filtered.map((q) => [
              q.id,
              q.customer,
              q.date,
              q.expiryDate,
              q.amount,
              q.status,
              q.conversion,
            ])}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showForm && (
          <form
            onSubmit={handleAddQuotation}
            className="sales-form__grid"
            noValidate
            onChange={handleFormFieldValidation}
          >
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
              <label>Valid For (Days)</label>
              <input
                type="number"
                value={formData.days}
                onChange={(e) =>
                  setFormData({ ...formData, days: e.target.value })
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

export default Quotations;
