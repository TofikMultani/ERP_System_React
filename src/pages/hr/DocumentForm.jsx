import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { fetchNextHrDocumentCode, uploadHrDocument } from "../../utils/adminApi.js";

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;
const categories = ["Policy", "Template", "Legal", "Compliance", "Offer", "Other"];
const statuses = ["Active", "Archived"];

const emptyForm = {
  documentCode: "",
  title: "",
  category: "Policy",
  ownerName: "",
  linkedEmployeeId: "",
  effectiveDate: "",
  expiryDate: "",
  status: "Active",
  description: "",
};

function DocumentForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const nextCode = await fetchNextHrDocumentCode();
        setForm((previousForm) => ({
          ...previousForm,
          documentCode: nextCode,
        }));
      } catch (error) {
        setErrorMessage(error.message || "Unable to initialize document form.");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateFormWithInlineErrors(event.currentTarget)) {
      return;
    }

    if (!selectedFile) {
      window.alert("Please choose a file to upload.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      window.alert("File size must be 1 MB or smaller.");
      return;
    }

    setIsSaving(true);

    try {
      await uploadHrDocument({
        ...form,
        file: selectedFile,
      });

      navigate("/hr/documents");
    } catch (error) {
      window.alert(error.message || "Unable to upload document.");
      setIsSaving(false);
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Upload Document</h2>
          <p>Upload HR document with metadata (max file size 1 MB).</p>
        </div>
        <button
          type="button"
          className="hr-btn hr-btn--secondary"
          onClick={() => navigate("/hr/documents")}
        >
          Back to Documents
        </button>
      </div>

      {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

      {!isLoading && (
        <form
          className="hr-form hr-panel"
          onSubmit={handleSubmit}
          noValidate
          onChange={handleFormFieldValidation}
        >
          <h3 className="hr-panel__title">New Document</h3>
          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Document Code (Auto)</label>
              <input name="documentCode" value={form.documentCode} readOnly required />
            </div>
            <div className="hr-form__field hr-form__field--full">
              <label>Document Name</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Appraisal Policy 2026"
              />
            </div>
            <div className="hr-form__field">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="hr-form__field">
              <label>Owner</label>
              <input
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                required
                placeholder="HR Team or person name"
              />
            </div>
            <div className="hr-form__field">
              <label>Linked Employee ID (Optional)</label>
              <input
                name="linkedEmployeeId"
                value={form.linkedEmployeeId}
                onChange={handleChange}
                placeholder="e.g. EMP-0001"
              />
            </div>
            <div className="hr-form__field">
              <label>Effective Date</label>
              <input
                type="date"
                name="effectiveDate"
                value={form.effectiveDate}
                onChange={handleChange}
              />
            </div>
            <div className="hr-form__field">
              <label>Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
              />
            </div>
            <div className="hr-form__field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} required>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="hr-form__field hr-form__field--full">
              <label>Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short document description"
              />
            </div>
            <div className="hr-form__field hr-form__field--full">
              <label>File (Max 1 MB)</label>
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                required
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
              />
            </div>
          </div>

          <button type="submit" className="hr-btn hr-btn--submit" disabled={isSaving}>
            {isSaving ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      )}
    </div>
  );
}

export default DocumentForm;
