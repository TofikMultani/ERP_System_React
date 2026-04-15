import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
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

function getWeekBucket(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `Week ${Math.ceil(date.getDate() / 7)}`;
}

function SalesReports() {
  const customers = usePersistentSnapshot("erp_sales_customers", []);
  const orders = usePersistentSnapshot("erp_sales_orders", []);

  const monthMap = orders.reduce((accumulator, order) => {
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

  const revenueData = Object.values(monthMap)
    .sort((left, right) => left.month.localeCompare(right.month))
    .slice(-6)
    .map((item) => ({ ...item, month: item.month.slice(5) }));

  const current = new Date();
  const weeklyMap = orders
    .filter((order) => {
      const date = new Date(order.date);
      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === current.getMonth() &&
        date.getFullYear() === current.getFullYear()
      );
    })
    .reduce((accumulator, order) => {
      const week = getWeekBucket(order.date);
      if (!week) {
        return accumulator;
      }

      if (!accumulator[week]) {
        accumulator[week] = { week, customers: 0, revenue: 0 };
      }

      accumulator[week].customers += 1;
      accumulator[week].revenue += parseCurrency(order.amount);
      return accumulator;
    }, {});

  const customerAcquisitionData = Object.values(weeklyMap).sort((left, right) =>
    left.week.localeCompare(right.week),
  );

  const customerOrderMap = orders.reduce((accumulator, order) => {
    const name = order.customer || "Unknown";
    if (!accumulator[name]) {
      accumulator[name] = { orders: 0, revenue: 0 };
    }
    accumulator[name].orders += 1;
    accumulator[name].revenue += parseCurrency(order.amount);
    return accumulator;
  }, {});

  const summaryRows = Object.entries(customerOrderMap)
    .sort((left, right) => right[1].revenue - left[1].revenue)
    .slice(0, 8)
    .map(([name, metrics]) => {
      const customer = customers.find((item) => item.name === name) || {};
      return [
        name,
        `${metrics.orders} orders`,
        `₹${metrics.revenue.toLocaleString()}`,
        customer.status || "Active",
      ];
    });

  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseCurrency(order.amount),
    0,
  );
  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active",
  ).length;

  return (
    <div className="sales-page">
      <div className="sales-page__header">
        <div>
          <h2>Reports</h2>
          <p>Sales analytics and performance metrics</p>
        </div>
      </div>

      <div className="sales-cards">
        <Card
          title="Total Revenue"
          value={`₹${(totalRevenue / 100000).toFixed(2)}L`}
          helper="From saved orders"
        />
        <Card title="Total Orders" value={orders.length} helper="All records" />
        <Card
          title="Active Customers"
          value={activeCustomers}
          helper="Current customer base"
        />
        <Card
          title="Avg Order Value"
          value={`₹${Math.round(totalRevenue / Math.max(orders.length, 1)).toLocaleString()}`}
          helper="Per order"
        />
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
        {!summaryRows.length ? (
          <p className="root-admin-dashboard__empty-state">No customer report data yet.</p>
        ) : null}
      </div>
    </div>
  );
}

export default SalesReports;
