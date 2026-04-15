import Card from "../../components/Card.jsx";
import { ticketsData } from "../../utils/supportData.js";
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
} from "recharts";

function getMonthLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function SupportDashboard() {
  const tickets = usePersistentSnapshot("erp_support_tickets", ticketsData);

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "open",
  ).length;
  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "resolved",
  ).length;
  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "in-progress",
  ).length;

  const monthlyMap = tickets.reduce((accumulator, ticket) => {
    const monthKey = getMonthLabel(ticket.created || ticket.date);
    if (!monthKey) {
      return accumulator;
    }

    if (!accumulator[monthKey]) {
      accumulator[monthKey] = { month: monthKey, open: 0, resolved: 0 };
    }

    if (ticket.status === "resolved") {
      accumulator[monthKey].resolved += 1;
    } else {
      accumulator[monthKey].open += 1;
    }

    return accumulator;
  }, {});

  const ticketData = Object.values(monthlyMap)
    .sort((left, right) => left.month.localeCompare(right.month))
    .slice(-6)
    .map((item) => ({ ...item, month: item.month.slice(5) }));

  const statusCountMap = tickets.reduce((accumulator, ticket) => {
    const key = ticket.status || "unknown";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const resolutionData = Object.entries(statusCountMap).map(([name, value]) => ({
    name,
    value,
  }));

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
        <Card
          title="Customer Satisfaction"
          value={`${tickets.length ? ((resolvedTickets / tickets.length) * 5).toFixed(1) : "0.0"}/5`}
          helper="Resolution ratio"
        />
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
