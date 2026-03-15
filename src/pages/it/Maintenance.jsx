import { useState } from "react";
import { handleFormFieldValidation, validateFormWithInlineErrors } from "../../utils/formValidation.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialMaintenance = [
  {
    id: 1,
    assetId: "LAP-001",
    assetName: "Laptop - John Doe",
    maintenanceType: "Software Update",
    scheduledDate: "2026-03-15",
    status: "Scheduled",
    priority: "Medium",
  },
  {
    id: 2,
    assetId: "SRV-001",
    assetName: "Database Server",
    maintenanceType: "Hardware Check",
    scheduledDate: "2026-03-12",
    status: "In Progress",
    priority: "High",
  },
  {
    id: 3,
    assetId: "NET-001",
    assetName: "Cisco Switch",
    maintenanceType: "Firmware Update",
    scheduledDate: "2026-03-20",
    status: "Scheduled",
    priority: "Low",
  },
  {
    id: 4,
    assetId: "DES-001",
    assetName: "Desktop - HR Dept",
    maintenanceType: "Cleaning",
    scheduledDate: "2026-03-11",
    status: "Completed",
    priority: "Low",
  },
];

function Maintenance() {
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    assetName: "",
    maintenanceType: "",
    scheduledDate: "",
    priority: "Medium",
  });

  const filtered =
    filterStatus === "All"
      ? maintenance
      : maintenance.filter((m) => m.status === filterStatus);

  const handleAddMaintenance = (e) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    if (!validateFormWithInlineErrors(formElement)) {
      return;
    }
    if (
      formData.assetName.trim() &&
      formData.maintenanceType &&
      formData.scheduledDate
    ) {
      const newMaintenance = {
        id: maintenance.length + 1,
        assetId: `AST-${Math.floor(Math.random() * 1000)}`,
        assetName: formData.assetName,
        maintenanceType: formData.maintenanceType,
        scheduledDate: formData.scheduledDate,
        status: "Scheduled",
        priority: formData.priority,
      };
      setMaintenance([...maintenance, newMaintenance]);
      setFormData({
        assetName: "",
        maintenanceType: "",
        scheduledDate: "",
        priority: "Medium",
      });
      setShowForm(false);
    }
  };

  return (
    <div className="it-page">
      <div className="it-page__header">
        <div>
          <h2>Maintenance</h2>
          <p>Schedule and track system and asset maintenance</p>
        </div>
      </div>

      <div className="it-cards">
        <Card
          title="Total Tasks"
          value={maintenance.length}
          helper="All time"
        />
        <Card
          title="Scheduled"
          value={maintenance.filter((m) => m.status === "Scheduled").length}
          helper="Upcoming"
        />
        <Card
          title="In Progress"
          value={maintenance.filter((m) => m.status === "In Progress").length}
          helper="Being worked on"
        />
        <Card
          title="Completed"
          value={maintenance.filter((m) => m.status === "Completed").length}
          helper="Finished"
        />
      </div>

      <div className="it-panel">
        <div className="it-panel__toolbar">
          <h3 className="it-panel__title">Maintenance Schedule</h3>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div className="it-filter-group">
              {["All", "Scheduled", "In Progress", "Completed"].map(
                (status) => (
                  <button
                    key={status}
                    className={`it-filter-btn ${filterStatus === status ? "it-filter-btn--active" : ""}`}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status}
                  </button>
                ),
              )}
            </div>
            <button className="it-btn" onClick={() => setShowForm(!showForm)}>
              + Schedule Task
            </button>
          </div>
        </div>

        {!showForm && (
          <Table
            columns={[
              "Asset ID",
              "Asset Name",
              "Maintenance Type",
              "Scheduled Date",
              "Status",
              "Priority",
            ]}
            rows={filtered.map((m) => [
              m.assetId,
              m.assetName,
              m.maintenanceType,
              m.scheduledDate,
              m.status,
              m.priority,
            ])}
          />
        )}

        {showForm && (
          <form onSubmit={handleAddMaintenance} className="it-form__grid" noValidate onChange={handleFormFieldValidation}>
            <div className="it-form__field">
              <label>Asset Name</label>
              <input
                type="text"
                value={formData.assetName}
                onChange={(e) =>
                  setFormData({ ...formData, assetName: e.target.value })
                }
                required
              />
            </div>
            <div className="it-form__field">
              <label>Maintenance Type</label>
              <select
                value={formData.maintenanceType}
                onChange={(e) =>
                  setFormData({ ...formData, maintenanceType: e.target.value })
                }
              >
                <option value="">-- Select Type --</option>
                <option>Software Update</option>
                <option>Hardware Check</option>
                <option>Firmware Update</option>
                <option>Cleaning</option>
                <option>Repair</option>
              </select>
            </div>
            <div className="it-form__field">
              <label>Scheduled Date</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledDate: e.target.value })
                }
                required
              />
            </div>
            <div className="it-form__field">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
              <button type="submit" className="it-btn">
                Schedule
              </button>
              <button
                type="button"
                className="it-btn"
                style={{ background: "#ccc", color: "#333" }}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Maintenance;



