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

const monthlyData = [
  { month: "January", income: 450000, expenses: 385000, profit: 65000 },
  { month: "February", income: 520000, expenses: 410000, profit: 110000 },
  { month: "March", income: 615000, expenses: 445000, profit: 170000 },
];

const expenseCategoryData = [
  { category: "Salaries", amount: 450000 },
  { category: "Operations", amount: 125000 },
  { category: "Marketing", amount: 75000 },
  { category: "Utilities", amount: 35000 },
  { category: "Others", amount: 40000 },
];

const COLORS = ["#5a3df0", "#3b82f6", "#10b981", "#fbbf24", "#ef4444"];

const summaryRows = [
  ["January 2026", "₹4.50L", "₹3.85L", "₹0.65L"],
  ["February 2026", "₹5.20L", "₹4.10L", "₹1.10L"],
  ["March 2026", "₹6.15L", "₹4.45L", "₹1.70L"],
];

function FinanceReports() {
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
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
        <Card
          title="Total Income"
          value={"₹" + (totalIncome / 100000).toFixed(2) + "L"}
          helper="YTD"
        />
        <Card
          title="Total Expenses"
          value={"₹" + (totalExpenses / 100000).toFixed(2) + "L"}
          helper="YTD"
        />
        <Card
          title="Net Profit"
          value={"₹" + (totalProfit / 100000).toFixed(2) + "L"}
          helper="YTD"
        />
        <Card
          title="Profit Margin"
          value={((totalProfit / totalIncome) * 100).toFixed(1) + "%"}
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
              <Tooltip formatter={(value) => `₹${value}`} />
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
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value}`} />
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
        </div>
      </div>

      <div className="finance-panel">
        <h3 className="finance-panel__title">Monthly Summary</h3>
        <Table
          columns={["Period", "Income", "Expenses", "Profit"]}
          rows={summaryRows}
        />
      </div>
    </div>
  );
}

export default FinanceReports;
