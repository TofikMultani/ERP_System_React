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

const summary = [
  { title: "Present", value: "214", helper: "out of 248 employees" },
  { title: "Absent", value: "16", helper: "today's absences" },
  { title: "On Leave", value: "18", helper: "approved leaves" },
  { title: "Late", value: "12", helper: "arrived after 09:15" },
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
