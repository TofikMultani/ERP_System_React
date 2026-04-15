import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  deleteEmployee,
  fetchEmployees,
  importEmployees,
} from "../../utils/adminApi.js";
import Table from "../../components/Table.jsx";
import {
  isValidEmployeePayload,
  normalizeEmployeePayload,
  toApiPayload,
} from "./employeeFormUtils.js";

const columns = [
  { header: "Employee ID", accessor: "employeeId" },
  { header: "Name", accessor: "name" },
  { header: "Department", accessor: "dept" },
  { header: "Role", accessor: "role" },
  { header: "Status", accessor: "status" },
];

function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const excelInputRef = useRef(null);

  const filtered = employees.filter((employee) =>
    `${employee.employeeId} ${employee.name} ${employee.dept} ${employee.role} ${employee.email} ${employee.phone}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setIsLoadingEmployees(true);
    setErrorMessage("");

    try {
      const data = await fetchEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load employees from database.");
    } finally {
      setIsLoadingEmployees(false);
    }
  }

  function handleEdit(employee) {
    navigate(`/hr/employees/${encodeURIComponent(employee.employeeId)}/edit`);
  }

  async function handleDelete(employee) {
    const shouldDelete = window.confirm(
      `Delete employee ${employee.employeeId} - ${employee.name}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteEmployee(employee.employeeId);
      await loadEmployees();
    } catch (error) {
      window.alert(error.message || "Unable to delete employee from database.");
    }
  }

  function handleView(employee) {
    navigate(`/hr/employees/${encodeURIComponent(employee.employeeId)}`);
  }

  async function handleExcelImport(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: true,
      });

      if (!rows.length) {
        window.alert("No rows found in the selected file.");
        return;
      }

      const validEmployees = rows
        .map((row) => normalizeEmployeePayload(row))
        .filter((employee) => isValidEmployeePayload(employee));

      if (!validEmployees.length) {
        window.alert(
          "No valid employee rows found. Ensure required columns are present in the Excel file.",
        );
        return;
      }

      const result = await importEmployees({
        employees: validEmployees.map(toApiPayload),
      });

      await loadEmployees();

      const insertedOrUpdated = Number(result?.insertedOrUpdated || 0);
      const skipped = Number(result?.skipped || 0);
      window.alert(
        `${insertedOrUpdated} employee record(s) saved to database.${
          skipped > 0 ? ` ${skipped} row(s) skipped due to missing required fields.` : ""
        }`,
      );
    } catch {
      window.alert("Unable to import employee file to database. Please check the file format.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Employees</h2>
          <p>Manage the full employee directory from database records.</p>
        </div>
        <div className="hr-actions-row">
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hr-file-input"
            onChange={handleExcelImport}
          />
          <button
            type="button"
            className="hr-btn hr-btn--secondary"
            onClick={() => excelInputRef.current?.click()}
          >
            Import Excel
          </button>
          <button
            type="button"
            className="hr-btn"
            onClick={() => navigate("/hr/employees/new")}
          >
            + Add Employee
          </button>
        </div>
      </div>

      <div className="hr-panel">
        <div className="hr-panel__toolbar">
          <h3 className="hr-panel__title">All Employees ({filtered.length})</h3>
          <input
            className="hr-search"
            placeholder="Search ID / name / dept / role…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

        <Table
          columns={columns}
          rows={isLoadingEmployees ? [] : filtered}
          renderActions={(row) => (
            <button
              type="button"
              className="erp-table__action-btn erp-table__action-btn--view"
              onClick={() => handleView(row)}
            >
              View Details
            </button>
          )}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Employees;
