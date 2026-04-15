import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import {
  createEmployee,
  fetchEmployees,
  fetchNextEmployeeId,
  updateEmployee,
} from "../../utils/adminApi.js";
import {
  emptyForm,
  isValidEmployeePayload,
  normalizeEmployeePayload,
  toApiPayload,
} from "./employeeFormUtils.js";

function EmployeeForm() {
  const navigate = useNavigate();
  const { employeeId } = useParams();

  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreparingEmployeeId, setIsPreparingEmployeeId] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [allEmployees, setAllEmployees] = useState([]);

  const isEditMode = Boolean(employeeId);

  const dynamicDepartments = Array.from(
    new Set(
      allEmployees
        .map((employee) => String(employee.dept || "").trim())
        .filter(Boolean),
    ),
  );

  const dynamicStatuses = Array.from(
    new Set(
      allEmployees
        .map((employee) => String(employee.status || "").trim())
        .filter(Boolean),
    ),
  );

  useEffect(() => {
    async function runInitialize() {
      setIsLoadingForm(true);
      setErrorMessage("");

      try {
        const employees = await fetchEmployees();
        const records = Array.isArray(employees) ? employees : [];
        setAllEmployees(records);

        if (isEditMode) {
          const existingEmployee = records.find(
            (employee) => String(employee.employeeId) === String(employeeId),
          );

          if (!existingEmployee) {
            setErrorMessage("Employee not found.");
            setForm(emptyForm);
            return;
          }

          setForm(normalizeEmployeePayload(existingEmployee));
          return;
        }

        setForm(emptyForm);
        await prepareAutoEmployeeId();
      } catch (error) {
        setErrorMessage(error.message || "Unable to load employee form data.");
      } finally {
        setIsLoadingForm(false);
      }
    }

    runInitialize();
  }, [employeeId, isEditMode]);

  async function prepareAutoEmployeeId() {
    setIsPreparingEmployeeId(true);

    try {
      const nextEmployeeId = await fetchNextEmployeeId();
      setForm((previousForm) => ({
        ...previousForm,
        employeeId: nextEmployeeId,
      }));
    } catch {
      window.alert("Unable to fetch next employee ID from database.");
    } finally {
      setIsPreparingEmployeeId(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formElement = event.currentTarget;
    if (!validateFormWithInlineErrors(formElement)) {
      return;
    }

    const normalizedForm = normalizeEmployeePayload(form);
    if (!isValidEmployeePayload(normalizedForm)) {
      window.alert("Please fill all required employee fields.");
      return;
    }

    const payload = toApiPayload(normalizedForm);
    setIsSaving(true);

    try {
      const savedEmployee = isEditMode
        ? await updateEmployee(employeeId, payload)
        : await createEmployee(payload);

      const nextEmployeeId = savedEmployee?.employeeId || employeeId;
      if (nextEmployeeId) {
        navigate(`/hr/employees/${encodeURIComponent(nextEmployeeId)}`);
        return;
      }

      navigate("/hr/employees");
    } catch (error) {
      window.alert(error.message || "Unable to save employee in database.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>{isEditMode ? "Edit Employee" : "Add Employee"}</h2>
          <p>Employee form only. Save to store data in database.</p>
        </div>
        <button
          type="button"
          className="hr-btn hr-btn--secondary"
          onClick={() => navigate("/hr/employees")}
        >
          Back to Employees
        </button>
      </div>

      {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

      {!isLoadingForm && (
        <form
          className="hr-form hr-panel"
          onSubmit={handleSubmit}
          noValidate
          onChange={handleFormFieldValidation}
        >
          <h3 className="hr-panel__title">
            {isEditMode ? "Update Employee" : "New Employee"}
          </h3>
          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Employee ID (Auto Generated)</label>
              <input
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                required
                readOnly
                placeholder={isPreparingEmployeeId ? "Fetching..." : "Auto generated"}
              />
            </div>
            <div className="hr-form__field">
              <label>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>
            <div className="hr-form__field">
              <label>Department</label>
              <input
                name="dept"
                value={form.dept}
                onChange={handleChange}
                required
                list="employee-department-options"
                placeholder="Enter department"
              />
              <datalist id="employee-department-options">
                {dynamicDepartments.map((department) => (
                  <option key={department} value={department} />
                ))}
              </datalist>
            </div>
            <div className="hr-form__field">
              <label>Role / Designation</label>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                placeholder="Enter role"
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
                placeholder="user@example.com"
              />
            </div>
            <div className="hr-form__field">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
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
              <input
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                list="employee-status-options"
                placeholder="Enter status"
              />
              <datalist id="employee-status-options">
                {dynamicStatuses.map((statusValue) => (
                  <option key={statusValue} value={statusValue} />
                ))}
              </datalist>
            </div>
            <div className="hr-form__field">
              <label>Salary (Optional)</label>
              <input
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder="Enter salary"
              />
            </div>
            <div className="hr-form__field hr-form__field--full">
              <label>Address (Optional)</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </div>
            <div className="hr-form__field">
              <label>Reporting Manager (Optional)</label>
              <input
                name="manager"
                value={form.manager}
                onChange={handleChange}
                placeholder="Enter manager name"
              />
            </div>
          </div>
          <button type="submit" className="hr-btn hr-btn--submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Employee"}
          </button>
        </form>
      )}
    </div>
  );
}

export default EmployeeForm;
