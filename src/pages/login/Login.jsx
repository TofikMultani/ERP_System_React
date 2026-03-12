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

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
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
          <span className="login-card__eyebrow">ERP System</span>
          <h1>Role-based access</h1>
          <p>
            Sign in with your work email, choose a module, and continue to the
            correct ERP dashboard.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-form__field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="admin@erp.local"
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

          <button type="submit">Login</button>
        </form>

        <div className="login-card__footer">
          <p>Selected role is stored in localStorage for protected routing.</p>
          <div className="login-card__chips" aria-label="Available modules">
            {moduleOptions.map((module) => (
              <span key={module.value}>{module.label}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
