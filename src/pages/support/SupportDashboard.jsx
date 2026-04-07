import Card from "../../components/Card.jsx";
import { ticketsData } from "../../utils/supportData.js";
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

const ticketData = [];

const resolutionData = [];

function SupportDashboard() {
  const openTickets = ticketsData.filter(
    (ticket) => ticket.status === "open",
  ).length;
  const resolvedTickets = ticketsData.filter(
    (ticket) => ticket.status === "resolved",
  ).length;
  const inProgressTickets = ticketsData.filter(
    (ticket) => ticket.status === "in-progress",
  ).length;

  return (
    <div className="support-page">
      <div className="support-page__header">
        <div>
          <h2>Support Dashboard</h2>
          <p>Monitor support tickets and resolution metrics</p>
        </div>
      </div>

      <div className="support-cards">
        <Card
          title="Open Tickets"
          value={openTickets}
          helper="Awaiting response"
        />
        <Card
          title="Resolved Tickets"
          value={resolvedTickets}
          helper="Closed items"
        />
        <Card
          title="In Progress"
          value={inProgressTickets}
          helper="Assigned to agents"
        />
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
          {!ticketData.length ? <p className="root-admin-dashboard__empty-state">No support trend data yet.</p> : null}
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
          {!resolutionData.length ? <p className="root-admin-dashboard__empty-state">No resolution distribution data yet.</p> : null}
        </div>
      </div>
    </div>
  );
}

export default SupportDashboard;
