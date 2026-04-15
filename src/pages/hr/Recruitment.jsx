import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import {
  deleteRecruitmentCandidate,
  fetchRecruitmentCandidates,
} from "../../utils/adminApi.js";
import { formatCurrency } from "./recruitmentFormUtils.js";

const columns = [
  { header: "Candidate Code", accessor: "candidateCode" },
  { header: "Candidate", accessor: "candidateName" },
  { header: "Role", accessor: "roleTitle" },
  { header: "Department", accessor: "department" },
  { header: "Source", accessor: "source" },
  {
    header: "Expected CTC",
    accessor: "expectedCtc",
    render: (value) => formatCurrency(value),
  },
  { header: "Applied", accessor: "applicationDate" },
  { header: "Stage", accessor: "stage" },
  { header: "Status", accessor: "status" },
];

function Recruitment() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchRecruitmentCandidates();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load recruitment records from database.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesStatus =
      statusFilter === "All" ||
      String(candidate.status || "").toLowerCase() === statusFilter.toLowerCase();

    if (!matchesStatus) {
      return false;
    }

    return `${candidate.candidateCode} ${candidate.candidateName} ${candidate.email} ${candidate.department} ${candidate.roleTitle} ${candidate.source} ${candidate.stage} ${candidate.status}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  function handleEdit(row) {
    navigate(`/hr/recruitment/${encodeURIComponent(row.candidateCode)}/edit`);
  }

  async function handleDelete(row) {
    const shouldDelete = window.confirm(
      `Delete candidate ${row.candidateCode} - ${row.candidateName}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteRecruitmentCandidate(row.candidateCode);
      await loadCandidates();
    } catch (error) {
      window.alert(error.message || "Unable to delete recruitment candidate from database.");
    }
  }

  const selectedCount = candidates.filter(
    (candidate) => candidate.status === "Selected",
  ).length;
  const inPipelineCount = candidates.filter((candidate) =>
    ["In Progress", "Interview Scheduled", "Offer Released", "On Hold"].includes(
      String(candidate.status),
    ),
  ).length;
  const rejectedCount = candidates.filter(
    (candidate) => candidate.status === "Rejected",
  ).length;
  const openPositions = new Set(
    candidates
      .filter((candidate) => candidate.status !== "Selected")
      .map((candidate) => candidate.roleTitle)
      .filter(Boolean),
  ).size;

  const summary = [
    {
      title: "Total Applicants",
      value: candidates.length,
      helper: "active pipeline",
    },
    { title: "Selected", value: selectedCount, helper: "offers extended" },
    {
      title: "In Pipeline",
      value: inPipelineCount,
      helper: "across stages",
    },
    { title: "Rejected", value: rejectedCount, helper: "closed profiles" },
    { title: "Open Positions", value: openPositions, helper: "to be filled" },
  ];

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Recruitment</h2>
          <p>Track candidate pipeline, hiring stages, and outcomes from database records.</p>
        </div>
        <button
          type="button"
          className="hr-btn"
          onClick={() => navigate("/hr/recruitment/new")}
        >
          + Add Candidate
        </button>
      </div>

      <div className="hr-cards hr-cards--compact">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      <div className="hr-panel">
        <div className="hr-panel__toolbar">
          <h3 className="hr-panel__title">Candidate Pipeline ({filteredCandidates.length})</h3>
          <div className="hr-actions-row">
            <div className="hr-filter-group">
              {[
                "All",
                "In Progress",
                "Interview Scheduled",
                "Offer Released",
                "Selected",
                "Rejected",
                "On Hold",
              ].map((filterValue) => (
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
              placeholder="Search code / candidate / role / stage / status…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

        <Table
          columns={columns}
          rows={isLoading ? [] : filteredCandidates}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Recruitment;
