import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchEmployees } from "../../utils/adminApi.js";
import { formatJoinedForDisplay } from "./employeeFormUtils.js";

function EmployeeDetails() {
  const navigate = useNavigate();
  const { employeeId } = useParams();

  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function runLoadEmployee() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const employees = await fetchEmployees();
        const records = Array.isArray(employees) ? employees : [];
        const matchedEmployee = records.find(
          (row) => String(row.employeeId) === String(employeeId),
        );

        if (!matchedEmployee) {
          setEmployee(null);
          setErrorMessage("Employee not found.");
          return;
        }

        setEmployee(matchedEmployee);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load employee details.");
      } finally {
        setIsLoading(false);
      }
    }

    runLoadEmployee();
  }, [employeeId]);

  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Employee Details</h2>
          <p>View full employee information.</p>
        </div>
        <div className="hr-actions-row">
          <button
            type="button"
            className="hr-btn hr-btn--secondary"
            onClick={() => navigate("/hr/employees")}
          >
            Go Back
          </button>
          <button
            type="button"
            className="hr-btn"
            onClick={() =>
              navigate(`/hr/employees/${encodeURIComponent(employeeId)}/edit`)
            }
            disabled={!employee}
          >
            Edit
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="hr-panel">
          <p>Loading employee details...</p>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="hr-panel">
          <p className="hr-inline-error">{errorMessage}</p>
        </div>
      )}

      {!isLoading && employee && (
        <div className="hr-panel hr-employee-details">
          <div className="hr-employee-details__grid">
            <div>
              <span className="hr-employee-details__label">Employee ID</span>
              <strong>{employee.employeeId}</strong>
            </div>
            <div>
              <span className="hr-employee-details__label">Full Name</span>
              <strong>{employee.name}</strong>
            </div>
            <div>
              <span className="hr-employee-details__label">Department</span>
              <strong>{employee.dept}</strong>
            </div>
            <div>
              <span className="hr-employee-details__label">Role / Designation</span>
              <strong>{employee.role}</strong>
            </div>
            <div>
              <span className="hr-employee-details__label">Status</span>
              <strong>{employee.status}</strong>
            </div>
            <div>
              <span className="hr-employee-details__label">Phone</span>
              <strong>{employee.phone}</strong>
            </div>
            <div>
              <span className="hr-employee-details__label">Email</span>
              <strong>{employee.email}</strong>
            </div>
            <div>
              <span className="hr-employee-details__label">Date Joined</span>
              <strong>{formatJoinedForDisplay(employee.joined)}</strong>
            </div>
            <div>
              <span className="hr-employee-details__label">Salary</span>
              <strong>{employee.salary || "—"}</strong>
            </div>
            <div>
              <span className="hr-employee-details__label">Address</span>
              <strong>{employee.address || "—"}</strong>
            </div>
            <div>
              <span className="hr-employee-details__label">Reporting Manager</span>
              <strong>{employee.manager || "—"}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDetails;
