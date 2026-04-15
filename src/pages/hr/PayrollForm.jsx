import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import {
  createPayrollRecord,
  fetchEmployees,
  fetchNextPayrollCode,
  fetchPayrollRecords,
  updatePayrollRecord,
} from "../../utils/adminApi.js";
import {
  emptyPayrollForm,
  formatCurrency,
  isValidPayrollPayload,
  normalizePayrollPayload,
  recomputePayrollAmounts,
  toPayrollApiPayload,
} from "./payrollFormUtils.js";

const MONEY_FIELDS = new Set([
  "basicSalary",
  "hra",
  "allowances",
  "overtimePay",
  "bonus",
  "tax",
  "providentFund",
  "otherDeductions",
]);

function PayrollForm() {
  const navigate = useNavigate();
  const { payrollCode } = useParams();
  const isEditMode = Boolean(payrollCode);

  const [form, setForm] = useState(emptyPayrollForm);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const employeeById = useMemo(
    () => new Map(employees.map((employee) => [String(employee.employeeId), employee])),
    [employees],
  );

  useEffect(() => {
    async function initializeForm() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [employeeRows, payrollRows] = await Promise.all([
          fetchEmployees(),
          fetchPayrollRecords(),
        ]);

        const safeEmployees = Array.isArray(employeeRows) ? employeeRows : [];
        const records = Array.isArray(payrollRows) ? payrollRows : [];
        setEmployees(safeEmployees);

        if (isEditMode) {
          const matched = records.find(
            (record) =>
              String(record.payrollCode).toLowerCase() ===
              String(payrollCode).toLowerCase(),
          );

          if (!matched) {
            setErrorMessage("Payroll record not found.");
            setForm(emptyPayrollForm);
            return;
          }

          setForm(normalizePayrollPayload(matched));
          return;
        }

        const nextCode = await fetchNextPayrollCode();
        setForm({
          ...emptyPayrollForm,
          payrollCode: nextCode,
        });
      } catch (error) {
        setErrorMessage(error.message || "Unable to load payroll form data.");
      } finally {
        setIsLoading(false);
      }
    }

    initializeForm();
  }, [isEditMode, payrollCode]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => {
      let nextForm = {
        ...previousForm,
        [name]: value,
      };

      if (name === "employeeId") {
        const selectedEmployee = employeeById.get(String(value));
        nextForm = {
          ...nextForm,
          employeeName: selectedEmployee?.name || "",
          department: selectedEmployee?.dept || "",
          roleDesignation: selectedEmployee?.role || "",
          basicSalary: String(selectedEmployee?.salary || "0").trim() || "0",
        };
      }

      if (MONEY_FIELDS.has(name) || name === "employeeId") {
        nextForm = recomputePayrollAmounts(nextForm);
      }

      return nextForm;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateFormWithInlineErrors(event.currentTarget)) {
      return;
    }

    const normalized = normalizePayrollPayload(form);
    if (!isValidPayrollPayload(normalized)) {
      window.alert("Please fill all required payroll fields.");
      return;
    }

    setIsSaving(true);

    try {
      await (isEditMode
        ? updatePayrollRecord(payrollCode, toPayrollApiPayload(normalized))
        : createPayrollRecord(toPayrollApiPayload(normalized)));

      navigate("/hr/payroll");
    } catch (error) {
      window.alert(error.message || "Unable to save payroll record in database.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>{isEditMode ? "Edit Payroll" : "Add Payroll"}</h2>
          <p>Payroll form only. Select employee to auto-fill profile and base salary.</p>
        </div>
        <button
          type="button"
          className="hr-btn hr-btn--secondary"
          onClick={() => navigate("/hr/payroll")}
        >
          Back to Payroll
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
            {isEditMode ? "Update Payroll Record" : "Create Payroll Record"}
          </h3>
          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Payroll Code (Auto Generated)</label>
              <input name="payrollCode" value={form.payrollCode} readOnly required />
            </div>

            <div className="hr-form__field">
              <label>Pay Month</label>
              <input
                type="month"
                name="payMonth"
                value={form.payMonth}
                onChange={handleChange}
                required
              />
            </div>

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
              <input name="employeeName" value={form.employeeName} readOnly required />
            </div>

            <div className="hr-form__field">
              <label>Department</label>
              <input name="department" value={form.department} readOnly required />
            </div>

            <div className="hr-form__field">
              <label>Role / Designation</label>
              <input name="roleDesignation" value={form.roleDesignation} readOnly required />
            </div>

            <div className="hr-form__field">
              <label>Basic Salary</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="basicSalary"
                value={form.basicSalary}
                onChange={handleChange}
                required
              />
            </div>

            <div className="hr-form__field">
              <label>HRA</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="hra"
                value={form.hra}
                onChange={handleChange}
              />
            </div>

            <div className="hr-form__field">
              <label>Allowances</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="allowances"
                value={form.allowances}
                onChange={handleChange}
              />
            </div>

            <div className="hr-form__field">
              <label>Overtime Pay</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="overtimePay"
                value={form.overtimePay}
                onChange={handleChange}
              />
            </div>

            <div className="hr-form__field">
              <label>Bonus</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="bonus"
                value={form.bonus}
                onChange={handleChange}
              />
            </div>

            <div className="hr-form__field">
              <label>Tax</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="tax"
                value={form.tax}
                onChange={handleChange}
              />
            </div>

            <div className="hr-form__field">
              <label>Provident Fund</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="providentFund"
                value={form.providentFund}
                onChange={handleChange}
              />
            </div>

            <div className="hr-form__field">
              <label>Other Deductions</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="otherDeductions"
                value={form.otherDeductions}
                onChange={handleChange}
              />
            </div>

            <div className="hr-form__field">
              <label>Gross Salary (Auto)</label>
              <input value={formatCurrency(form.grossSalary)} readOnly />
            </div>

            <div className="hr-form__field">
              <label>Total Deductions (Auto)</label>
              <input value={formatCurrency(form.totalDeductions)} readOnly />
            </div>

            <div className="hr-form__field">
              <label>Net Salary (Auto)</label>
              <input value={formatCurrency(form.netSalary)} readOnly />
            </div>

            <div className="hr-form__field">
              <label>Payment Date</label>
              <input
                type="date"
                name="paymentDate"
                value={form.paymentDate}
                onChange={handleChange}
              />
            </div>

            <div className="hr-form__field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} required>
                <option>Pending</option>
                <option>Processed</option>
                <option>Paid</option>
                <option>On Hold</option>
              </select>
            </div>

            <div className="hr-form__field hr-form__field--full">
              <label>Notes</label>
              <input
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Optional payroll notes"
              />
            </div>
          </div>

          <button type="submit" className="hr-btn hr-btn--submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Payroll"}
          </button>
        </form>
      )}
    </div>
  );
}

export default PayrollForm;
