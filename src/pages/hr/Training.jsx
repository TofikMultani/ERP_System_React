import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialPrograms = [];

const columns = [
  { header: "Program", accessor: "title" },
  { header: "Department", accessor: "dept" },
  { header: "Trainer", accessor: "trainer" },
  { header: "Start", accessor: "startDate" },
  { header: "End", accessor: "endDate" },
  { header: "Seats", accessor: "seats" },
  { header: "Enrolled", accessor: "enrolled" },
  { header: "Status", accessor: "status" },
];

function Training() {
  const navigate = useNavigate();
  const [programs, setPrograms] = usePersistentState(
    "erp_hr_training",
    initialPrograms,
  );

  const orderedPrograms = useMemo(
    () => [...programs].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)),
    [programs],
  );

  const handleEdit = (row) => {
    navigate(`/hr/training/${encodeURIComponent(row.id)}/edit`);
  };
  const handleDelete = (row) =>
    deleteRowById(setPrograms, row, "training program");

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

      <div className="hr-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      <div className="hr-panel">
        <h3 className="hr-panel__title">Training Programs</h3>
        <Table
          columns={columns}
          rows={orderedPrograms}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Training;
