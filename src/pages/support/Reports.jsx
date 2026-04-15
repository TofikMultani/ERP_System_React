import Card from "../../components/Card.jsx";
import { usePersistentSnapshot } from "../../utils/persistentState.js";
import { ticketsData } from "../../utils/supportData.js";

function SupportReports() {
  const tickets = usePersistentSnapshot("erp_support_tickets", ticketsData);

  const reportMap = tickets.reduce((accumulator, ticket) => {
    const agent = ticket.agent || ticket.assignee || "Unassigned";

    if (!accumulator[agent]) {
      accumulator[agent] = {
        agent,
        tickets: 0,
        resolved: 0,
        hoursTotal: 0,
        hoursCount: 0,
      };
    }

    accumulator[agent].tickets += 1;
    if (ticket.status === "resolved") {
      accumulator[agent].resolved += 1;
    }

    const hours = Number.parseFloat(ticket.resolutionHours);
    if (!Number.isNaN(hours) && hours > 0) {
      accumulator[agent].hoursTotal += hours;
      accumulator[agent].hoursCount += 1;
    }

    return accumulator;
  }, {});

  const reportData = Object.values(reportMap)
    .map((row) => {
      const avgHours = row.hoursCount ? row.hoursTotal / row.hoursCount : 0;
      const satisfaction = row.tickets ? (row.resolved / row.tickets) * 5 : 0;

      return {
        ...row,
        avg_time: avgHours ? `${avgHours.toFixed(1)} hrs` : "-",
        satisfaction: satisfaction.toFixed(1),
      };
    })
    .sort((left, right) => right.tickets - left.tickets);

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
          value={
            reportData.some((row) => row.avg_time !== "-")
              ? `${(
                  reportData
                    .filter((row) => row.avg_time !== "-")
                    .reduce(
                      (sum, row) =>
                        sum + Number.parseFloat(String(row.avg_time).replace(/[^\d.]/g, "")),
                      0,
                    ) /
                  Math.max(
                    reportData.filter((row) => row.avg_time !== "-").length,
                    1,
                  )
                ).toFixed(1)} hrs`
              : "-"
          }
          helper="Across tracked agents"
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
