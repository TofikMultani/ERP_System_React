import { useState } from "react";
import { Link } from "react-router-dom";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Unable to process request.");
      }

      setMessage(data.message || "If the email exists, a reset link has been sent.");
    } catch (requestError) {
      setError(requestError.message || "Unable to process request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-card__hero">
          <Link to="/login" className="login-card__back-link">
            ← Back to Login
          </Link>
          <div className="login-card__brand">ERP System</div>
          <h1>Forgot Password</h1>
          <p>Enter your registered email and we’ll send a password reset link.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-form__field">
            <span>Email Address</span>
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              aria-invalid={Boolean(error)}
            />
            {error ? <small>{error}</small> : null}
          </label>

          {message ? <p className="forgot-password__message">{message}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ForgotPassword;
