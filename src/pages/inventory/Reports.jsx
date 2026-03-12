import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
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

const stockTrendData = [
  { week: "Week 1", total: 6800 },
  { week: "Week 2", total: 7100 },
  { week: "Week 3", total: 7350 },
  { week: "Week 4", total: 7650 },
];

const categoryValueData = [
  { category: "Electronics", value: 1850 },
  { category: "Accessories", value: 650 },
  { category: "Furniture", value: 980 },
  { category: "Lighting", value: 320 },
  { category: "Software", value: 0 },
];

const warehouseUtilData = [
  { warehouse: "Main", utilization: 65 },
  { warehouse: "Secondary", utilization: 62 },
  { warehouse: "Cold Storage", utilization: 65 },
  { warehouse: "Distribution", utilization: 48 },
];

const categoryBreakdownColumns = [
  { header: "Category", accessor: "category" },
  { header: "Items", accessor: "items" },
  { header: "Total Value", accessor: "value" },
  { header: "Avg Price", accessor: "avgPrice" },
  { header: "Reorder Rate", accessor: "reorderRate" },
];

const categoryBreakdownRows = [
  {
    id: 1,
    category: "Electronics",
    items: 3,
    value: "$1,850",
    avgPrice: "$616.67",
    reorderRate: "2x/month",
  },
  {
    id: 2,
    category: "Accessories",
    items: 3,
    value: "$650",
    avgPrice: "$216.67",
    reorderRate: "1x/month",
  },
  {
    id: 3,
    category: "Furniture",
    items: 2,
    value: "$980",
    avgPrice: "$490.00",
    reorderRate: "3x/year",
  },
  {
    id: 4,
    category: "Lighting",
    items: 1,
    value: "$320",
    avgPrice: "$320.00",
    reorderRate: "Never",
  },
];

const summary = [
  {
    title: "Total Inventory Value",
    value: "$3.8M",
    helper: "across all items",
  },
  { title: "Avg Stock Level", value: "76.3 days", helper: "supply on hand" },
  { title: "Stock Turnover", value: "4.7x/year", helper: "annual rotation" },
  { title: "Inventory Accuracy", value: "98.5%", helper: "last count" },
];

function Reports() {
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
                tickFormatter={(v) => `$${v / 100}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => `$${v}`}
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
      </div>
    </div>
  );
}

export default Reports;
