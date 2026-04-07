import { useState } from "react";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";
import { usePersistentState } from "../../utils/persistentState.js";
import { deleteRowById } from "../../utils/tableActions.js";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialSystems = [];

function Systems() {
  const [systems, setSystems] = usePersistentState(
    "erp_it_systems",
    initialSystems,
  );
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    ip: "",
    status: "Operational",
  });

  const filtered =
    filterStatus === "All"
      ? systems
      : systems.filter((s) => s.status === filterStatus);

  const handleEdit = (_, rowIndex) => {
    const targetRow = filtered[rowIndex];
    if (targetRow) {
      setEditingId(targetRow.id);
      setFormData({
        name: targetRow.name || "",
        ip: targetRow.ip || "",
        status: targetRow.status || "Operational",
      });
      setShowForm(true);
    }
  };

  const handleDelete = (_, rowIndex) => {
    const targetRow = filtered[rowIndex];
    if (targetRow) {
      deleteRowById(setSystems, targetRow, "system");
    }
  };

  const handleAddSystem = (e) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    if (!validateFormWithInlineErrors(formElement)) {
      return;
    }
    if (formData.name.trim() && formData.ip) {
      if (editingId !== null) {
        setSystems((previousRows) =>
          previousRows.map((item) =>
            String(item.id) === String(editingId)
              ? {
                  ...item,
                  name: formData.name,
                  ip: formData.ip,
                  status: formData.status,
                }
              : item,
          ),
        );
      } else {
        const newSystem = {
          id: systems.length + 1,
          name: formData.name,
          ip: formData.ip,
          status: formData.status,
          uptime: "N/A",
          lastCheck: new Date().toLocaleString(),
        };
        setSystems([...systems, newSystem]);
      }
      setFormData({ name: "", ip: "", status: "Operational" });
      setEditingId(null);
      setShowForm(false);
    }
  };

  return (
    <div className="it-page">
      <div className="it-page__header">
        <div>
          <h2>Systems</h2>
          <p>Monitor and manage IT systems and servers</p>
        </div>
      </div>

      <div className="it-cards">
        <Card title="Total Systems" value={systems.length} helper="Monitored" />
        <Card
          title="Operational"
          value={systems.filter((s) => s.status === "Operational").length}
          helper="Running"
        />
        <Card
          title="In Maintenance"
          value={systems.filter((s) => s.status === "Maintenance").length}
          helper="Being serviced"
        />
        <Card title="Avg Uptime" value="99.75%" helper="Last 30 days" />
      </div>

      <div className="it-panel">
        <div className="it-panel__toolbar">
          <h3 className="it-panel__title">Systems List</h3>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div className="it-filter-group">
              {["All", "Operational", "Maintenance"].map((status) => (
                <button
                  key={status}
                  className={`it-filter-btn ${filterStatus === status ? "it-filter-btn--active" : ""}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <button className="it-btn" onClick={() => setShowForm(!showForm)}>
              + Add System
            </button>
          </div>
        </div>

        {!showForm && (
          <Table
            columns={["Name", "IP Address", "Status", "Uptime", "Last Check"]}
            rows={filtered.map((s) => [
              s.name,
              s.ip,
              s.status,
              s.uptime,
              s.lastCheck,
            ])}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showForm && (
          <form
            onSubmit={handleAddSystem}
            className="it-form__grid"
            noValidate
            onChange={handleFormFieldValidation}
          >
            <div className="it-form__field">
              <label>System Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="it-form__field">
              <label>IP Address</label>
              <input
                type="text"
                value={formData.ip}
                onChange={(e) =>
                  setFormData({ ...formData, ip: e.target.value })
                }
                placeholder="192.168.0.0"
                required
              />
            </div>
            <div className="it-form__field">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option>Operational</option>
                <option>Maintenance</option>
                <option>Down</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
              <button type="submit" className="it-btn">
                Add
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

export default Systems;
