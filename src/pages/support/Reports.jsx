import Card from "../../components/Card.jsx";

const reportData = [
  {
    agent: "Sarah Johnson",
    tickets: 45,
    resolved: 42,
    avg_time: "3.2 hrs",
    satisfaction: 4.8,
  },
  {
    agent: "Mike Wilson",
    tickets: 38,
    resolved: 35,
    avg_time: "4.1 hrs",
    satisfaction: 4.6,
  },
  {
    agent: "Emily Brown",
    tickets: 52,
    resolved: 50,
    avg_time: "2.8 hrs",
    satisfaction: 4.9,
  },
  {
    agent: "David Lee",
    tickets: 35,
    resolved: 32,
    avg_time: "5.2 hrs",
    satisfaction: 4.4,
  },
  {
    agent: "Lisa Anderson",
    tickets: 48,
    resolved: 46,
    avg_time: "3.5 hrs",
    satisfaction: 4.7,
  },
];

function SupportReports() {
  const totalTickets = reportData.reduce((sum, r) => sum + r.tickets, 0);
  const totalResolved = reportData.reduce((sum, r) => sum + r.resolved, 0);
  const avgSatisfaction = (
    reportData.reduce((sum, r) => sum + r.satisfaction, 0) / reportData.length
  ).toFixed(1);

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
      </div>
    </div>
  );
}

export default SupportReports;
