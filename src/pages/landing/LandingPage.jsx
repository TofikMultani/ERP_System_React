import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const MODULE_OPTIONS = [
  "HR",
  "Sales",
  "Inventory",
  "Finance",
  "Customer Support",
  "IT",
];

const INITIAL_FORM = {
  fullName: "",
  email: "",
  companyName: "",
};

const INITIAL_ERRORS = {
  fullName: "",
  email: "",
  companyName: "",
  modules: "",
};

const INITIAL_CONTACT_FORM = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const INITIAL_CONTACT_ERRORS = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]*$/;

function validateFormValues(formValues, selectedModules) {
  const nextErrors = { ...INITIAL_ERRORS };

  if (formValues.fullName.trim().length < 3) {
    nextErrors.fullName = "Full Name must be at least 3 characters.";
  }

  if (!EMAIL_REGEX.test(formValues.email.trim())) {
    nextErrors.email = "Please enter a valid work email address.";
  }

  if (formValues.companyName.trim().length < 2) {
    nextErrors.companyName = "Company Name must be at least 2 characters.";
  }

  if (selectedModules.length === 0) {
    nextErrors.modules = "Select at least one module.";
  }

  const isValid = Object.values(nextErrors).every((errorText) => !errorText);

  return { isValid, nextErrors };
}

function validateContactFormValues(contactValues) {
  const nextErrors = { ...INITIAL_CONTACT_ERRORS };
  const normalizedName = contactValues.name.trim();
  const normalizedEmail = contactValues.email.trim();
  const normalizedSubject = contactValues.subject.trim();
  const normalizedMessage = contactValues.message.trim();

  if (normalizedName.length < 2) {
    nextErrors.name = "Name must be at least 2 characters.";
  } else if (!NAME_REGEX.test(normalizedName)) {
    nextErrors.name = "Name can contain letters and spaces only.";
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    nextErrors.email = "Please enter a valid email address.";
  }

  if (normalizedSubject.length < 4) {
    nextErrors.subject = "Subject must be at least 4 characters.";
  }

  if (normalizedMessage.length < 15) {
    nextErrors.message = "Message must be at least 15 characters.";
  }

  const isValid = Object.values(nextErrors).every((errorText) => !errorText);

  return { isValid, nextErrors };
}

function LandingPage() {
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [selectedModules, setSelectedModules] = useState([]);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactValues, setContactValues] = useState(INITIAL_CONTACT_FORM);
  const [contactErrors, setContactErrors] = useState(INITIAL_CONTACT_ERRORS);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({ type, message });

    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  useEffect(
    () => () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    },
    [],
  );

  const handleFieldChange = (fieldName, value) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleModuleChange = (moduleName) => {
    setSelectedModules((prev) => {
      const nextModules =
      prev.includes(moduleName)
        ? prev.filter((item) => item !== moduleName)
        : [...prev, moduleName];

      if (nextModules.length > 0) {
        setErrors((prevErrors) => ({ ...prevErrors, modules: "" }));
      }

      return nextModules;
    });

  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { isValid, nextErrors } = validateFormValues(
      formValues,
      selectedModules,
    );

    setErrors(nextErrors);

    if (!isValid) {
      showToast("danger", "Something went wrong.");
      return;
    }

    try {
      setIsSubmitting(true);
      await new Promise((resolve) => {
        setTimeout(resolve, 900);
      });

      setFormValues(INITIAL_FORM);
      setSelectedModules([]);
      setErrors(INITIAL_ERRORS);
      showToast("success", "Workspace request submitted successfully.");
    } catch {
      showToast("danger", "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactFieldChange = (fieldName, value) => {
    setContactValues((prev) => ({ ...prev, [fieldName]: value }));
    setContactErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();

    const { isValid, nextErrors } = validateContactFormValues(contactValues);
    setContactErrors(nextErrors);

    if (!isValid) {
      showToast("danger", "Something went wrong.");
      return;
    }

    try {
      setIsContactSubmitting(true);
      await new Promise((resolve) => {
        setTimeout(resolve, 700);
      });

      setContactValues(INITIAL_CONTACT_FORM);
      setContactErrors(INITIAL_CONTACT_ERRORS);
      showToast("success", "Message sent successfully.");
    } catch {
      showToast("danger", "Something went wrong.");
    } finally {
      setIsContactSubmitting(false);
    }
  };

  return (
    <main className="landing-page">
      {toast ? (
        <div
          className={`landing-toast landing-toast--${toast.type}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      <header className="landing-topbar">
        <div className="landing-brand">ERP System</div>
        <div className="landing-topbar__right">
          <nav className="landing-nav" aria-label="Primary Navigation">
            <a href="#home">Home</a>
            <a href="#contact">Contact Us</a>
            <a href="#about">About Us</a>
          </nav>

          <div className="landing-topbar__actions">
            <Link
              to="/login"
              className="landing-action-btn landing-action-btn--primary"
            >
              Login
            </Link>
            <a
              href="#request-workspace"
              className="landing-action-btn landing-action-btn--secondary"
            >
              Request Workspace
            </a>
          </div>
        </div>
      </header>

      <section id="home" className="landing-section landing-hero">
        <div className="landing-hero__content">
          <span className="landing-chip">All-in-One ERP Platform</span>
          <h1>Run HR, Sales, Inventory, Finance, Support and IT from one place.</h1>
          <p>
            A modern ERP experience that helps every department work together with
            shared workflows, real-time data, and faster operations.
          </p>

          <div className="landing-module-pills" aria-label="Available Modules">
            {MODULE_OPTIONS.map((moduleName) => (
              <span key={moduleName}>{moduleName}</span>
            ))}
          </div>

          <div className="landing-hero__stats">
            <article>
              <h3>6</h3>
              <p>Core Modules</p>
            </article>
            <article>
              <h3>1</h3>
              <p>Unified Workspace</p>
            </article>
            <article>
              <h3>24/7</h3>
              <p>Operational Visibility</p>
            </article>
          </div>
        </div>

        <div className="landing-hero__image-wrap">
          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80"
            alt="ERP dashboard workspace"
          />
        </div>
      </section>

      <section id="about" className="landing-section landing-about">
        <div className="landing-section__text landing-section__card">
          <h2>About Us</h2>
          <p>
            We build practical ERP tools for growing organizations. This system
            unifies core business modules so your teams can collaborate in real time,
            reduce manual work, and scale with confidence.
          </p>

          <div className="landing-feature-grid">
            <div>
              <h4>Centralized Data</h4>
              <p>All departments access one reliable source of information.</p>
            </div>
            <div>
              <h4>Process Automation</h4>
              <p>Automate repetitive tasks and improve everyday efficiency.</p>
            </div>
            <div>
              <h4>Role-based Access</h4>
              <p>Give each team the tools they need with secure permissions.</p>
            </div>
          </div>
        </div>
        <div className="landing-section__image-wrap">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1100&q=80"
            alt="Team collaboration in office"
          />
        </div>
      </section>

      <section id="contact" className="landing-section landing-contact">
        <div className="landing-section__text landing-section__card">
          <h2>Contact Us</h2>
          <p>
            Reach us for product demos, pricing, and onboarding support. Use the
            request form to choose the modules your workspace needs.
          </p>

          <ul className="landing-contact__list">
            <li>Email: hello@erp-system.com</li>
            <li>Phone: +1 (000) 123-4567</li>
            <li>Hours: Monday - Friday, 9:00 AM to 6:00 PM</li>
          </ul>

          <form className="landing-contact-form" onSubmit={handleContactSubmit} noValidate>
            <h3>Send Us a Message</h3>

            <label
              className="landing-form__field"
              data-error={contactErrors.name || undefined}
            >
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={contactValues.name}
                onChange={(event) =>
                  handleContactFieldChange("name", event.target.value)
                }
                aria-invalid={Boolean(contactErrors.name)}
                minLength={2}
                maxLength={60}
                required
              />
              {contactErrors.name ? (
                <small className="landing-form__error">{contactErrors.name}</small>
              ) : null}
            </label>

            <label
              className="landing-form__field"
              data-error={contactErrors.email || undefined}
            >
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={contactValues.email}
                onChange={(event) =>
                  handleContactFieldChange("email", event.target.value)
                }
                aria-invalid={Boolean(contactErrors.email)}
                maxLength={120}
                required
              />
              {contactErrors.email ? (
                <small className="landing-form__error">{contactErrors.email}</small>
              ) : null}
            </label>

            <label
              className="landing-form__field"
              data-error={contactErrors.subject || undefined}
            >
              <span>Subject</span>
              <input
                type="text"
                name="subject"
                value={contactValues.subject}
                onChange={(event) =>
                  handleContactFieldChange("subject", event.target.value)
                }
                aria-invalid={Boolean(contactErrors.subject)}
                minLength={4}
                maxLength={100}
                required
              />
              {contactErrors.subject ? (
                <small className="landing-form__error">{contactErrors.subject}</small>
              ) : null}
            </label>

            <label
              className="landing-form__field"
              data-error={contactErrors.message || undefined}
            >
              <span>Message</span>
              <textarea
                name="message"
                value={contactValues.message}
                onChange={(event) =>
                  handleContactFieldChange("message", event.target.value)
                }
                aria-invalid={Boolean(contactErrors.message)}
                rows={4}
                minLength={15}
                maxLength={600}
                required
              />
              {contactErrors.message ? (
                <small className="landing-form__error">{contactErrors.message}</small>
              ) : null}
            </label>

            <button
              type="submit"
              disabled={isContactSubmitting}
              aria-busy={isContactSubmitting}
            >
              {isContactSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <form
          id="request-workspace"
          className="landing-request-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <h3>Request Workspace</h3>

          <label className="landing-form__field" data-error={errors.fullName || undefined}>
            <span>Full Name</span>
            <input
              type="text"
              name="fullName"
              value={formValues.fullName}
              onChange={(event) =>
                handleFieldChange("fullName", event.target.value)
              }
              aria-invalid={Boolean(errors.fullName)}
              required
            />
            {errors.fullName ? (
              <small className="landing-form__error">{errors.fullName}</small>
            ) : null}
          </label>

          <label className="landing-form__field" data-error={errors.email || undefined}>
            <span>Work Email</span>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={(event) => handleFieldChange("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              required
            />
            {errors.email ? (
              <small className="landing-form__error">{errors.email}</small>
            ) : null}
          </label>

          <label
            className="landing-form__field"
            data-error={errors.companyName || undefined}
          >
            <span>Company Name</span>
            <input
              type="text"
              name="companyName"
              value={formValues.companyName}
              onChange={(event) =>
                handleFieldChange("companyName", event.target.value)
              }
              aria-invalid={Boolean(errors.companyName)}
              required
            />
            {errors.companyName ? (
              <small className="landing-form__error">{errors.companyName}</small>
            ) : null}
          </label>

          <div className="landing-request-form__modules">
            <p>Total Available Modules</p>
            <ul>
              {MODULE_OPTIONS.map((moduleName) => (
                <li key={moduleName}>{moduleName}</li>
              ))}
            </ul>

            <p>Select Required Modules</p>
            <div className="landing-request-form__checkbox-grid">
              {MODULE_OPTIONS.map((moduleName) => (
                <label key={moduleName} className="landing-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(moduleName)}
                    onChange={() => handleModuleChange(moduleName)}
                  />
                  <span>{moduleName}</span>
                </label>
              ))}
            </div>
            {errors.modules ? (
              <small className="landing-form__error">{errors.modules}</small>
            ) : null}
          </div>

          <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? "Submitting Request..." : "Submit Request"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LandingPage;
