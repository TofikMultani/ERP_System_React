import { useEffect, useMemo, useState } from "react";
import { ListFilter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import {
  fetchAdminAccessRequests,
  fetchAdminModules,
} from "../../utils/adminApi.js";

const ACCESS_REQUEST_STATUS = {
  pending: "pending",
  paymentPending: "payment_pending",
  paymentDone: "payment_done",
  cancelled: "cancelled",
  rejected: "rejected",
};

const statusOptions = [
  { value: ACCESS_REQUEST_STATUS.pending, label: "Pending" },
  { value: ACCESS_REQUEST_STATUS.paymentPending, label: "Payment Pending" },
  { value: ACCESS_REQUEST_STATUS.paymentDone, label: "Payment Done" },
  { value: ACCESS_REQUEST_STATUS.cancelled, label: "Cancelled" },
  { value: ACCESS_REQUEST_STATUS.rejected, label: "Rejected" },
];

function buildStatusCounts(requests) {
  return {
    total: requests.length,
    pending: requests.filter(
      (request) => request.status === ACCESS_REQUEST_STATUS.pending,
    ).length,
    paymentPending: requests.filter(
      (request) => request.status === ACCESS_REQUEST_STATUS.paymentPending,
    ).length,
    paymentDone: requests.filter(
      (request) => request.status === ACCESS_REQUEST_STATUS.paymentDone,
    ).length,
    cancelled: requests.filter(
      (request) => request.status === ACCESS_REQUEST_STATUS.cancelled,
    ).length,
    rejected: requests.filter(
      (request) => request.status === ACCESS_REQUEST_STATUS.rejected,
    ).length,
  };
}

function RootAdminDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [moduleCatalog, setModuleCatalog] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let refreshTimer;

    async function loadDashboardData() {
      try {
        const [requestRows, modules] = await Promise.all([
          fetchAdminAccessRequests(),
          fetchAdminModules(),
        ]);

        if (!isMounted) {
          return;
        }

        setRequests(requestRows);
        setModuleCatalog(modules);
        setError("");
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load root admin dashboard data.");
        }
      }
    }

    loadDashboardData();
    refreshTimer = setInterval(loadDashboardData, 10000);

    return () => {
      isMounted = false;
      clearInterval(refreshTimer);
    };
  }, []);

  const statusCounts = useMemo(() => buildStatusCounts(requests), [requests]);
  const activeModuleCount = moduleCatalog.filter((item) => item.isActive).length;
  const inactiveModuleCount = moduleCatalog.length - activeModuleCount;

  return (
    <div className="admin-dashboard root-admin-dashboard">
      <section className="admin-dashboard__cards">
        <Card
          title="Total Requests"
          value={statusCounts.total}
          helper="Submitted from the landing page"
        />
        <Card
          title="Pending Review"
          value={statusCounts.pending}
          helper="Awaiting root admin decision"
        />
        <Card
          title="Payment Pending"
          value={statusCounts.paymentPending}
          helper="Approved and awaiting payment"
        />
        <Card
          title="Payment Done"
          value={statusCounts.paymentDone}
          helper="Payment completed requests"
        />
        <Card
          title="Active Modules"
          value={activeModuleCount}
          helper="Available for new requests"
        />
        <Card
          title="Inactive Modules"
          value={inactiveModuleCount}
          helper="Currently blocked for new requests"
        />
      </section>

      <section className="admin-dashboard__charts">
        <div className="admin-dashboard__panel">
          <div className="root-admin-dashboard__panel-head">
            <h3 className="admin-dashboard__panel-title">Request Status Overview</h3>
            <ListFilter className="root-admin-dashboard__panel-icon" strokeWidth={1.9} />
          </div>

          <div className="root-admin-dashboard__status-list">
            {statusOptions.map((option) => {
              const value = statusCounts[option.value] || 0;
              const total = statusCounts.total || 1;
              const percentage = Math.round((value / total) * 100);

              return (
                <div key={option.value} className="root-admin-dashboard__status-row">
                  <div className="root-admin-dashboard__status-row-head">
                    <strong>{option.label}</strong>
                    <span>{value}</span>
                  </div>
                  <div className="root-admin-dashboard__status-bar">
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-dashboard__panel">
          <h3 className="admin-dashboard__panel-title">Requests Management</h3>
          <p className="root-admin-dashboard__empty-state">
            Manage landing page workspace requests from the dedicated Requests
            Management page.
          </p>
          {error ? (
            <p className="root-admin-dashboard__empty-state">{error}</p>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/root-admin/requests")}
          >
            Open Requests Management
          </Button>
        </div>

        <div className="admin-dashboard__panel">
          <h3 className="admin-dashboard__panel-title">Pricing and Activation Rules</h3>
          <p className="root-admin-dashboard__empty-state">
            Module activation and price updates are managed from the dedicated
            Module Configuration page.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/root-admin/modules")}
          >
            Open Module Configuration
          </Button>
        </div>
      </section>
    </div>
  );
}

export default RootAdminDashboard;
