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
} from "recharts";

const uptimeData = [
  { week: "Week 1", uptime: 99.8 },
  { week: "Week 2", uptime: 99.9 },
  { week: "Week 3", uptime: 99.7 },
  { week: "Week 4", uptime: 99.95 },
];

const maintenanceData = [
  { month: "January", completed: 8, pending: 2 },
  { month: "February", completed: 6, pending: 3 },
  { month: "March", completed: 5, pending: 4 },
];

const assetSummary = [
  ["Laptops", "45", "₹45L", "Active"],
  ["Desktops", "30", "₹36L", "Active"],
  ["Servers", "8", "₹80L", "Active"],
  ["Networking", "25", "₹18L", "Active"],
];

function Reports() {
  return (
    <div className="it-page">
      <div className="it-page__header">
        <div>
          <h2>IT Reports</h2>
          <p>System performance, maintenance, and asset analytics</p>
        </div>
      </div>

      <div className="it-cards">
        <Card title="Avg System Uptime" value="99.85%" helper="Last 30 days" />
        <Card title="Total Assets" value="108" helper="Managed" />
        <Card title="Completed Maintenance" value="19" helper="YTD" />
        <Card title="Pending Tasks" value="9" helper="To be scheduled" />
      </div>

      <div className="it-charts">
        <div className="it-panel">
          <h3 className="it-panel__title">System Uptime Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={uptimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[98, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="uptime"
                stroke="#10b981"
                strokeWidth={2}
                name="Uptime %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="it-panel">
          <h3 className="it-panel__title">Maintenance Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={maintenanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="pending" fill="#fbbf24" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="it-panel">
          <h3 className="it-panel__title">Asset Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { type: "Laptops", count: 45 },
                { type: "Desktops", count: 30 },
                { type: "Servers", count: 8 },
                { type: "Networking", count: 25 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#5a3df0" name="Units" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="it-panel">
        <h3 className="it-panel__title">Asset Summary</h3>
        <Table
          columns={["Type", "Count", "Value", "Status"]}
          rows={assetSummary}
        />
      </div>
    </div>
  );
}

export default Reports;
