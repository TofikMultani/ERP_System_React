import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import {
  deleteTrainingProgram,
  fetchTrainingPrograms,
} from "../../utils/adminApi.js";
import { formatCurrency } from "./trainingFormUtils.js";

const columns = [
  { header: "Code", accessor: "trainingCode" },
  { header: "Program", accessor: "title" },
  { header: "Department", accessor: "department" },
  { header: "Trainer", accessor: "trainerName" },
  { header: "Mode", accessor: "trainingMode" },
  { header: "Start", accessor: "startDate" },
  { header: "End", accessor: "endDate" },
  { header: "Seats", accessor: "totalSeats" },
  { header: "Enrolled", accessor: "enrolledCount" },
  {
    header: "Budget",
    accessor: "budget",
    render: (value) => formatCurrency(value),
  },
  { header: "Status", accessor: "status" },
];

function Training() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchTrainingPrograms();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load training programs from database.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPrograms = programs.filter((program) => {
    const matchesStatus =
      statusFilter === "All" ||
      String(program.status || "").toLowerCase() === statusFilter.toLowerCase();

    if (!matchesStatus) {
      return false;
    }

    return `${program.trainingCode} ${program.title} ${program.department} ${program.trainerName} ${program.trainingMode} ${program.status}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const handleEdit = (row) => {
    navigate(`/hr/training/${encodeURIComponent(row.trainingCode)}/edit`);
  };

  async function handleDelete(row) {
    const shouldDelete = window.confirm(
      `Delete training program ${row.trainingCode} - ${row.title}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteTrainingProgram(row.trainingCode);
      await loadPrograms();
    } catch (error) {
      window.alert(error.message || "Unable to delete training program.");
    }
  }

  const summary = [
    {
      title: "Total Programs",
      value: programs.length,
      helper: "this quarter",
    },
    {
      title: "Ongoing",
      value: programs.filter((program) => program.status === "Ongoing").length,
      helper: "in progress",
    },
    {
      title: "Upcoming",
      value: programs.filter((program) => program.status === "Upcoming").length,
      helper: "scheduled",
    },
    {
      title: "Completed",
      value: programs.filter((program) => program.status === "Completed").length,
      helper: "this month",
    },
    {
      title: "Total Seats",
      value: programs.reduce((sum, program) => sum + (Number(program.totalSeats) || 0), 0),
      helper: "capacity planned",
    },
  ];

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Training</h2>
          <p>Corporate training programs and employee skill development.</p>
        </div>
        <button
          className="hr-btn"
          type="button"
          onClick={() => navigate("/hr/training/new")}
        >
          + Schedule Training
        </button>
      </div>

      <div className="hr-cards hr-cards--compact">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      <div className="hr-panel">
        <div className="hr-panel__toolbar">
          <h3 className="hr-panel__title">Training Programs ({filteredPrograms.length})</h3>
          <div className="hr-actions-row">
            <div className="hr-filter-group">
              {["All", "Upcoming", "Ongoing", "Completed", "Cancelled"].map((filterValue) => (
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
              placeholder="Search code / title / dept / trainer / status…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

        <Table
          columns={columns}
          rows={isLoading ? [] : filteredPrograms}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Training;
