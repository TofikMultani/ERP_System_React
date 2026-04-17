import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card.jsx";
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
import {
  fetchFinanceIncome,
  fetchFinanceExpenses,
  fetchFinancePayments,
} from "../../utils/financeApi.js";

const COLORS = ["#5a3df0", "#3b82f6", "#10b981", "#fbbf24", "#ef4444"];

function getMonthLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function FinanceDashboard() {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [incomeData, expensesData, paymentsData] = await Promise.all([
          fetchFinanceIncome(),
          fetchFinanceExpenses(),
          fetchFinancePayments(),
        ]);

        if (isMounted) {
          setIncome(incomeData);
          setExpenses(expensesData);
          setPayments(paymentsData);
        }
      } catch (error) {
        console.error("Unable to load finance dashboard data:", error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalIncome = useMemo(
    () => income.reduce((sum, record) => sum + (Number(record.amount) || 0), 0),
    [income],
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0),
    [expenses],
  );

  const pendingIncome = useMemo(
    () => income
      .filter((record) => String(record.status || "").toLowerCase() === "pending")
      .reduce((sum, record) => sum + (Number(record.amount) || 0), 0),
    [income],
  );

  const completedPayments = useMemo(
    () => payments.filter((payment) => String(payment.status || "").toLowerCase() === "completed").length,
    [payments],
  );

  const monthlyData = useMemo(() => {
    const monthlyIncomeMap = income.reduce((accumulator, record) => {
      const month = getMonthLabel(record.receivedDate || record.date);
      if (!month) {
        return accumulator;
      }
      accumulator[month] = (accumulator[month] || 0) + (Number(record.amount) || 0);
      return accumulator;
    }, {});

    const monthlyExpenseMap = expenses.reduce((accumulator, expense) => {
      const month = getMonthLabel(expense.expenseDate || expense.date);
      if (!month) {
        return accumulator;
      }
      accumulator[month] = (accumulator[month] || 0) + (Number(expense.amount) || 0);
      return accumulator;
    }, {});

    const monthKeys = Array.from(
      new Set([...Object.keys(monthlyIncomeMap), ...Object.keys(monthlyExpenseMap)]),
    )
      .sort((left, right) => left.localeCompare(right))
      .slice(-6);

    return monthKeys.map((monthKey) => ({
      month: monthKey.slice(5),
      income: monthlyIncomeMap[monthKey] || 0,
      expenses: monthlyExpenseMap[monthKey] || 0,
      profit: (monthlyIncomeMap[monthKey] || 0) - (monthlyExpenseMap[monthKey] || 0),
    }));
  }, [income, expenses]);

  const expenseData = useMemo(() => {
    const categoryMap = expenses.reduce((accumulator, expense) => {
      const category = expense.category || "Others";
      accumulator[category] = (accumulator[category] || 0) + (Number(expense.amount) || 0);
      return accumulator;
    }, {});

    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [expenses]);

  return (
    <div className="finance-page">
      <div className="finance-page__header">
        <div>
          <h2>Finance Dashboard</h2>
          <p>Overview of financial performance and cash flow</p>
        </div>
      </div>

      <div className="finance-cards">
        <Card title="Total Income" value={`₹${totalIncome.toFixed(2)}`} helper={`${income.length} records`} />
        <Card title="Total Expenses" value={`₹${totalExpenses.toFixed(2)}`} helper={`${expenses.length} expense records`} />
        <Card title="Net Profit" value={`₹${(totalIncome - totalExpenses).toFixed(2)}`} helper="Income minus expenses" />
        <Card title="Pending Income" value={`₹${pendingIncome.toFixed(2)}`} helper={`${completedPayments} payments completed`} />
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Line type="monotone" dataKey="profit" stroke="#5a3df0" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
          {!monthlyData.length ? <p className="root-admin-dashboard__empty-state">No profit trend data yet.</p> : null}
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboard;
