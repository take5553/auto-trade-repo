const KpiCard = ({ title, value, sub, badge, badgeUp, iconEl, iconClass }) => (
  <div className="card kpi-card">
    <div className="kpi-header">
      <span className="kpi-title">{title}</span>
      <div className={`kpi-icon ${iconClass}`}>{iconEl}</div>
    </div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-sub">
      {badge && <span className={`kpi-badge ${badgeUp ? 'up' : 'down'}`}>{badge}</span>}
      {sub}
    </div>
  </div>
);
