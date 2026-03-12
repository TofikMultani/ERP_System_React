import Card from "../../components/Card.jsx";
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

const monthlyData = [
  { month: "January", revenue: 45000, orders: 12 },
  { month: "February", revenue: 67000, orders: 15 },
  { month: "March", revenue: 92500, orders: 18 },
];

const topCustomers = [
  {
    name: "ABC Corporation",
    phone: "+1-555-1001",
    email: "contact@abc.com",
    spent: "₹450,000",
  },
  {
    name: "Premier Solutions",
    phone: "+1-555-1004",
    email: "hello@premier.com",
    spent: "₹380,000",
  },
  {
    name: "XYZ Ltd",
    phone: "+1-555-1002",
    email: "info@xyz.com",
    spent: "₹320,000",
  },
];

function SalesDashboard() {
  return (
    <div className="sales-page">
      <div className="sales-page__header">
        <div>
          <h2>Sales Dashboard</h2>
          <p>Overview of your sales performance and activity</p>
        </div>
      </div>

      <div className="sales-cards">
        <Card
          title="This Month Revenue"
          value="₹92.5K"
          helper="Current month"
        />
        <Card title="Total Orders" value="45" helper="YTD" />
        <Card
          title="Active Customers"
          value="12"
          helper="Ongoing relationships"
        />
        <Card title="Pending Quotes" value="3" helper="Awaiting response" />
      </div>

      <div className="sales-charts">
        <div className="sales-panel">
          <h3 className="sales-panel__title">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#5a3df0" name="Revenue" />
              <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="sales-panel">
          <h3 className="sales-panel__title">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={2}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="sales-panel">
          <h3 className="sales-panel__title">Top Customers</h3>
          <div style={{ display: "grid", gap: "0.8rem" }}>
            {topCustomers.map((customer, index) => (
              <div
                key={index}
                style={{
                  padding: "1rem",
                  borderRadius: "8px",
                  background: "#f8f9ff",
                  borderLeft: "3px solid #5a3df0",
                }}
              >
                <div style={{ fontWeight: "600", color: "var(--color-text)" }}>
                  {customer.name}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--color-text-soft)",
                    marginTop: "0.3rem",
                  }}
                >
                  {customer.email} • {customer.phone}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#5a3df0",
                    marginTop: "0.4rem",
                  }}
                >
                  {customer.spent}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesDashboard;
