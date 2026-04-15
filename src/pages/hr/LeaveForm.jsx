import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import {
  createLeave,
  fetchEmployees,
  fetchLeaves,
  updateLeave,
} from "../../utils/adminApi.js";
import {
  calculateLeaveDays,
  emptyLeaveForm,
  isValidLeavePayload,
  normalizeLeavePayload,
  toLeaveApiPayload,
} from "./leaveFormUtils.js";

function LeaveForm() {
  const navigate = useNavigate();
  const { leaveCode } = useParams();
  const isEditMode = Boolean(leaveCode);

  const [form, setForm] = useState(emptyLeaveForm);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const employeeById = useMemo(
    () =>
      new Map(
        employees.map((employee) => [String(employee.employeeId), employee]),
      ),
    [employees],
  );

  useEffect(() => {
    async function initializeForm() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [employeeRows, leaveRows] = await Promise.all([
          fetchEmployees(),
          fetchLeaves(),
        ]);

        const safeEmployees = Array.isArray(employeeRows) ? employeeRows : [];
        setEmployees(safeEmployees);

        if (isEditMode) {
          const records = Array.isArray(leaveRows) ? leaveRows : [];
          const matchedLeave = records.find(
            (leave) =>
              String(leave.leaveCode).toLowerCase() ===
              String(leaveCode).toLowerCase(),
          );

          if (!matchedLeave) {
            setErrorMessage("Leave record not found.");
            setForm(emptyLeaveForm);
            return;
          }

          setForm(normalizeLeavePayload(matchedLeave));
          return;
        }

        setForm(emptyLeaveForm);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load leave form data.");
      } finally {
        setIsLoading(false);
      }
    }

    initializeForm();
  }, [leaveCode, isEditMode]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => {
      const nextForm = {
        ...previousForm,
        [name]: value,
      };

      if (name === "employeeId") {
        const matchedEmployee = employeeById.get(String(value));
        nextForm.name = matchedEmployee?.name || "";
        nextForm.dept = matchedEmployee?.dept || "";
      }

      if (name === "from" || name === "to") {
        nextForm.days = calculateLeaveDays(nextForm.from, nextForm.to);
      }

      return nextForm;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateFormWithInlineErrors(event.currentTarget)) {
      return;
    }

    const normalized = normalizeLeavePayload(form);
    if (!isValidLeavePayload(normalized)) {
      window.alert("Please fill all required leave fields.");
      return;
    }

    if (!normalized.days || Number(normalized.days) <= 0) {
      window.alert("Leave days must be greater than 0.");
      return;
    }

    setIsSaving(true);

    try {
      await (isEditMode
        ? updateLeave(leaveCode, toLeaveApiPayload(normalized))
        : createLeave(toLeaveApiPayload(normalized)));

      navigate("/hr/leave");
    } catch (error) {
      window.alert(error.message || "Unable to save leave in database.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>{isEditMode ? "Edit Leave" : "Add Leave"}</h2>
          <p>Leave form only. Records are saved in database.</p>
        </div>
        <button
          type="button"
          className="hr-btn hr-btn--secondary"
          onClick={() => navigate("/hr/leave")}
        >
          Back to Leave Records
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
            {isEditMode ? "Update Leave" : "Leave Application"}
          </h3>
          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Employee</label>
              <select
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                required
              >
                <option value="">Select employee…</option>
                {employees.map((employee) => (
                  <option key={employee.employeeId} value={employee.employeeId}>
                    {employee.employeeId} - {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="hr-form__field">
              <label>Employee Name</label>
              <input name="name" value={form.name} readOnly required />
            </div>

            <div className="hr-form__field">
              <label>Department</label>
              <input name="dept" value={form.dept} readOnly required />
            </div>

            <div className="hr-form__field">
              <label>Leave Type</label>
              <select name="type" value={form.type} onChange={handleChange} required>
                <option>Casual</option>
                <option>Sick</option>
                <option>Earned</option>
                <option>Maternity</option>
                <option>Paternity</option>
              </select>
            </div>

            <div className="hr-form__field">
              <label>From</label>
              <input
                type="date"
                name="from"
                value={form.from}
                onChange={handleChange}
                required
              />
            </div>

            <div className="hr-form__field">
              <label>To</label>
              <input
                type="date"
                name="to"
                value={form.to}
                onChange={handleChange}
                required
                min={form.from || undefined}
              />
            </div>

            <div className="hr-form__field">
              <label>Number of Days (Auto)</label>
              <input type="number" name="days" value={form.days} readOnly required />
            </div>

            <div className="hr-form__field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} required>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>

            <div className="hr-form__field hr-form__field--full">
              <label>Reason</label>
              <input
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Brief reason…"
              />
            </div>
          </div>

          <button type="submit" className="hr-btn hr-btn--submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Leave"}
          </button>
        </form>
      )}
    </div>
  );
}

export default LeaveForm;
