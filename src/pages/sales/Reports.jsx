import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 65000, orders: 12 },
  { month: "Feb", revenue: 78000, orders: 15 },
  { month: "Mar", revenue: 92500, orders: 18 },
];

const customerAcquisitionData = [
  { week: "Week 1", customers: 5, revenue: 45000 },
  { week: "Week 2", customers: 3, revenue: 32000 },
  { week: "Week 3", customers: 7, revenue: 58000 },
  { week: "Week 4", customers: 4, revenue: 42500 },
];

const summaryRows = [
  ["ABC Corporation", "15 orders", "₹450,000", "Active"],
  ["Premier Solutions", "10 orders", "₹380,000", "Active"],
  ["XYZ Ltd", "8 orders", "₹320,000", "Active"],
  ["Global Tech", "5 orders", "₹180,000", "Inactive"],
];

function SalesReports() {
  return (
    <div className="sales-page">
      <div className="sales-page__header">
        <div>
          <h2>Reports</h2>
          <p>Sales analytics and performance metrics</p>
        </div>
      </div>

      <div className="sales-cards">
        <Card title="Total Revenue" value="₹23.25L" helper="YTD" />
        <Card title="Total Orders" value="45" helper="This year" />
        <Card title="Active Customers" value="12" helper="Ongoing" />
        <Card title="Avg Order Value" value="₹51.6K" helper="Per order" />
      </div>

      <div className="sales-charts">
        <div className="sales-panel">
          <h3 className="sales-panel__title">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#5a3df0"
                strokeWidth={2}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="sales-panel">
          <h3 className="sales-panel__title">Customer Acquisition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerAcquisitionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Bar
                yAxisId="right"
                dataKey="customers"
                fill="#10b981"
                name="New Customers"
              />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                fill="#5a3df0"
                name="Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="sales-panel">
        <h3 className="sales-panel__title">Top Customers</h3>
        <Table
          columns={["Customer", "Orders", "Revenue", "Status"]}
          rows={summaryRows}
        />
      </div>
    </div>
  );
}

export default SalesReports;
