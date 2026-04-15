import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDepartment, fetchDepartments } from "../../utils/adminApi.js";
import Table from "../../components/Table.jsx";

const columns = [
  { header: "Code", accessor: "code" },
  { header: "Department", accessor: "name" },
  { header: "Head", accessor: "head" },
  { header: "Head Email", accessor: "headEmail" },
  { header: "Employees", accessor: "employees" },
  { header: "Budget", accessor: "budget" },
  { header: "Location", accessor: "location" },
  { header: "Status", accessor: "status" },
];

function Departments() {
  const navigate = useNavigate();
  const [depts, setDepts] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchDepartments();
      setDepts(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load departments from database.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredDepartments = depts.filter((department) =>
    `${department.code} ${department.name} ${department.head} ${department.location}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleEdit = (row) => {
    navigate(`/hr/departments/${encodeURIComponent(row.code)}/edit`);
  };

  async function handleDelete(row) {
    const shouldDelete = window.confirm(
      `Delete department ${row.code} - ${row.name}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDepartment(row.code);
      await loadDepartments();
    } catch (error) {
      window.alert(error.message || "Unable to delete department from database.");
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Departments</h2>
          <p>Manage departments from database records.</p>
        </div>
        <button
          type="button"
          className="hr-btn"
          onClick={() => navigate("/hr/departments/new")}
        >
          + Add Department
        </button>
      </div>

      <div className="hr-panel">
        <div className="hr-panel__toolbar">
          <h3 className="hr-panel__title">
            All Departments ({filteredDepartments.length})
          </h3>
          <input
            className="hr-search"
            placeholder="Search code / name / head / location…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

        <Table
          columns={columns}
          rows={isLoading ? [] : filteredDepartments}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Departments;
