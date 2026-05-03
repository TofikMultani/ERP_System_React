import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import {
  deleteSalaryRecord,
  fetchSalaryRecords,
  generateSalaryForMonth,
} from "../../utils/salaryManagementApi.js";
import { formatCurrency, toNumber } from "./payrollFormUtils.js";

const columns = [
  { header: "Salary Code", accessor: "salaryCode" },
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
  {
    header: "CTC",
    accessor: "totalCtc",
    render: (value) => formatCurrency(value),
  },
  { header: "Payment Mode", accessor: "paymentMode" },
  { header: "Status", accessor: "status" },
];

function SalaryManagement() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const rows = await fetchSalaryRecords();
      setRecords(Array.isArray(rows) ? rows : []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load salary records from database.");
    } finally {
      setIsLoading(false);
    }
  }

  const filtered = records.filter((record) => {
    const matchesStatus =
      statusFilter === "All" ||
      String(record.status || "").toLowerCase() === statusFilter.toLowerCase();

    if (!matchesStatus) return false;

    return `${record.salaryCode} ${record.employeeId} ${record.employeeName} ${record.department} ${record.roleDesignation} ${record.payMonth} ${record.status}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const totalNet = records.reduce((sum, r) => sum + toNumber(r.netSalary), 0);
  const avgNet = records.length ? Math.round(totalNet / records.length) : 0;
  const totalCtc = records.reduce((sum, r) => sum + toNumber(r.totalCtc), 0);
  const processedCount = records.filter((r) => String(r.status).toLowerCase() === "processed").length;
  const pendingCount = records.filter((r) => ["pending", "on hold"].includes(String(r.status).toLowerCase())).length;

  const summary = [
    { title: "Total Payroll", value: formatCurrency(totalNet), helper: "net payout amount" },
    { title: "Avg Net Salary", value: formatCurrency(avgNet), helper: "per record" },
    { title: "Total CTC", value: formatCurrency(totalCtc), helper: "employer monthly cost" },
    { title: "Processed", value: processedCount, helper: "processed records" },
    { title: "Pending / On Hold", value: pendingCount, helper: "awaiting completion" },
    { title: "Total Records", value: records.length, helper: "saved in database" },
  ];

  function handleEdit(row) {
    navigate(`/hr/salary-management/${encodeURIComponent(row.salaryCode)}/edit`);
  }

  async function handleDelete(row) {
    const ok = window.confirm(`Delete salary record ${row.salaryCode} for ${row.employeeName}?`);
    if (!ok) return;

    try {
      await deleteSalaryRecord(row.salaryCode);
      await loadRecords();
    } catch (error) {
      window.alert(error.message || "Unable to delete salary record from database.");
    }
  }

  async function handleGenerate() {
    const today = new Date();
    const suggested = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const month = window.prompt("Enter salary month in YYYY-MM format:", suggested);
    if (!month) return;

    const overwrite = window.confirm("Overwrite existing salary records for this month? OK to overwrite.");

    try {
      const result = await generateSalaryForMonth({ payMonth: month, overwriteExisting: overwrite });
      const generated = Number(result?.generatedCount || 0);
      const skipped = Number(result?.skippedCount || 0);
      window.alert(`Generation complete for ${month}. Generated: ${generated}, Skipped: ${skipped}.`);
      await loadRecords();
    } catch (error) {
      window.alert(error.message || "Unable to generate salary records.");
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Salary Management</h2>
          <p>Manage monthly salary records, allowances, deductions and employer costs.</p>
        </div>
        <div className="hr-actions-row">
          <button type="button" className="hr-btn hr-btn--secondary" onClick={handleGenerate}>
            Generate Monthly Salary
          </button>
          <button type="button" className="hr-btn" onClick={() => navigate("/hr/salary-management/new")}>
            + Add Salary
          </button>
        </div>
      </div>

      <div className="hr-cards hr-cards--compact">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      <div className="hr-panel">
        <div className="hr-panel__toolbar">
          <h3 className="hr-panel__title">Salary Records ({filtered.length})</h3>
          <div className="hr-actions-row">
            <div className="hr-filter-group">
              {["All", "Pending", "Processed", "Paid", "On Hold"].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`hr-filter-btn ${statusFilter === v ? "hr-filter-btn--active" : ""}`}
                  onClick={() => setStatusFilter(v)}
                >
                  {v}
                </button>
              ))}
            </div>
            <input className="hr-search" placeholder="Search code / employee / dept / month / status…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

        <Table columns={columns} rows={isLoading ? [] : filtered} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}

export default SalaryManagement;
