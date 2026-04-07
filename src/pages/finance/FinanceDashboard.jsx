import Card from "../../components/Card.jsx";
import { usePersistentSnapshot } from "../../utils/persistentState.js";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const expenseData = [];

const monthlyData = [];

const COLORS = ["#5a3df0", "#3b82f6", "#10b981", "#fbbf24", "#ef4444"];

function FinanceDashboard() {
  const invoices = usePersistentSnapshot("erp_finance_invoices", []);
  const expenses = usePersistentSnapshot("erp_finance_expenses", []);
  const payments = usePersistentSnapshot("erp_finance_payments", []);

  const totalIncome = invoices.reduce(
    (sum, invoice) =>
      sum +
      (Number.parseInt(String(invoice.amount).replace(/[^\d]/g, ""), 10) || 0),
    0,
  );
  const totalExpenses = expenses.reduce(
    (sum, expense) =>
      sum +
      (Number.parseInt(String(expense.amount).replace(/[^\d]/g, ""), 10) || 0),
    0,
  );
  const pendingInvoices = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce(
      (sum, invoice) =>
        sum +
        (Number.parseInt(String(invoice.amount).replace(/[^\d]/g, ""), 10) ||
          0),
      0,
    );
  const completedPayments = payments.filter(
    (payment) => payment.status === "Completed",
  ).length;

  return (
    <div className="finance-page">
      <div className="finance-page__header">
        <div>
          <h2>Finance Dashboard</h2>
          <p>Overview of financial performance and cash flow</p>
        </div>
      </div>

      <div className="finance-cards">
        <Card
          title="Total Income"
          value={`₹${(totalIncome / 100000).toFixed(2)}L`}
          helper={`${invoices.length} invoices`}
        />
        <Card
          title="Total Expenses"
          value={`₹${(totalExpenses / 100000).toFixed(2)}L`}
          helper={`${expenses.length} expense records`}
        />
        <Card
          title="Net Profit"
          value={`₹${((totalIncome - totalExpenses) / 100000).toFixed(2)}L`}
          helper="Income minus expenses"
        />
        <Card
          title="Pending Invoices"
          value={`₹${(pendingInvoices / 100000).toFixed(2)}L`}
          helper={`${completedPayments} payments completed`}
        />
      </div>

      <div className="finance-charts">
        <div className="finance-panel">
          <h3 className="finance-panel__title">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
          {!monthlyData.length ? <p className="root-admin-dashboard__empty-state">No finance trend data yet.</p> : null}
        </div>

        <div className="finance-panel">
          <h3 className="finance-panel__title">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {expenseData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value}`} />
            </PieChart>
          </ResponsiveContainer>
          {!expenseData.length ? <p className="root-admin-dashboard__empty-state">No expense breakdown data yet.</p> : null}
        </div>

        <div className="finance-panel">
          <h3 className="finance-panel__title">Monthly Profit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={monthlyData.map((m) => ({
                ...m,
                profit: m.income - m.expenses,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#5a3df0"
                strokeWidth={2}
                name="Profit"
              />
            </LineChart>
          </ResponsiveContainer>
          {!monthlyData.length ? <p className="root-admin-dashboard__empty-state">No profit trend data yet.</p> : null}
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboard;
