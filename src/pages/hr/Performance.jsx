import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const performanceData = [
  {
    id: 1,
    name: "Ananya Sharma",
    dept: "Engineering",
    q1: 92,
    q2: 95,
    q3: 90,
    q4: 94,
    avg: "92.8",
    rating: "Excellent",
  },
  {
    id: 2,
    name: "Rohan Mehta",
    dept: "HR",
    q1: 78,
    q2: 80,
    q3: 82,
    q4: 81,
    avg: "80.3",
    rating: "Good",
  },
  {
    id: 3,
    name: "Priya Nair",
    dept: "Finance",
    q1: 85,
    q2: 88,
    q3: 84,
    q4: 87,
    avg: "86.0",
    rating: "Good",
  },
  {
    id: 4,
    name: "Arjun Patel",
    dept: "Sales",
    q1: 70,
    q2: 74,
    q3: 72,
    q4: 76,
    avg: "73.0",
    rating: "Average",
  },
  {
    id: 5,
    name: "Sneha Joshi",
    dept: "IT",
    q1: 88,
    q2: 90,
    q3: 89,
    q4: 91,
    avg: "89.5",
    rating: "Excellent",
  },
  {
    id: 6,
    name: "Vikram Singh",
    dept: "Engineering",
    q1: 76,
    q2: 79,
    q3: 78,
    q4: 80,
    avg: "78.3",
    rating: "Good",
  },
  {
    id: 7,
    name: "Neha Kapoor",
    dept: "Support",
    q1: 82,
    q2: 84,
    q3: 83,
    q4: 85,
    avg: "83.5",
    rating: "Good",
  },
  {
    id: 8,
    name: "Karan Verma",
    dept: "Sales",
    q1: 65,
    q2: 68,
    q3: 64,
    q4: 66,
    avg: "65.8",
    rating: "Below Average",
  },
];

const deptAvgData = [
  { dept: "Engineering", avg: 85.5 },
  { dept: "HR", avg: 80.3 },
  { dept: "Finance", avg: 86.0 },
  { dept: "Sales", avg: 69.4 },
  { dept: "IT", avg: 89.5 },
  { dept: "Support", avg: 83.5 },
];

const columns = [
  { header: "Employee", accessor: "name" },
  { header: "Department", accessor: "dept" },
  { header: "Q1", accessor: "q1" },
  { header: "Q2", accessor: "q2" },
  { header: "Q3", accessor: "q3" },
  { header: "Q4", accessor: "q4" },
  { header: "Avg Score", accessor: "avg" },
  { header: "Rating", accessor: "rating" },
];

const summary = [
  { title: "Avg Score", value: "82.4", helper: "org-wide average" },
  { title: "Excellent", value: "2", helper: "employees rated excellent" },
  { title: "Good", value: "4", helper: "employees rated good" },
  { title: "Needs Attention", value: "2", helper: "below 70%" },
];

function Performance() {
  return (
    <div className="hr-page">
      <div className="hr-page__header">
        <div>
          <h2>Performance</h2>
          <p>Annual performance reviews and quarterly scores.</p>
        </div>
        <button className="hr-btn">Start Review Cycle</button>
      </div>

      <div className="hr-cards">
        {summary.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      <div className="hr-charts">
        <div className="hr-panel" style={{ gridColumn: "1 / -1" }}>
          <h3 className="hr-panel__title">Average Score by Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={deptAvgData}
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(20,33,61,0.08)"
              />
              <XAxis
                dataKey="dept"
                tick={{ fontSize: 12, fill: "#69708a" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                tick={{ fontSize: 12, fill: "#69708a" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [v, "Avg Score"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(20,33,61,0.1)",
                }}
              />
              <Bar dataKey="avg" fill="#5a3df0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="hr-panel">
        <h3 className="hr-panel__title">Performance Records — FY 2025–26</h3>
        <Table columns={columns} rows={performanceData} />
      </div>
    </div>
  );
}

export default Performance;
