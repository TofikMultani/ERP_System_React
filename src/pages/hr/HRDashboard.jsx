import { useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import { usePersistentSnapshot } from "../../utils/persistentState.js";
import { fetchEmployees, fetchLeaves } from "../../utils/adminApi.js";
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

const recentColumns = [
  { header: "Name", accessor: "name" },
  { header: "Department", accessor: "dept" },
  { header: "Role", accessor: "role" },
  { header: "Status", accessor: "status" },
];

function HRDashboard() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const recruitment = usePersistentSnapshot("erp_hr_recruitment", []);

  useEffect(() => {
    async function loadDashboardData() {
      setErrorMessage("");

      try {
        const [employeeRows, leaveRows] = await Promise.all([
          fetchEmployees(),
          fetchLeaves(),
        ]);

        setEmployees(Array.isArray(employeeRows) ? employeeRows : []);
        setLeaves(Array.isArray(leaveRows) ? leaveRows : []);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load dashboard data from database.");
      }
    }

    loadDashboardData();
  }, []);

  const joinMonthMap = employees.reduce((accumulator, employee) => {
    const month = getMonthLabel(employee.joined || employee.applied);
    if (!month) {
      return accumulator;
    }
    accumulator[month] = (accumulator[month] || 0) + 1;
    return accumulator;
  }, {});

  let runningHeadcount = 0;
  const headcountData = Object.keys(joinMonthMap)
    .sort((left, right) => left.localeCompare(right))
    .slice(-6)
    .map((month) => {
      runningHeadcount += joinMonthMap[month];
      return { month: month.slice(5), count: runningHeadcount };
    });

  const cards = [
    {
      title: "Total Employees",
      value: employees.length,
      helper: `${employees.filter((employee) => employee.status === "Active").length} active employees`,
    },
    {
      title: "Present Today",
      value: employees.filter((employee) => employee.status === "Active")
        .length,
      helper: `${employees.length ? ((employees.filter((employee) => employee.status === "Active").length / employees.length) * 100).toFixed(1) : "0.0"}% active status`,
    },
    {
      title: "On Leave",
      value: leaves.filter(
        (leave) => leave.status === "Pending" || leave.status === "Approved",
      ).length,
      helper: `${leaves.filter((leave) => leave.status === "Pending").length} pending approvals`,
    },
    {
      title: "Open Positions",
      value: recruitment.filter(
        (candidate) => candidate.status === "In Progress",
      ).length,
      helper: `${recruitment.filter((candidate) => candidate.status === "Selected").length} selected candidates`,
    },
  ];

  const deptCounts = employees.reduce((accumulator, employee) => {
    const key = employee.dept || "Unknown";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const deptData = Object.entries(deptCounts).map(([dept, count]) => ({
    dept: dept.length > 10 ? dept.slice(0, 10) : dept,
    employees: count,
  }));

  const recentRows = employees
    .slice(-5)
    .reverse()
    .map((employee) => ({
      id: employee.id,
      name: employee.name,
      dept: employee.dept,
      role: employee.role,
      status: employee.status,
    }));

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <h2>HR Dashboard</h2>
        <p>Organisation-wide workforce overview.</p>
      </div>

      {errorMessage ? <p className="hr-inline-error">{errorMessage}</p> : null}

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
            {!headcountData.length ? (
              <p className="root-admin-dashboard__empty-state">No headcount trend data yet.</p>
            ) : null}
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
          {!deptData.length ? (
            <p className="root-admin-dashboard__empty-state">No department data yet.</p>
          ) : null}
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
