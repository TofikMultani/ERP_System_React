import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import AdminLayout from "../layout/AdminLayout.jsx";
import Login from "../pages/login/Login.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import HRDashboard from "../pages/hr/HRDashboard.jsx";
import Employees from "../pages/hr/Employees.jsx";
import Departments from "../pages/hr/Departments.jsx";
import Attendance from "../pages/hr/Attendance.jsx";
import Leave from "../pages/hr/Leave.jsx";
import Payroll from "../pages/hr/Payroll.jsx";
import Recruitment from "../pages/hr/Recruitment.jsx";
import Performance from "../pages/hr/Performance.jsx";
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
import Profile from "../pages/profile/Profile.jsx";
import Settings from "../pages/settings/Settings.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route
            path="/admin/dashboard"
            element={<Navigate to="/admin" replace />}
          />

          <Route path="/hr" element={<Navigate to="/hr/dashboard" replace />} />
          <Route path="/hr/dashboard" element={<HRDashboard />} />
          <Route path="/hr/employees" element={<Employees />} />
          <Route path="/hr/departments" element={<Departments />} />
          <Route path="/hr/attendance" element={<Attendance />} />
          <Route path="/hr/leave" element={<Leave />} />
          <Route path="/hr/payroll" element={<Payroll />} />
          <Route path="/hr/recruitment" element={<Recruitment />} />
          <Route path="/hr/performance" element={<Performance />} />
          <Route path="/hr/documents" element={<Documents />} />
          <Route path="/hr/training" element={<Training />} />
          <Route path="/hr/reports" element={<HRReports />} />

          <Route
            path="/inventory"
            element={<Navigate to="/inventory/products" replace />}
          />
          <Route path="/inventory/products" element={<Products />} />
          <Route path="/inventory/categories" element={<Categories />} />
          <Route path="/inventory/stock" element={<Stock />} />
          <Route path="/inventory/suppliers" element={<Suppliers />} />
          <Route path="/inventory/warehouses" element={<Warehouses />} />
          <Route
            path="/inventory/purchase-orders"
            element={<PurchaseOrders />}
          />
          <Route path="/inventory/adjustments" element={<Adjustments />} />
          <Route path="/inventory/reports" element={<InventoryReports />} />

          <Route
            path="/sales"
            element={<Navigate to="/sales/dashboard" replace />}
          />
          <Route path="/sales/dashboard" element={<SalesDashboard />} />
          <Route path="/sales/customers" element={<Customers />} />
          <Route path="/sales/orders" element={<SalesOrders />} />
          <Route path="/sales/invoices" element={<SalesInvoices />} />
          <Route path="/sales/quotations" element={<Quotations />} />
          <Route path="/sales/reports" element={<SalesReports />} />

          <Route
            path="/finance"
            element={<Navigate to="/finance/dashboard" replace />}
          />
          <Route path="/finance/dashboard" element={<FinanceDashboard />} />
          <Route path="/finance/invoices" element={<FinanceInvoices />} />
          <Route path="/finance/expenses" element={<Expenses />} />
          <Route path="/finance/payments" element={<Payments />} />
          <Route path="/finance/reports" element={<FinanceReports />} />

          <Route path="/it" element={<Navigate to="/it/dashboard" replace />} />
          <Route path="/it/dashboard" element={<ITDashboard />} />
          <Route path="/it/systems" element={<Systems />} />
          <Route path="/it/assets" element={<Assets />} />
          <Route path="/it/maintenance" element={<Maintenance />} />
          <Route path="/it/reports" element={<ITReports />} />

          <Route
            path="/support"
            element={<Navigate to="/support/dashboard" replace />}
          />
          <Route path="/support/dashboard" element={<SupportDashboard />} />
          <Route path="/support/tickets" element={<Tickets />} />
          <Route path="/support/assign-ticket" element={<AssignTicket />} />
          <Route path="/support/reports" element={<SupportReports />} />

          {/* Profile Page */}
          <Route path="/profile" element={<Profile />} />

          {/* Settings Page */}
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
