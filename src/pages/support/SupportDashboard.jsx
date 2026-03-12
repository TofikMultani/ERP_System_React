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
} from "recharts";

const ticketData = [
  { month: "January", open: 25, resolved: 18, pending: 7 },
  { month: "February", open: 32, resolved: 28, pending: 4 },
  { month: "March", open: 28, resolved: 32, pending: -4 },
];

const resolutionData = [
  { name: "Within 24hrs", value: 45 },
  { name: "Within 48hrs", value: 30 },
  { name: "Within 72hrs", value: 15 },
  { name: "Beyond 72hrs", value: 10 },
];

function SupportDashboard() {
  return (
    <div className="support-page">
      <div className="support-page__header">
        <div>
          <h2>Support Dashboard</h2>
          <p>Monitor support tickets and resolution metrics</p>
        </div>
      </div>

      <div className="support-cards">
        <Card title="Open Tickets" value="48" helper="Awaiting response" />
        <Card title="Resolved Today" value="12" helper="Avg resolution" />
        <Card title="Avg Response Time" value="2.5 hrs" helper="Within SLA" />
        <Card title="Customer Satisfaction" value="4.8/5" helper="Rating" />
      </div>

      <div className="support-charts">
        <div className="support-panel">
          <h3 className="support-panel__title">Ticket Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ticketData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="open"
                stroke="#6366f1"
                name="Open"
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="#10b981"
                name="Resolved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="support-panel">
          <h3 className="support-panel__title">Resolution Time Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default SupportDashboard;
