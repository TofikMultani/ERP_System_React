import { useState } from "react";

function Settings() {
  const [settings, setSettings] = useState({
    currency: "₹",
    theme: "light",
    language: "English",
    notifications: true,
    twoFactor: false,
  });

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    localStorage.setItem("erp_settings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            margin: "0 0 0.5rem",
            fontSize: "1.8rem",
            color: "var(--color-text)",
          }}
        >
          Settings
        </h2>
        <p
          style={{
            margin: "0",
            color: "var(--color-text-soft)",
            fontSize: "0.95rem",
          }}
        >
          Manage your application preferences
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
        <div style={{ display: "grid", gap: "2rem" }}>
          {/* Currency Setting */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "var(--color-text)",
                marginBottom: "0.6rem",
              }}
            >
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => handleSettingChange("currency", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 0.9rem",
                borderRadius: "10px",
                border: "1px solid rgba(27, 35, 64, 0.14)",
                background: "var(--color-surface-muted)",
                color: "var(--color-text)",
                fontSize: "0.95rem",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              <option value="₹">Indian Rupee (₹)</option>
              <option value="$">US Dollar ($)</option>
              <option value="€">Euro (€)</option>
              <option value="£">British Pound (£)</option>
            </select>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "0.85rem",
                color: "var(--color-text-soft)",
              }}
            >
              Choose your preferred currency for all transactions
            </p>
          </div>

          {/* Theme Setting */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "var(--color-text)",
                marginBottom: "0.6rem",
              }}
            >
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange("theme", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 0.9rem",
                borderRadius: "10px",
                border: "1px solid rgba(27, 35, 64, 0.14)",
                background: "var(--color-surface-muted)",
                color: "var(--color-text)",
                fontSize: "0.95rem",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
              <option value="auto">Auto (System)</option>
            </select>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "0.85rem",
                color: "var(--color-text-soft)",
              }}
            >
              Select your preferred visual theme
            </p>
          </div>

          {/* Language Setting */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "var(--color-text)",
                marginBottom: "0.6rem",
              }}
            >
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange("language", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 0.9rem",
                borderRadius: "10px",
                border: "1px solid rgba(27, 35, 64, 0.14)",
                background: "var(--color-surface-muted)",
                color: "var(--color-text)",
                fontSize: "0.95rem",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "0.85rem",
                color: "var(--color-text-soft)",
              }}
            >
              Choose your interface language
            </p>
          </div>

          {/* Notifications Toggle */}
          <div
            style={{
              padding: "1.2rem",
              borderRadius: "12px",
              background: "rgba(90, 61, 240, 0.05)",
              border: "1px solid rgba(90, 61, 240, 0.15)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "var(--color-text)",
                  marginBottom: "0.3rem",
                }}
              >
                Email Notifications
              </label>
              <p
                style={{
                  margin: "0",
                  fontSize: "0.85rem",
                  color: "var(--color-text-soft)",
                }}
              >
                Receive system alerts via email
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) =>
                handleSettingChange("notifications", e.target.checked)
              }
              style={{ width: "24px", height: "24px", cursor: "pointer" }}
            />
          </div>

          {/* Two-Factor Authentication */}
          <div
            style={{
              padding: "1.2rem",
              borderRadius: "12px",
              background: "rgba(59, 130, 246, 0.05)",
              border: "1px solid rgba(59, 130, 246, 0.15)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "var(--color-text)",
                  marginBottom: "0.3rem",
                }}
              >
                Two-Factor Authentication
              </label>
              <p
                style={{
                  margin: "0",
                  fontSize: "0.85rem",
                  color: "var(--color-text-soft)",
                }}
              >
                Add extra security to your account
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.twoFactor}
              onChange={(e) =>
                handleSettingChange("twoFactor", e.target.checked)
              }
              style={{ width: "24px", height: "24px", cursor: "pointer" }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginTop: "2.5rem",
          }}
        >
          <button
            onClick={handleSave}
            style={{
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
            Save Changes
          </button>
          <button
            style={{
              padding: "0.85rem",
              borderRadius: "12px",
              border: "1px solid rgba(27, 35, 64, 0.14)",
              background: "transparent",
              color: "var(--color-text)",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
