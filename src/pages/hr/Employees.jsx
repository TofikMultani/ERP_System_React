import { useState } from "react";
import Table from "../../components/Table.jsx";

const initialEmployees = [
  {
    id: 1,
    name: "Ananya Sharma",
    dept: "Engineering",
    role: "Senior Dev",
    email: "ananya@erp.io",
    phone: "9810001111",
    joined: "01 Mar 2025",
    status: "Active",
  },
  {
    id: 2,
    name: "Rohan Mehta",
    dept: "HR",
    role: "HR Manager",
    email: "rohan@erp.io",
    phone: "9810002222",
    joined: "15 Jan 2025",
    status: "Active",
  },
  {
    id: 3,
    name: "Priya Nair",
    dept: "Finance",
    role: "Analyst",
    email: "priya@erp.io",
    phone: "9810003333",
    joined: "10 Nov 2024",
    status: "Active",
  },
  {
    id: 4,
    name: "Arjun Patel",
    dept: "Sales",
    role: "Sales Lead",
    email: "arjun@erp.io",
    phone: "9810004444",
    joined: "05 Sep 2024",
    status: "On Leave",
  },
  {
    id: 5,
    name: "Sneha Joshi",
    dept: "IT",
    role: "Sys Admin",
    email: "sneha@erp.io",
    phone: "9810005555",
    joined: "20 Aug 2024",
    status: "Active",
  },
  {
    id: 6,
    name: "Vikram Singh",
    dept: "Engineering",
    role: "Backend Dev",
    email: "vikram@erp.io",
    phone: "9810006666",
    joined: "01 Jul 2024",
    status: "Active",
  },
  {
    id: 7,
    name: "Neha Kapoor",
    dept: "Support",
    role: "Support Exec",
    email: "neha@erp.io",
    phone: "9810007777",
    joined: "12 Jun 2024",
    status: "Active",
  },
  {
    id: 8,
    name: "Karan Verma",
    dept: "Sales",
    role: "Account Mgr",
    email: "karan@erp.io",
    phone: "9810008888",
    joined: "03 May 2024",
    status: "Inactive",
  },
  {
    id: 9,
    name: "Divya Rao",
    dept: "Finance",
    role: "Sr. Accountant",
    email: "divya@erp.io",
    phone: "9810009999",
    joined: "19 Apr 2024",
    status: "Active",
  },
  {
    id: 10,
    name: "Amit Kumar",
    dept: "Engineering",
    role: "Frontend Dev",
    email: "amit@erp.io",
    phone: "9810010000",
    joined: "08 Mar 2024",
    status: "Active",
  },
];

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Department", accessor: "dept" },
  { header: "Role", accessor: "role" },
  { header: "Email", accessor: "email" },
  { header: "Phone", accessor: "phone" },
  { header: "Joined", accessor: "joined" },
  { header: "Status", accessor: "status" },
];

const emptyForm = {
  name: "",
  dept: "",
  role: "",
  email: "",
  phone: "",
  joined: "",
  status: "Active",
};

function Employees() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setEmployees((prev) => [...prev, { ...form, id: prev.length + 1 }]);
    setForm(emptyForm);
    setShowForm(false);
  }

  const filtered = employees.filter((emp) =>
    `${emp.name} ${emp.dept} ${emp.role}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Employees</h2>
          <p>Manage the full employee directory.</p>
        </div>
        <button className="hr-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Employee"}
        </button>
      </div>

      {showForm && (
        <form className="hr-form hr-panel" onSubmit={handleSubmit}>
          <h3 className="hr-panel__title">New Employee</h3>
          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Ravi Sharma"
              />
            </div>
            <div className="hr-form__field">
              <label>Department</label>
              <select
                name="dept"
                value={form.dept}
                onChange={handleChange}
                required
              >
                <option value="">Select…</option>
                {["Engineering", "HR", "Finance", "Sales", "IT", "Support"].map(
                  (d) => (
                    <option key={d}>{d}</option>
                  ),
                )}
              </select>
            </div>
            <div className="hr-form__field">
              <label>Role</label>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                placeholder="e.g. Developer"
              />
            </div>
            <div className="hr-form__field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="user@erp.io"
              />
            </div>
            <div className="hr-form__field">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="98XXXXXXXX"
              />
            </div>
            <div className="hr-form__field">
              <label>Date Joined</label>
              <input
                type="date"
                name="joined"
                value={form.joined}
                onChange={handleChange}
                required
              />
            </div>
            <div className="hr-form__field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Active</option>
                <option>Inactive</option>
                <option>On Leave</option>
              </select>
            </div>
          </div>
          <button type="submit" className="hr-btn hr-btn--submit">
            Save Employee
          </button>
        </form>
      )}

      <div className="hr-panel">
        <div className="hr-panel__toolbar">
          <h3 className="hr-panel__title">All Employees ({filtered.length})</h3>
          <input
            className="hr-search"
            placeholder="Search name / dept / role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Table columns={columns} rows={filtered} />
      </div>
    </div>
  );
}

export default Employees;
