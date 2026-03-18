import { useState } from "react";
import { PERSISTENT_STATE_UPDATED_EVENT } from "../../utils/persistentState.js";

const DEFAULT_SETTINGS = {
  currency: "₹",
  theme: "light",
  language: "English",
  notifications: true,
  twoFactor: false,
};

const SETTINGS_STORAGE_KEY = "erp_settings";

function readStoredSettings() {
  try {
    const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return rawSettings
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function Settings() {
  const [settings, setSettings] = useState(() => readStoredSettings());

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent(PERSISTENT_STATE_UPDATED_EVENT, {
        detail: { storageKey: SETTINGS_STORAGE_KEY },
      }),
    );
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(PERSISTENT_STATE_UPDATED_EVENT, {
        detail: { storageKey: SETTINGS_STORAGE_KEY },
      }),
    );
  };

  return (
    <section className="settings-page">
      <header className="settings-page__hero">
        <div>
          <p className="settings-page__eyebrow">Workspace Preferences</p>
          <h2>Settings</h2>
          <p className="settings-page__subtext">
            Configure platform behavior, localization, and account security with
            a cleaner admin-grade control panel.
          </p>
        </div>
        <div className="settings-page__status-card">
          <span className="settings-page__status-label">Current theme</span>
          <strong>
            {settings.theme === "auto" ? "System" : settings.theme}
          </strong>
          <span className="settings-page__status-note">
            Preferences are stored locally for this ERP workspace.
          </span>
        </div>
      </header>

      <div className="settings-page__layout">
        <div className="settings-page__panel">
          <div className="settings-page__panel-head">
            <div>
              <h3>General Preferences</h3>
              <p>
                Set how finance, display, and language values appear across the
                application.
              </p>
            </div>
          </div>

          <div className="settings-page__grid">
            <div className="settings-page__field-card">
              <label htmlFor="settings-currency">Currency</label>
              <select
                id="settings-currency"
                className="settings-page__select"
                value={settings.currency}
                onChange={(event) =>
                  handleSettingChange("currency", event.target.value)
                }
              >
                <option value="₹">Indian Rupee (₹)</option>
              </select>
              <p>
                Choose the default currency shown in reports, invoices, and
                dashboards.
              </p>
            </div>

            <div className="settings-page__field-card">
              <label htmlFor="settings-theme">Theme</label>
              <select
                id="settings-theme"
                className="settings-page__select"
                value={settings.theme}
                onChange={(event) =>
                  handleSettingChange("theme", event.target.value)
                }
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
                <option value="auto">Auto (System)</option>
              </select>
              <p>
                Set the visual appearance best suited to your workspace and
                display environment.
              </p>
            </div>

            <div className="settings-page__field-card settings-page__field-card--full">
              <label htmlFor="settings-language">Language</label>
              <select
                id="settings-language"
                className="settings-page__select"
                value={settings.language}
                onChange={(event) =>
                  handleSettingChange("language", event.target.value)
                }
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
              <p>
                Choose the default interface language used throughout modules
                and navigation.
              </p>
            </div>
          </div>
        </div>

        <aside className="settings-page__panel settings-page__panel--side">
          <div className="settings-page__panel-head">
            <div>
              <h3>Security & Alerts</h3>
              <p>
                Control communication preferences and strengthen account access.
              </p>
            </div>
          </div>

          <div className="settings-page__toggle-list">
            <label className="settings-page__toggle-card">
              <div>
                <span className="settings-page__toggle-title">
                  Email Notifications
                </span>
                <p>
                  Receive important system alerts, activity updates, and
                  reminders by email.
                </p>
              </div>
              <span className="settings-page__switch">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(event) =>
                    handleSettingChange("notifications", event.target.checked)
                  }
                />
                <span className="settings-page__switch-slider" />
              </span>
            </label>

            {/* <label className="settings-page__toggle-card settings-page__toggle-card--info">
              <div>
                <span className="settings-page__toggle-title">
                  Two-Factor Authentication
                </span>
                <p>
                  Add a second verification step to increase account security
                  for sensitive workflows.
                </p>
              </div>
              <span className="settings-page__switch">
                <input
                  type="checkbox"
                  checked={settings.twoFactor}
                  onChange={(event) =>
                    handleSettingChange("twoFactor", event.target.checked)
                  }
                />
                <span className="settings-page__switch-slider" />
              </span>
            </label> */}
          </div>

          <div className="settings-page__summary">
            <span className="settings-page__summary-label">Active profile</span>
            <div className="settings-page__summary-tags">
              <span>{settings.currency}</span>
              <span>{settings.language}</span>
              <span>{settings.notifications ? "Alerts On" : "Alerts Off"}</span>
              {/* <span>{settings.twoFactor ? "2FA Enabled" : "2FA Disabled"}</span> */}
            </div>
          </div>
        </aside>
      </div>

      <div className="settings-page__actions">
        <button
          type="button"
          onClick={handleSave}
          className="settings-page__btn settings-page__btn--primary"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="settings-page__btn settings-page__btn--secondary"
        >
          Reset to Default
        </button>
      </div>
    </section>
  );
}

export default Settings;
