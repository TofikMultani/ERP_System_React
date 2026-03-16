import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRouteForRole, moduleOptions, storeRole } from "../../utils/auth.js";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

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
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [resetCode, setResetCode] = useState("");
  const [forgotValues, setForgotValues] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [forgotErrors, setForgotErrors] = useState({});
  const [forgotMessage, setForgotMessage] = useState("");

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

  function openForgotPassword() {
    setIsForgotOpen(true);
    setForgotStep("request");
    setResetCode("");
    setForgotMessage("");
    setForgotErrors({});
    setForgotValues({
      email: formValues.email.trim(),
      code: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  function closeForgotPassword() {
    setIsForgotOpen(false);
    setForgotStep("request");
    setResetCode("");
    setForgotMessage("");
    setForgotErrors({});
    setForgotValues({
      email: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  function handleForgotChange(event) {
    const { name, value } = event.target;

    setForgotValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setForgotErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setForgotMessage("");
  }

  function validateForgotRequest() {
    const nextErrors = {};
    const normalizedEmail = forgotValues.email.trim();

    if (!normalizedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    setForgotErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSendResetCode(event) {
    event.preventDefault();

    if (!validateForgotRequest()) {
      return;
    }

    const generatedCode = String(Math.floor(100000 + Math.random() * 900000));

    setResetCode(generatedCode);
    setForgotStep("verify");
    setForgotValues((currentValues) => ({
      ...currentValues,
      code: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setForgotErrors({});
    setForgotMessage(
      `Reset code sent to ${forgotValues.email.trim()}. Demo code: ${generatedCode}`,
    );
  }

  function validateResetPassword() {
    const nextErrors = {};
    const codeValue = forgotValues.code.trim();
    const newPassword = forgotValues.newPassword.trim();
    const confirmPassword = forgotValues.confirmPassword.trim();

    if (!codeValue) {
      nextErrors.code = "Reset code is required.";
    } else if (!/^\d{6}$/.test(codeValue)) {
      nextErrors.code = "Reset code must be exactly 6 digits.";
    } else if (codeValue !== resetCode) {
      nextErrors.code = "Invalid reset code.";
    }

    if (!newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(newPassword)) {
      nextErrors.newPassword =
        "Password must include at least one uppercase letter.";
    } else if (!/[a-z]/.test(newPassword)) {
      nextErrors.newPassword =
        "Password must include at least one lowercase letter.";
    } else if (!/\d/.test(newPassword)) {
      nextErrors.newPassword = "Password must include at least one number.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm your new password.";
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setForgotErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleResetPassword(event) {
    event.preventDefault();

    if (!validateResetPassword()) {
      return;
    }

    setForgotMessage("Password reset successful. You can now sign in.");
    setFormValues((currentValues) => ({
      ...currentValues,
      email: forgotValues.email.trim(),
      password: "",
    }));

    setTimeout(() => {
      closeForgotPassword();
    }, 1200);
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

            <button
              type="button"
              className="login-form__link"
              onClick={openForgotPassword}
            >
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

      {isForgotOpen ? (
        <div className="forgot-password" role="dialog" aria-modal="true">
          <div
            className="forgot-password__backdrop"
            onClick={closeForgotPassword}
          />
          <section
            className="forgot-password__card"
            aria-label="Reset password"
          >
            <div className="forgot-password__header">
              <h2>Forgot Password</h2>
              <button
                type="button"
                className="forgot-password__close"
                onClick={closeForgotPassword}
                aria-label="Close forgot password dialog"
              >
                ×
              </button>
            </div>

            {forgotStep === "request" ? (
              <form
                onSubmit={handleSendResetCode}
                className="forgot-password__form"
                noValidate
              >
                <p className="forgot-password__hint">
                  Enter your registered email to receive a reset code.
                </p>

                <label className="login-form__field">
                  <span>Email Address</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={forgotValues.email}
                    onChange={handleForgotChange}
                    aria-invalid={Boolean(forgotErrors.email)}
                  />
                  {forgotErrors.email ? (
                    <small>{forgotErrors.email}</small>
                  ) : null}
                </label>

                {forgotMessage ? (
                  <p className="forgot-password__message">{forgotMessage}</p>
                ) : null}

                <button type="submit">Send Reset Code</button>
              </form>
            ) : (
              <form
                onSubmit={handleResetPassword}
                className="forgot-password__form"
                noValidate
              >
                <p className="forgot-password__hint">
                  Enter the 6-digit code and set your new password.
                </p>

                <label className="login-form__field">
                  <span>Reset Code</span>
                  <input
                    type="text"
                    name="code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={forgotValues.code}
                    onChange={handleForgotChange}
                    aria-invalid={Boolean(forgotErrors.code)}
                  />
                  {forgotErrors.code ? (
                    <small>{forgotErrors.code}</small>
                  ) : null}
                </label>

                <label className="login-form__field">
                  <span>New Password</span>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="At least 8 chars, 1 uppercase, 1 number"
                    value={forgotValues.newPassword}
                    onChange={handleForgotChange}
                    aria-invalid={Boolean(forgotErrors.newPassword)}
                  />
                  {forgotErrors.newPassword ? (
                    <small>{forgotErrors.newPassword}</small>
                  ) : null}
                </label>

                <label className="login-form__field">
                  <span>Confirm New Password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter new password"
                    value={forgotValues.confirmPassword}
                    onChange={handleForgotChange}
                    aria-invalid={Boolean(forgotErrors.confirmPassword)}
                  />
                  {forgotErrors.confirmPassword ? (
                    <small>{forgotErrors.confirmPassword}</small>
                  ) : null}
                </label>

                {forgotMessage ? (
                  <p className="forgot-password__message">{forgotMessage}</p>
                ) : null}

                <button type="submit">Reset Password</button>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default Login;
