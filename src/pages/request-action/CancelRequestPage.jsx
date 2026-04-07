import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cancelRequestByToken } from "../../utils/adminApi.js";

function CancelRequestPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function handleCancelRequest() {
    if (!token || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await cancelRequestByToken(token);
      setResult("Your request has been cancelled.");
    } catch (cancelError) {
      setError(cancelError.message || "Unable to cancel request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" style={{ maxWidth: "560px" }}>
        <div className="login-card__hero" style={{ width: "100%" }}>
          <p className="login-card__eyebrow">Request Action</p>
          <h1>Cancel Request</h1>
          <p>If you no longer need the ERP workspace, you can cancel this request.</p>

          {result ? <p className="login-form__error" style={{ color: "#0f9b6d" }}>{result}</p> : null}
          {error ? <p className="login-form__error">{error}</p> : null}

          {!result ? (
            <button
              type="button"
              onClick={handleCancelRequest}
              disabled={!token || isSubmitting}
            >
              {isSubmitting ? "Cancelling..." : "Cancel Request"}
            </button>
          ) : null}

          <p style={{ marginTop: "1rem" }}>
            <Link to="/">Back to home</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default CancelRequestPage;
