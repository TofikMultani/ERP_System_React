import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLeaves } from "../../utils/adminApi.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const columns = [
  { header: "Leave Code", accessor: "leaveCode" },
  { header: "Employee", accessor: "name" },
  { header: "Department", accessor: "dept" },
  { header: "Type", accessor: "type" },
  { header: "From", accessor: "from" },
  { header: "To", accessor: "to" },
  { header: "Days", accessor: "days" },
  { header: "Reason", accessor: "reason" },
  { header: "Status", accessor: "status" },
];

function Leave() {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadLeaves();
  }, []);

  async function loadLeaves() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchLeaves();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load leave records from database.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredLeaves = leaves.filter((leave) => {
    const matchesStatus =
      statusFilter === "All" ||
      String(leave.status).toLowerCase() === statusFilter.toLowerCase();

    if (!matchesStatus) {
      return false;
    }

    return `${leave.leaveCode} ${leave.employeeId} ${leave.name} ${leave.dept} ${leave.type} ${leave.status}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const approvedCount = leaves.filter((leave) => leave.status === "Approved").length;
  const pendingCount = leaves.filter((leave) => leave.status === "Pending").length;
  const rejectedCount = leaves.filter((leave) => leave.status === "Rejected").length;
  const avgLeaveDays = leaves.length
    ? (
        leaves.reduce((sum, leave) => sum + (Number(leave.days) || 0), 0) /
        leaves.length
      ).toFixed(1)
    : "0.0";

  const summary = [
    { title: "Total Leaves", value: leaves.length, helper: "all leave records" },
    { title: "Approved", value: approvedCount, helper: "approved requests" },
    { title: "Pending", value: pendingCount, helper: "awaiting approval" },
    { title: "Rejected", value: rejectedCount, helper: "rejected requests" },
    { title: "Avg Leave Days", value: avgLeaveDays, helper: "days per request" },
  ];

  function handleEdit(row) {
    navigate(`/hr/leave/${encodeURIComponent(row.leaveCode)}/edit`);
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Leave Management</h2>
          <p>Track leave requests from database records.</p>
        </div>
        <button
          type="button"
          className="hr-btn"
          onClick={() => navigate("/hr/leave/new")}
        >
          + Add Leave
        </button>
      </div>

      <div className="hr-cards hr-cards--compact">
        {summary.map((card) => (
          <Card key={card.title} {...card} />
        ))}
      </div>

      <div className="hr-panel">
        <div className="hr-panel__toolbar">
          <h3 className="hr-panel__title">Leave Records ({filteredLeaves.length})</h3>
          <div className="hr-actions-row">
            <div className="hr-filter-group">
              {["All", "Pending", "Approved", "Rejected"].map((filterValue) => (
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
              placeholder="Search code / employee / dept / type / status…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

        <Table columns={columns} rows={isLoading ? [] : filteredLeaves} onEdit={handleEdit} />
      </div>
    </div>
  );
}

export default Leave;
