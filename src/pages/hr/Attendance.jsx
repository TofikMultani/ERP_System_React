import { useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialRecords = [
  {
    id: 1,
    name: "Ananya Sharma",
    dept: "Engineering",
    date: "13 Mar 2026",
    checkIn: "09:02",
    checkOut: "18:05",
    status: "Present",
  },
  {
    id: 2,
    name: "Rohan Mehta",
    dept: "HR",
    date: "13 Mar 2026",
    checkIn: "09:15",
    checkOut: "18:00",
    status: "Present",
  },
  {
    id: 3,
    name: "Priya Nair",
    dept: "Finance",
    date: "13 Mar 2026",
    checkIn: "—",
    checkOut: "—",
    status: "Absent",
  },
  {
    id: 4,
    name: "Arjun Patel",
    dept: "Sales",
    date: "13 Mar 2026",
    checkIn: "—",
    checkOut: "—",
    status: "On Leave",
  },
  {
    id: 5,
    name: "Sneha Joshi",
    dept: "IT",
    date: "13 Mar 2026",
    checkIn: "08:55",
    checkOut: "17:58",
    status: "Present",
  },
  {
    id: 6,
    name: "Vikram Singh",
    dept: "Engineering",
    date: "13 Mar 2026",
    checkIn: "09:30",
    checkOut: "18:30",
    status: "Late",
  },
  {
    id: 7,
    name: "Neha Kapoor",
    dept: "Support",
    date: "13 Mar 2026",
    checkIn: "09:00",
    checkOut: "18:00",
    status: "Present",
  },
  {
    id: 8,
    name: "Karan Verma",
    dept: "Sales",
    date: "13 Mar 2026",
    checkIn: "—",
    checkOut: "—",
    status: "Absent",
  },
  {
    id: 9,
    name: "Divya Rao",
    dept: "Finance",
    date: "13 Mar 2026",
    checkIn: "09:10",
    checkOut: "18:10",
    status: "Present",
  },
  {
    id: 10,
    name: "Amit Kumar",
    dept: "Engineering",
    date: "13 Mar 2026",
    checkIn: "09:05",
    checkOut: "18:00",
    status: "Present",
  },
];

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

function Attendance() {
  const [date, setDate] = useState("2026-03-13");
  const [records] = useState(initialRecords);
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered =
    filterStatus === "All"
      ? records
      : records.filter((r) => r.status === filterStatus);

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
        <Table columns={columns} rows={filtered} />
      </div>
    </div>
  );
}

export default Attendance;
