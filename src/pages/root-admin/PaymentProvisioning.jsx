import { useEffect, useMemo, useState } from "react";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import Table from "../../components/Table.jsx";
import {
  fetchAdminPaymentProvisioningRequests,
  generateAdminAccessCredentials,
} from "../../utils/adminApi.js";

const STATUS = {
  paymentPending: "payment_pending",
  paymentDone: "payment_done",
};

const statusVariantMap = {
  [STATUS.paymentPending]: "warning",
  [STATUS.paymentDone]: "success",
};

const statusLabelMap = {
  [STATUS.paymentPending]: "Payment Pending",
  [STATUS.paymentDone]: "Payment Done",
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

function PaymentProvisioning() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [busyRequestId, setBusyRequestId] = useState(null);
  const [generatedInfo, setGeneratedInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRows() {
      try {
        const rows = await fetchAdminPaymentProvisioningRequests();
        if (!isMounted) {
          return;
        }

        setRequests(rows);
        setError("");
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load payment provisioning data.");
        }
      }
    }

    loadRows();

    return () => {
      isMounted = false;
    };
  }, []);

  const tableRows = useMemo(
    () =>
      requests.map((request) => ({
        id: request.id,
        requesterName: request.requesterName,
        requesterEmail: request.requesterEmail,
        requesterPhone: request.requesterPhone,
        companyName: request.companyName,
        modules: request.modules,
        paymentAmount: request.paymentAmount || request.totalEstimatedCost,
        paymentId: request.paymentId,
        paymentCompletedAt: request.paymentCompletedAt,
        status: request.status,
        credentialsGeneratedAt: request.credentialsGeneratedAt,
      })),
    [requests],
  );

  const columns = [
    { header: "Customer", accessor: "requesterName" },
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
        <div className="root-admin-request__module-tags" aria-label="Requested modules">
          {Array.isArray(modules) && modules.length
            ? modules.map((moduleName) => <span key={moduleName}>{moduleName}</span>)
            : "—"}
        </div>
      ),
    },
    {
      header: "Payment Details",
      accessor: "paymentAmount",
      render: (paymentAmount, row) => (
        <div className="root-admin-request__contact">
          <strong>{formatCurrency(paymentAmount)}</strong>
          <span>{row.paymentId ? `Txn: ${row.paymentId}` : "Txn: —"}</span>
          <span>{formatDateTime(row.paymentCompletedAt)}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (status) => (
        <Badge variant={statusVariantMap[status] || "secondary"} size="sm">
          {statusLabelMap[status] || status}
        </Badge>
      ),
    },
    {
      header: "Credentials",
      accessor: "credentialsGeneratedAt",
      render: (credentialsGeneratedAt) =>
        credentialsGeneratedAt ? formatDateTime(credentialsGeneratedAt) : "Not generated",
    },
  ];

  async function handleGenerateCredentials(requestId) {
    setBusyRequestId(requestId);
    setError("");
    setGeneratedInfo(null);

    try {
      const result = await generateAdminAccessCredentials(requestId);

      setRequests((current) =>
        current.map((item) => (item.id === requestId ? result.request : item)),
      );

      setGeneratedInfo({
        requestId,
        email: result.generatedEmail,
        password: result.generatedPassword,
        emailSent: result.emailSent,
        emailError: result.emailError,
      });
    } catch (actionError) {
      setError(actionError.message || "Unable to generate credentials.");
    } finally {
      setBusyRequestId(null);
    }
  }

  return (
    <div className="admin-dashboard root-admin-dashboard root-admin-requests-page">
      <section className="admin-dashboard__tables root-admin-requests-page__tables">
        <div className="admin-dashboard__panel root-admin-dashboard__table-panel root-admin-requests-page__panel">
          <div className="root-admin-dashboard__table-head">
            <h3 className="admin-dashboard__panel-title">Payment & Credential Provisioning</h3>
          </div>

          {error ? <p className="root-admin-dashboard__empty-state">{error}</p> : null}

          {generatedInfo ? (
            <p className="root-admin-dashboard__empty-state">
              Generated login for request #{generatedInfo.requestId}: {generatedInfo.email} /{" "}
              {generatedInfo.password}
              {generatedInfo.emailSent
                ? " (credentials email sent)"
                : ` (email not sent: ${generatedInfo.emailError || "SMTP issue"})`}
            </p>
          ) : null}

          <Table
            columns={columns}
            rows={tableRows}
            renderActions={(row) => {
              const isPaymentDone = row.status === STATUS.paymentDone;
              const alreadyGenerated = Boolean(row.credentialsGeneratedAt);
              const isBusy = busyRequestId === row.id;

              if (!isPaymentDone) {
                return <span className="root-admin-request__decision-lock">Awaiting completed payment</span>;
              }

              if (alreadyGenerated) {
                return <span className="root-admin-request__decision-lock">Credentials generated</span>;
              }

              return (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateCredentials(row.id)}
                  disabled={isBusy}
                >
                  {isBusy ? "Generating..." : "Generate Email ID & Password"}
                </Button>
              );
            }}
          />
        </div>
      </section>
    </div>
  );
}

export default PaymentProvisioning;
