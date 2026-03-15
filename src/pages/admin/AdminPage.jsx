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
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import { usePersistentSnapshot } from "../../utils/persistentState.js";
import { ticketsData } from "../../utils/supportData.js";

// ── Static data ──────────────────────────────────────────────────────────────

const revenueData = [
  { month: "Jan", revenue: 62000 },
  { month: "Feb", revenue: 78000 },
  { month: "Mar", revenue: 91000 },
  { month: "Apr", revenue: 85000 },
  { month: "May", revenue: 105000 },
  { month: "Jun", revenue: 97000 },
];

const ordersData = [
  { month: "Jan", orders: 320 },
  { month: "Feb", orders: 410 },
  { month: "Mar", orders: 375 },
  { month: "Apr", orders: 490 },
  { month: "May", orders: 530 },
  { month: "Jun", orders: 460 },
];

const employeeColumns = [
  { header: "Name", accessor: "name" },
  { header: "Department", accessor: "department" },
  { header: "Role", accessor: "role" },
  { header: "Joined", accessor: "joined" },
  { header: "Status", accessor: "status" },
];

const orderColumns = [
  { header: "Order ID", accessor: "orderId" },
  { header: "Customer", accessor: "customer" },
  { header: "Amount", accessor: "amount" },
  { header: "Status", accessor: "status" },
  { header: "Date", accessor: "date" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRevenue(value) {
  return `$${(value / 1000).toFixed(0)}k`;
}

function parseRupeeAmount(value) {
  return Number.parseInt(String(value).replace(/[^\d]/g, ""), 10) || 0;
}

// ── Component ────────────────────────────────────────────────────────────────

function AdminPage() {
  const employees = usePersistentSnapshot("erp_hr_employees", []);
  const products = usePersistentSnapshot("erp_inventory_products", []);
  const orders = usePersistentSnapshot("erp_sales_orders", []);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseRupeeAmount(order.amount),
    0,
  );
  const openTickets = ticketsData.filter(
    (ticket) => ticket.status !== "resolved",
  ).length;

  const statCards = [
    {
      title: "Total Employees",
      value: employees.length,
      helper: `${employees.filter((employee) => employee.status === "Active").length} active records`,
    },
    {
      title: "Total Products",
      value: products.length,
      helper: `${products.filter((product) => product.status === "Low Stock").length} low-stock items`,
    },
    {
      title: "Total Revenue",
      value: `₹${(totalRevenue / 100000).toFixed(2)}L`,
      helper: `${orders.length} saved sales orders`,
    },
    {
      title: "Open Tickets",
      value: openTickets,
      helper: `${ticketsData.length} tickets in support queue`,
    },
  ];

  const employeeRows = employees
    .slice(-5)
    .reverse()
    .map((employee) => ({
      id: employee.id,
      name: employee.name,
      department: employee.dept,
      role: employee.role,
      joined: employee.joined,
      status: employee.status,
    }));

  const orderRows = orders
    .slice(-5)
    .reverse()
    .map((order) => ({
      id: order.id,
      orderId: order.id,
      customer: order.customer,
      amount: order.amount,
      status: order.status,
      date: order.date,
    }));

  return (
    <div className="admin-dashboard">
      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <section className="admin-dashboard__cards">
        {statCards.map((card) => (
          <Card
            key={card.title}
            title={card.title}
            value={card.value}
            helper={card.helper}
          />
        ))}
      </section>

      {/* ── Charts ─────────────────────────────────────────────── */}
      <section className="admin-dashboard__charts">
        {/* Bar chart — Monthly Revenue */}
        <div className="admin-dashboard__panel">
          <h3 className="admin-dashboard__panel-title">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={revenueData}
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(20,33,61,0.08)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 13, fill: "#69708a" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#69708a" }}
                tickFormatter={formatRevenue}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(20,33,61,0.1)",
                  boxShadow: "0 8px 24px rgba(20,33,61,0.08)",
                }}
              />
              <Bar dataKey="revenue" fill="#5a3df0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart — Monthly Orders */}
        <div className="admin-dashboard__panel">
          <h3 className="admin-dashboard__panel-title">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={ordersData}
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(20,33,61,0.08)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 13, fill: "#69708a" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#69708a" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [v, "Orders"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(20,33,61,0.1)",
                  boxShadow: "0 8px 24px rgba(20,33,61,0.08)",
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#5a3df0"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#5a3df0", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Tables ─────────────────────────────────────────────── */}
      <section className="admin-dashboard__tables">
        <div className="admin-dashboard__panel">
          <h3 className="admin-dashboard__panel-title">Recent Employees</h3>
          <Table columns={employeeColumns} rows={employeeRows} />
        </div>

        <div className="admin-dashboard__panel">
          <h3 className="admin-dashboard__panel-title">Recent Orders</h3>
          <Table columns={orderColumns} rows={orderRows} />
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
