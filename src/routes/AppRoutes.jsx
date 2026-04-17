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
import DocumentForm from "../pages/hr/DocumentForm.jsx";
import TrainingForm from "../pages/hr/TrainingForm.jsx";
import HRReports from "../pages/hr/Reports.jsx";
import Products from "../pages/inventory/Products.jsx";
import ProductForm from "../pages/inventory/ProductsForm.jsx";
import Categories from "../pages/inventory/Categories.jsx";
import CategoryForm from "../pages/inventory/CategoriesForm.jsx";
import Stock from "../pages/inventory/Stock.jsx";
import StockForm from "../pages/inventory/StockForm.jsx";
import Suppliers from "../pages/inventory/Suppliers.jsx";
import SupplierForm from "../pages/inventory/SuppliersForm.jsx";
import Warehouses from "../pages/inventory/Warehouses.jsx";
import WarehouseForm from "../pages/inventory/WarehousesForm.jsx";
import Adjustments from "../pages/inventory/Adjustments.jsx";
import AdjustmentForm from "../pages/inventory/AdjustmentsForm.jsx";
import InventoryReports from "../pages/inventory/Reports.jsx";
import SalesDashboard from "../pages/sales/SalesDashboard.jsx";
import { Customers as SalesCustomersList, CustomersForm as SalesCustomersForm } from "../pages/sales/Customers.jsx";
import { Orders as SalesOrdersList, OrdersForm as SalesOrdersForm } from "../pages/sales/Orders.jsx";
import { Invoices as SalesInvoicesList, InvoicesForm as SalesInvoicesForm } from "../pages/sales/Invoices.jsx";
import { Quotations as SalesQuotationsList, QuotationsForm as SalesQuotationsForm } from "../pages/sales/Quotations.jsx";
import SalesReports from "../pages/sales/Reports.jsx";
import FinanceDashboard from "../pages/finance/FinanceDashboard.jsx";
import { FinanceIncome, FinanceIncomeForm } from "../pages/finance/Invoices.jsx";
import { FinanceExpenses, FinanceExpensesForm } from "../pages/finance/Expenses.jsx";
import { FinancePayments, FinancePaymentsForm } from "../pages/finance/Payments.jsx";
import FinanceReports from "../pages/finance/Reports.jsx";
import ITDashboard from "../pages/it/ITDashboard.jsx";
import { Systems, SystemsForm } from "../pages/it/Systems.jsx";
import { Assets, AssetsForm } from "../pages/it/Assets.jsx";
import { Maintenance, MaintenanceForm } from "../pages/it/Maintenance.jsx";
import ITReports from "../pages/it/Reports.jsx";
import SupportDashboard from "../pages/support/Dashboard.jsx";
import SupportCustomers from "../pages/support/Customers.jsx";
import CustomersForm from "../pages/support/CustomersForm.jsx";
import SupportTickets from "../pages/support/Tickets.jsx";
import TicketsForm from "../pages/support/TicketsForm.jsx";
import Responses from "../pages/support/Responses.jsx";
import ResponsesForm from "../pages/support/ResponsesForm.jsx";
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
            <Route path="documents/new" element={<DocumentForm />} />
            <Route path="training" element={<Training />} />
            <Route path="training/new" element={<TrainingForm />} />
            <Route path="training/:trainingCode/edit" element={<TrainingForm />} />
            <Route path="reports" element={<HRReports />} />
          </Route>

          <Route path="/inventory" element={<InventoryLayout />}>
            <Route index element={<Products />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:productCode/edit" element={<ProductForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="categories/:categoryCode/edit" element={<CategoryForm />} />
            <Route path="stock" element={<Stock />} />
            <Route path="stock/new" element={<StockForm />} />
            <Route path="stock/:stockCode/edit" element={<StockForm />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="suppliers/new" element={<SupplierForm />} />
            <Route path="suppliers/:supplierCode/edit" element={<SupplierForm />} />
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="warehouses/new" element={<WarehouseForm />} />
            <Route path="warehouses/:warehouseCode/edit" element={<WarehouseForm />} />
            <Route path="adjustments" element={<Adjustments />} />
            <Route path="adjustments/new" element={<AdjustmentForm />} />
            <Route path="adjustments/:adjustmentCode/edit" element={<AdjustmentForm />} />
            <Route path="reports" element={<InventoryReports />} />
          </Route>

          <Route path="/sales" element={<SalesLayout />}>
            <Route index element={<SalesDashboard />} />
            <Route
              path="dashboard"
              element={<Navigate to="/sales" replace />}
            />
            <Route path="customers" element={<SalesCustomersList />} />
            <Route path="customers/new" element={<SalesCustomersForm />} />
            <Route path="customers/:customerCode/edit" element={<SalesCustomersForm />} />
            <Route path="orders" element={<SalesOrdersList />} />
            <Route path="orders/new" element={<SalesOrdersForm />} />
            <Route path="orders/:orderNumber/edit" element={<SalesOrdersForm />} />
            <Route path="invoices" element={<SalesInvoicesList />} />
            <Route path="invoices/new" element={<SalesInvoicesForm />} />
            <Route path="invoices/:invoiceNumber/edit" element={<SalesInvoicesForm />} />
            <Route path="quotations" element={<SalesQuotationsList />} />
            <Route path="quotations/new" element={<SalesQuotationsForm />} />
            <Route path="quotations/:quotationNumber/edit" element={<SalesQuotationsForm />} />
            <Route path="reports" element={<SalesReports />} />
          </Route>

          <Route path="/finance" element={<FinanceLayout />}>
            <Route index element={<FinanceDashboard />} />
            <Route
              path="dashboard"
              element={<Navigate to="/finance" replace />}
            />
            <Route path="income" element={<FinanceIncome />} />
            <Route path="income/new" element={<FinanceIncomeForm />} />
            <Route path="income/:incomeCode/edit" element={<FinanceIncomeForm />} />
            <Route path="expenses" element={<FinanceExpenses />} />
            <Route path="expenses/new" element={<FinanceExpensesForm />} />
            <Route path="expenses/:expenseCode/edit" element={<FinanceExpensesForm />} />
            <Route path="payments" element={<FinancePayments />} />
            <Route path="payments/new" element={<FinancePaymentsForm />} />
            <Route path="payments/:paymentCode/edit" element={<FinancePaymentsForm />} />
            <Route path="reports" element={<FinanceReports />} />
          </Route>

          <Route path="/it" element={<ITLayout />}>
            <Route index element={<ITDashboard />} />
            <Route path="dashboard" element={<Navigate to="/it" replace />} />
            <Route path="systems" element={<Systems />} />
            <Route path="systems/new" element={<SystemsForm />} />
            <Route path="systems/:systemCode/edit" element={<SystemsForm />} />
            <Route path="assets" element={<Assets />} />
            <Route path="assets/new" element={<AssetsForm />} />
            <Route path="assets/:assetCode/edit" element={<AssetsForm />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="maintenance/new" element={<MaintenanceForm />} />
            <Route path="maintenance/:maintenanceCode/edit" element={<MaintenanceForm />} />
            <Route path="reports" element={<ITReports />} />
          </Route>

          <Route path="/support" element={<SupportLayout />}>
            <Route index element={<SupportDashboard />} />
            <Route
              path="dashboard"
              element={<Navigate to="/support" replace />}
            />
            <Route path="customers" element={<SupportCustomers />} />
            <Route path="customers/new" element={<CustomersForm />} />
            <Route path="customers/:code/edit" element={<CustomersForm />} />
            <Route path="tickets" element={<SupportTickets />} />
            <Route path="tickets/new" element={<TicketsForm />} />
            <Route path="tickets/:code/edit" element={<TicketsForm />} />
            <Route path="responses" element={<Responses />} />
            <Route path="responses/new" element={<ResponsesForm />} />
            <Route path="responses/:code/edit" element={<ResponsesForm />} />
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
