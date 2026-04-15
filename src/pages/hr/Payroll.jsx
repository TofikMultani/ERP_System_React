import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import {
  deletePayrollRecord,
  fetchPayrollRecords,
  generatePayrollForMonth,
} from "../../utils/adminApi.js";
import { formatCurrency, toNumber } from "./payrollFormUtils.js";

const columns = [
  { header: "Payroll Code", accessor: "payrollCode" },
  { header: "Employee", accessor: "employeeName" },
  { header: "Department", accessor: "department" },
  { header: "Pay Month", accessor: "payMonth" },
  {
    header: "Gross",
    accessor: "grossSalary",
    render: (value) => formatCurrency(value),
  },
  {
    header: "Deductions",
    accessor: "totalDeductions",
    render: (value) => formatCurrency(value),
  },
  {
    header: "Net Salary",
    accessor: "netSalary",
    render: (value) => formatCurrency(value),
  },
  { header: "Status", accessor: "status" },
];

function Payroll() {
  const navigate = useNavigate();
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  function getCurrentMonthValue() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  }

  useEffect(() => {
    loadPayrollRecords();
  }, []);

  async function loadPayrollRecords() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const records = await fetchPayrollRecords();
      setPayrollRecords(Array.isArray(records) ? records : []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load payroll records from database.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPayrollRecords = payrollRecords.filter((record) => {
    const matchesStatus =
      statusFilter === "All" ||
      String(record.status || "").toLowerCase() === statusFilter.toLowerCase();

    if (!matchesStatus) {
      return false;
    }

    return `${record.payrollCode} ${record.employeeId} ${record.employeeName} ${record.department} ${record.roleDesignation} ${record.payMonth} ${record.status}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const totalPayroll = payrollRecords.reduce(
    (sum, record) => sum + toNumber(record.netSalary),
    0,
  );
  const averageNetSalary = payrollRecords.length
    ? Math.round(totalPayroll / payrollRecords.length)
    : 0;
  const processedCount = payrollRecords.filter(
    (record) => String(record.status).toLowerCase() === "processed",
  ).length;
  const pendingCount = payrollRecords.filter((record) =>
    ["pending", "on hold"].includes(String(record.status).toLowerCase()),
  ).length;

  const summary = [
    {
      title: "Total Payroll",
      value: formatCurrency(totalPayroll),
      helper: "net payout amount",
    },
    {
      title: "Avg Net Salary",
      value: formatCurrency(averageNetSalary),
      helper: "per payroll record",
    },
    {
      title: "Processed",
      value: processedCount,
      helper: "processed records",
    },
    {
      title: "Pending / On Hold",
      value: pendingCount,
      helper: "awaiting completion",
    },
    {
      title: "Total Records",
      value: payrollRecords.length,
      helper: "saved in database",
    },
  ];

  function handleEdit(row) {
    navigate(`/hr/payroll/${encodeURIComponent(row.payrollCode)}/edit`);
  }

  async function handleDelete(row) {
    const shouldDelete = window.confirm(
      `Delete payroll record ${row.payrollCode} for ${row.employeeName}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deletePayrollRecord(row.payrollCode);
      await loadPayrollRecords();
    } catch (error) {
      window.alert(error.message || "Unable to delete payroll record from database.");
    }
  }

  async function handleGenerateMonthlyPayroll() {
    const suggestedMonth = getCurrentMonthValue();
    const selectedMonth = window.prompt(
      "Enter payroll month in YYYY-MM format:",
      suggestedMonth,
    );

    if (!selectedMonth) {
      return;
    }

    const shouldOverwrite = window.confirm(
      "Overwrite existing payroll records for this month? Click OK to overwrite, Cancel to skip existing records.",
    );

    try {
      const result = await generatePayrollForMonth({
        payMonth: selectedMonth,
        overwriteExisting: shouldOverwrite,
      });

      const generatedCount = Number(result?.generatedCount || 0);
      const skippedCount = Number(result?.skippedCount || 0);

      window.alert(
        `Payroll generation complete for ${selectedMonth}. Generated: ${generatedCount}, Skipped: ${skippedCount}.`,
      );

      await loadPayrollRecords();
    } catch (error) {
      window.alert(error.message || "Unable to generate monthly payroll.");
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Payroll</h2>
          <p>Manage payroll records dynamically from the database.</p>
        </div>
        <div className="hr-actions-row">
          <button
            type="button"
            className="hr-btn hr-btn--secondary"
            onClick={handleGenerateMonthlyPayroll}
          >
            Generate Monthly Payroll
          </button>
          <button
            type="button"
            className="hr-btn"
            onClick={() => navigate("/hr/payroll/new")}
          >
            + Add Payroll
          </button>
        </div>
      </div>

      <div className="hr-cards hr-cards--compact">
        {summary.map((card) => (
          <Card key={card.title} {...card} />
        ))}
      </div>

      <div className="hr-panel">
        <div className="hr-panel__toolbar">
          <h3 className="hr-panel__title">
            Payroll Records ({filteredPayrollRecords.length})
          </h3>
          <div className="hr-actions-row">
            <div className="hr-filter-group">
              {["All", "Pending", "Processed", "Paid", "On Hold"].map((filterValue) => (
                <button
                  key={filterValue}
                  type="button"
                  className={`hr-filter-btn ${
                    statusFilter === filterValue ? "hr-filter-btn--active" : ""
                  }`}
                  onClick={() => setStatusFilter(filterValue)}
                >
                  {filterValue}
                </button>
              ))}
            </div>
            <input
              className="hr-search"
              placeholder="Search code / employee / dept / month / status…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

        <Table
          columns={columns}
          rows={isLoading ? [] : filteredPayrollRecords}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Payroll;
