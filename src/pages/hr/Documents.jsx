import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialDocs = [
  {
    id: 1,
    name: "Employee Handbook",
    category: "Policy",
    owner: "HR Team",
    uploaded: "01 Jan 2026",
    size: "2.4 MB",
    status: "Active",
  },
  {
    id: 2,
    name: "Offer Letter Template",
    category: "Template",
    owner: "Rohan Mehta",
    uploaded: "15 Jan 2026",
    size: "0.3 MB",
    status: "Active",
  },
  {
    id: 3,
    name: "NDA Agreement",
    category: "Legal",
    owner: "Legal Team",
    uploaded: "20 Jan 2026",
    size: "0.8 MB",
    status: "Active",
  },
  {
    id: 4,
    name: "Leave Policy 2026",
    category: "Policy",
    owner: "HR Team",
    uploaded: "01 Feb 2026",
    size: "1.1 MB",
    status: "Active",
  },
  {
    id: 5,
    name: "Payroll Structure FY26",
    category: "Finance",
    owner: "Divya Rao",
    uploaded: "10 Feb 2026",
    size: "0.5 MB",
    status: "Active",
  },
  {
    id: 6,
    name: "Performance Review Form",
    category: "Template",
    owner: "HR Team",
    uploaded: "15 Feb 2026",
    size: "0.4 MB",
    status: "Active",
  },
  {
    id: 7,
    name: "IT Asset Policy",
    category: "Policy",
    owner: "Sneha Joshi",
    uploaded: "20 Feb 2026",
    size: "0.9 MB",
    status: "Active",
  },
  {
    id: 8,
    name: "Code of Conduct",
    category: "Policy",
    owner: "HR Team",
    uploaded: "01 Mar 2026",
    size: "1.6 MB",
    status: "Active",
  },
];

const columns = [
  { header: "Document Name", accessor: "name" },
  { header: "Category", accessor: "category" },
  { header: "Owner", accessor: "owner" },
  { header: "Uploaded", accessor: "uploaded" },
  { header: "Size", accessor: "size" },
  { header: "Status", accessor: "status" },
];

const summary = [
  { title: "Total Documents", value: "8", helper: "in repository" },
  { title: "Policies", value: "4", helper: "active policy files" },
  { title: "Templates", value: "2", helper: "ready to use" },
  { title: "Legal Docs", value: "1", helper: "compliance documents" },
];

const emptyForm = {
  name: "",
  category: "Policy",
  owner: "",
  uploaded: "",
  size: "",
};

function Documents() {
  const [docs, setDocs] = usePersistentState("erp_hr_documents", initialDocs);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const formElement = e.currentTarget;
    if (!validateFormWithInlineErrors(formElement)) {
      return;
    }
    if (editingId !== null) {
      setDocs((previousRows) =>
        previousRows.map((item) =>
          String(item.id) === String(editingId) ? { ...item, ...form } : item,
        ),
      );
    } else {
      setDocs((prev) => [
        ...prev,
        { ...form, id: prev.length + 1, status: "Active" },
      ]);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  const filtered = docs.filter((d) =>
    `${d.name} ${d.category}`.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({ ...emptyForm, ...row });
    setShowForm(true);
  };
  const handleDelete = (row) => deleteRowById(setDocs, row, "document");

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Documents</h2>
          <p>HR document repository — policies, templates, and legal files.</p>
        </div>
        <button className="hr-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Upload Document"}
        </button>
      </div>

      <div className="hr-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      {showForm && (
        <form
          className="hr-form hr-panel"
          onSubmit={handleSubmit}
          noValidate
          onChange={handleFormFieldValidation}
        >
          <h3 className="hr-panel__title">Add Document Record</h3>
          <div className="hr-form__grid">
            <div className="hr-form__field hr-form__field--full">
              <label>Document Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Appraisal Policy 2026"
              />
            </div>
            <div className="hr-form__field">
              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Policy</option>
                <option>Template</option>
                <option>Legal</option>
                <option>Finance</option>
                <option>Other</option>
              </select>
            </div>
            <div className="hr-form__field">
              <label>Owner</label>
              <input
                name="owner"
                value={form.owner}
                onChange={handleChange}
                required
                placeholder="HR Team or person name"
              />
            </div>
            <div className="hr-form__field">
              <label>Upload Date</label>
              <input
                type="date"
                name="uploaded"
                value={form.uploaded}
                onChange={handleChange}
                required
              />
            </div>
            <div className="hr-form__field">
              <label>File Size</label>
              <input
                name="size"
                value={form.size}
                onChange={handleChange}
                placeholder="e.g. 1.2 MB"
              />
            </div>
          </div>
          <button type="submit" className="hr-btn hr-btn--submit">
            Save Record
          </button>
        </form>
      )}

      <div className="hr-panel">
        <div className="hr-panel__toolbar">
          <h3 className="hr-panel__title">
            Document Repository ({filtered.length})
          </h3>
          <input
            className="hr-search"
            placeholder="Search name / category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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

export default Documents;
