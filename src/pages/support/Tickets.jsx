import { useState } from "react";
import Card from "../../components/Card.jsx";
import Button from "../../components/Button.jsx";
import Badge from "../../components/Badge.jsx";

const ticketsData = [
  {
    id: "TKT-001",
    title: "Login issue on mobile",
    customer: "John Doe",
    status: "open",
    priority: "high",
    created: "2024-03-10",
  },
  {
    id: "TKT-002",
    title: "Product compatibility question",
    customer: "Jane Smith",
    status: "in-progress",
    priority: "medium",
    created: "2024-03-09",
  },
  {
    id: "TKT-003",
    title: "Integration setup help",
    customer: "ABC Corp",
    status: "resolved",
    priority: "high",
    created: "2024-03-08",
  },
  {
    id: "TKT-004",
    title: "Feature request - dark mode",
    customer: "Tech Team",
    status: "open",
    priority: "low",
    created: "2024-03-07",
  },
  {
    id: "TKT-005",
    title: "Performance degradation",
    customer: "Premium User",
    status: "in-progress",
    priority: "critical",
    created: "2024-03-06",
  },
];

function getStatusColor(status) {
  const statusMap = {
    open: "primary",
    "in-progress": "warning",
    resolved: "success",
  };
  return statusMap[status] || "secondary";
}

function getPriorityColor(priority) {
  const priorityMap = {
    critical: "danger",
    high: "warning",
    medium: "info",
    low: "success",
  };
  return priorityMap[priority] || "secondary";
}

function Tickets() {
  const [filter, setFilter] = useState("all");

  const filteredTickets =
    filter === "all"
      ? ticketsData
      : ticketsData.filter((t) => t.status === filter);

  return (
    <div className="support-page">
      <div className="support-page__header">
        <div>
          <h2>Support Tickets</h2>
          <p>Create and manage customer support tickets</p>
        </div>
      </div>

      <div className="support-cards">
        <Card
          title="Total Tickets"
          value={ticketsData.length}
          helper="All time"
        />
        <Card
          title="Open"
          value={ticketsData.filter((t) => t.status === "open").length}
          helper="Awaiting response"
        />
        <Card
          title="In Progress"
          value={ticketsData.filter((t) => t.status === "in-progress").length}
          helper="Agent assigned"
        />
        <Card
          title="Resolved"
          value={ticketsData.filter((t) => t.status === "resolved").length}
          helper="Closed"
        />
      </div>

      <div className="support-panel">
        <div className="support-panel__header">
          <h3 className="support-panel__title">All Tickets</h3>
          <div className="support-panel__toolbar">
            {["all", "open", "in-progress", "resolved"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="support-table-wrapper">
          <table className="support-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <strong>{ticket.id}</strong>
                  </td>
                  <td>{ticket.title}</td>
                  <td>{ticket.customer}</td>
                  <td>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td>{ticket.created}</td>
                  <td>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Tickets;
