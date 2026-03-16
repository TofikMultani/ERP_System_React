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

  function getInputClass(fieldName) {
    return `profile-page__input${errors[fieldName] ? " profile-page__input--error" : ""}`;
  }

  return (
    <section className="profile-page">
      <header className="profile-page__hero">
        <div>
          <p className="profile-page__eyebrow">Account Settings</p>
          <h2>My Profile</h2>
          <p className="profile-page__subtext">
            Manage your personal details, department information, and account
            identity used across the ERP platform.
          </p>
        </div>
        <div className="profile-page__role-chip">{getRoleLabel(role)}</div>
      </header>

      <div className="profile-page__card">
        <div className="profile-page__identity">
          <div className="profile-page__avatar" aria-hidden="true">
            {user.name.charAt(0)}
          </div>
          <div className="profile-page__identity-meta">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        <form className="profile-page__form" onSubmit={handleSave} noValidate>
          <div className="profile-page__grid">
            <div className="profile-page__field">
              <label htmlFor="profile-name">Full Name</label>
              {isEditing ? (
                <>
                  <input
                    id="profile-name"
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                    className={getInputClass("name")}
                  />
                  {errors.name ? (
                    <small className="profile-page__error">{errors.name}</small>
                  ) : null}
                </>
              ) : (
                <p className="profile-page__value">{user.name}</p>
              )}
            </div>

            <div className="profile-page__field">
              <label htmlFor="profile-email">Email Address</label>
              {isEditing ? (
                <>
                  <input
                    id="profile-email"
                    name="email"
                    value={formValues.email}
                    onChange={handleChange}
                    className={getInputClass("email")}
                  />
                  {errors.email ? (
                    <small className="profile-page__error">
                      {errors.email}
                    </small>
                  ) : null}
                </>
              ) : (
                <p className="profile-page__value">{user.email}</p>
              )}
            </div>

            <div className="profile-page__field">
              <label htmlFor="profile-department">Department</label>
              {isEditing ? (
                <>
                  <input
                    id="profile-department"
                    name="department"
                    value={formValues.department}
                    onChange={handleChange}
                    className={getInputClass("department")}
                  />
                  {errors.department ? (
                    <small className="profile-page__error">
                      {errors.department}
                    </small>
                  ) : null}
                </>
              ) : (
                <p className="profile-page__value">{user.department}</p>
              )}
            </div>

            <div className="profile-page__field">
              <label htmlFor="profile-phone">Phone</label>
              {isEditing ? (
                <>
                  <input
                    id="profile-phone"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleChange}
                    className={getInputClass("phone")}
                  />
                  {errors.phone ? (
                    <small className="profile-page__error">
                      {errors.phone}
                    </small>
                  ) : null}
                </>
              ) : (
                <p className="profile-page__value">{user.phone}</p>
              )}
            </div>

            <div className="profile-page__field profile-page__field--full">
              <label htmlFor="profile-join-date">Joined On</label>
              {isEditing ? (
                <>
                  <input
                    type="date"
                    id="profile-join-date"
                    name="joinDate"
                    value={formValues.joinDate}
                    onChange={handleChange}
                    className={getInputClass("joinDate")}
                  />
                  {errors.joinDate ? (
                    <small className="profile-page__error">
                      {errors.joinDate}
                    </small>
                  ) : null}
                </>
              ) : (
                <p className="profile-page__value">
                  {new Date(user.joinDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="profile-page__actions">
              <button
                type="submit"
                className="profile-page__btn profile-page__btn--primary"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="profile-page__btn profile-page__btn--secondary"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="profile-page__btn profile-page__btn--primary profile-page__btn--single"
            >
              Edit Profile
            </button>
          )}
        </form>
      </div>
    </section>
  );
}

export default Profile;
