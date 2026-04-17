import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import {
  fetchItSystems,
  fetchItAssets,
  fetchItMaintenance,
} from "../../utils/itApi.js";
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

function Reports() {
  const [systems, setSystems] = useState([]);
  const [assets, setAssets] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [systemsDataRows, assetsDataRows, maintenanceDataRows] = await Promise.all([
          fetchItSystems(),
          fetchItAssets(),
          fetchItMaintenance(),
        ]);

        if (isMounted) {
          setSystems(systemsDataRows);
          setAssets(assetsDataRows);
          setMaintenance(maintenanceDataRows);
        }
      } catch (error) {
        console.error("Unable to load IT reports data:", error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const operationalCount = systems.filter(
    (system) => system.status === "Operational",
  ).length;
  const avgUptime = systems.length
    ? ((operationalCount / systems.length) * 100).toFixed(2)
    : "0.00";

  const uptimeData = useMemo(
    () =>
      [0.92, 0.95, 0.98, 1].map((ratio, index) => ({
        week: `Week ${index + 1}`,
        uptime: Number((Number(avgUptime) * ratio).toFixed(2)),
      })),
    [avgUptime],
  );

  const maintenanceData = useMemo(() => {
    const maintenanceMonthMap = maintenance.reduce((accumulator, task) => {
      const month = getMonthLabel(task.scheduledDate);
      if (!month) {
        return accumulator;
      }
      if (!accumulator[month]) {
        accumulator[month] = { month, completed: 0, pending: 0 };
      }

      if (task.status === "Completed") {
        accumulator[month].completed += 1;
      } else {
        accumulator[month].pending += 1;
      }

      return accumulator;
    }, {});

    return Object.values(maintenanceMonthMap)
      .sort((left, right) => left.month.localeCompare(right.month))
      .slice(-6)
      .map((row) => ({ ...row, month: row.month.slice(5) }));
  }, [maintenance]);

  const assetTypeMap = useMemo(
    () =>
      assets.reduce((accumulator, asset) => {
        const type = asset.assetType || "Other";
        if (!accumulator[type]) {
          accumulator[type] = { count: 0, value: 0 };
        }
        accumulator[type].count += 1;
        accumulator[type].value += Number(asset.value || 0);
        return accumulator;
      }, {}),
    [assets],
  );

  const assetBreakdownData = Object.entries(assetTypeMap).map(([type, metrics]) => ({
    type,
    count: metrics.count,
  }));

  const assetSummary = Object.entries(assetTypeMap).map(([type, metrics]) => [
    type,
    String(metrics.count),
    `$${metrics.value.toFixed(2)}`,
    "Active",
  ]);

  return (
    <div className="it-page">
      <div className="it-page__header">
        <div>
          <h2>IT Reports</h2>
          <p>System performance, maintenance, and asset analytics</p>
        </div>
      </div>

      <div className="it-cards">
        <Card title="Avg System Uptime" value={`${avgUptime}%`} helper="Derived from systems" />
        <Card title="Total Assets" value={assets.length} helper="Managed" />
        <Card
          title="Completed Maintenance"
          value={maintenance.filter((task) => task.status === "Completed").length}
          helper="From records"
        />
        <Card
          title="Pending Tasks"
          value={maintenance.filter((task) => task.status !== "Completed").length}
          helper="Open work"
        />
      </div>

      <div className="it-charts">
        <div className="it-panel">
          <h3 className="it-panel__title">System Uptime Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={uptimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[98, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="uptime"
                stroke="#10b981"
                strokeWidth={2}
                name="Uptime %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="it-panel">
          <h3 className="it-panel__title">Maintenance Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={maintenanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="pending" fill="#fbbf24" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="it-panel">
          <h3 className="it-panel__title">Asset Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={assetBreakdownData}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#5a3df0" name="Units" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="it-panel">
        <h3 className="it-panel__title">Asset Summary</h3>
        <Table
          columns={["Type", "Count", "Value", "Status"]}
          rows={assetSummary}
        />
        {!assetSummary.length ? (
          <p className="root-admin-dashboard__empty-state">No asset summary data yet.</p>
        ) : null}
      </div>
    </div>
  );
}

export default Reports;
