import { useState } from "react";
import Card from "../../components/Card.jsx";
import Button from "../../components/Button.jsx";
import Select from "../../components/Select.jsx";

const unassignedTickets = [];

const agentOptions = [];

const queueOptions = [];

function AssignTicket() {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedQueue, setSelectedQueue] = useState("");

  return (
    <div className="support-page">
      <div className="support-page__header">
        <div>
          <h2>Assign Tickets</h2>
          <p>Allocate incoming support requests to the right team and agent.</p>
        </div>
      </div>

      <div className="support-cards">
        <Card title="Unassigned Tickets" value="0" helper="Needs routing" />
        <Card title="Escalations" value="0" helper="Priority attention" />
        <Card title="Available Agents" value="0" helper="Online now" />
        <Card
          title="Average Queue Time"
          value="18 min"
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
