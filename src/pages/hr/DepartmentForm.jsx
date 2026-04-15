import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import {
  createDepartment,
  fetchDepartments,
  fetchNextDepartmentCode,
  updateDepartment,
} from "../../utils/adminApi.js";
import {
  emptyDepartmentForm,
  isValidDepartmentPayload,
  normalizeDepartmentPayload,
  toDepartmentApiPayload,
} from "./departmentFormUtils.js";

function DepartmentForm() {
  const navigate = useNavigate();
  const { departmentCode } = useParams();
  const isEditMode = Boolean(departmentCode);

  const [form, setForm] = useState(emptyDepartmentForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const departments = await fetchDepartments();
        const records = Array.isArray(departments) ? departments : [];

        if (isEditMode) {
          const matched = records.find(
            (department) =>
              String(department.code).toLowerCase() ===
              String(departmentCode).toLowerCase(),
          );

          if (!matched) {
            setErrorMessage("Department not found.");
            setForm(emptyDepartmentForm);
            return;
          }

          setForm(normalizeDepartmentPayload(matched));
          return;
        }

        const nextCode = await fetchNextDepartmentCode();
        setForm({
          ...emptyDepartmentForm,
          code: nextCode,
        });
      } catch (error) {
        setErrorMessage(error.message || "Unable to load department form data.");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [departmentCode, isEditMode]);

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

    const normalized = normalizeDepartmentPayload(form);
    if (!isValidDepartmentPayload(normalized)) {
      window.alert("Please fill all required department fields.");
      return;
    }

    const payload = toDepartmentApiPayload(normalized);
    setIsSaving(true);

    try {
      await (isEditMode
        ? updateDepartment(departmentCode, payload)
        : createDepartment(payload));

      navigate("/hr/departments");
    } catch (error) {
      window.alert(error.message || "Unable to save department in database.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>{isEditMode ? "Edit Department" : "Add Department"}</h2>
          <p>Department form only. Save to store data in database.</p>
        </div>
        <button
          type="button"
          className="hr-btn hr-btn--secondary"
          onClick={() => navigate("/hr/departments")}
        >
          Back to Departments
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
          <h3 className="hr-panel__title">{isEditMode ? "Update" : "New"} Department</h3>
          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Department Code (Auto Generated)</label>
              <input name="code" value={form.code} readOnly required />
            </div>
            <div className="hr-form__field">
              <label>Department Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Operations"
              />
            </div>
            <div className="hr-form__field">
              <label>Department Head</label>
              <input
                name="head"
                value={form.head}
                onChange={handleChange}
                required
                placeholder="Full name"
              />
            </div>
            <div className="hr-form__field">
              <label>Head Email</label>
              <input
                type="email"
                name="headEmail"
                value={form.headEmail}
                onChange={handleChange}
                placeholder="head@company.com"
              />
            </div>
            <div className="hr-form__field">
              <label>Head Phone</label>
              <input
                name="headPhone"
                value={form.headPhone}
                onChange={handleChange}
                placeholder="Phone"
              />
            </div>
            <div className="hr-form__field">
              <label>Employees</label>
              <input
                type="number"
                min="0"
                name="employees"
                value={form.employees}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div className="hr-form__field">
              <label>Annual Budget</label>
              <input
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="e.g. 1200000"
              />
            </div>
            <div className="hr-form__field">
              <label>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Building A"
              />
            </div>
            <div className="hr-form__field">
              <label>Status</label>
              <input
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                placeholder="e.g. Active"
              />
            </div>
            <div className="hr-form__field hr-form__field--full">
              <label>Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Department responsibilities and scope"
              />
            </div>
          </div>

          <button type="submit" className="hr-btn hr-btn--submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Department"}
          </button>
        </form>
      )}
    </div>
  );
}

export default DepartmentForm;
