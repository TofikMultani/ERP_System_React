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

const headcountTrend = [
  { month: "Oct", count: 220 },
  { month: "Nov", count: 225 },
  { month: "Dec", count: 228 },
  { month: "Jan", count: 232 },
  { month: "Feb", count: 240 },
  { month: "Mar", count: 248 },
];

const attritionData = [
  { month: "Oct", exits: 2 },
  { month: "Nov", exits: 1 },
  { month: "Dec", exits: 3 },
  { month: "Jan", exits: 2 },
  { month: "Feb", exits: 4 },
  { month: "Mar", exits: 1 },
];

const deptSummaryColumns = [
  { header: "Department", accessor: "dept" },
  { header: "Employees", accessor: "total" },
  { header: "Present", accessor: "present" },
  { header: "On Leave", accessor: "onLeave" },
  { header: "Avg Performance", accessor: "perf" },
  { header: "Payroll Cost", accessor: "payroll" },
];

const deptSummaryRows = [
  {
    id: 1,
    dept: "Engineering",
    total: 74,
    present: 68,
    onLeave: 4,
    perf: "87.4",
    payroll: "₹48,200",
  },
  {
    id: 2,
    dept: "HR",
    total: 22,
    present: 21,
    onLeave: 1,
    perf: "80.3",
    payroll: "₹28,600",
  },
  {
    id: 3,
    dept: "Finance",
    total: 31,
    present: 29,
    onLeave: 2,
    perf: "86.0",
    payroll: "₹41,000",
  },
  {
    id: 4,
    dept: "Sales",
    total: 48,
    present: 42,
    onLeave: 5,
    perf: "72.4",
    payroll: "₹38,400",
  },
  {
    id: 5,
    dept: "IT",
    total: 40,
    present: 38,
    onLeave: 2,
    perf: "89.5",
    payroll: "₹33,800",
  },
  {
    id: 6,
    dept: "Support",
    total: 33,
    present: 31,
    onLeave: 2,
    perf: "83.5",
    payroll: "₹26,200",
  },
];

const summary = [
  { title: "Headcount", value: "248", helper: "+12 from last month" },
  { title: "Attrition Rate", value: "1.2%", helper: "6 exits this quarter" },
  { title: "Avg Attendance", value: "86.3%", helper: "this month" },
  { title: "Total Payroll", value: "₹216k", helper: "March 2026" },
];

function Reports() {
  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Reports</h2>
          <p>Consolidated HR analytics and department-level summaries.</p>
        </div>
        <button className="hr-btn">Export Report</button>
      </div>

      <div className="hr-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      <div className="hr-charts">
        <div className="hr-panel">
          <h3 className="hr-panel__title">Headcount Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={headcountTrend}
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
          <h3 className="hr-panel__title">Monthly Exits (Attrition)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={attritionData}
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
              />
              <Tooltip
                formatter={(v) => [v, "Exits"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(20,33,61,0.1)",
                }}
              />
              <Bar dataKey="exits" fill="#d14343" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="hr-panel">
        <h3 className="hr-panel__title">Department Summary</h3>
        <Table columns={deptSummaryColumns} rows={deptSummaryRows} />
      </div>
    </div>
  );
}

export default Reports;
