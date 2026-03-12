import { useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";

const initialAssets = [
  {
    id: "LAP-001",
    name: "Laptop - John Doe",
    assetType: "Laptop",
    model: "Dell XPS 15",
    serialNo: "SN12345",
    purchaseDate: "2023-06-15",
    status: "Active",
    value: "₹1,20,000",
  },
  {
    id: "DES-001",
    name: "Desktop - HR Dept",
    assetType: "Desktop",
    model: "HP ProDesk",
    serialNo: "SN23456",
    purchaseDate: "2022-12-10",
    status: "Active",
    value: "₹85,000",
  },
  {
    id: "SRV-001",
    name: "Database Server",
    assetType: "Server",
    model: "Dell PowerEdge",
    serialNo: "SN34567",
    purchaseDate: "2021-03-20",
    status: "Active",
    value: "₹10,00,000",
  },
  {
    id: "NET-001",
    name: "Cisco Switch",
    assetType: "Networking",
    model: "Catalyst 2960",
    serialNo: "SN45678",
    purchaseDate: "2022-08-05",
    status: "Active",
    value: "₹45,000",
  },
  {
    id: "LAP-002",
    name: "Laptop - Jane Smith",
    assetType: "Laptop",
    model: "MacBook Pro",
    serialNo: "SN56789",
    purchaseDate: "2024-01-10",
    status: "Retired",
    value: "₹1,50,000",
  },
];

function Assets() {
  const [assets, setAssets] = useState(initialAssets);
  const [filterType, setFilterType] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    assetType: "Laptop",
    model: "",
    serialNo: "",
    value: "",
  });

  const filtered =
    filterType === "All"
      ? assets
      : assets.filter((a) => a.assetType === filterType);

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.serialNo) {
      const newAsset = {
        id: `AST-${String(assets.length + 1).padStart(3, "0")}`,
        name: formData.name,
        assetType: formData.assetType,
        model: formData.model,
        serialNo: formData.serialNo,
        purchaseDate: new Date().toISOString().split("T")[0],
        status: "Active",
        value: "₹" + formData.value,
      };
      setAssets([...assets, newAsset]);
      setFormData({
        name: "",
        assetType: "Laptop",
        model: "",
        serialNo: "",
        value: "",
      });
      setShowForm(false);
    }
  };

  const totalValue = assets.reduce(
    (sum, a) => sum + parseInt(a.value.replace("₹", "").replace(",", "")),
    0,
  );

  return (
    <div className="it-page">
      <div className="it-page__header">
        <div>
          <h2>IT Assets</h2>
          <p>Manage hardware inventory and asset lifecycle</p>
        </div>
      </div>

      <div className="it-cards">
        <Card
          title="Total Assets"
          value={assets.length}
          helper="In inventory"
        />
        <Card
          title="Active"
          value={assets.filter((a) => a.status === "Active").length}
          helper="In use"
        />
        <Card
          title="Retired"
          value={assets.filter((a) => a.status === "Retired").length}
          helper="Decommissioned"
        />
        <Card
          title="Total Value"
          value={"₹" + (totalValue / 100000).toFixed(1) + "L"}
          helper="Asset worth"
        />
      </div>

      <div className="it-panel">
        <div className="it-panel__toolbar">
          <h3 className="it-panel__title">Assets Inventory</h3>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div className="it-filter-group">
              {["All", "Laptop", "Desktop", "Server", "Networking"].map(
                (type) => (
                  <button
                    key={type}
                    className={`it-filter-btn ${filterType === type ? "it-filter-btn--active" : ""}`}
                    onClick={() => setFilterType(type)}
                  >
                    {type}
                  </button>
                ),
              )}
            </div>
            <button className="it-btn" onClick={() => setShowForm(!showForm)}>
              + Add Asset
            </button>
          </div>
        </div>

        {!showForm && (
          <Table
            columns={[
              "Asset ID",
              "Name",
              "Type",
              "Model",
              "Serial No",
              "Status",
              "Value",
            ]}
            rows={filtered.map((a) => [
              a.id,
              a.name,
              a.assetType,
              a.model,
              a.serialNo,
              a.status,
              a.value,
            ])}
          />
        )}

        {showForm && (
          <form onSubmit={handleAddAsset} className="it-form__grid">
            <div className="it-form__field">
              <label>Asset Name</label>
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
              <label>Type</label>
              <select
                value={formData.assetType}
                onChange={(e) =>
                  setFormData({ ...formData, assetType: e.target.value })
                }
              >
                <option>Laptop</option>
                <option>Desktop</option>
                <option>Server</option>
                <option>Networking</option>
              </select>
            </div>
            <div className="it-form__field">
              <label>Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>
            <div className="it-form__field">
              <label>Serial Number</label>
              <input
                type="text"
                value={formData.serialNo}
                onChange={(e) =>
                  setFormData({ ...formData, serialNo: e.target.value })
                }
                required
              />
            </div>
            <div className="it-form__field">
              <label>Value (₹)</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
              />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
              <button type="submit" className="it-btn">
                Add Asset
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

export default Assets;
