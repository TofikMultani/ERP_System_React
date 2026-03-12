import { useState } from "react";

function Profile() {
  const [role] = useState(localStorage.getItem("erp_user_role") || "unknown");

  const getRoleLabel = (role) => {
    const roleMap = {
      admin: "Administrator",
      hr: "HR Manager",
      sales: "Sales Representative",
      inventory: "Inventory Manager",
      finance: "Finance Manager",
      support: "Support Agent",
      it: "IT Specialist",
    };
    return roleMap[role] || role;
  };

  const getUserData = (role) => {
    const users = {
      admin: {
        name: "Administrator",
        email: "admin@erpsystem.com",
        department: "Management",
        joinDate: "2024-01-01",
        phone: "+1-555-0001",
      },
      hr: {
        name: "HR Department",
        email: "hr@erpsystem.com",
        department: "Human Resources",
        joinDate: "2024-01-15",
        phone: "+1-555-0002",
      },
      sales: {
        name: "Sales Team",
        email: "sales@erpsystem.com",
        department: "Sales",
        joinDate: "2024-02-01",
        phone: "+1-555-0003",
      },
      inventory: {
        name: "Inventory Manager",
        email: "inventory@erpsystem.com",
        department: "Operations",
        joinDate: "2024-02-15",
        phone: "+1-555-0004",
      },
      finance: {
        name: "Finance Department",
        email: "finance@erpsystem.com",
        department: "Finance",
        joinDate: "2024-03-01",
        phone: "+1-555-0005",
      },
      support: {
        name: "Support Team",
        email: "support@erpsystem.com",
        department: "Customer Support",
        joinDate: "2024-03-15",
        phone: "+1-555-0006",
      },
      it: {
        name: "IT Department",
        email: "it@erpsystem.com",
        department: "Information Technology",
        joinDate: "2024-04-01",
        phone: "+1-555-0007",
      },
    };
    return users[role] || users.admin;
  };

  const user = getUserData(role);

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

        <div style={{ display: "grid", gap: "1.5rem" }}>
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
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "var(--color-text)",
              }}
            >
              {user.name}
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
              Email Address
            </label>
            <div style={{ fontSize: "1rem", color: "var(--color-text)" }}>
              {user.email}
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
            <div style={{ fontSize: "1rem", color: "var(--color-text)" }}>
              {user.department}
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
              Phone
            </label>
            <div style={{ fontSize: "1rem", color: "var(--color-text)" }}>
              {user.phone}
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
              Joined On
            </label>
            <div style={{ fontSize: "1rem", color: "var(--color-text)" }}>
              {new Date(user.joinDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        <button
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
      </div>
    </div>
  );
}

export default Profile;
