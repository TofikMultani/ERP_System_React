import { useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import { deleteRowById } from "../../utils/tableActions.js";

const initialRecords = [];

const columns = [
  { header: "Employee", accessor: "name" },
  { header: "Department", accessor: "dept" },
  { header: "Date", accessor: "date" },
  { header: "Check In", accessor: "checkIn" },
  { header: "Check Out", accessor: "checkOut" },
  { header: "Status", accessor: "status" },
];

const emptyForm = {
  name: "",
  dept: "",
  date: "",
  checkIn: "",
  checkOut: "",
  status: "Present",
};

function Attendance() {
  const [date, setDate] = useState("2026-03-13");
  const [records, setRecords] = useState(initialRecords);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered =
    filterStatus === "All"
      ? records
      : records.filter((r) => r.status === filterStatus);

  const dateFiltered = records.filter((record) => {
    if (!record.date) {
      return true;
    }
    return String(record.date).startsWith(date);
  });

  const presentCount = dateFiltered.filter(
    (record) => record.status === "Present",
  ).length;
  const absentCount = dateFiltered.filter(
    (record) => record.status === "Absent",
  ).length;
  const onLeaveCount = dateFiltered.filter(
    (record) => record.status === "On Leave",
  ).length;
  const lateCount = dateFiltered.filter((record) => record.status === "Late").length;

  const summary = [
    {
      title: "Present",
      value: presentCount,
      helper: `out of ${dateFiltered.length} employees`,
    },
    { title: "Absent", value: absentCount, helper: "today's absences" },
    { title: "On Leave", value: onLeaveCount, helper: "approved leaves" },
    { title: "Late", value: lateCount, helper: "arrived after 09:15" },
  ];

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({ ...emptyForm, ...row });
    setShowForm(true);
  };
  const handleDelete = (row) => deleteRowById(setRecords, row, "attendance");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId === null) {
      return;
    }

    setRecords((previousRows) =>
      previousRows.map((item) =>
        String(item.id) === String(editingId) ? { ...item, ...form } : item,
      ),
    );

    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Attendance</h2>
          <p>Daily attendance records and check-in tracking.</p>
        </div>
        <input
          type="date"
          className="hr-date-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="hr-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      {showForm && (
        <form className="hr-form hr-panel" onSubmit={handleSubmit}>
          <h3 className="hr-panel__title">Edit Attendance</h3>
          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Employee</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="hr-form__field">
              <label>Department</label>
              <input
                value={form.dept}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, dept: e.target.value }))
                }
                required
              />
            </div>
            <div className="hr-form__field">
              <label>Date</label>
              <input
                value={form.date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </div>
            <div className="hr-form__field">
              <label>Check In</label>
              <input
                value={form.checkIn}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, checkIn: e.target.value }))
                }
              />
            </div>
            <div className="hr-form__field">
              <label>Check Out</label>
              <input
                value={form.checkOut}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, checkOut: e.target.value }))
                }
              />
            </div>
            <div className="hr-form__field">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option>Present</option>
                <option>Absent</option>
                <option>On Leave</option>
                <option>Late</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.8rem" }}>
            <button type="submit" className="hr-btn">
              Save
            </button>
            <button
              type="button"
              className="hr-btn"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setShowForm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="hr-panel">
        <div className="hr-panel__toolbar">
          <h3 className="hr-panel__title">Attendance Log</h3>
          <div className="hr-filter-group">
            {["All", "Present", "Absent", "On Leave", "Late"].map((s) => (
              <button
                key={s}
                className={`hr-filter-btn${filterStatus === s ? " hr-filter-btn--active" : ""}`}
                onClick={() => setFilterStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <Table
          columns={columns}
          rows={filtered}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Attendance;
