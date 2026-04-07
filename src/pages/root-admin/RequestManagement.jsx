import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import Table from "../../components/Table.jsx";
import {
  fetchAdminAccessRequests,
  fetchAdminModules,
  patchAdminAccessRequestStatus,
} from "../../utils/adminApi.js";

const ACCESS_REQUEST_STATUS = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

const statusOptions = [
  { value: "all", label: "All Requests" },
  { value: ACCESS_REQUEST_STATUS.pending, label: "Pending" },
  { value: ACCESS_REQUEST_STATUS.approved, label: "Approved" },
  { value: ACCESS_REQUEST_STATUS.rejected, label: "Rejected" },
];

const statusVariantMap = {
  [ACCESS_REQUEST_STATUS.pending]: "warning",
  [ACCESS_REQUEST_STATUS.approved]: "success",
  [ACCESS_REQUEST_STATUS.rejected]: "danger",
};

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getRequestPricing(request, moduleCatalog) {
  const modules = Array.isArray(request.modules) ? request.modules : [];

  const pricingBreakdown = modules.map((moduleName) => {
    const moduleConfig = moduleCatalog.find((item) => item.label === moduleName);

    if (!moduleConfig) {
      return {
        moduleName,
        price: 0,
        isActive: false,
      };
    }

    return {
      moduleName,
      price: Number(moduleConfig.price) || 0,
      isActive: Boolean(moduleConfig.isActive),
    };
  });

  const totalEstimatedCost = pricingBreakdown
    .filter((item) => item.isActive)
    .reduce((total, item) => total + item.price, 0);

  const inactiveRequestedModules = pricingBreakdown
    .filter((item) => !item.isActive)
    .map((item) => item.moduleName);

  return {
    pricingBreakdown,
    totalEstimatedCost,
    inactiveRequestedModules,
  };
}

function RequestManagement() {
  const [requests, setRequests] = useState([]);
  const [moduleCatalog, setModuleCatalog] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let refreshTimer;

    async function loadRequests() {
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
          setError(loadError.message || "Unable to load access requests.");
        }
      }
    }

    loadRequests();
    refreshTimer = setInterval(loadRequests, 10000);

    return () => {
      isMounted = false;
      clearInterval(refreshTimer);
    };
  }, []);

  const filteredRequests = useMemo(() => {
    if (activeFilter === "all") {
      return requests;
    }

    return requests.filter((request) => request.status === activeFilter);
  }, [activeFilter, requests]);

  const requestPricingById = useMemo(() => {
    const pricingMap = new Map();

    requests.forEach((request) => {
      pricingMap.set(request.id, getRequestPricing(request, moduleCatalog));
    });

    return pricingMap;
  }, [requests, moduleCatalog]);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) || null,
    [requests, selectedRequestId],
  );

  const selectedRequestPricing = selectedRequest
    ? requestPricingById.get(selectedRequest.id)
    : null;

  const requestRows = filteredRequests.map((request) => {
    const pricing = requestPricingById.get(request.id) || {
      totalEstimatedCost: 0,
      inactiveRequestedModules: [],
    };

    return {
      id: request.id,
      requester: request.requesterName,
      requesterEmail: request.requesterEmail,
      requesterPhone: request.requesterPhone,
      companyName: request.companyName,
      modules: request.modules,
      status: request.status,
      submittedAt: request.submittedAt,
      estimatedCost: pricing.totalEstimatedCost,
      hasInactiveModules: pricing.inactiveRequestedModules.length > 0,
    };
  });

  const requestColumns = [
    { header: "Requester", accessor: "requester" },
    {
      header: "Contact",
      accessor: "requesterEmail",
      render: (requesterEmail, row) => (
        <div className="root-admin-request__contact">
          <strong>{requesterEmail || "—"}</strong>
          <span>{row.requesterPhone || "—"}</span>
        </div>
      ),
    },
    { header: "Company", accessor: "companyName" },
    {
      header: "Requested Modules",
      accessor: "modules",
      render: (modules) => (
        <div
          className="root-admin-request__module-tags"
          aria-label="Requested modules"
        >
          {Array.isArray(modules) && modules.length
            ? modules.map((moduleName) => <span key={moduleName}>{moduleName}</span>)
            : "—"}
        </div>
      ),
    },
    {
      header: "Est. Cost",
      accessor: "estimatedCost",
      render: (estimatedCost, row) => (
        <span className={row.hasInactiveModules ? "root-admin-cost root-admin-cost--warning" : "root-admin-cost"}>
          {formatCurrency(estimatedCost)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (status) => (
        <Badge variant={statusVariantMap[status] || "secondary"} size="sm">
          {status}
        </Badge>
      ),
    },
    {
      header: "Submitted",
      accessor: "submittedAt",
      render: (submittedAt) => formatDateTime(submittedAt),
    },
  ];

  function openRequestDetails(requestId) {
    setSelectedRequestId(requestId);
  }

  async function handleRequestDecision(requestId, nextStatus) {
    const request = requests.find((item) => item.id === requestId);
    if (!request) {
      return;
    }

    const pricing = getRequestPricing(request, moduleCatalog);

    if (
      nextStatus === ACCESS_REQUEST_STATUS.approved &&
      pricing.inactiveRequestedModules.length > 0
    ) {
      return;
    }

    try {
      const updatedRequest = await patchAdminAccessRequestStatus(requestId, {
        status: nextStatus,
      });
      setRequests((current) =>
        current.map((item) => (item.id === updatedRequest.id ? updatedRequest : item)),
      );
      setSelectedRequestId(requestId);
      setError("");
    } catch (updateError) {
      setError(updateError.message || "Unable to update request status.");
    }
  }

  function closeDetails() {
    setSelectedRequestId(null);
  }

  return (
    <div className="admin-dashboard root-admin-dashboard root-admin-requests-page">
      <section className="admin-dashboard__tables root-admin-requests-page__tables">
        <div className="admin-dashboard__panel root-admin-dashboard__table-panel root-admin-requests-page__panel">
          <div className="root-admin-dashboard__table-head">
            <h3 className="admin-dashboard__panel-title">Access Requests Queue</h3>
            <div className="root-admin-dashboard__filters" aria-label="Request filters">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    activeFilter === option.value
                      ? "root-admin-dashboard__filter-btn root-admin-dashboard__filter-btn--active"
                      : "root-admin-dashboard__filter-btn"
                  }
                  onClick={() => setActiveFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p className="root-admin-dashboard__empty-state">{error}</p>
          ) : null}

          <Table
            columns={requestColumns}
            rows={requestRows}
            renderActions={(row) => (
              <div className="root-admin-dashboard__table-actions">
                <Button variant="ghost" size="sm" onClick={() => openRequestDetails(row.id)}>
                  <Eye size={14} />
                  View Details
                </Button>
                {row.status === ACCESS_REQUEST_STATUS.pending ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestDecision(row.id, ACCESS_REQUEST_STATUS.approved)}
                      disabled={row.hasInactiveModules}
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRequestDecision(row.id, ACCESS_REQUEST_STATUS.rejected)}
                    >
                      <XCircle size={14} />
                      Reject
                    </Button>
                  </>
                ) : null}
              </div>
            )}
          />
        </div>
      </section>

      {selectedRequest ? (
        <div className="root-admin-modal" role="presentation" onClick={closeDetails}>
          <div
            className="root-admin-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="root-admin-request-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="root-admin-modal__header">
              <div>
                <p className="root-admin-modal__eyebrow">Request overview</p>
                <h3 id="root-admin-request-title">{selectedRequest.requesterName}</h3>
                <p className="root-admin-modal__subtitle">
                  {selectedRequest.companyName || "No company name provided"}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeDetails}>
                Close
              </Button>
            </div>

            <div className="root-admin-modal__body">
              <div className="root-admin-modal__meta-grid">
                <div>
                  <span>Work Email</span>
                  <strong>{selectedRequest.requesterEmail}</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>{selectedRequest.requesterPhone || "—"}</strong>
                </div>
                <div>
                  <span>Submitted</span>
                  <strong>{formatDateTime(selectedRequest.submittedAt)}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>
                    <Badge
                      variant={statusVariantMap[selectedRequest.status] || "secondary"}
                      size="sm"
                    >
                      {selectedRequest.status}
                    </Badge>
                  </strong>
                </div>
                <div>
                  <span>Estimated Cost</span>
                  <strong>
                    {formatCurrency(selectedRequestPricing?.totalEstimatedCost || 0)}
                  </strong>
                </div>
                <div>
                  <span>Reviewed By</span>
                  <strong>{selectedRequest.reviewedBy || "—"}</strong>
                </div>
                <div>
                  <span>Reviewed At</span>
                  <strong>{formatDateTime(selectedRequest.reviewedAt)}</strong>
                </div>
              </div>

              <div className="root-admin-modal__pricing-panel">
                <h4>Requested Modules & Pricing</h4>
                <div className="root-admin-modal__pricing-list">
                  {(selectedRequestPricing?.pricingBreakdown || []).map((item) => (
                    <div key={item.moduleName} className="root-admin-modal__pricing-row">
                      <span>{item.moduleName}</span>
                      <div className="root-admin-modal__pricing-meta">
                        <Badge
                          variant={item.isActive ? "success" : "danger"}
                          size="sm"
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <strong>{formatCurrency(item.price)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRequestPricing?.inactiveRequestedModules?.length ? (
                <div className="root-admin-modal__note">
                  <span>Approval blocked</span>
                  <p>
                    This request includes inactive modules:
                    {` ${selectedRequestPricing.inactiveRequestedModules.join(", ")}. `}
                    Activate them in module configuration before approval.
                  </p>
                </div>
              ) : null}

              <div className="root-admin-modal__note">
                <span>Decision note</span>
                <p>{selectedRequest.reviewNote || "No review note added yet."}</p>
              </div>
            </div>

            <div className="root-admin-modal__actions">
              {selectedRequest.status === ACCESS_REQUEST_STATUS.pending ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleRequestDecision(
                        selectedRequest.id,
                        ACCESS_REQUEST_STATUS.approved,
                      )
                    }
                    disabled={(selectedRequestPricing?.inactiveRequestedModules?.length || 0) > 0}
                  >
                    <CheckCircle2 size={16} />
                    Approve Request
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() =>
                      handleRequestDecision(
                        selectedRequest.id,
                        ACCESS_REQUEST_STATUS.rejected,
                      )
                    }
                  >
                    <XCircle size={16} />
                    Reject Request
                  </Button>
                </>
              ) : (
                <p className="root-admin-modal__decision-locked">
                  This request has already been {selectedRequest.status}.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default RequestManagement;