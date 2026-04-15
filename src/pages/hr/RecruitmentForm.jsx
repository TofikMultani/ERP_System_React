import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import {
  createRecruitmentCandidate,
  fetchDepartments,
  fetchNextCandidateCode,
  fetchRecruitmentCandidates,
  updateRecruitmentCandidate,
} from "../../utils/adminApi.js";
import {
  emptyRecruitmentForm,
  isValidRecruitmentPayload,
  normalizeRecruitmentPayload,
  toRecruitmentApiPayload,
} from "./recruitmentFormUtils.js";

const SOURCES = ["LinkedIn", "Naukri", "Indeed", "Referral", "Company Website", "Agency", "Walk-In"];
const STAGES = ["Screening", "Aptitude", "Technical", "HR Round", "Final Discussion", "Offer"];
const STATUSES = ["In Progress", "Interview Scheduled", "Offer Released", "Selected", "Rejected", "On Hold"];

function RecruitmentForm() {
  const navigate = useNavigate();
  const { candidateCode } = useParams();
  const isEditMode = Boolean(candidateCode);

  const [form, setForm] = useState(emptyRecruitmentForm);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [departmentRows, candidateRows] = await Promise.all([
          fetchDepartments(),
          fetchRecruitmentCandidates(),
        ]);

        const departmentNames = (Array.isArray(departmentRows) ? departmentRows : [])
          .map((department) => String(department.name || "").trim())
          .filter(Boolean);
        setDepartments(Array.from(new Set(departmentNames)));

        if (isEditMode) {
          const records = Array.isArray(candidateRows) ? candidateRows : [];
          const matched = records.find(
            (candidate) =>
              String(candidate.candidateCode).toLowerCase() ===
              String(candidateCode).toLowerCase(),
          );

          if (!matched) {
            setErrorMessage("Candidate record not found.");
            setForm(emptyRecruitmentForm);
            return;
          }

          setForm(normalizeRecruitmentPayload(matched));
          return;
        }

        const nextCode = await fetchNextCandidateCode();
        setForm({
          ...emptyRecruitmentForm,
          candidateCode: nextCode,
          applicationDate: new Date().toISOString().slice(0, 10),
        });
      } catch (error) {
        setErrorMessage(error.message || "Unable to load recruitment form data.");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [candidateCode, isEditMode]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateFormWithInlineErrors(event.currentTarget)) {
      return;
    }

    const normalized = normalizeRecruitmentPayload(form);
    if (!isValidRecruitmentPayload(normalized)) {
      window.alert("Please fill all required recruitment fields.");
      return;
    }

    setIsSaving(true);

    try {
      await (isEditMode
        ? updateRecruitmentCandidate(candidateCode, toRecruitmentApiPayload(normalized))
        : createRecruitmentCandidate(toRecruitmentApiPayload(normalized)));

      navigate("/hr/recruitment");
    } catch (error) {
      window.alert(error.message || "Unable to save recruitment candidate in database.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>{isEditMode ? "Edit Candidate" : "Add Candidate"}</h2>
          <p>Recruitment form only. Save candidate profile and pipeline details.</p>
        </div>
        <button
          type="button"
          className="hr-btn hr-btn--secondary"
          onClick={() => navigate("/hr/recruitment")}
        >
          Back to Recruitment
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
          <h3 className="hr-panel__title">
            {isEditMode ? "Update Candidate" : "New Candidate Profile"}
          </h3>
          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Candidate Code (Auto)</label>
              <input name="candidateCode" value={form.candidateCode} readOnly required />
            </div>

            <div className="hr-form__field">
              <label>Candidate Name</label>
              <input
                name="candidateName"
                value={form.candidateName}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </div>

            <div className="hr-form__field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="candidate@email.com"
                required
              />
            </div>

            <div className="hr-form__field">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                required
              />
            </div>

            <div className="hr-form__field">
              <label>Department</label>
              <select name="department" value={form.department} onChange={handleChange} required>
                <option value="">Select department…</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div className="hr-form__field">
              <label>Role Title</label>
              <input
                name="roleTitle"
                value={form.roleTitle}
                onChange={handleChange}
                placeholder="e.g. HR Executive"
                required
              />
            </div>

            <div className="hr-form__field">
              <label>Source</label>
              <select name="source" value={form.source} onChange={handleChange}>
                {SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div className="hr-form__field">
              <label>Experience (Years)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                name="experienceYears"
                value={form.experienceYears}
                onChange={handleChange}
              />
            </div>

            <div className="hr-form__field">
              <label>Current CTC</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="currentCtc"
                value={form.currentCtc}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <div className="hr-form__field">
              <label>Expected CTC</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="expectedCtc"
                value={form.expectedCtc}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <div className="hr-form__field">
              <label>Notice Period (Days)</label>
              <input
                type="number"
                min="0"
                step="1"
                name="noticePeriodDays"
                value={form.noticePeriodDays}
                onChange={handleChange}
              />
            </div>

            <div className="hr-form__field">
              <label>Application Date</label>
              <input
                type="date"
                name="applicationDate"
                value={form.applicationDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="hr-form__field">
              <label>Interview Date</label>
              <input
                type="date"
                name="interviewDate"
                value={form.interviewDate}
                onChange={handleChange}
              />
            </div>

            <div className="hr-form__field">
              <label>Stage</label>
              <select name="stage" value={form.stage} onChange={handleChange} required>
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            <div className="hr-form__field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} required>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="hr-form__field">
              <label>Recruiter Name</label>
              <input
                name="recruiterName"
                value={form.recruiterName}
                onChange={handleChange}
                placeholder="Assigned recruiter"
              />
            </div>

            <div className="hr-form__field hr-form__field--full">
              <label>Remarks</label>
              <input
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Interview notes / hiring comments"
              />
            </div>
          </div>

          <button type="submit" className="hr-btn hr-btn--submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Candidate"}
          </button>
        </form>
      )}
    </div>
  );
}

export default RecruitmentForm;
