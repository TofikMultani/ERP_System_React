/**
 * Stat Component - Enhanced stat card with icon support
 */
function Stat({ icon: Icon, title, value, trend, trendUp = true, helper }) {
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        {Icon && <Icon className="stat-card__icon" />}
        <span className="stat-card__title">{title}</span>
      </div>

      <div className="stat-card__content">
        <div className="stat-card__value">{value}</div>
        {trend && (
          <div
            className={`stat-card__trend ${trendUp ? "stat-card__trend--up" : "stat-card__trend--down"}`}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </div>
        )}
      </div>

      {helper && <p className="stat-card__helper">{helper}</p>}
    </div>
  );
}

export default Stat;
