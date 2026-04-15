import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";

const storageKey = "erp_hr_training";
const initialPrograms = [];

const emptyForm = {
  title: "",
  dept: "",
  trainer: "",
  startDate: "",
  endDate: "",
  seats: "",
  enrolled: "0",
  status: "Upcoming",
};

function TrainingForm() {
  const navigate = useNavigate();
  const { programId } = useParams();
  const isEditMode = Boolean(programId);
  const [programs, setPrograms] = usePersistentState(storageKey, initialPrograms);

  const matchedProgram = useMemo(
    () =>
      isEditMode
        ? programs.find((item) => String(item.id) === String(programId))
        : null,
    [isEditMode, programId, programs],
  );

  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(matchedProgram || {}),
  }));

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateFormWithInlineErrors(event.currentTarget)) {
      return;
    }

    if (isEditMode) {
      setPrograms((previousRows) =>
        previousRows.map((item) =>
          String(item.id) === String(programId)
            ? {
                ...item,
                ...form,
                id: item.id,
              }
            : item,
        ),
      );
    } else {
      setPrograms((previousRows) => [
        ...previousRows,
        {
          ...form,
          id:
            previousRows.reduce((maxValue, item) => Math.max(maxValue, Number(item.id) || 0), 0) +
            1,
          status: form.status || "Upcoming",
        },
      ]);
    }

    navigate("/hr/training");
  }

  if (isEditMode && !matchedProgram) {
    return (
      <div className="hr-page">
        <div className="hr-page__header">
          <div>
            <h2>Edit Training</h2>
            <p>Training program record not found.</p>
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
          <p>Training form only. Save program details from this page.</p>
        </div>
        <button
          type="button"
          className="hr-btn hr-btn--secondary"
          onClick={() => navigate("/hr/training")}
        >
          Back to Training
        </button>
      </div>

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
          <div className="hr-form__field hr-form__field--full">
            <label>Program Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Project Management Basics"
            />
          </div>
          <div className="hr-form__field">
            <label>Target Department</label>
            <select name="dept" value={form.dept} onChange={handleChange} required>
              <option value="">Select…</option>
              <option>All</option>
              {["Engineering", "HR", "Finance", "Sales", "IT", "Support"].map((department) => (
                <option key={department}>{department}</option>
              ))}
            </select>
          </div>
          <div className="hr-form__field">
            <label>Trainer</label>
            <input
              name="trainer"
              value={form.trainer}
              onChange={handleChange}
              required
              placeholder="Trainer name"
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
            <label>Total Seats</label>
            <input
              type="number"
              name="seats"
              value={form.seats}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
          <div className="hr-form__field">
            <label>Enrolled</label>
            <input
              type="number"
              name="enrolled"
              value={form.enrolled}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          <div className="hr-form__field">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange} required>
              {["Upcoming", "Ongoing", "Completed"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="hr-btn hr-btn--submit">
          {isEditMode ? "Update Program" : "Schedule Program"}
        </button>
      </form>
    </div>
  );
}

export default TrainingForm;
