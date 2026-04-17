import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function validateToken() {
      if (!token) {
        if (isMounted) {
          setError("Invalid reset link.");
          setIsTokenValid(false);
          setIsValidating(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/reset-password/validate?token=${encodeURIComponent(token)}`,
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Reset link is invalid or expired.");
        }

        if (isMounted) {
          setIsTokenValid(true);
          setError("");
        }
      } catch (validationError) {
        if (isMounted) {
          setIsTokenValid(false);
          setError(validationError.message || "Reset link is invalid or expired.");
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    }

    validateToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (confirmPassword.trim() !== password.trim()) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password: password.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setMessage("Password reset successful. You can now sign in.");
      setPassword("");
      setConfirmPassword("");
      setIsTokenValid(false);
    } catch (resetError) {
      setError(resetError.message || "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-card__hero">
          <div className="login-card__brand">ERP System</div>
          <h1>Reset Password</h1>
          <p>Enter and confirm your new password.</p>
        </div>

        {isValidating ? (
          <p className="forgot-password__message">Validating reset link...</p>
        ) : null}

        {!isValidating && isTokenValid ? (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-form__field">
              <span>New Password</span>
              <input
                type="password"
                name="password"
                placeholder="Enter new password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                aria-invalid={Boolean(error)}
              />
            </label>

            <label className="login-form__field">
              <span>Confirm Password</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
                aria-invalid={Boolean(error)}
              />
            </label>

            {error ? <p className="login-form__error">{error}</p> : null}
            {message ? <p className="forgot-password__message">{message}</p> : null}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        ) : null}

        {!isValidating && !isTokenValid ? (
          <>
            {error ? <p className="login-form__error">{error}</p> : null}
            {message ? <p className="forgot-password__message">{message}</p> : null}
          </>
        ) : null}

        <p className="forgot-password__hint" style={{ marginTop: "1rem" }}>
          <Link to="/login" className="login-form__link">
            Back to Login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default ResetPassword;
