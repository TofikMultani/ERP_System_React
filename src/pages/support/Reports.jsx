import Card from "../../components/Card.jsx";

const reportData = [];

function SupportReports() {
  const totalTickets = reportData.reduce((sum, r) => sum + r.tickets, 0);
  const totalResolved = reportData.reduce((sum, r) => sum + r.resolved, 0);
  const avgSatisfaction = reportData.length
    ? (
        reportData.reduce((sum, r) => sum + r.satisfaction, 0) /
        reportData.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="support-page">
      <div className="support-page__header">
        <div>
          <h2>Support Reports</h2>
          <p>Agent performance and support metrics</p>
        </div>
      </div>

      <div className="support-cards">
        <Card
          title="Total Tickets Handled"
          value={totalTickets}
          helper="This month"
        />
        <Card
          title="Resolved Tickets"
          value={totalResolved}
          helper="Success rate"
        />
        <Card
          title="Avg Resolution Time"
          value="3.8 hrs"
          helper="Target: 4 hrs"
        />
        <Card
          title="Customer Satisfaction"
          value={`${avgSatisfaction}/5`}
          helper="Team average"
        />
      </div>

      <div className="support-panel">
        <h3 className="support-panel__title">Agent Performance</h3>
        <div className="support-table-wrapper">
          <table className="support-table">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Tickets Handled</th>
                <th>Resolved</th>
                <th>Avg Resolution Time</th>
                <th>Satisfaction Rating</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.agent}</td>
                  <td>{row.tickets}</td>
                  <td>{row.resolved}</td>
                  <td>{row.avg_time}</td>
                  <td>
                    <strong>{row.satisfaction}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!reportData.length ? (
          <p className="root-admin-dashboard__empty-state">No support report data yet.</p>
        ) : null}
      </div>
    </div>
  );
}

export default SupportReports;
