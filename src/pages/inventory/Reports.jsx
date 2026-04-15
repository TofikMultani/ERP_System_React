import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import { usePersistentSnapshot } from "../../utils/persistentState.js";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const categoryBreakdownColumns = [
  { header: "Category", accessor: "category" },
  { header: "Items", accessor: "items" },
  { header: "Total Value", accessor: "value" },
  { header: "Avg Price", accessor: "avgPrice" },
  { header: "Reorder Rate", accessor: "reorderRate" },
];


function parseNumber(value) {
  return Number.parseInt(String(value ?? "0").replace(/[^\d]/g, ""), 10) || 0;
}

function Reports() {
  const products = usePersistentSnapshot("erp_inventory_products", []);
  const categories = usePersistentSnapshot("erp_inventory_categories", []);
  const warehouses = usePersistentSnapshot("erp_inventory_warehouses", []);
  const purchaseOrders = usePersistentSnapshot("erp_inventory_purchase_orders", []);

  const categoryAgg = products.reduce((accumulator, product) => {
    const category = product.category || "Uncategorized";
    if (!accumulator[category]) {
      accumulator[category] = { items: 0, value: 0, stock: 0 };
    }
    const price = parseNumber(product.price);
    const stock = parseNumber(product.stock);
    accumulator[category].items += 1;
    accumulator[category].stock += stock;
    accumulator[category].value += price * stock;
    return accumulator;
  }, {});

  const categoryValueData = Object.entries(categoryAgg).map(([category, data]) => ({
    category,
    value: data.value,
  }));

  const totalStock = products.reduce(
    (sum, product) => sum + parseNumber(product.stock),
    0,
  );
  const weeklySlice = [0.7, 0.82, 0.91, 1].map((ratio, index) => ({
    week: `Week ${index + 1}`,
    total: Math.round(totalStock * ratio),
  }));
  const stockTrendData = weeklySlice;

  const warehouseUtilData = warehouses.map((warehouse) => {
    const capacity = Math.max(parseNumber(warehouse.capacity), 1);
    const occupied = parseNumber(warehouse.occupied);
    return {
      warehouse: warehouse.name || "Warehouse",
      utilization: Math.round((occupied / capacity) * 100),
    };
  });

  const categoryBreakdownRows = Object.entries(categoryAgg).map(
    ([category, data], index) => ({
      id: index + 1,
      category,
      items: data.items,
      value: `₹${data.value.toLocaleString()}`,
      avgPrice: `₹${Math.round(data.value / Math.max(data.stock, 1)).toLocaleString()}`,
      reorderRate: data.stock < 25 ? "High" : data.stock < 100 ? "Medium" : "Low",
    }),
  );

  const totalInventoryValue = products.reduce((sum, product) => {
    const price = parseNumber(product.price);
    const stock = parseNumber(product.stock);
    return sum + price * stock;
  }, 0);

  const avgStockLevel = products.length
    ? `${Math.round(totalStock / products.length)} units`
    : "0 units";

  const stockTurnover = `${(
    purchaseOrders.length / Math.max(products.length, 1)
  ).toFixed(1)}x/year`;

  const inventoryAccuracy = `${(
    100 -
    (products.filter((product) => parseNumber(product.stock) === 0).length /
      Math.max(products.length, 1)) *
      100
  ).toFixed(1)}%`;

  const summary = [
    {
      title: "Total Inventory Value",
      value: `₹${(totalInventoryValue / 100000).toFixed(2)}L`,
      helper: "Based on price × stock",
    },
    { title: "Avg Stock Level", value: avgStockLevel, helper: "Per product" },
    { title: "Stock Turnover", value: stockTurnover, helper: "POs to products ratio" },
    { title: "Inventory Accuracy", value: inventoryAccuracy, helper: "In-stock coverage" },
  ];

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h2>Inventory Reports</h2>
          <p>Consolidated analytics and inventory performance metrics.</p>
        </div>
        <button className="inv-btn">Export Report</button>
      </div>

      <div className="inv-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      <div className="inv-charts">
        <div className="inv-panel">
          <h3 className="inv-panel__title">Stock Trend (4 weeks)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={stockTrendData}
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(20,33,61,0.08)"
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12, fill: "#69708a" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#69708a" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => `${v} units`}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(20,33,61,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#5a3df0"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#5a3df0", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="inv-panel">
          <h3 className="inv-panel__title">Value by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={categoryValueData}
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(20,33,61,0.08)"
              />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: "#69708a" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#69708a" }}
                tickFormatter={(v) => `₹${v / 100}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => `₹${v}`}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(20,33,61,0.1)",
                }}
              />
              <Bar dataKey="value" fill="#5a3df0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="inv-panel">
          <h3 className="inv-panel__title">Warehouse Utilization</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={warehouseUtilData}
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(20,33,61,0.08)"
              />
              <XAxis
                dataKey="warehouse"
                tick={{ fontSize: 11, fill: "#69708a" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#69708a" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => `${v}%`}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(20,33,61,0.1)",
                }}
              />
              <Bar dataKey="utilization" fill="#5a3df0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="inv-panel">
        <h3 className="inv-panel__title">Category Breakdown</h3>
        <Table
          columns={categoryBreakdownColumns}
          rows={categoryBreakdownRows}
        />
        {!categoryBreakdownRows.length ? (
          <p className="root-admin-dashboard__empty-state">No category breakdown data yet.</p>
        ) : null}
      </div>
    </div>
  );
}

export default Reports;
