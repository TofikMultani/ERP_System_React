import Card from "../components/Card.jsx";
import Table from "../components/Table.jsx";

function formatModuleName(moduleKey) {
  const labels = {
    admin: "Dashboard",
    hr: "HR",
    sales: "Sales",
    inventory: "Inventory",
    finance: "Finance",
    support: "Customer Support",
    it: "IT",
    profile: "Profile",
    settings: "Settings",
  };

  return labels[moduleKey] ?? "Dashboard";
}

function ModuleLayout({ moduleKey, title, description }) {
  const moduleName = formatModuleName(moduleKey);

  const cards = [
    {
      title: "Open Tasks",
      value: "24",
      helper: `${moduleName} queue for this week`,
    },
    {
      title: "Pending Approval",
      value: "08",
      helper: "Items waiting for review",
    },
    {
      title: "Completion Rate",
      value: "92%",
      helper: "Static KPI placeholder",
    },
  ];

  const columns = [
    { header: "Item", accessor: "item" },
    { header: "Owner", accessor: "owner" },
    { header: "Status", accessor: "status" },
    { header: "Updated", accessor: "updated" },
  ];

  const rows = [
    {
      id: 1,
      item: `${moduleName} workflow A`,
      owner: "Team Lead",
      status: "Active",
      updated: "Today",
    },
    {
      id: 2,
      item: `${moduleName} workflow B`,
      owner: "Operations",
      status: "Review",
      updated: "Yesterday",
    },
    {
      id: 3,
      item: `${moduleName} workflow C`,
      owner: "Manager",
      status: "Queued",
      updated: "2 days ago",
    },
  ];

  return (
    <section className="module-page">
      <div className="module-page__hero">
        <div>
          <span className="module-page__tag">Module View</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <div className="module-page__status">
          <span>Layout Status</span>
          <strong>Reusable dashboard shell active</strong>
        </div>
      </div>

      <div className="module-page__cards">
        {cards.map((card) => (
          <Card
            key={card.title}
            title={card.title}
            value={card.value}
            helper={card.helper}
          />
        ))}
      </div>

      <section className="module-page__panel">
        <div className="module-page__panel-header">
          <div>
            <span className="module-page__tag">Overview</span>
            <h4>{moduleName} dashboard summary</h4>
          </div>
          <p>
            Shared content panel for every ERP route using the same layout
            structure.
          </p>
        </div>

        <Table columns={columns} rows={rows} />
      </section>
    </section>
  );
}

export default ModuleLayout;
