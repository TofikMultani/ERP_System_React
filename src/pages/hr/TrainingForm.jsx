import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import {
  createTrainingProgram,
  fetchDepartments,
  fetchNextTrainingCode,
  fetchTrainingPrograms,
  updateTrainingProgram,
} from "../../utils/adminApi.js";
import {
  emptyTrainingForm,
  isValidTrainingPayload,
  normalizeTrainingPayload,
  toTrainingApiPayload,
} from "./trainingFormUtils.js";

const trainingModes = ["Online", "Offline", "Hybrid"];
const trainingStatuses = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

function TrainingForm() {
  const navigate = useNavigate();
  const { trainingCode } = useParams();
  const isEditMode = Boolean(trainingCode);
  const [form, setForm] = useState(emptyTrainingForm);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [departmentRows, trainingRows] = await Promise.all([
          fetchDepartments(),
          fetchTrainingPrograms(),
        ]);

        const departmentNames = (Array.isArray(departmentRows) ? departmentRows : [])
          .map((department) => String(department.name || "").trim())
          .filter(Boolean);
        setDepartments(Array.from(new Set(departmentNames)));

        if (isEditMode) {
          const records = Array.isArray(trainingRows) ? trainingRows : [];
          const matched = records.find(
            (program) =>
              String(program.trainingCode).toLowerCase() ===
              String(trainingCode).toLowerCase(),
          );

          if (!matched) {
            setErrorMessage("Training program record not found.");
            setForm(emptyTrainingForm);
            return;
          }

          setForm(normalizeTrainingPayload(matched));
          return;
        }

        const nextCode = await fetchNextTrainingCode();
        setForm({
          ...emptyTrainingForm,
          trainingCode: nextCode,
        });
      } catch (error) {
        setErrorMessage(error.message || "Unable to load training form data.");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [isEditMode, trainingCode]);

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

    const normalized = normalizeTrainingPayload(form);
    if (!isValidTrainingPayload(normalized)) {
      window.alert("Please fill all required training fields.");
      return;
    }

    setIsSaving(true);

    try {
      await (isEditMode
        ? updateTrainingProgram(trainingCode, toTrainingApiPayload(normalized))
        : createTrainingProgram(toTrainingApiPayload(normalized)));
    } catch (error) {
      window.alert(error.message || "Unable to save training program in database.");
      setIsSaving(false);
      return;
    }

    navigate("/hr/training");
  }

  if (isEditMode && !isLoading && errorMessage) {
    return (
      <div className="hr-page">
        <div className="hr-page__header">
          <div>
            <h2>Edit Training</h2>
            <p>{errorMessage}</p>
          </div>
          <button
            type="button"
            className="hr-btn hr-btn--secondary"
            onClick={() => navigate("/hr/training")}
          >
            Back to Training
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>{isEditMode ? "Edit Training" : "Schedule Training"}</h2>
          <p>Training form only. Save detailed program information in database.</p>
        </div>
        <button
          type="button"
          className="hr-btn hr-btn--secondary"
          onClick={() => navigate("/hr/training")}
        >
          Back to Training
        </button>
      </div>

      {errorMessage && !isEditMode && <p className="hr-inline-error">{errorMessage}</p>}

      {!isLoading && (
        <form
          className="hr-form hr-panel"
          onSubmit={handleSubmit}
          noValidate
          onChange={handleFormFieldValidation}
        >
          <h3 className="hr-panel__title">
            {isEditMode ? "Update Training Program" : "New Training Program"}
          </h3>
          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Training Code (Auto)</label>
              <input name="trainingCode" value={form.trainingCode} readOnly required />
            </div>
            <div className="hr-form__field hr-form__field--full">
              <label>Program Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Leadership Development Bootcamp"
              />
            </div>
            <div className="hr-form__field">
              <label>Target Department</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
              >
                <option value="">Select…</option>
                <option value="All">All</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
            <div className="hr-form__field">
              <label>Trainer Name</label>
              <input
                name="trainerName"
                value={form.trainerName}
                onChange={handleChange}
                required
                placeholder="Trainer / facilitator"
              />
            </div>
            <div className="hr-form__field">
              <label>Mode</label>
              <select
                name="trainingMode"
                value={form.trainingMode}
                onChange={handleChange}
                required
              >
                {trainingModes.map((mode) => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </div>
            <div className="hr-form__field">
              <label>Provider Name</label>
              <input
                name="providerName"
                value={form.providerName}
                onChange={handleChange}
                placeholder="Internal HR / external vendor"
              />
            </div>
            <div className="hr-form__field">
              <label>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Conference Room A / Zoom"
              />
            </div>
            <div className="hr-form__field">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="hr-form__field">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                min={form.startDate || undefined}
              />
            </div>
            <div className="hr-form__field">
              <label>Duration (Hours)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                name="durationHours"
                value={form.durationHours}
                onChange={handleChange}
              />
            </div>
            <div className="hr-form__field">
              <label>Total Seats</label>
              <input
                type="number"
                min="1"
                name="totalSeats"
                value={form.totalSeats}
                onChange={handleChange}
                required
              />
            </div>
            <div className="hr-form__field">
              <label>Enrolled Count</label>
              <input
                type="number"
                min="0"
                name="enrolledCount"
                value={form.enrolledCount}
                onChange={handleChange}
              />
            </div>
            <div className="hr-form__field">
              <label>Budget</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="Optional budget"
              />
            </div>
            <div className="hr-form__field">
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                {trainingStatuses.map((status) => (
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
                placeholder="Program goals, agenda, or notes"
              />
            </div>
          </div>

          <button type="submit" className="hr-btn hr-btn--submit" disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : isEditMode
                ? "Update Program"
                : "Schedule Program"}
          </button>
        </form>
      )}
    </div>
  );
}

export default TrainingForm;
