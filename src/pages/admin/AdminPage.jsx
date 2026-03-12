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

// ── Static data ──────────────────────────────────────────────────────────────

const statCards = [
  { title: "Total Employees", value: "248", helper: "+12 hired this month" },
  { title: "Total Products", value: "1,340", helper: "86 low-stock items" },
  { title: "Total Revenue", value: "$842,500", helper: "+8.4% vs last month" },
  { title: "Open Tickets", value: "37", helper: "14 high-priority" },
];

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

const employeeRows = [
  {
    id: 1,
    name: "Ananya Sharma",
    department: "Engineering",
    role: "Senior Dev",
    joined: "01 Mar 2026",
    status: "Active",
  },
  {
    id: 2,
    name: "Rohan Mehta",
    department: "HR",
    role: "HR Manager",
    joined: "15 Feb 2026",
    status: "Active",
  },
  {
    id: 3,
    name: "Priya Nair",
    department: "Finance",
    role: "Analyst",
    joined: "10 Feb 2026",
    status: "Active",
  },
  {
    id: 4,
    name: "Arjun Patel",
    department: "Sales",
    role: "Sales Lead",
    joined: "05 Jan 2026",
    status: "On Leave",
  },
  {
    id: 5,
    name: "Sneha Joshi",
    department: "IT",
    role: "Sys Admin",
    joined: "20 Jan 2026",
    status: "Active",
  },
];

const orderColumns = [
  { header: "Order ID", accessor: "orderId" },
  { header: "Customer", accessor: "customer" },
  { header: "Amount", accessor: "amount" },
  { header: "Status", accessor: "status" },
  { header: "Date", accessor: "date" },
];

const orderRows = [
  {
    id: 1,
    orderId: "#ORD-1021",
    customer: "Tech Supplies Co.",
    amount: "$4,200",
    status: "Delivered",
    date: "10 Mar 2026",
  },
  {
    id: 2,
    orderId: "#ORD-1020",
    customer: "Global Retail Ltd.",
    amount: "$1,800",
    status: "Processing",
    date: "09 Mar 2026",
  },
  {
    id: 3,
    orderId: "#ORD-1019",
    customer: "NextGen Labs",
    amount: "$9,500",
    status: "Delivered",
    date: "08 Mar 2026",
  },
  {
    id: 4,
    orderId: "#ORD-1018",
    customer: "Horizon Foods",
    amount: "$670",
    status: "Cancelled",
    date: "07 Mar 2026",
  },
  {
    id: 5,
    orderId: "#ORD-1017",
    customer: "Apex Systems",
    amount: "$3,300",
    status: "Pending",
    date: "06 Mar 2026",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRevenue(value) {
  return `$${(value / 1000).toFixed(0)}k`;
}

// ── Component ────────────────────────────────────────────────────────────────

function AdminPage() {
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
