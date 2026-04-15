import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import AdminLayout from "../layout/AdminLayout.jsx";
import HRLayout from "../layout/HRLayout.jsx";
import InventoryLayout from "../layout/InventoryLayout.jsx";
import SalesLayout from "../layout/SalesLayout.jsx";
import FinanceLayout from "../layout/FinanceLayout.jsx";
import ITLayout from "../layout/ITLayout.jsx";
import SupportLayout from "../layout/SupportLayout.jsx";
import Login from "../pages/login/Login.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import HRDashboard from "../pages/hr/HRDashboard.jsx";
import Employees from "../pages/hr/Employees.jsx";
import EmployeeForm from "../pages/hr/EmployeeForm.jsx";
import EmployeeDetails from "../pages/hr/EmployeeDetails.jsx";
import Departments from "../pages/hr/Departments.jsx";
import DepartmentForm from "../pages/hr/DepartmentForm.jsx";
import Leave from "../pages/hr/Leave.jsx";
import LeaveForm from "../pages/hr/LeaveForm.jsx";
import Payroll from "../pages/hr/Payroll.jsx";
import PayrollForm from "../pages/hr/PayrollForm.jsx";
import Recruitment from "../pages/hr/Recruitment.jsx";
import RecruitmentForm from "../pages/hr/RecruitmentForm.jsx";
import Documents from "../pages/hr/Documents.jsx";
import Training from "../pages/hr/Training.jsx";
import HRReports from "../pages/hr/Reports.jsx";
import Products from "../pages/inventory/Products.jsx";
import Categories from "../pages/inventory/Categories.jsx";
import Stock from "../pages/inventory/Stock.jsx";
import Suppliers from "../pages/inventory/Suppliers.jsx";
import Warehouses from "../pages/inventory/Warehouses.jsx";
import PurchaseOrders from "../pages/inventory/PurchaseOrders.jsx";
import Adjustments from "../pages/inventory/Adjustments.jsx";
import InventoryReports from "../pages/inventory/Reports.jsx";
import SalesDashboard from "../pages/sales/SalesDashboard.jsx";
import Customers from "../pages/sales/Customers.jsx";
import SalesOrders from "../pages/sales/Orders.jsx";
import SalesInvoices from "../pages/sales/Invoices.jsx";
import Quotations from "../pages/sales/Quotations.jsx";
import SalesReports from "../pages/sales/Reports.jsx";
import FinanceDashboard from "../pages/finance/FinanceDashboard.jsx";
import FinanceInvoices from "../pages/finance/Invoices.jsx";
import Expenses from "../pages/finance/Expenses.jsx";
import Payments from "../pages/finance/Payments.jsx";
import FinanceReports from "../pages/finance/Reports.jsx";
import ITDashboard from "../pages/it/ITDashboard.jsx";
import Systems from "../pages/it/Systems.jsx";
import Assets from "../pages/it/Assets.jsx";
import Maintenance from "../pages/it/Maintenance.jsx";
import ITReports from "../pages/it/Reports.jsx";
import SupportDashboard from "../pages/support/SupportDashboard.jsx";
import Tickets from "../pages/support/Tickets.jsx";
import AssignTicket from "../pages/support/AssignTicket.jsx";
import SupportReports from "../pages/support/Reports.jsx";
import RootAdminDashboard from "../pages/root-admin/RootAdminDashboard.jsx";
import RequestManagement from "../pages/root-admin/RequestManagement.jsx";
import Profile from "../pages/profile/Profile.jsx";
import Settings from "../pages/settings/Settings.jsx";
import LandingPage from "../pages/landing/LandingPage.jsx";
import ModuleConfiguration from "../pages/root-admin/ModuleConfiguration.jsx";
import PaymentProvisioning from "../pages/root-admin/PaymentProvisioning.jsx";
import CancelRequestPage from "../pages/request-action/CancelRequestPage.jsx";
import PaymentRequestPage from "../pages/request-action/PaymentRequestPage.jsx";
import MyUsers from "../pages/my-users/MyUsers.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/request-action/cancel" element={<CancelRequestPage />} />
      <Route path="/request-action/payment" element={<PaymentRequestPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route
            path="/admin/dashboard"
            element={<Navigate to="/admin" replace />}
          />
          <Route path="/root-admin" element={<RootAdminDashboard />} />
          <Route
            path="/root-admin/modules"
            element={<ModuleConfiguration />}
          />
          <Route
            path="/root-admin/requests"
            element={<RequestManagement />}
          />
          <Route
            path="/root-admin/payments"
            element={<PaymentProvisioning />}
          />
          <Route
            path="/root-admin/dashboard"
            element={<Navigate to="/root-admin" replace />}
          />

          <Route path="/hr" element={<HRLayout />}>
            <Route index element={<HRDashboard />} />
            <Route path="dashboard" element={<Navigate to="/hr" replace />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/new" element={<EmployeeForm />} />
            <Route path="employees/:employeeId" element={<EmployeeDetails />} />
            <Route
              path="employees/:employeeId/edit"
              element={<EmployeeForm />}
            />
            <Route path="departments" element={<Departments />} />
            <Route path="departments/new" element={<DepartmentForm />} />
            <Route
              path="departments/:departmentCode/edit"
              element={<DepartmentForm />}
            />
            <Route path="leave" element={<Leave />} />
            <Route path="leave/new" element={<LeaveForm />} />
            <Route path="leave/:leaveCode/edit" element={<LeaveForm />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="payroll/new" element={<PayrollForm />} />
            <Route path="payroll/:payrollCode/edit" element={<PayrollForm />} />
            <Route path="recruitment" element={<Recruitment />} />
            <Route path="recruitment/new" element={<RecruitmentForm />} />
            <Route
              path="recruitment/:candidateCode/edit"
              element={<RecruitmentForm />}
            />
            <Route path="documents" element={<Documents />} />
            <Route path="training" element={<Training />} />
            <Route path="reports" element={<HRReports />} />
          </Route>

          <Route path="/inventory" element={<InventoryLayout />}>
            <Route index element={<Products />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="stock" element={<Stock />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="adjustments" element={<Adjustments />} />
            <Route path="reports" element={<InventoryReports />} />
          </Route>

          <Route path="/sales" element={<SalesLayout />}>
            <Route index element={<SalesDashboard />} />
            <Route
              path="dashboard"
              element={<Navigate to="/sales" replace />}
            />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<SalesOrders />} />
            <Route path="invoices" element={<SalesInvoices />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="reports" element={<SalesReports />} />
          </Route>

          <Route path="/finance" element={<FinanceLayout />}>
            <Route index element={<FinanceDashboard />} />
            <Route
              path="dashboard"
              element={<Navigate to="/finance" replace />}
            />
            <Route path="invoices" element={<FinanceInvoices />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<FinanceReports />} />
          </Route>

          <Route path="/it" element={<ITLayout />}>
            <Route index element={<ITDashboard />} />
            <Route path="dashboard" element={<Navigate to="/it" replace />} />
            <Route path="systems" element={<Systems />} />
            <Route path="assets" element={<Assets />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="reports" element={<ITReports />} />
          </Route>

          <Route path="/support" element={<SupportLayout />}>
            <Route index element={<SupportDashboard />} />
            <Route
              path="dashboard"
              element={<Navigate to="/support" replace />}
            />
            <Route path="tickets" element={<Tickets />} />
            <Route path="assign-ticket" element={<AssignTicket />} />
            <Route path="reports" element={<SupportReports />} />
          </Route>

          {/* Profile Page */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-users" element={<MyUsers />} />

          {/* Settings Page */}
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
