import { useState } from "react";
import Card from "../../components/Card.jsx";
import Button from "../../components/Button.jsx";
import Select from "../../components/Select.jsx";
import { usePersistentSnapshot } from "../../utils/persistentState.js";
import { ticketsData } from "../../utils/supportData.js";

function AssignTicket() {
  const tickets = usePersistentSnapshot("erp_support_tickets", ticketsData);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedQueue, setSelectedQueue] = useState("");

  const unassignedTickets = tickets.filter(
    (ticket) => !ticket.agent && !ticket.assignee,
  );

  const agentNames = Array.from(
    new Set(
      tickets
        .map((ticket) => ticket.agent || ticket.assignee)
        .filter((agent) => typeof agent === "string" && agent.trim().length > 0),
    ),
  );

  const categoryNames = Array.from(
    new Set(
      tickets
        .map((ticket) => ticket.category)
        .filter((category) => typeof category === "string" && category.trim().length > 0),
    ),
  );

  const agentOptions = agentNames.map((name) => ({
    label: name,
    value: name,
  }));
  const queueOptions = categoryNames.map((name) => ({
    label: name,
    value: name,
  }));

  const escalations = tickets.filter((ticket) => {
    const priority = String(ticket.priority || "").toLowerCase();
    return priority === "high" || priority === "critical";
  }).length;
  const availableAgents = agentNames.length;
  const queueTimeMinutes = Math.max(5, unassignedTickets.length * 6);

  return (
    <div className="support-page">
      <div className="support-page__header">
        <div>
          <h2>Assign Tickets</h2>
          <p>Allocate incoming support requests to the right team and agent.</p>
        </div>
      </div>

      <div className="support-cards">
        <Card
          title="Unassigned Tickets"
          value={unassignedTickets.length}
          helper="Needs routing"
        />
        <Card title="Escalations" value={escalations} helper="Priority attention" />
        <Card title="Available Agents" value={availableAgents} helper="Online now" />
        <Card
          title="Average Queue Time"
          value={`${queueTimeMinutes} min`}
          helper="Before assignment"
        />
      </div>

      <div className="support-panel">
        <div className="support-panel__header">
          <h3 className="support-panel__title">Assignment Workspace</h3>
          <div className="support-panel__toolbar">
            <Button variant="secondary" size="sm">
              Auto Assign
            </Button>
            <Button variant="primary" size="sm">
              Save Assignment
            </Button>
          </div>
        </div>

        <div className="finance-form__grid">
          <Select
            label="Assign To Agent"
            value={selectedAgent}
            onChange={(event) => setSelectedAgent(event.target.value)}
            options={agentOptions}
          />
          <Select
            label="Support Queue"
            value={selectedQueue}
            onChange={(event) => setSelectedQueue(event.target.value)}
            options={queueOptions}
          />
        </div>
      </div>

      <div className="support-panel">
        <h3 className="support-panel__title">Pending Assignment Queue</h3>
        <div className="support-table-wrapper">
          <table className="support-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {unassignedTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <strong>{ticket.id}</strong>
                  </td>
                  <td>{ticket.subject}</td>
                  <td>{ticket.customer}</td>
                  <td>{ticket.priority}</td>
                  <td>{ticket.category}</td>
                  <td>
                    <Button variant="ghost" size="sm">
                      Assign
                    </Button>
                  </td>
                </tr>
              ))}
              {!unassignedTickets.length ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "1.5rem" }}>
                    No tickets available.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AssignTicket;
