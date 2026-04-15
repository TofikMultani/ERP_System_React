import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import { usePersistentSnapshot } from "../../utils/persistentState.js";
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

const deptSummaryColumns = [
  { header: "Department", accessor: "dept" },
  { header: "Employees", accessor: "total" },
  { header: "Present", accessor: "present" },
  { header: "On Leave", accessor: "onLeave" },
  { header: "Avg Performance", accessor: "perf" },
  { header: "Payroll Cost", accessor: "payroll" },
];


function getMonthLabel(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function Reports() {
  const employees = usePersistentSnapshot("erp_hr_employees", []);
  const leaves = usePersistentSnapshot("erp_hr_leave", []);
  const recruitment = usePersistentSnapshot("erp_hr_recruitment", []);

  const joinMonthMap = employees.reduce((accumulator, employee) => {
    const month = getMonthLabel(employee.joined);
    if (!month) {
      return accumulator;
    }
    accumulator[month] = (accumulator[month] || 0) + 1;
    return accumulator;
  }, {});

  const monthKeys = Object.keys(joinMonthMap)
    .sort((left, right) => left.localeCompare(right))
    .slice(-6);

  let runningCount = 0;
  const headcountTrend = monthKeys.map((month) => {
    runningCount += joinMonthMap[month];
    return { month: month.slice(5), count: runningCount };
  });

  const exitsByMonth = employees
    .filter((employee) => employee.status === "Inactive")
    .reduce((accumulator, employee) => {
      const month = getMonthLabel(employee.joined);
      if (!month) {
        return accumulator;
      }
      accumulator[month] = (accumulator[month] || 0) + 1;
      return accumulator;
    }, {});

  const attritionData = monthKeys.map((month) => ({
    month: month.slice(5),
    exits: exitsByMonth[month] || 0,
  }));

  const leaveDeptMap = leaves.reduce((accumulator, leave) => {
    const dept = leave.dept || "Unknown";
    accumulator[dept] = (accumulator[dept] || 0) + 1;
    return accumulator;
  }, {});

  const deptSummaryRows = Object.entries(
    employees.reduce((accumulator, employee) => {
      const dept = employee.dept || "Unknown";
      if (!accumulator[dept]) {
        accumulator[dept] = {
          id: dept,
          dept,
          total: 0,
          present: 0,
          onLeave: 0,
          perf: "0.0",
          payroll: "₹0",
        };
      }
      accumulator[dept].total += 1;
      if (employee.status === "Active") {
        accumulator[dept].present += 1;
      }
      return accumulator;
    }, {}),
  ).map(([, row]) => ({
    ...row,
    onLeave: leaveDeptMap[row.dept] || 0,
    perf: row.total ? ((row.present / row.total) * 100).toFixed(1) : "0.0",
    payroll: `₹${(row.total * 18000).toLocaleString()}`,
  }));

  const headcount = employees.length;
  const inactiveCount = employees.filter(
    (employee) => employee.status === "Inactive",
  ).length;
  const attritionRate = headcount
    ? `${((inactiveCount / headcount) * 100).toFixed(1)}%`
    : "0.0%";
  const activeCount = employees.filter((employee) => employee.status === "Active").length;
  const avgAttendance = headcount
    ? `${((activeCount / headcount) * 100).toFixed(1)}%`
    : "0.0%";
  const totalPayroll = `₹${(headcount * 18000).toLocaleString()}`;

  const summary = [
    { title: "Headcount", value: String(headcount), helper: "Current employees" },
    {
      title: "Attrition Rate",
      value: attritionRate,
      helper: `${inactiveCount} inactive records`,
    },
    { title: "Avg Attendance", value: avgAttendance, helper: "Active status ratio" },
    { title: "Total Payroll", value: totalPayroll, helper: "Estimated monthly" },
  ];

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
        {!deptSummaryRows.length ? (
          <p className="root-admin-dashboard__empty-state">No department summary data yet.</p>
        ) : null}
      </div>
    </div>
  );
}

export default Reports;
