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

const cards = [
  { title: "Total Employees", value: "248", helper: "+12 this month" },
  { title: "Present Today", value: "214", helper: "86.3% attendance" },
  { title: "On Leave", value: "18", helper: "7 pending approvals" },
  { title: "Open Positions", value: "9", helper: "3 urgent roles" },
];

const headcountData = [
  { month: "Jan", count: 224 },
  { month: "Feb", count: 229 },
  { month: "Mar", count: 235 },
  { month: "Apr", count: 238 },
  { month: "May", count: 244 },
  { month: "Jun", count: 248 },
];

const deptData = [
  { dept: "Eng", employees: 74 },
  { dept: "Sales", employees: 48 },
  { dept: "HR", employees: 22 },
  { dept: "Finance", employees: 31 },
  { dept: "IT", employees: 40 },
  { dept: "Support", employees: 33 },
];

const recentColumns = [
  { header: "Name", accessor: "name" },
  { header: "Department", accessor: "dept" },
  { header: "Role", accessor: "role" },
  { header: "Status", accessor: "status" },
];

const recentRows = [
  {
    id: 1,
    name: "Ananya Sharma",
    dept: "Engineering",
    role: "Senior Dev",
    status: "Active",
  },
  {
    id: 2,
    name: "Rohan Mehta",
    dept: "HR",
    role: "HR Manager",
    status: "Active",
  },
  {
    id: 3,
    name: "Priya Nair",
    dept: "Finance",
    role: "Analyst",
    status: "Active",
  },
  {
    id: 4,
    name: "Arjun Patel",
    dept: "Sales",
    role: "Sales Lead",
    status: "On Leave",
  },
  {
    id: 5,
    name: "Sneha Joshi",
    dept: "IT",
    role: "Sys Admin",
    status: "Active",
  },
];

function HRDashboard() {
  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <h2>HR Dashboard</h2>
        <p>Organisation-wide workforce overview.</p>
      </div>

      <div className="hr-cards">
        {cards.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      <div className="hr-charts">
        <div className="hr-panel">
          <h3 className="hr-panel__title">Headcount Growth</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={headcountData}
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(20,33,61,0.08)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#69708a" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#69708a" }}
                axisLine={false}
                tickLine={false}
                domain={[210, 260]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(20,33,61,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#5a3df0"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#5a3df0", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="hr-panel">
          <h3 className="hr-panel__title">Employees by Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={deptData}
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(20,33,61,0.08)"
              />
              <XAxis
                dataKey="dept"
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
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(20,33,61,0.1)",
                }}
              />
              <Bar dataKey="employees" fill="#5a3df0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="hr-panel">
        <h3 className="hr-panel__title">Recent Activity</h3>
        <Table columns={recentColumns} rows={recentRows} />
      </div>
    </div>
  );
}

export default HRDashboard;
