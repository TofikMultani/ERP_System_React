import { Bell, CalendarDays, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getStoredRole } from "../utils/auth.js";

function formatLabel(segment) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function Topbar({ title, description }) {
  const location = useLocation();
  const userRole = getStoredRole() || "admin";

  // Generate breadcrumbs from path
  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part, idx) => ({
    label: formatLabel(part),
    path: "/" + pathParts.slice(0, idx + 1).join("/"),
  }));
  const currentDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="topbar">
      <div className="topbar__main">
        <div className="topbar__title-group">
          <div className="topbar__breadcrumbs">
            <Link to="/admin" className="topbar__breadcrumb">
              Dashboard
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className="topbar__breadcrumb-group">
                <span className="topbar__breadcrumb-sep">›</span>
                {index === breadcrumbs.length - 1 ? (
                  <span className="topbar__breadcrumb topbar__breadcrumb--active">
                    {crumb.label}
                  </span>
                ) : (
                  <Link to={crumb.path} className="topbar__breadcrumb">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
          <h2 className="topbar__title">{title}</h2>
          <p className="topbar__description">{description}</p>
        </div>

        <div className="topbar__actions">
          <div className="topbar__meta">
            <div className="topbar__date-chip">
              <CalendarDays className="topbar__meta-icon" strokeWidth={1.8} />
              <span>{currentDate}</span>
            </div>
            <button
              type="button"
              className="topbar__notify"
              aria-label="Notifications"
            >
              <Bell className="topbar__meta-icon" strokeWidth={1.8} />
            </button>
          </div>

          <label className="topbar__search">
            <Search className="topbar__search-icon" strokeWidth={1.8} />
            <input
              type="search"
              placeholder="Search employees, invoices, tickets..."
              className="topbar__search-input"
            />
          </label>

          <div className="topbar__profile">
            <div className="topbar__avatar">
              {userRole.charAt(0).toUpperCase()}
            </div>
            <div className="topbar__profile-info">
              <div className="topbar__profile-name">ERP Workspace</div>
              <div className="topbar__profile-role">
                {formatLabel(userRole)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
