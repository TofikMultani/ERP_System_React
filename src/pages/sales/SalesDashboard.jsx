import Card from "../../components/Card.jsx";
import { usePersistentSnapshot } from "../../utils/persistentState.js";
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

function parseCurrency(value) {
  return Number.parseInt(String(value ?? "0").replace(/[^\d]/g, ""), 10) || 0;
}

function getMonthLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function SalesDashboard() {
  const customers = usePersistentSnapshot("erp_sales_customers", []);
  const orders = usePersistentSnapshot("erp_sales_orders", []);
  const quotations = usePersistentSnapshot("erp_sales_quotations", []);

  const currentDate = new Date();
  const currentMonthRevenue = orders.reduce((sum, order) => {
    const date = new Date(order.date);
    if (
      Number.isNaN(date.getTime()) ||
      date.getMonth() !== currentDate.getMonth() ||
      date.getFullYear() !== currentDate.getFullYear()
    ) {
      return sum;
    }

    return sum + parseCurrency(order.amount);
  }, 0);

  const monthlyMap = orders.reduce((accumulator, order) => {
    const monthKey = getMonthLabel(order.date);
    if (!monthKey) {
      return accumulator;
    }

    if (!accumulator[monthKey]) {
      accumulator[monthKey] = { month: monthKey, revenue: 0, orders: 0 };
    }

    accumulator[monthKey].revenue += parseCurrency(order.amount);
    accumulator[monthKey].orders += 1;
    return accumulator;
  }, {});

  const monthlyData = Object.values(monthlyMap)
    .sort((left, right) => left.month.localeCompare(right.month))
    .slice(-6)
    .map((item) => ({ ...item, month: item.month.slice(5) }));

  const customerSpendMap = orders.reduce((accumulator, order) => {
    const key = order.customer || "Unknown";
    accumulator[key] = (accumulator[key] || 0) + parseCurrency(order.amount);
    return accumulator;
  }, {});

  const topCustomers = Object.entries(customerSpendMap)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([name, total]) => {
      const customer = customers.find((item) => item.name === name) || {};
      return {
        name,
        phone: customer.phone || "-",
        email: customer.email || "-",
        spent: `₹${total.toLocaleString()}`,
      };
    });

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
          value={`₹${(currentMonthRevenue / 100000).toFixed(2)}L`}
          helper="Saved order revenue"
        />
        <Card
          title="Total Orders"
          value={orders.length}
          helper="Saved orders"
        />
        <Card
          title="Active Customers"
          value={
            customers.filter((customer) => customer.status === "Active").length
          }
          helper="Ongoing relationships"
        />
        <Card
          title="Pending Quotes"
          value={
            quotations.filter((quotation) =>
              ["Pending", "Sent"].includes(quotation.status),
            ).length
          }
          helper="Awaiting response"
        />
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
          {!monthlyData.length ? <p className="root-admin-dashboard__empty-state">No sales trend data yet.</p> : null}
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
          {!monthlyData.length ? <p className="root-admin-dashboard__empty-state">No order trend data yet.</p> : null}
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
