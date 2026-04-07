import Button from "../../components/Button.jsx";
import { useEffect, useState } from "react";
import {
  fetchAdminModules,
  patchAdminModule,
} from "../../utils/adminApi.js";

function ModuleConfiguration() {
  const [moduleCatalog, setModuleCatalog] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadModules() {
      try {
        const modules = await fetchAdminModules();
        if (isMounted) {
          setModuleCatalog(modules);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Unable to load modules.");
        }
      }
    }

    loadModules();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeCount = moduleCatalog.filter((item) => item.isActive).length;
  const inactiveCount = moduleCatalog.length - activeCount;
  const totalEstimated = moduleCatalog
    .filter((item) => item.isActive)
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  async function toggleModuleActive(moduleItem) {
    try {
      const updated = await patchAdminModule(moduleItem.key, {
        isActive: !moduleItem.isActive,
      });

      setModuleCatalog((current) =>
        current.map((item) => (item.key === updated.key ? updated : item)),
      );
      setError("");
    } catch (updateError) {
      setError(updateError.message || "Unable to update module status.");
    }
  }

  async function updateModulePrice(moduleItem, value) {
    const parsed = Number(value);
    const safePrice = Number.isFinite(parsed) && parsed >= 0 ? parsed : moduleItem.price;

    try {
      const updated = await patchAdminModule(moduleItem.key, {
        price: safePrice,
      });

      setModuleCatalog((current) =>
        current.map((item) => (item.key === updated.key ? updated : item)),
      );
      setError("");
    } catch (updateError) {
      setError(updateError.message || "Unable to update module price.");
    }
  }

  return (
    <div className="admin-dashboard root-admin-dashboard root-admin-module-config-page">
      <section className="root-admin-module-config-layout">
        <div className="admin-dashboard__panel root-admin-module-config-layout__intro">
          <h3 className="admin-dashboard__panel-title">Configuration Summary</h3>
          <div className="root-admin-module-config__summary-list">
            <div>
              <span>Total Modules</span>
              <strong>{moduleCatalog.length}</strong>
            </div>
            <div>
              <span>Active Modules</span>
              <strong>{activeCount}</strong>
            </div>
            <div>
              <span>Inactive Modules</span>
              <strong>{inactiveCount}</strong>
            </div>
            <div>
              <span>Active Catalog Cost</span>
              <strong>
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(totalEstimated)}
              </strong>
            </div>
          </div>
          <p className="root-admin-dashboard__empty-state">
            Use the right panel to activate/deactivate modules and update module
            pricing used during request approvals.
          </p>
          {error ? (
            <p className="root-admin-dashboard__empty-state">{error}</p>
          ) : null}
        </div>

        <div className="admin-dashboard__panel root-admin-module-config-layout__panel">
          <h3 className="admin-dashboard__panel-title">Module Configuration</h3>

          <div className="root-admin-module-config">
            {moduleCatalog.map((moduleItem) => (
              <div key={moduleItem.key} className="root-admin-module-config__row">
                <div>
                  <strong>{moduleItem.label}</strong>
                  <p>{moduleItem.isActive ? "Active" : "Inactive"}</p>
                </div>

                <label className="root-admin-module-config__price">
                  <span>Price (₹)</span>
                  <input
                    type="number"
                    min={0}
                    defaultValue={moduleItem.price}
                    onBlur={(event) => updateModulePrice(moduleItem, event.target.value)}
                  />
                </label>

                <Button
                  variant={moduleItem.isActive ? "danger" : "outline"}
                  size="sm"
                  onClick={() => toggleModuleActive(moduleItem)}
                >
                  {moduleItem.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ModuleConfiguration;
