import { useMemo, useState } from "react";
import { getStoredRole } from "../../utils/auth.js";
import {
  getRoleLabel,
  getStoredProfile,
  storeProfile,
} from "../../utils/profile.js";

function Profile() {
  const role = getStoredRole() || "admin";
  const initialProfile = useMemo(() => getStoredProfile(role), [role]);
  const [user, setUser] = useState(initialProfile);
  const [formValues, setFormValues] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!formValues.name.trim()) {
      nextErrors.name = "Full Name is required.";
    }

    if (!formValues.email.trim()) {
      nextErrors.email = "Email Address is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formValues.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formValues.department.trim()) {
      nextErrors.department = "Department is required.";
    }

    if (!formValues.phone.trim()) {
      nextErrors.phone = "Phone is required.";
    }

    if (!formValues.joinDate.trim()) {
      nextErrors.joinDate = "Joined On is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const nextUser = {
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      department: formValues.department.trim(),
      phone: formValues.phone.trim(),
      joinDate: formValues.joinDate,
    };

    storeProfile(role, nextUser);
    setUser(nextUser);
    setFormValues(nextUser);
    setIsEditing(false);
  }

  function handleCancel() {
    setFormValues(user);
    setErrors({});
    setIsEditing(false);
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            margin: "0 0 0.5rem",
            fontSize: "1.8rem",
            color: "var(--color-text)",
          }}
        >
          My Profile
        </h2>
        <p
          style={{
            margin: "0",
            color: "var(--color-text-soft)",
            fontSize: "0.95rem",
          }}
        >
          Your account information and role details
        </p>
      </div>

      <div
        style={{
          padding: "2rem",
          borderRadius: "20px",
          border: "1px solid rgba(20, 33, 61, 0.08)",
          background: "#ffffff",
          boxShadow: "0 8px 24px rgba(20, 33, 61, 0.05)",
        }}
      >
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #5a3df0 0%, #7257ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "2.5rem",
            fontWeight: "700",
            marginBottom: "1.5rem",
          }}
        >
          {user.name.charAt(0)}
        </div>

        <form style={{ display: "grid", gap: "1.5rem" }} onSubmit={handleSave}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--color-text-soft)",
                marginBottom: "0.4rem",
              }}
            >
              Full Name
            </label>
            {isEditing ? (
              <>
                <input
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    border: `1px solid ${errors.name ? "var(--color-danger)" : "rgba(27, 35, 64, 0.14)"}`,
                    borderRadius: "14px",
                    background: "var(--color-surface-muted)",
                    color: "var(--color-text)",
                    outline: "none",
                  }}
                />
                {errors.name ? (
                  <small
                    style={{
                      color: "var(--color-danger)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {errors.name}
                  </small>
                ) : null}
              </>
            ) : (
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "var(--color-text)",
                }}
              >
                {user.name}
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--color-text-soft)",
                marginBottom: "0.4rem",
              }}
            >
              Email Address
            </label>
            {isEditing ? (
              <>
                <input
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    border: `1px solid ${errors.email ? "var(--color-danger)" : "rgba(27, 35, 64, 0.14)"}`,
                    borderRadius: "14px",
                    background: "var(--color-surface-muted)",
                    color: "var(--color-text)",
                    outline: "none",
                  }}
                />
                {errors.email ? (
                  <small
                    style={{
                      color: "var(--color-danger)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {errors.email}
                  </small>
                ) : null}
              </>
            ) : (
              <div style={{ fontSize: "1rem", color: "var(--color-text)" }}>
                {user.email}
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--color-text-soft)",
                marginBottom: "0.4rem",
              }}
            >
              Role
            </label>
            <div
              style={{
                display: "inline-block",
                padding: "0.4rem 1rem",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, rgba(90, 61, 240, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
                color: "#5a3df0",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              {getRoleLabel(role)}
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--color-text-soft)",
                marginBottom: "0.4rem",
              }}
            >
              Department
            </label>
            {isEditing ? (
              <>
                <input
                  name="department"
                  value={formValues.department}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    border: `1px solid ${errors.department ? "var(--color-danger)" : "rgba(27, 35, 64, 0.14)"}`,
                    borderRadius: "14px",
                    background: "var(--color-surface-muted)",
                    color: "var(--color-text)",
                    outline: "none",
                  }}
                />
                {errors.department ? (
                  <small
                    style={{
                      color: "var(--color-danger)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {errors.department}
                  </small>
                ) : null}
              </>
            ) : (
              <div style={{ fontSize: "1rem", color: "var(--color-text)" }}>
                {user.department}
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--color-text-soft)",
                marginBottom: "0.4rem",
              }}
            >
              Phone
            </label>
            {isEditing ? (
              <>
                <input
                  name="phone"
                  value={formValues.phone}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    border: `1px solid ${errors.phone ? "var(--color-danger)" : "rgba(27, 35, 64, 0.14)"}`,
                    borderRadius: "14px",
                    background: "var(--color-surface-muted)",
                    color: "var(--color-text)",
                    outline: "none",
                  }}
                />
                {errors.phone ? (
                  <small
                    style={{
                      color: "var(--color-danger)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {errors.phone}
                  </small>
                ) : null}
              </>
            ) : (
              <div style={{ fontSize: "1rem", color: "var(--color-text)" }}>
                {user.phone}
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--color-text-soft)",
                marginBottom: "0.4rem",
              }}
            >
              Joined On
            </label>
            {isEditing ? (
              <>
                <input
                  type="date"
                  name="joinDate"
                  value={formValues.joinDate}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    border: `1px solid ${errors.joinDate ? "var(--color-danger)" : "rgba(27, 35, 64, 0.14)"}`,
                    borderRadius: "14px",
                    background: "var(--color-surface-muted)",
                    color: "var(--color-text)",
                    outline: "none",
                  }}
                />
                {errors.joinDate ? (
                  <small
                    style={{
                      color: "var(--color-danger)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {errors.joinDate}
                  </small>
                ) : null}
              </>
            ) : (
              <div style={{ fontSize: "1rem", color: "var(--color-text)" }}>
                {new Date(user.joinDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {isEditing ? (
            <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "0.85rem",
                  borderRadius: "12px",
                  border: "0",
                  background:
                    "linear-gradient(135deg, #5a3df0 0%, #7257ff 100%)",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  flex: 1,
                  padding: "0.85rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(27, 35, 64, 0.16)",
                  background: "#ffffff",
                  color: "var(--color-text)",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                marginTop: "2rem",
                width: "100%",
                padding: "0.85rem",
                borderRadius: "12px",
                border: "0",
                background: "linear-gradient(135deg, #5a3df0 0%, #7257ff 100%)",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              Edit Profile
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default Profile;
