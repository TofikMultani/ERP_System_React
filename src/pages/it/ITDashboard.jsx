import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card.jsx";
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

function ITDashboard() {
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
        console.error("Unable to load IT dashboard data:", error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalAssets = assets.length;
  const totalValue = useMemo(
    () => assets.reduce((sum, asset) => sum + (Number(asset.value) || 0), 0),
    [assets],
  );
  const operationalSystems = useMemo(
    () => systems.filter((system) => String(system.status || "") === "Operational").length,
    [systems],
  );
  const uptime = systems.length
    ? ((operationalSystems / systems.length) * 100).toFixed(2)
    : "0.00";
  const assetDistribution = Object.entries(
    assets.reduce((accumulator, asset) => {
      const type = asset.assetType || "Other";
      const value = Number(asset.value) || 0;

      if (!accumulator[type]) {
        accumulator[type] = { count: 0, value: 0 };
      }

      accumulator[type].count += 1;
      accumulator[type].value += value;
      return accumulator;
    }, {}),
  ).map(([type, data]) => ({
    type,
    count: data.count,
    value: `$${data.value.toFixed(2)}`,
  }));

  const systemsTrendData = useMemo(() => {
    const monthMap = systems.reduce((accumulator, system) => {
      const month = getMonthLabel(system.lastCheckedAt || system.updatedAt);
      if (!month) {
        return accumulator;
      }

      if (!accumulator[month]) {
        accumulator[month] = {
          month,
          uptimeTotal: 0,
          count: 0,
          incidents: 0,
        };
      }

      accumulator[month].uptimeTotal += Number(system.uptimePercent || 0);
      accumulator[month].count += 1;
      if (String(system.status || "").toLowerCase() === "down") {
        accumulator[month].incidents += 1;
      }

      return accumulator;
    }, {});

    return Object.values(monthMap)
      .sort((left, right) => left.month.localeCompare(right.month))
      .slice(-6)
      .map((row) => ({
        week: row.month.slice(5),
        uptime: row.count ? Number((row.uptimeTotal / row.count).toFixed(2)) : 0,
        incidents: row.incidents,
      }));
  }, [systems]);

  const maintenanceTrendData = useMemo(() => {
    const monthMap = maintenance.reduce((accumulator, task) => {
      const month = getMonthLabel(task.scheduledDate);
      if (!month) {
        return accumulator;
      }

      if (!accumulator[month]) {
        accumulator[month] = {
          month,
          incidents: 0,
        };
      }

      if (String(task.status || "").toLowerCase() !== "completed") {
        accumulator[month].incidents += 1;
      }

      return accumulator;
    }, {});

    return Object.values(monthMap)
      .sort((left, right) => left.month.localeCompare(right.month))
      .slice(-6)
      .map((row) => ({
        week: row.month.slice(5),
        incidents: row.incidents,
      }));
  }, [maintenance]);

  return (
    <div className="it-page">
      <div className="it-page__header">
        <div>
          <h2>IT Dashboard</h2>
          <p>System health, infrastructure status, and asset overview</p>
        </div>
      </div>

      <div className="it-cards">
        <Card
          title="System Uptime"
          value={`${uptime}%`}
          helper="Operational systems"
        />
        <Card title="Total Assets" value={totalAssets} helper="IT inventory" />
        <Card
          title="Pending Maintenance"
          value={
            maintenance.filter((task) => task.status !== "Completed").length
          }
          helper="Open tasks"
        />
        <Card
          title="Total Asset Value"
          value={`$${totalValue.toFixed(2)}`}
          helper="Inventory value"
        />
      </div>

      <div className="it-charts">
        <div className="it-panel">
          <h3 className="it-panel__title">System Uptime & Incidents</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={systemsTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis yAxisId="left" type="number" domain={[98, 100]} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value) => `${value}`} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="uptime"
                fill="#10b981"
                name="Uptime %"
              />
              <Bar
                yAxisId="right"
                dataKey="incidents"
                fill="#ef4444"
                name="Incidents"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="it-panel">
          <h3 className="it-panel__title">Asset Distribution</h3>
          <div style={{ display: "grid", gap: "0.8rem" }}>
            {assetDistribution.map((asset, index) => (
              <div
                key={index}
                style={{
                  padding: "1rem",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, rgba(90, 61, 240, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)",
                  borderLeft: "3px solid #5a3df0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: "600", color: "var(--color-text)" }}
                    >
                      {asset.type}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--color-text-soft)",
                        marginTop: "0.3rem",
                      }}
                    >
                      {asset.count} units
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#5a3df0",
                    }}
                  >
                    {asset.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="it-panel">
          <h3 className="it-panel__title">Maintenance Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={maintenanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="#ef4444"
                strokeWidth={2}
                name="Incidents"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ITDashboard;
