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

const expenseData = [
  { category: "Salaries", amount: 450000 },
  { category: "Operations", amount: 125000 },
  { category: "Marketing", amount: 75000 },
  { category: "Utilities", amount: 35000 },
  { category: "Others", amount: 40000 },
];

const monthlyData = [
  { month: "January", income: 450000, expenses: 385000 },
  { month: "February", income: 520000, expenses: 410000 },
  { month: "March", income: 615000, expenses: 445000 },
];

const COLORS = ["#5a3df0", "#3b82f6", "#10b981", "#fbbf24", "#ef4444"];

function FinanceDashboard() {
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);

  return (
    <div className="finance-page">
      <div className="finance-page__header">
        <div>
          <h2>Finance Dashboard</h2>
          <p>Overview of financial performance and cash flow</p>
        </div>
      </div>

      <div className="finance-cards">
        <Card title="Total Income" value="₹15.85L" helper="YTD" />
        <Card title="Total Expenses" value="₹12.40L" helper="YTD" />
        <Card title="Net Profit" value="₹3.45L" helper="YTD" />
        <Card
          title="Pending Invoices"
          value="₹2.15L"
          helper="Not yet received"
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
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboard;
