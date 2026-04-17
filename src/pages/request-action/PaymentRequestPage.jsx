import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CreditCard, ShieldCheck, Wallet } from "lucide-react";
import {
  createPaymentOrderByToken,
  fetchActionRequestByToken,
  verifyPaymentByToken,
} from "../../utils/adminApi.js";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    const existingScript = document.querySelector("script[data-razorpay-checkout='true']");
    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function PaymentRequestPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [requestData, setRequestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const amountLabel = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(requestData?.totalEstimatedCost || 0),
    [requestData],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadRequest() {
      if (!token) {
        if (isMounted) {
          setError("Invalid payment link.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await fetchActionRequestByToken(token);
        if (isMounted) {
          setRequestData(data);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load request details.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRequest();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handlePayNow() {
    if (!token || isPaying) {
      return;
    }

    try {
      setIsPaying(true);
      setError("");
      setSuccessMessage("");

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      const orderData = await createPaymentOrderByToken(token);

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ERP System",
        description: "Module access payment",
        order_id: orderData.orderId,
        prefill: {
          name: orderData.requesterName,
          email: orderData.requesterEmail,
          contact: orderData.requesterPhone,
        },
        handler: async (response) => {
          await verifyPaymentByToken(token, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          setSuccessMessage("Payment completed successfully.");
          setRequestData((current) =>
            current ? { ...current, status: "payment_done" } : current,
          );
        },
      });

      razorpay.open();
    } catch (paymentError) {
      setError(paymentError.message || "Payment could not be completed.");
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card request-payment-card">
        <div className="login-card__hero request-payment__hero">
          <p className="login-card__eyebrow">Request Action</p>
          <h1>Secure Payment</h1>
          <p>Review your request and complete payment to activate your ERP access.</p>

          {isLoading ? <p className="request-payment__status">Loading request...</p> : null}

          {error ? <p className="request-payment__status request-payment__status--error">{error}</p> : null}

          {successMessage ? (
            <div className="request-payment__success-banner">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          ) : null}

          {requestData ? (
            <div className="request-payment__content">
              <div className="request-payment__summary-grid">
                <article className="request-payment__summary-card">
                  <div className="request-payment__summary-head">
                    <Wallet size={16} />
                    <span>Amount Payable</span>
                  </div>
                  <strong>{amountLabel}</strong>
                </article>

                <article className="request-payment__summary-card">
                  <div className="request-payment__summary-head">
                    <CreditCard size={16} />
                    <span>Payment Status</span>
                  </div>
                  <strong>
                    {requestData.status === "payment_done" ? "Completed" : "Pending"}
                  </strong>
                </article>
              </div>

              <div className="request-payment__section">
                <h3>
                  <ShieldCheck size={16} />
                  Requested Modules
                </h3>
                <div className="request-payment__module-tags">
                  {(requestData.modules || []).map((moduleName) => (
                    <span key={moduleName}>{moduleName}</span>
                  ))}
                </div>
              </div>

              <div className="request-payment__actions">
                {requestData.status === "payment_done" ? (
                  <p className="request-payment__done-text">Payment already completed for this request.</p>
                ) : (
                  <button
                    type="button"
                    className="request-payment__pay-btn"
                    onClick={handlePayNow}
                    disabled={isPaying || requestData.status !== "payment_pending"}
                  >
                    {isPaying ? "Opening Gateway..." : "Proceed to Payment Gateway"}
                  </button>
                )}

                <Link className="request-payment__back-link" to="/">
                  Back to home
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default PaymentRequestPage;
