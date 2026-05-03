import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import {
  createSalaryRecord,
  fetchNextSalaryCode,
  fetchSalaryRecords,
  updateSalaryRecord,
} from "../../utils/salaryManagementApi.js";
import { fetchEmployees } from "../../utils/adminApi.js";
import {
  emptyPayrollForm,
  formatCurrency,
  isValidPayrollPayload,
  normalizePayrollPayload,
  recomputePayrollAmounts,
  toNumber,
  toPayrollApiPayload,
} from "./payrollFormUtils.js";

const MONEY_FIELDS = new Set([
  "basicSalary",
  "hra",
  "allowances",
  "specialAllowance",
  "conveyanceAllowance",
  "medicalAllowance",
  "overtimePay",
  "bonus",
  "reimbursements",
  "arrears",
  "tax",
  "providentFund",
  "esi",
  "professionalTax",
  "tds",
  "loanDeduction",
  "otherDeductions",
  "employerPf",
  "employerEsi",
]);

function getDaysInMonth(payMonth) {
  const text = String(payMonth || "").trim();
  if (!/^\d{4}-\d{2}$/.test(text)) {
    return 30;
  }

  const [yearText, monthText] = text.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return 30;
  }

  return new Date(year, month, 0).getDate();
}

function SalaryManagementForm() {
  const navigate = useNavigate();
  const { salaryCode } = useParams();
  const isEditMode = Boolean(salaryCode);

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
        const [employeeRows, salaryRows] = await Promise.all([
          fetchEmployees(),
          fetchSalaryRecords(),
        ]);

        const safeEmployees = Array.isArray(employeeRows) ? employeeRows : [];
        const records = Array.isArray(salaryRows) ? salaryRows : [];
        setEmployees(safeEmployees);

        if (isEditMode) {
          const matched = records.find(
            (record) => String(record.salaryCode).toLowerCase() === String(salaryCode).toLowerCase(),
          );

          if (!matched) {
            setErrorMessage("Salary record not found.");
            setForm(emptyPayrollForm);
            return;
          }

          setForm(normalizePayrollPayload(matched));
          return;
        }

        const nextCode = await fetchNextSalaryCode();
        setForm({
          ...emptyPayrollForm,
          payrollCode: nextCode,
          salaryCode: nextCode,
        });
      } catch (error) {
        setErrorMessage(error.message || "Unable to load salary form data.");
      } finally {
        setIsLoading(false);
      }
    }

    initializeForm();
  }, [isEditMode, salaryCode]);

  function handleEmployeeSelection(value, previousForm) {
    const selectedEmployee = employeeById.get(String(value));

    if (!selectedEmployee) {
      return previousForm;
    }

    const basicSalary = toNumber(selectedEmployee.salary || 0);

    const nextForm = {
      ...previousForm,
      employeeName: selectedEmployee.name || "",
      department: selectedEmployee.dept || "",
      roleDesignation: selectedEmployee.role || "",
      basicSalary: String(basicSalary),
      hra: String(Math.round(basicSalary * 0.4 * 100) / 100),
      allowances: String(Math.round(basicSalary * 0.15 * 100) / 100),
      specialAllowance: String(Math.round(basicSalary * 0.1 * 100) / 100),
      tax: String(Math.round(basicSalary * 0.1 * 100) / 100),
      providentFund: String(Math.round(basicSalary * 0.12 * 100) / 100),
      employerPf: String(Math.round(basicSalary * 0.13 * 100) / 100),
      professionalTax: String(200),
    };

    return nextForm;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => {
      let nextForm = {
        ...previousForm,
        [name]: value,
      };

      if (name === "employeeId") {
        nextForm = handleEmployeeSelection(value, nextForm);
      }

      if (name === "payMonth") {
        const daysInMonth = getDaysInMonth(value);
        nextForm.daysInMonth = String(daysInMonth);
        if (!nextForm.paidDays || Number(nextForm.paidDays) <= 0) {
          nextForm.paidDays = String(daysInMonth);
        }
      }

      if (name === "daysInMonth") {
        const days = Math.max(1, Math.trunc(Number(value) || 30));
        nextForm.daysInMonth = String(days);
        if (Number(nextForm.paidDays) > days) {
          nextForm.paidDays = String(days);
        }
      }

      if (name === "paidDays") {
        const totalDays = Math.max(1, Math.trunc(Number(nextForm.daysInMonth) || 30));
        const paidDays = Math.max(0, Math.min(totalDays, Math.trunc(Number(value) || 0)));
        nextForm.paidDays = String(paidDays);
      }

      if (MONEY_FIELDS.has(name) || name === "employeeId" || name === "daysInMonth" || name === "paidDays" || name === "payMonth") {
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
      window.alert("Please fill all required salary fields.");
      return;
    }

    setIsSaving(true);

    try {
      await (isEditMode
        ? updateSalaryRecord(salaryCode, toPayrollApiPayload(normalized))
        : createSalaryRecord(toPayrollApiPayload(normalized)));

      navigate("/hr/salary-management");
    } catch (error) {
      window.alert(error.message || "Unable to save salary record in database.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>{isEditMode ? "Edit Salary Record" : "Add Salary Record"}</h2>
          <p>Complete salary management with attendance proration, statutory deductions, and CTC tracking.</p>
        </div>
        <button
          type="button"
          className="hr-btn hr-btn--secondary"
          onClick={() => navigate("/hr/salary-management")}
        >
          Back to Salary Management
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
          <h3 className="hr-panel__title">{isEditMode ? "Update Salary Record" : "Create Salary Record"}</h3>

          <div className="hr-form__grid">
            <div className="hr-form__field">
              <label>Salary Code</label>
              <input name="salaryCode" value={form.salaryCode || form.payrollCode} readOnly required />
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
              <select name="employeeId" value={form.employeeId} onChange={handleChange} required>
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
              <label>Days in Month</label>
              <input
                type="number"
                min="1"
                step="1"
                name="daysInMonth"
                value={form.daysInMonth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="hr-form__field">
              <label>Paid Days</label>
              <input
                type="number"
                min="0"
                step="1"
                name="paidDays"
                value={form.paidDays}
                onChange={handleChange}
                required
              />
            </div>

            <div className="hr-form__field">
              <label>LOP Days (Auto)</label>
              <input value={form.lopDays} readOnly />
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
              <input type="number" min="0" step="0.01" name="hra" value={form.hra} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Allowances</label>
              <input type="number" min="0" step="0.01" name="allowances" value={form.allowances} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Special Allowance</label>
              <input type="number" min="0" step="0.01" name="specialAllowance" value={form.specialAllowance} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Conveyance Allowance</label>
              <input type="number" min="0" step="0.01" name="conveyanceAllowance" value={form.conveyanceAllowance} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Medical Allowance</label>
              <input type="number" min="0" step="0.01" name="medicalAllowance" value={form.medicalAllowance} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Overtime Pay</label>
              <input type="number" min="0" step="0.01" name="overtimePay" value={form.overtimePay} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Bonus</label>
              <input type="number" min="0" step="0.01" name="bonus" value={form.bonus} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Reimbursements</label>
              <input type="number" min="0" step="0.01" name="reimbursements" value={form.reimbursements} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Arrears</label>
              <input type="number" min="0" step="0.01" name="arrears" value={form.arrears} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>LOP Amount (Auto)</label>
              <input value={formatCurrency(form.lopAmount)} readOnly />
            </div>

            <div className="hr-form__field">
              <label>Gross Salary (Auto)</label>
              <input value={formatCurrency(form.grossSalary)} readOnly />
            </div>

            <div className="hr-form__field">
              <label>Tax</label>
              <input type="number" min="0" step="0.01" name="tax" value={form.tax} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Provident Fund</label>
              <input type="number" min="0" step="0.01" name="providentFund" value={form.providentFund} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>ESI</label>
              <input type="number" min="0" step="0.01" name="esi" value={form.esi} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Professional Tax</label>
              <input type="number" min="0" step="0.01" name="professionalTax" value={form.professionalTax} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>TDS</label>
              <input type="number" min="0" step="0.01" name="tds" value={form.tds} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Loan Deduction</label>
              <input type="number" min="0" step="0.01" name="loanDeduction" value={form.loanDeduction} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Other Deductions</label>
              <input type="number" min="0" step="0.01" name="otherDeductions" value={form.otherDeductions} onChange={handleChange} />
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
              <label>Employer PF</label>
              <input type="number" min="0" step="0.01" name="employerPf" value={form.employerPf} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Employer ESI</label>
              <input type="number" min="0" step="0.01" name="employerEsi" value={form.employerEsi} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Total CTC (Auto)</label>
              <input value={formatCurrency(form.totalCtc)} readOnly />
            </div>

            <div className="hr-form__field">
              <label>Payment Date</label>
              <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} />
            </div>

            <div className="hr-form__field">
              <label>Payment Mode</label>
              <select name="paymentMode" value={form.paymentMode} onChange={handleChange} required>
                <option>Bank Transfer</option>
                <option>UPI</option>
                <option>Cheque</option>
                <option>Cash</option>
              </select>
            </div>

            <div className="hr-form__field">
              <label>Bank Reference</label>
              <input
                name="bankReference"
                value={form.bankReference}
                onChange={handleChange}
                placeholder="UTR / cheque / transaction reference"
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
                placeholder="Optional salary notes"
              />
            </div>
          </div>

          <button type="submit" className="hr-btn hr-btn--submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Salary Record"}
          </button>
        </form>
      )}
    </div>
  );
}

export default SalaryManagementForm;
