import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
      <section className="login-card" style={{ maxWidth: "640px" }}>
        <div className="login-card__hero" style={{ width: "100%" }}>
          <p className="login-card__eyebrow">Request Action</p>
          <h1>Payment</h1>

          {isLoading ? <p>Loading request...</p> : null}
          {error ? <p className="login-form__error">{error}</p> : null}
          {successMessage ? (
            <p className="login-form__error" style={{ color: "#0f9b6d" }}>
              {successMessage}
            </p>
          ) : null}

          {requestData ? (
            <>
              <p>
                <strong>Requested Modules:</strong>
              </p>
              <ul>
                {(requestData.modules || []).map((moduleName) => (
                  <li key={moduleName}>{moduleName}</li>
                ))}
              </ul>

              <p>
                <strong>Payment Amount:</strong>{" "}
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(requestData.totalEstimatedCost || 0)}
              </p>

              {requestData.status === "payment_done" ? (
                <p>Payment already completed.</p>
              ) : (
                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={isPaying || requestData.status !== "payment_pending"}
                >
                  {isPaying ? "Processing..." : "Pay Now"}
                </button>
              )}
            </>
          ) : null}

          <p style={{ marginTop: "1rem" }}>
            <Link to="/">Back to home</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default PaymentRequestPage;
