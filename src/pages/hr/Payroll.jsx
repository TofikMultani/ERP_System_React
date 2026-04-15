import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const payrollData = [
  {
    id: 1,
    name: "Ananya Sharma",
    dept: "Engineering",
    basic: "₹5,200",
    hra: "₹1,040",
    allowances: "₹600",
    deductions: "₹420",
    net: "₹6,420",
  },
  {
    id: 2,
    name: "Rohan Mehta",
    dept: "HR",
    basic: "₹4,000",
    hra: "₹800",
    allowances: "₹400",
    deductions: "₹310",
    net: "₹4,890",
  },
  {
    id: 3,
    name: "Priya Nair",
    dept: "Finance",
    basic: "₹4,500",
    hra: "₹900",
    allowances: "₹450",
    deductions: "₹360",
    net: "₹5,490",
  },
  {
    id: 4,
    name: "Arjun Patel",
    dept: "Sales",
    basic: "₹4,800",
    hra: "₹960",
    allowances: "₹700",
    deductions: "₹400",
    net: "₹6,060",
  },
  {
    id: 5,
    name: "Sneha Joshi",
    dept: "IT",
    basic: "₹4,200",
    hra: "₹840",
    allowances: "₹500",
    deductions: "₹350",
    net: "₹5,190",
  },
  {
    id: 6,
    name: "Vikram Singh",
    dept: "Engineering",
    basic: "₹4,600",
    hra: "₹920",
    allowances: "₹550",
    deductions: "₹380",
    net: "₹5,690",
  },
  {
    id: 7,
    name: "Neha Kapoor",
    dept: "Support",
    basic: "₹3,800",
    hra: "₹760",
    allowances: "₹400",
    deductions: "₹300",
    net: "₹4,660",
  },
  {
    id: 8,
    name: "Divya Rao",
    dept: "Finance",
    basic: "₹4,100",
    hra: "₹820",
    allowances: "₹450",
    deductions: "₹330",
    net: "₹5,040",
  },
];

const deptCost = [
  { dept: "Engineering", cost: 48200 },
  { dept: "HR", cost: 28600 },
  { dept: "Finance", cost: 41000 },
  { dept: "Sales", cost: 38400 },
  { dept: "IT", cost: 33800 },
  { dept: "Support", cost: 26200 },
];

const columns = [
  { header: "Employee", accessor: "name" },
  { header: "Department", accessor: "dept" },
  { header: "Basic", accessor: "basic" },
  { header: "HRA", accessor: "hra" },
  { header: "Allowances", accessor: "allowances" },
  { header: "Deductions", accessor: "deductions" },
  { header: "Net Pay", accessor: "net" },
];

function parseCurrency(value) {
  return Number.parseInt(String(value ?? "0").replace(/[^\d]/g, ""), 10) || 0;
}

function Payroll() {
  const totalPayroll = payrollData.reduce(
    (sum, employee) => sum + parseCurrency(employee.net),
    0,
  );
  const avgSalary = payrollData.length
    ? Math.round(totalPayroll / payrollData.length)
    : 0;
  const pendingPayouts = payrollData.filter(
    (employee) => parseCurrency(employee.net) > 0,
  ).length;

  const summary = [
    {
      title: "Total Payroll",
      value: `₹${totalPayroll.toLocaleString()}`,
      helper: "Current cycle",
    },
    {
      title: "Avg Salary",
      value: `₹${avgSalary.toLocaleString()}`,
      helper: "per employee",
    },
    {
      title: "Total Employees",
      value: payrollData.length,
      helper: "on payroll",
    },
    {
      title: "Pending Payouts",
      value: pendingPayouts,
      helper: "to be processed",
    },
  ];

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Payroll</h2>
          <p>March 2026 payroll summary and individual breakdowns.</p>
        </div>
        <button className="hr-btn">Run Payroll</button>
      </div>

      <div className="hr-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      <div className="hr-charts">
        <div className="hr-panel" style={{ gridColumn: "1 / -1" }}>
          <h3 className="hr-panel__title">Payroll Cost by Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={deptCost}
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
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString()}`, "Cost"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(20,33,61,0.1)",
                }}
              />
              <Bar dataKey="cost" fill="#5a3df0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="hr-panel">
        <h3 className="hr-panel__title">Employee Payroll â€” March 2026</h3>
        <Table columns={columns} rows={payrollData} />
      </div>
    </div>
  );
}

export default Payroll;
