import { Bell, CalendarDays, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getAllowedPathsForRole,
  getRouteForRole,
  getStoredRole,
} from "../utils/auth.js";
import {
  filterNavigationItems,
  getSearchableNavigationItems,
} from "../utils/navigation.js";
import { getStoredProfile, PROFILE_UPDATED_EVENT } from "../utils/profile.js";

function formatLabel(segment) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getTopbarMeta(pathname) {
  if (pathname.startsWith("/root-admin/requests")) {
    return {
      title: "Requests Management",
      description:
        "Review landing page workspace requests and approve or reject them.",
    };
  }

  if (pathname.startsWith("/root-admin/modules")) {
    return {
      title: "Module Configuration",
      description:
        "Activate or deactivate modules and manage per-module pricing for approvals.",
    };
  }

  if (pathname.startsWith("/root-admin/payments")) {
    return {
      title: "Payment Provisioning",
      description:
        "Review completed payments and generate login credentials for paid customers.",
    };
  }

  if (pathname.startsWith("/my-users")) {
    return {
      title: "My Users",
      description:
        "Manage the sub-users created for your requested ERP modules.",
    };
  }

  return null;
}

function Topbar({ title, description }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = getStoredRole() || "admin";
  const allowedPaths = getAllowedPathsForRole(userRole);
  const [, setProfileVersion] = useState(0);
  const profile = getStoredProfile(userRole);
  const meta = getTopbarMeta(location.pathname);
  const [searchQuery, setSearchQuery] = useState("");

  const searchItems = filterNavigationItems(
    getSearchableNavigationItems(allowedPaths),
    searchQuery,
  );

  useEffect(() => {
    function handleProfileUpdate() {
      setProfileVersion((value) => value + 1);
    }

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate);
    return () =>
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate);
  }, [userRole]);

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

  function handleSearchSubmit(event) {
    event.preventDefault();

    if (!searchItems.length) {
      return;
    }

    navigate(searchItems[0].path);
    setSearchQuery("");
  }

  function handleSearchSelect(path) {
    navigate(path);
    setSearchQuery("");
  }

  return (
    <header className="topbar">
      <div className="topbar__main">
        <div className="topbar__title-group">
          <div className="topbar__breadcrumbs">
            <Link to={getRouteForRole(userRole)} className="topbar__breadcrumb">
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
          <h2 className="topbar__title">{meta?.title || title}</h2>
          <p className="topbar__description">{meta?.description || description}</p>
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

          <form className="topbar__search" onSubmit={handleSearchSubmit}>
            <Search className="topbar__search-icon" strokeWidth={1.8} />
            <input
              type="search"
              placeholder="Search module pages, reports, forms..."
              className="topbar__search-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery.trim() ? (
              <div className="topbar__search-results">
                {searchItems.length ? (
                  searchItems.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      className="topbar__search-result"
                      onClick={() => handleSearchSelect(item.path)}
                    >
                      <span className="topbar__search-result-label">
                        {item.label}
                      </span>
                      <span className="topbar__search-result-path">
                        {item.path}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="topbar__search-empty">
                    No matching pages found.
                  </div>
                )}
              </div>
            ) : null}
          </form>

          <Link to="/profile" className="topbar__profile">
            <div className="topbar__avatar">
              {(profile.name || userRole).charAt(0).toUpperCase()}
            </div>
            <div className="topbar__profile-info">
              <div className="topbar__profile-name">{profile.name}</div>
              <div className="topbar__profile-role">{formatLabel(userRole)}</div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
