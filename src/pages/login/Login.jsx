import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getRouteForRole,
  storeAccessProfile,
  storeToken,
} from "../../utils/auth.js";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValue =
      event.target.type === "checkbox" ? event.target.checked : value;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: nextValue,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  }

  function validateForm() {
    const nextErrors = {};
    const normalizedEmail = formValues.email.trim();

    if (!normalizedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formValues.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (formValues.password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formValues.email.trim(),
          password: formValues.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (data.token) {
        storeToken(data.token);
      }

      storeAccessProfile({
        role: data.user?.role,
        email: data.user?.email,
        allowedPaths: data.user?.allowedPaths,
        allowedModules: data.user?.allowedModules,
      });

      const requestedPath = location.state?.from?.pathname;
      const destination =
        requestedPath && requestedPath !== "/"
          ? requestedPath
          : data.redirectTo || getRouteForRole(data.user?.role);

      navigate(destination, { replace: true });
    } catch (error) {
      setSubmitError(error.message || "Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-card__hero">
          <a href="/" className="login-card__back-link">
            ← Back to Home
          </a>
          <div className="login-card__brand">ERP System</div>
          <h1>Sign in to your account</h1>
          <p>Access your ERP workspace with your business credentials.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-form__field">
            <span>Email Address</span>
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              value={formValues.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? <small>{errors.email}</small> : null}
          </label>

          <label className="login-form__field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formValues.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password ? <small>{errors.password}</small> : null}
          </label>

          <div className="login-form__meta">
            <label className="login-form__checkbox">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formValues.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password" className="login-form__link">
              Forgot password?
            </Link>
          </div>

          {submitError ? <p className="login-form__error">{submitError}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
