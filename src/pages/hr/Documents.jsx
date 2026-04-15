import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import {
  deleteHrDocument,
  downloadHrDocumentFile,
  fetchHrDocuments,
} from "../../utils/adminApi.js";

const columns = [
  { header: "Doc Code", accessor: "documentCode" },
  { header: "Document Name", accessor: "title" },
  { header: "Category", accessor: "category" },
  { header: "Owner", accessor: "ownerName" },
  {
    header: "Uploaded",
    accessor: "uploadedAt",
    render: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
  },
  {
    header: "Size",
    accessor: "fileSizeBytes",
    render: (value) => `${(Number(value || 0) / 1024 / 1024).toFixed(2)} MB`,
  },
  { header: "Status", accessor: "status" },
];

function Documents() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const rows = await fetchHrDocuments();
      setDocs(Array.isArray(rows) ? rows : []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load HR documents from database.");
    } finally {
      setIsLoading(false);
    }
  }

  const filtered = docs.filter((d) =>
    `${d.documentCode} ${d.title} ${d.category} ${d.ownerName}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const summary = [
    { title: "Total Documents", value: docs.length, helper: "in repository" },
    {
      title: "Policies",
      value: docs.filter((doc) => doc.category === "Policy").length,
      helper: "active policy files",
    },
    {
      title: "Templates",
      value: docs.filter((doc) => doc.category === "Template").length,
      helper: "ready to use",
    },
    {
      title: "Legal Docs",
      value: docs.filter((doc) => ["Legal", "Compliance"].includes(doc.category)).length,
      helper: "compliance documents",
    },
  ];

  async function handleDelete(row) {
    const shouldDelete = window.confirm(
      `Delete document ${row.documentCode} - ${row.title}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteHrDocument(row.documentCode);
      await loadDocuments();
    } catch (error) {
      window.alert(error.message || "Unable to delete document.");
    }
  }

  async function handleDownload(row) {
    try {
      const { blob, fileName } = await downloadHrDocumentFile(row.documentCode);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName || row.originalFileName || "document";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      window.alert(error.message || "Unable to download file.");
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Documents</h2>
          <p>Upload and manage HR documents from database-backed records.</p>
        </div>
        <button
          className="hr-btn"
          type="button"
          onClick={() => navigate("/hr/documents/new")}
        >
          + Upload Document
        </button>
      </div>

      <div className="hr-cards hr-cards--compact">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

      <div className="hr-panel">
        <div className="hr-panel__toolbar">
          <h3 className="hr-panel__title">
            Document Repository ({filtered.length})
          </h3>
          <input
            className="hr-search"
            placeholder="Search code / name / category / owner…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Table
          columns={columns}
          rows={isLoading ? [] : filtered}
          onDelete={handleDelete}
          renderActions={(row) => (
            <button
              type="button"
              className="erp-table__action-btn erp-table__action-btn--edit"
              onClick={() => handleDownload(row)}
            >
              Download
            </button>
          )}
        />
      </div>
    </div>
  );
}

export default Documents;
