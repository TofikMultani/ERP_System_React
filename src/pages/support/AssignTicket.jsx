import { useState } from "react";
import Card from "../../components/Card.jsx";
import Button from "../../components/Button.jsx";
import Select from "../../components/Select.jsx";

const unassignedTickets = [
  {
    id: "TKT-006",
    subject: "Billing discrepancy in invoice",
    customer: "Nexa Retail",
    priority: "High",
    category: "Billing",
  },
  {
    id: "TKT-007",
    subject: "Unable to export monthly report",
    customer: "BlueWave Pvt Ltd",
    priority: "Medium",
    category: "Reporting",
  },
  {
    id: "TKT-008",
    subject: "Warehouse sync delay issue",
    customer: "Prime Logistics",
    priority: "Critical",
    category: "Integration",
  },
  {
    id: "TKT-009",
    subject: "Need help with user permissions",
    customer: "Vertex Solutions",
    priority: "Low",
    category: "Access",
  },
];

const agentOptions = [
  { value: "sarah-johnson", label: "Sarah Johnson - Billing" },
  { value: "mike-wilson", label: "Mike Wilson - Technical" },
  { value: "emily-brown", label: "Emily Brown - Reporting" },
  { value: "david-lee", label: "David Lee - Integrations" },
];

const queueOptions = [
  { value: "level-1", label: "Level 1 Support" },
  { value: "level-2", label: "Level 2 Support" },
  { value: "billing", label: "Billing Desk" },
  { value: "technical", label: "Technical Desk" },
];

function AssignTicket() {
  const [selectedAgent, setSelectedAgent] = useState(agentOptions[0].value);
  const [selectedQueue, setSelectedQueue] = useState(queueOptions[0].value);

  return (
    <div className="support-page">
      <div className="support-page__header">
        <div>
          <h2>Assign Tickets</h2>
          <p>Allocate incoming support requests to the right team and agent.</p>
        </div>
      </div>

      <div className="support-cards">
        <Card title="Unassigned Tickets" value="14" helper="Needs routing" />
        <Card title="Escalations" value="3" helper="Priority attention" />
        <Card title="Available Agents" value="9" helper="Online now" />
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AssignTicket;
