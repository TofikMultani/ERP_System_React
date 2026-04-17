import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
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
import { fetchFinanceIncome, fetchFinanceExpenses } from "../../utils/financeApi.js";

const COLORS = ["#5a3df0", "#3b82f6", "#10b981", "#fbbf24", "#ef4444"];

function getMonthLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function FinanceReports() {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [incomeData, expenseData] = await Promise.all([
          fetchFinanceIncome(),
          fetchFinanceExpenses(),
        ]);

        if (isMounted) {
          setIncome(incomeData);
          setExpenses(expenseData);
        }
      } catch (error) {
        console.error("Unable to load finance reports data:", error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

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

    return monthKeys.map((monthKey) => {
      const income = monthlyIncomeMap[monthKey] || 0;
      const monthlyExpenses = monthlyExpenseMap[monthKey] || 0;
      return {
        month: monthKey,
        income,
        expenses: monthlyExpenses,
        profit: income - monthlyExpenses,
      };
    });
  }, [income, expenses]);

  const expenseCategoryData = useMemo(() => {
    const categoryMap = expenses.reduce((accumulator, expense) => {
      const category = expense.category || "Others";
      accumulator[category] = (accumulator[category] || 0) + (Number(expense.amount) || 0);
      return accumulator;
    }, {});

    return Object.entries(categoryMap).map(([category, amount]) => ({ category, amount }));
  }, [expenses]);

  const summaryRows = useMemo(
    () => monthlyData.map((row) => [
      row.month,
      `$${row.income.toFixed(2)}`,
      `$${row.expenses.toFixed(2)}`,
      `$${row.profit.toFixed(2)}`,
    ]),
    [monthlyData],
  );

  const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;

  return (
    <div className="finance-page">
      <div className="finance-page__header">
        <div>
          <h2>Financial Reports</h2>
          <p>Comprehensive financial analysis and insights</p>
        </div>
      </div>

      <div className="finance-cards">
        <Card title="Total Income" value={`$${totalIncome.toFixed(2)}`} helper="YTD" />
        <Card title="Total Expenses" value={`$${totalExpenses.toFixed(2)}`} helper="YTD" />
        <Card title="Net Profit" value={`$${totalProfit.toFixed(2)}`} helper="YTD" />
        <Card
          title="Profit Margin"
          value={totalIncome ? `${((totalProfit / totalIncome) * 100).toFixed(1)}%` : "0.0%"}
          helper="Of income"
        />
      </div>

      <div className="finance-charts">
        <div className="finance-panel">
          <h3 className="finance-panel__title">Financial Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              <Bar dataKey="profit" fill="#5a3df0" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="finance-panel">
          <h3 className="finance-panel__title">Expense Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseCategoryData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {expenseCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="finance-panel">
          <h3 className="finance-panel__title">Profit Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line type="monotone" dataKey="profit" stroke="#5a3df0" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="finance-panel">
        <h3 className="finance-panel__title">Monthly Summary</h3>
        <Table columns={["Period", "Income", "Expenses", "Profit"]} rows={summaryRows} />
        {!summaryRows.length ? <p className="root-admin-dashboard__empty-state">No monthly summary data yet.</p> : null}
      </div>
    </div>
  );
}

export default FinanceReports;
