import { useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

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

const summary = [
  { title: "Total Stock Items", value: "8", helper: "products tracked" },
  { title: "Low Stock Alert", value: "4", helper: "below reorder level" },
  { title: "Out of Stock", value: "1", helper: "requires immediate reorder" },
  { title: "Total Value", value: "$4.2M", helper: "inventory value" },
];

const lowStockAlerts = initialStock.filter((s) => s.onHand <= s.reorderLevel);

function Stock() {
  const [filterWarehouse, setFilterWarehouse] = useState("All");

  const filtered =
    filterWarehouse === "All"
      ? initialStock
      : initialStock.filter((s) => s.warehouse === filterWarehouse);

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
                <strong>{item.product}</strong> — Only {item.onHand} units on
                hand (reorder at {item.reorderLevel})
              </div>
            ))}
          </div>
        </div>
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
        <Table columns={columns} rows={filtered} />
      </div>
    </div>
  );
}

export default Stock;
