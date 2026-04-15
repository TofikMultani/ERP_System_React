import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import {
  fetchEmployees,
  fetchLeaves,
  fetchPayrollRecords,
  fetchRecruitmentCandidates,
  fetchTrainingPrograms,
} from "../../utils/adminApi.js";
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
  { header: "Utilization", accessor: "utilization" },
  { header: "Payroll Cost", accessor: "payroll" },
];

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value) {
  return `₹${toNumber(value).toLocaleString()}`;
}

function getLatestPayMonth(records) {
  const months = records
    .map((record) => String(record.payMonth || "").trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));

  return months.length ? months[months.length - 1] : "";
}

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
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [recruitmentCandidates, setRecruitmentCandidates] = useState([]);
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadReportsData();
  }, []);

  async function loadReportsData() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [
        employeeRows,
        leaveRows,
        payrollRows,
        recruitmentRows,
        trainingRows,
      ] = await Promise.all([
        fetchEmployees(),
        fetchLeaves(),
        fetchPayrollRecords(),
        fetchRecruitmentCandidates(),
        fetchTrainingPrograms(),
      ]);

      setEmployees(Array.isArray(employeeRows) ? employeeRows : []);
      setLeaves(Array.isArray(leaveRows) ? leaveRows : []);
      setPayrollRecords(Array.isArray(payrollRows) ? payrollRows : []);
      setRecruitmentCandidates(Array.isArray(recruitmentRows) ? recruitmentRows : []);
      setTrainingPrograms(Array.isArray(trainingRows) ? trainingRows : []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to generate HR reports from database data.");
    } finally {
      setIsLoading(false);
    }
  }

  const reportData = useMemo(() => {
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
      .filter((employee) => String(employee.status || "").toLowerCase() === "inactive")
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

    const activeLeaveStatuses = new Set(["pending", "approved"]);
    const leaveDeptMap = leaves.reduce((accumulator, leave) => {
      const status = String(leave.status || "").toLowerCase();
      if (!activeLeaveStatuses.has(status)) {
        return accumulator;
      }

      const dept = String(leave.dept || "Unknown").trim() || "Unknown";
      accumulator[dept] = (accumulator[dept] || 0) + 1;
      return accumulator;
    }, {});

    const latestPayMonth = getLatestPayMonth(payrollRecords);
    const payrollByDepartment = payrollRecords.reduce((accumulator, record) => {
      if (latestPayMonth && String(record.payMonth || "") !== latestPayMonth) {
        return accumulator;
      }

      const dept = String(record.department || "Unknown").trim() || "Unknown";
      accumulator[dept] = (accumulator[dept] || 0) + toNumber(record.netSalary);
      return accumulator;
    }, {});

    const deptSummaryRows = Object.entries(
      employees.reduce((accumulator, employee) => {
        const dept = String(employee.dept || "Unknown").trim() || "Unknown";

        if (!accumulator[dept]) {
          accumulator[dept] = {
            id: dept,
            dept,
            total: 0,
            present: 0,
            onLeave: 0,
            utilization: "0.0%",
            payroll: formatCurrency(0),
          };
        }

        accumulator[dept].total += 1;
        if (String(employee.status || "").toLowerCase() === "active") {
          accumulator[dept].present += 1;
        }

        return accumulator;
      }, {}),
    )
      .map(([, row]) => {
        const onLeave = leaveDeptMap[row.dept] || 0;
        const utilization = row.total
          ? `${(((row.present - onLeave) / row.total) * 100).toFixed(1)}%`
          : "0.0%";

        return {
          ...row,
          onLeave,
          utilization,
          payroll: formatCurrency(payrollByDepartment[row.dept] || 0),
        };
      })
      .sort((left, right) => right.total - left.total);

    const headcount = employees.length;
    const inactiveCount = employees.filter(
      (employee) => String(employee.status || "").toLowerCase() === "inactive",
    ).length;
    const attritionRate = headcount
      ? `${((inactiveCount / headcount) * 100).toFixed(1)}%`
      : "0.0%";

    const activeCount = employees.filter(
      (employee) => String(employee.status || "").toLowerCase() === "active",
    ).length;
    const attendanceRate = headcount
      ? `${((activeCount / headcount) * 100).toFixed(1)}%`
      : "0.0%";

    const latestMonthPayroll = payrollRecords
      .filter((record) => !latestPayMonth || String(record.payMonth || "") === latestPayMonth)
      .reduce((sum, record) => sum + toNumber(record.netSalary), 0);

    const pipelineCount = recruitmentCandidates.filter((candidate) =>
      ["in progress", "interview scheduled", "offer released", "on hold"].includes(
        String(candidate.status || "").toLowerCase(),
      ),
    ).length;

    const ongoingTrainingCount = trainingPrograms.filter(
      (program) => String(program.status || "").toLowerCase() === "ongoing",
    ).length;

    const summary = [
      { title: "Headcount", value: String(headcount), helper: "current employees" },
      { title: "Attrition Rate", value: attritionRate, helper: `${inactiveCount} inactive records` },
      { title: "Attendance", value: attendanceRate, helper: "active employee ratio" },
      {
        title: "Latest Payroll",
        value: formatCurrency(latestMonthPayroll),
        helper: latestPayMonth ? `month ${latestPayMonth}` : "no payroll month yet",
      },
      {
        title: "Hiring / Training",
        value: `${pipelineCount} / ${ongoingTrainingCount}`,
        helper: "pipeline candidates / ongoing programs",
      },
    ];

    return {
      headcountTrend,
      attritionData,
      deptSummaryRows,
      summary,
    };
  }, [employees, leaves, payrollRecords, recruitmentCandidates, trainingPrograms]);

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Reports</h2>
          <p>Consolidated HR analytics generated dynamically from database modules.</p>
        </div>
        <button type="button" className="hr-btn" onClick={loadReportsData}>
          Refresh Report
        </button>
      </div>

      <div className="hr-cards hr-cards--compact">
        {reportData.summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

      <div className="hr-charts">
        <div className="hr-panel">
          <h3 className="hr-panel__title">Headcount Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={isLoading ? [] : reportData.headcountTrend}
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
        </div>

        <div className="hr-panel">
          <h3 className="hr-panel__title">Monthly Exits (Attrition)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={isLoading ? [] : reportData.attritionData}
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
        <Table
          columns={deptSummaryColumns}
          rows={isLoading ? [] : reportData.deptSummaryRows}
        />
        {!isLoading && !reportData.deptSummaryRows.length ? (
          <p className="root-admin-dashboard__empty-state">No department summary data yet.</p>
        ) : null}
      </div>
    </div>
  );
}

export default Reports;
