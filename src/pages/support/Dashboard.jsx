import { useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import { fetchSupportDashboard } from "../../utils/supportApi.js";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function SupportDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSupportDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="inv-container"><p>Loading dashboard...</p></div>;
  if (error) return <div className="inv-container"><p className="hr-inline-error">{error}</p></div>;
  if (!dashboard) return <div className="inv-container"><p>No data available</p></div>;

  const ticketStats = dashboard.ticketsStats || {};
  const customerStats = dashboard.customerStats || {};
  const priorityRows = Array.isArray(dashboard.ticketsByPriority) ? dashboard.ticketsByPriority : [];
  const categoryRows = Array.isArray(dashboard.ticketsByCategory) ? dashboard.ticketsByCategory : [];
  const recentRows = Array.isArray(dashboard.recentTickets) ? dashboard.recentTickets : [];

  const summaryCards = [
    { title: "Total Tickets", value: toNumber(ticketStats.total_tickets), helper: "all tickets" },
    { title: "Open", value: toNumber(ticketStats.open_tickets), helper: "awaiting action" },
    { title: "In Progress", value: toNumber(ticketStats.in_progress_tickets), helper: "actively handled" },
    { title: "Resolved", value: toNumber(ticketStats.resolved_tickets), helper: "completed" },
    { title: "Critical", value: toNumber(ticketStats.critical_tickets), helper: "high urgency" },
    {
      title: "Active Accounts",
      value: toNumber(customerStats.active_customers || ticketStats.unique_customers),
      helper: "customers with support activity",
    },
    {
      title: "Avg Responses",
      value: toNumber(ticketStats.avg_responses).toFixed(1),
      helper: "responses per ticket",
    },
    {
      title: "Avg Satisfaction",
      value: `${toNumber(ticketStats.avg_satisfaction).toFixed(1)}/5`,
      helper: "from rated tickets",
    },
  ];

  return (
    <div className="inv-container">
      <div className="inv-header">
        <h1>Support Dashboard</h1>
        <div className="inv-actions">
          <button type="button" className="inv-btn inv-btn--secondary" onClick={loadDashboard}>
            Refresh
          </button>
        </div>
      </div>

      <div className="inv-cards inv-cards--compact">
        {summaryCards.map((card) => (
          <Card key={card.title} {...card} />
        ))}
      </div>

      <div className="inv-panel">
        <h3 className="inv-panel__title">Tickets by Priority</h3>
        <Table
          columns={[
            { header: "Priority", accessor: "priority" },
            { header: "Count", accessor: "count" },
          ]}
          rows={priorityRows}
        />
      </div>

      <div className="inv-panel">
        <h3 className="inv-panel__title">Tickets by Category</h3>
        <Table
          columns={[
            { header: "Category", accessor: "category" },
            { header: "Count", accessor: "count" },
            { header: "Open", accessor: "open_count" },
          ]}
          rows={categoryRows}
        />
      </div>

      <div className="inv-panel">
        <h3 className="inv-panel__title">Recent Tickets</h3>
        <Table
          columns={[
            { header: "Ticket #", accessor: "ticketNumber" },
            { header: "Customer", accessor: "customerName" },
            { header: "Subject", accessor: "subject" },
            { header: "Priority", accessor: "priority" },
            { header: "Status", accessor: "status" },
          ]}
          rows={recentRows}
        />
      </div>
    </div>
  );
}
