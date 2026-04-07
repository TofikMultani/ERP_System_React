import { useEffect, useMemo, useState } from "react";
import {
  KeyRound,
  PencilLine,
  RefreshCw,
  Trash2,
  UserRoundPlus,
  Users,
} from "lucide-react";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import Table from "../../components/Table.jsx";
import {
  createMyUser,
  deleteMyUser,
  fetchMyUsers,
  updateMyUser,
} from "../../utils/adminApi.js";
import { getStoredAllowedModules } from "../../utils/auth.js";

const MODULE_LABELS = {
  hr: "HR",
  sales: "Sales",
  inventory: "Inventory",
  finance: "Finance",
  support: "Customer Support",
  it: "IT",
};

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  assignedModule: "",
};

function generatePassword() {
  return `ERP-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function MyUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  const allowedModules = useMemo(() => getStoredAllowedModules(), []);

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setLoading(true);
      try {
        const rows = await fetchMyUsers();
        if (!isMounted) {
          return;
        }

        setUsers(rows);
        setError("");
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load users.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const moduleUsage = useMemo(() => {
    const usage = {};

    users.forEach((user) => {
      const moduleKey = String(user.assignedModule || "").toLowerCase();
      if (!moduleKey) {
        return;
      }

      usage[moduleKey] = (usage[moduleKey] || 0) + 1;
    });

    return usage;
  }, [users]);

  const moduleOptions = allowedModules.length
    ? allowedModules
    : Object.keys(MODULE_LABELS);

  const canAddMoreForSelectedModule = (() => {
    if (!formValues.assignedModule) {
      return true;
    }

    const moduleKey = String(formValues.assignedModule).toLowerCase();
    const currentCount = moduleUsage[moduleKey] || 0;

    if (editingUserId) {
      const editingUser = users.find((user) => user.id === editingUserId);
      if (editingUser && String(editingUser.assignedModule).toLowerCase() === moduleKey) {
        return currentCount <= 2;
      }
      return currentCount < 2;
    }

    return currentCount < 2;
  })();

  const rows = users.map((user) => ({
    id: user.id,
    name: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    module: user.assignedModuleLabel || MODULE_LABELS[user.assignedModule] || user.assignedModule,
    password: user.visiblePassword || "—",
    createdAt: user.createdAt,
  }));

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Module", accessor: "module" },
    {
      header: "Password",
      accessor: "password",
      render: (password) => <span className="root-admin-request__decision-lock">{password || "—"}</span>,
    },
    {
      header: "Created",
      accessor: "createdAt",
      render: (createdAt) => formatDateTime(createdAt),
    },
  ];

  function resetForm() {
    setFormValues(INITIAL_FORM);
    setEditingUserId(null);
    setFormErrors({});
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));

    setFormErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!formValues.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }
    if (!formValues.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }
    if (!formValues.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formValues.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!formValues.assignedModule) {
      nextErrors.assignedModule = "Select a module.";
    }
    if (!formValues.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (formValues.password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!canAddMoreForSelectedModule) {
      nextErrors.assignedModule = "This module already has 2 users assigned.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      email: formValues.email.trim(),
      password: formValues.password.trim(),
      assignedModule: formValues.assignedModule,
    };

    try {
      if (editingUserId) {
        const updated = await updateMyUser(editingUserId, payload);
        setUsers((current) =>
          current.map((user) => (user.id === updated.id ? updated : user)),
        );
      } else {
        const created = await createMyUser(payload);
        setUsers((current) => [created, ...current]);
      }

      resetForm();
    } catch (saveError) {
      setError(saveError.message || "Unable to save user.");
    } finally {
      setSaving(false);
    }
  }

  function handleEditUser(user) {
    setEditingUserId(user.id);
    setFormValues({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      password: user.visiblePassword || "",
      assignedModule: String(user.assignedModule || "").toLowerCase(),
    });
  }

  async function handleDeleteUser(user) {
    const confirmed = window.confirm(`Delete ${user.fullName || user.email}?`);
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteMyUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      if (editingUserId === user.id) {
        resetForm();
      }
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete user.");
    } finally {
      setSaving(false);
    }
  }

  function handleGeneratePassword() {
    setFormValues((current) => ({
      ...current,
      password: generatePassword(),
    }));
  }

  return (
    <div className="admin-dashboard root-admin-dashboard root-admin-requests-page">
      <section className="admin-dashboard__panel" style={{ marginBottom: 24 }}>
        <div className="root-admin-dashboard__table-head">
          <h3 className="admin-dashboard__panel-title">My Users</h3>
          <div className="root-admin-dashboard__filters">
            <div className="root-admin-dashboard__filter-btn root-admin-dashboard__filter-btn--active" style={{ cursor: "default" }}>
              {users.length} Users
            </div>
            <div className="root-admin-dashboard__filter-btn" style={{ cursor: "default" }}>
              {allowedModules.length} Allocated Modules
            </div>
          </div>
        </div>

        <div className="root-admin-request__contact" style={{ marginTop: 12 }}>
          <strong>Module user limit:</strong>
          <span>2 users per module</span>
        </div>

        {error ? <p className="root-admin-dashboard__empty-state">{error}</p> : null}
        {loading ? <p className="root-admin-dashboard__empty-state">Loading users...</p> : null}
      </section>

      <section className="admin-dashboard__panel" style={{ marginBottom: 24 }}>
        <div className="root-admin-dashboard__table-head">
          <h3 className="admin-dashboard__panel-title">
            {editingUserId ? "Edit Sub-User" : "Add New Sub-User"}
          </h3>
          <Button variant="ghost" size="sm" onClick={resetForm}>
            <RefreshCw size={14} />
            Reset
          </Button>
        </div>

        <form className="root-admin-module-config" onSubmit={handleSubmit}>
          <div className="root-admin-module-config__row" style={{ alignItems: "flex-start" }}>
            <label className="root-admin-module-config__price" style={{ flex: 1 }}>
              <span>First Name</span>
              <input
                name="firstName"
                value={formValues.firstName}
                onChange={handleFieldChange}
                placeholder="First name"
              />
              {formErrors.firstName ? <small className="profile-page__error">{formErrors.firstName}</small> : null}
            </label>
            <label className="root-admin-module-config__price" style={{ flex: 1 }}>
              <span>Last Name</span>
              <input
                name="lastName"
                value={formValues.lastName}
                onChange={handleFieldChange}
                placeholder="Last name"
              />
              {formErrors.lastName ? <small className="profile-page__error">{formErrors.lastName}</small> : null}
            </label>
          </div>

          <div className="root-admin-module-config__row" style={{ alignItems: "flex-start" }}>
            <label className="root-admin-module-config__price" style={{ flex: 1 }}>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleFieldChange}
                placeholder="user@company.com"
              />
              {formErrors.email ? <small className="profile-page__error">{formErrors.email}</small> : null}
            </label>

            <label className="root-admin-module-config__price" style={{ flex: 1 }}>
              <span>Module</span>
              <select
                name="assignedModule"
                value={formValues.assignedModule}
                onChange={handleFieldChange}
              >
                <option value="">Select module</option>
                {moduleOptions.map((moduleKey) => (
                  <option key={moduleKey} value={moduleKey}>
                    {MODULE_LABELS[moduleKey] || moduleKey}
                    {moduleUsage[moduleKey] ? ` (${moduleUsage[moduleKey]}/2)` : " (0/2)"}
                  </option>
                ))}
              </select>
              {formErrors.assignedModule ? (
                <small className="profile-page__error">{formErrors.assignedModule}</small>
              ) : null}
            </label>
          </div>

          <div className="root-admin-module-config__row" style={{ alignItems: "flex-start" }}>
            <label className="root-admin-module-config__price" style={{ flex: 1 }}>
              <span>Password</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  name="password"
                  value={formValues.password}
                  onChange={handleFieldChange}
                  placeholder="Password"
                  style={{ flex: 1 }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleGeneratePassword}>
                  <KeyRound size={14} />
                  Generate
                </Button>
              </div>
              {formErrors.password ? <small className="profile-page__error">{formErrors.password}</small> : null}
            </label>

            <div className="root-admin-module-config__price" style={{ flex: 1 }}>
              <span>Module Access</span>
              <div className="root-admin-request__module-tags">
                {allowedModules.length
                  ? allowedModules.map((moduleKey) => (
                      <span key={moduleKey}>{MODULE_LABELS[moduleKey] || moduleKey}</span>
                    ))
                  : "No allocated modules available"}
              </div>
            </div>
          </div>

          <div className="root-admin-dashboard__table-actions" style={{ marginTop: 12 }}>
            <Button type="submit" variant="primary" disabled={saving}>
              <UserRoundPlus size={14} />
              {editingUserId ? "Update Sub-User" : "Add New User"}
            </Button>
            {editingUserId ? (
              <Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>
                Cancel Edit
              </Button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="admin-dashboard__panel">
        <div className="root-admin-dashboard__table-head">
          <h3 className="admin-dashboard__panel-title">Current Sub-Users</h3>
          <Users className="root-admin-dashboard__panel-icon" strokeWidth={1.9} />
        </div>

        <Table
          columns={columns}
          rows={rows}
          renderActions={(row) => {
            const user = users.find((item) => item.id === row.id);
            if (!user) {
              return null;
            }

            return (
              <div className="root-admin-dashboard__table-actions">
                <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                  <PencilLine size={14} />
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user)}>
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            );
          }}
        />
      </section>
    </div>
  );
}

export default MyUsers;
