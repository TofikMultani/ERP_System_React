import { useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import { deleteRowById } from "../../utils/tableActions.js";

const initialStock = [
  {
    id: 1,
    product: "Laptop Pro 15",
    sku: "LP-001",
    onHand: 24,
    reorderLevel: 10,
    reorderQty: 15,
    warehouse: "Main",
    lastUpdated: "13 Mar 2026",
  },
  {
    id: 2,
    product: "USB-C Cable",
    sku: "USB-002",
    onHand: 450,
    reorderLevel: 100,
    reorderQty: 200,
    warehouse: "Main",
    lastUpdated: "13 Mar 2026",
  },
  {
    id: 3,
    product: "Wireless Mouse",
    sku: "MOU-003",
    onHand: 78,
    reorderLevel: 20,
    reorderQty: 50,
    warehouse: "Secondary",
    lastUpdated: "12 Mar 2026",
  },
  {
    id: 4,
    product: 'Monitor 27" 4K',
    sku: "MON-004",
    onHand: 12,
    reorderLevel: 15,
    reorderQty: 20,
    warehouse: "Main",
    lastUpdated: "10 Mar 2026",
  },
  {
    id: 5,
    product: "Mechanical Keyboard",
    sku: "KEY-005",
    onHand: 5,
    reorderLevel: 10,
    reorderQty: 30,
    warehouse: "Main",
    lastUpdated: "13 Mar 2026",
  },
  {
    id: 6,
    product: "Desk Lamp LED",
    sku: "LAMP-006",
    onHand: 0,
    reorderLevel: 10,
    reorderQty: 25,
    warehouse: "Main",
    lastUpdated: "09 Mar 2026",
  },
  {
    id: 7,
    product: "Office Chair Mesh",
    sku: "CHAIR-007",
    onHand: 8,
    reorderLevel: 15,
    reorderQty: 10,
    warehouse: "Main",
    lastUpdated: "11 Mar 2026",
  },
  {
    id: 8,
    product: "Standing Desk",
    sku: "DESK-008",
    onHand: 3,
    reorderLevel: 5,
    reorderQty: 5,
    warehouse: "Secondary",
    lastUpdated: "13 Mar 2026",
  },
];

const columns = [
  { header: "Product", accessor: "product" },
  { header: "SKU", accessor: "sku" },
  { header: "On Hand", accessor: "onHand" },
  { header: "Reorder Level", accessor: "reorderLevel" },
  { header: "Reorder Qty", accessor: "reorderQty" },
  { header: "Warehouse", accessor: "warehouse" },
  { header: "Last Updated", accessor: "lastUpdated" },
];

function Stock() {
  const [stockRows, setStockRows] = useState(initialStock);
  const [filterWarehouse, setFilterWarehouse] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    product: "",
    sku: "",
    onHand: "",
    reorderLevel: "",
    reorderQty: "",
    warehouse: "Main",
    lastUpdated: "",
  });

  const filtered =
    filterWarehouse === "All"
      ? stockRows
      : stockRows.filter((s) => s.warehouse === filterWarehouse);

  const lowStockAlerts = stockRows.filter((s) => s.onHand <= s.reorderLevel);
  const outOfStockCount = stockRows.filter((s) => s.onHand === 0).length;
  const totalUnits = stockRows.reduce((sum, row) => sum + Number(row.onHand || 0), 0);

  const summary = [
    {
      title: "Total Stock Items",
      value: stockRows.length,
      helper: "products tracked",
    },
    {
      title: "Low Stock Alert",
      value: lowStockAlerts.length,
      helper: "below reorder level",
    },
    {
      title: "Out of Stock",
      value: outOfStockCount,
      helper: "requires immediate reorder",
    },
    {
      title: "Total Units On Hand",
      value: totalUnits,
      helper: "inventory quantity",
    },
  ];

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      product: row.product || "",
      sku: row.sku || "",
      onHand: String(row.onHand ?? ""),
      reorderLevel: String(row.reorderLevel ?? ""),
      reorderQty: String(row.reorderQty ?? ""),
      warehouse: row.warehouse || "Main",
      lastUpdated: row.lastUpdated || "",
    });
    setShowForm(true);
  };
  const handleDelete = (row) => deleteRowById(setStockRows, row, "stock item");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId === null) {
      return;
    }

    setStockRows((previousRows) =>
      previousRows.map((item) =>
        String(item.id) === String(editingId)
          ? {
              ...item,
              product: form.product,
              sku: form.sku,
              onHand: Number.parseInt(form.onHand, 10) || 0,
              reorderLevel: Number.parseInt(form.reorderLevel, 10) || 0,
              reorderQty: Number.parseInt(form.reorderQty, 10) || 0,
              warehouse: form.warehouse,
              lastUpdated: form.lastUpdated,
            }
          : item,
      ),
    );

    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h2>Stock Levels</h2>
          <p>Real-time inventory stock status and reorder management.</p>
        </div>
        <button className="inv-btn">Update Stock</button>
      </div>

      <div className="inv-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      {lowStockAlerts.length > 0 && (
        <div className="inv-panel inv-panel--alert">
          <h3 className="inv-panel__title">
            ⚠ Low Stock Alerts ({lowStockAlerts.length})
          </h3>
          <div className="inv-alert-list">
            {lowStockAlerts.map((item) => (
              <div key={item.id} className="inv-alert-item">
                <strong>{item.product}</strong> - Only {item.onHand} units on
                hand (reorder at {item.reorderLevel})
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <form className="inv-form inv-panel" onSubmit={handleSubmit}>
          <h3 className="inv-panel__title">Edit Stock Item</h3>
          <div className="inv-form__grid">
            <div className="inv-form__field">
              <label>Product</label>
              <input
                value={form.product}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, product: e.target.value }))
                }
                required
              />
            </div>
            <div className="inv-form__field">
              <label>SKU</label>
              <input
                value={form.sku}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sku: e.target.value }))
                }
                required
              />
            </div>
            <div className="inv-form__field">
              <label>On Hand</label>
              <input
                type="number"
                value={form.onHand}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, onHand: e.target.value }))
                }
              />
            </div>
            <div className="inv-form__field">
              <label>Reorder Level</label>
              <input
                type="number"
                value={form.reorderLevel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, reorderLevel: e.target.value }))
                }
              />
            </div>
            <div className="inv-form__field">
              <label>Reorder Qty</label>
              <input
                type="number"
                value={form.reorderQty}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, reorderQty: e.target.value }))
                }
              />
            </div>
            <div className="inv-form__field">
              <label>Warehouse</label>
              <select
                value={form.warehouse}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, warehouse: e.target.value }))
                }
              >
                <option>Main</option>
                <option>Secondary</option>
              </select>
            </div>
            <div className="inv-form__field">
              <label>Last Updated</label>
              <input
                value={form.lastUpdated}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lastUpdated: e.target.value }))
                }
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.8rem" }}>
            <button type="submit" className="inv-btn">
              Save
            </button>
            <button
              type="button"
              className="inv-btn"
              onClick={() => {
                setEditingId(null);
                setShowForm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="inv-panel">
        <div className="inv-panel__toolbar">
          <h3 className="inv-panel__title">Stock Inventory</h3>
          <div className="inv-filter-group">
            {["All", "Main", "Secondary"].map((w) => (
              <button
                key={w}
                className={`inv-filter-btn${filterWarehouse === w ? " inv-filter-btn--active" : ""}`}
                onClick={() => setFilterWarehouse(w)}
              >
                {w}
              </button>
            ))}
          </div>
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

export default Stock;
