import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getRouteForRole,
  getStoredRole,
  moduleOptions,
  storeRole,
} from "../../utils/auth.js";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    module: "",
    rememberMe: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedRole = getStoredRole();

    if (storedRole) {
      navigate(getRouteForRole(storedRole), { replace: true });
    }
  }, [navigate]);

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
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formValues.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (formValues.password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!formValues.module) {
      nextErrors.module = "Select a module to continue.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    storeRole(formValues.module);

    const requestedPath = location.state?.from?.pathname;
    const destination =
      requestedPath && requestedPath !== "/"
        ? requestedPath
        : getRouteForRole(formValues.module);

    navigate(destination, { replace: true });
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-card__hero">
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

          <label className="login-form__field">
            <span>Select Module</span>
            <select
              name="module"
              value={formValues.module}
              onChange={handleChange}
              aria-invalid={Boolean(errors.module)}
            >
              <option value="">Choose a module</option>
              {moduleOptions.map((module) => (
                <option key={module.value} value={module.value}>
                  {module.label}
                </option>
              ))}
            </select>
            {errors.module ? <small>{errors.module}</small> : null}
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

            <button type="button" className="login-form__link">
              Forgot password?
            </button>
          </div>

          <button type="submit">Sign In</button>
        </form>

        <div className="login-card__footer">
          <p>
            Static ERP demo with role-based routing and localStorage session.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
